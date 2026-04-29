import test from "node:test";
import assert from "node:assert/strict";

import { handleRequest } from "../index.js";

class MemoryKV {
  constructor() {
    this.store = new Map();
  }

  async get(keyOrKeys, type) {
    if (Array.isArray(keyOrKeys)) {
      const values = new Map();
      for (const key of keyOrKeys) {
        values.set(key, this.store.get(key) ?? null);
      }
      return values;
    }

    if (!this.store.has(keyOrKeys)) {
      return null;
    }

    const value = this.store.get(keyOrKeys);
    if (type === "json") {
      return JSON.parse(value);
    }

    return value;
  }

  async put(key, value) {
    this.store.set(key, value);
  }
}

class MemoryR2 {
  constructor() {
    this.store = new Map();
  }

  async put(key, value) {
    this.store.set(key, value);
  }
}

function createEnv() {
  return {
    BUTTON_LINKS: new MemoryKV(),
    DINNER_APP_KV: new MemoryKV(),
    DINNER_IMAGES: new MemoryR2(),
    APP_BASE_URL: "https://example.com",
    AI: {
      async run() {
        return { imageUrl: "https://cdn.example.com/generated/meal.png" };
      },
    },
  };
}

async function readJson(response) {
  return response.json();
}

test("GET /api/button-links preserves existing behavior", async () => {
  const env = createEnv();
  await env.BUTTON_LINKS.put("GitHub", "https://github.com/example");

  const response = await handleRequest(new Request("https://app.test/api/button-links"), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await readJson(response), {
    links: {
      GitHub: "https://github.com/example",
    },
  });
});

test("family group flow supports create, save tonight meal, read meal, and RSVP status update", async () => {
  const env = createEnv();

  const createResponse = await handleRequest(
    new Request("https://app.test/api/family-groups", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ groupName: "王家晚餐组", ownerName: "Mia" }),
    }),
    env,
  );
  assert.equal(createResponse.status, 201);
  const created = await readJson(createResponse);
  assert.equal(
    created.shareUrl,
    `https://example.com/family-groups/${created.groupId}/tonight-meal?code=${created.inviteCode}`,
  );

  const mealPayload = {
    code: created.inviteCode,
    updatedBy: "Mia",
    meal: {
      recipeId: "rp_demo",
      title: "清爽生菜鸡蛋卷",
      summary: "15 分钟可完成，适合 3 人晚餐。",
      imageUrl: "https://cdn.example.com/meal.png",
      ingredients: ["生菜", "鸡蛋", "番茄"],
      steps: ["洗菜", "煎蛋", "卷起切段"],
      servings: 3,
    },
  };

  const saveResponse = await handleRequest(
    new Request(`https://app.test/api/family-groups/${created.groupId}/tonight-meal`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mealPayload),
    }),
    env,
  );
  assert.equal(saveResponse.status, 200);
  const saved = await readJson(saveResponse);
  assert.equal(saved.ok, true);
  assert.equal(saved.status, "shared");

  const readResponse = await handleRequest(
    new Request(`https://app.test/api/family-groups/${created.groupId}/tonight-meal?code=${created.inviteCode}`),
    env,
  );
  assert.equal(readResponse.status, 200);
  const meal = await readJson(readResponse);
  assert.equal(meal.groupName, "王家晚餐组");
  assert.equal(meal.meal.title, "清爽生菜鸡蛋卷");

  const rsvpResponse = await handleRequest(
    new Request(`https://app.test/api/family-groups/${created.groupId}/tonight-meal/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: created.inviteCode,
        status: "going",
      }),
    }),
    env,
  );
  assert.equal(rsvpResponse.status, 200);
  assert.deepEqual(await readJson(rsvpResponse), {
    ok: true,
    status: "going",
  });

  const updatedMealResponse = await handleRequest(
    new Request(`https://app.test/api/family-groups/${created.groupId}/tonight-meal?code=${created.inviteCode}`),
    env,
  );
  const updatedMeal = await readJson(updatedMealResponse);
  assert.equal(updatedMeal.status, "going");
  assert.deepEqual(updatedMeal.viewers, []);
});

test("PATCH /api/family-groups/:groupId/tonight-meal/status rejects unsupported RSVP status", async () => {
  const env = createEnv();

  const createResponse = await handleRequest(
    new Request("https://app.test/api/family-groups", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ groupName: "王家晚餐组", ownerName: "Mia" }),
    }),
    env,
  );
  const created = await readJson(createResponse);

  await handleRequest(
    new Request(`https://app.test/api/family-groups/${created.groupId}/tonight-meal`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: created.inviteCode,
        updatedBy: "Mia",
        meal: { title: "清炒生菜" },
      }),
    }),
    env,
  );

  const response = await handleRequest(
    new Request(`https://app.test/api/family-groups/${created.groupId}/tonight-meal/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: created.inviteCode,
        status: "maybe",
      }),
    }),
    env,
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await readJson(response), {
    error: {
      code: "validation_error",
      message: "status must be one of going, late, skip.",
      details: {
        field: "status",
      },
    },
  });
});

test("generate image returns recipe with AI image when binding succeeds", async () => {
  const env = createEnv();

  const response = await handleRequest(
    new Request("https://app.test/api/meal-plan/generate-image", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ingredients: ["生菜", "鸡蛋", "番茄"],
        servings: 3,
        flavor: "清淡",
      }),
    }),
    env,
  );

  assert.equal(response.status, 200);
  const recipe = await readJson(response);
  assert.equal(recipe.imageStatus, "ready");
  assert.equal(recipe.fallbackUsed, false);
  assert.equal(recipe.ingredients.length, 3);
});

test("generate image degrades to placeholder when AI fails", async () => {
  const env = createEnv();
  env.AI = {
    async run() {
      throw new Error("upstream timeout");
    },
  };

  const response = await handleRequest(
    new Request("https://app.test/api/meal-plan/generate-image", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ingredients: ["生菜", "鸡蛋"],
        servings: 2,
        flavor: "家常",
      }),
    }),
    env,
  );

  assert.equal(response.status, 200);
  const recipe = await readJson(response);
  assert.equal(recipe.imageStatus, "fallback");
  assert.equal(recipe.fallbackUsed, true);
  assert.equal(recipe.imageUrl, "/images/meal-placeholder.jpg");
});
