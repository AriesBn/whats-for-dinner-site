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
        return new Uint8Array([1, 2, 3]);
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

test("family lifecycle supports create, join, update dinner, read dinner, and RSVP", async () => {
  const env = createEnv();

  const createResponse = await handleRequest(
    new Request("https://app.test/api/families", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ familyName: "王家晚餐组", hostName: "妈妈" }),
    }),
    env,
  );
  assert.equal(createResponse.status, 201);
  const created = await readJson(createResponse);
  const familyId = created.family.id;
  const inviteCode = created.family.inviteCode;
  const hostId = created.hostMember.id;

  const joinResponse = await handleRequest(
    new Request("https://app.test/api/families/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ inviteCode, displayName: "爸爸" }),
    }),
    env,
  );
  assert.equal(joinResponse.status, 200);
  const joined = await readJson(joinResponse);
  const memberId = joined.member.id;

  const putDinnerResponse = await handleRequest(
    new Request(`https://app.test/api/families/${familyId}/dinner`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        memberId: hostId,
        date: "2026-04-29",
        title: "今晚吃红烧鸡翅",
        dishes: [{ name: "红烧鸡翅", servings: "3人份", notes: "少糖" }],
        cookTime: "19:00",
        shoppingNeeded: true,
        shoppingItems: ["鸡翅", "姜"],
      }),
    }),
    env,
  );
  assert.equal(putDinnerResponse.status, 200);

  const rsvpResponse = await handleRequest(
    new Request(`https://app.test/api/families/${familyId}/rsvp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        memberId,
        status: "late",
        comment: "19:20 到家",
        date: "2026-04-29",
      }),
    }),
    env,
  );
  assert.equal(rsvpResponse.status, 200);

  const dinnerResponse = await handleRequest(
    new Request(`https://app.test/api/families/${familyId}/dinner?date=2026-04-29`),
    env,
  );
  assert.equal(dinnerResponse.status, 200);
  const dinner = await readJson(dinnerResponse);
  assert.equal(dinner.family.name, "王家晚餐组");
  assert.equal(dinner.plan.imageStatus, "pending");
  assert.equal(dinner.rsvps[0].status, "late");
});

test("image generation failure is recoverable and does not delete the dinner text plan", async () => {
  const env = createEnv();
  env.AI = {
    async run() {
      throw new Error("upstream timeout");
    },
  };

  const createResponse = await handleRequest(
    new Request("https://app.test/api/families", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ familyName: "测试家庭", hostName: "主持人" }),
    }),
    env,
  );
  const created = await readJson(createResponse);
  const familyId = created.family.id;
  const hostId = created.hostMember.id;

  await handleRequest(
    new Request(`https://app.test/api/families/${familyId}/dinner`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        memberId: hostId,
        date: "2026-04-29",
        title: "今晚吃番茄炒蛋",
        dishes: [{ name: "番茄炒蛋", servings: "2人份", notes: "" }],
        cookTime: "18:30",
        shoppingNeeded: false,
        shoppingItems: [],
      }),
    }),
    env,
  );

  const imageResponse = await handleRequest(
    new Request(`https://app.test/api/families/${familyId}/dinner/image`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ memberId: hostId, date: "2026-04-29" }),
    }),
    env,
  );
  assert.equal(imageResponse.status, 502);
  const payload = await readJson(imageResponse);
  assert.equal(payload.ok, false);
  assert.equal(payload.recoverable, true);

  const dinnerResponse = await handleRequest(
    new Request(`https://app.test/api/families/${familyId}/dinner?date=2026-04-29`),
    env,
  );
  const dinner = await readJson(dinnerResponse);
  assert.equal(dinner.plan.title, "今晚吃番茄炒蛋");
  assert.equal(dinner.plan.imageStatus, "failed");
});

test("daily image generation limit stops the fourth attempt", async () => {
  const env = createEnv();

  const createResponse = await handleRequest(
    new Request("https://app.test/api/families", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ familyName: "限流测试", hostName: "主持人" }),
    }),
    env,
  );
  const created = await readJson(createResponse);
  const familyId = created.family.id;
  const hostId = created.hostMember.id;

  await handleRequest(
    new Request(`https://app.test/api/families/${familyId}/dinner`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        memberId: hostId,
        date: "2026-04-29",
        title: "今晚吃饺子",
        dishes: [{ name: "饺子", servings: "4人份", notes: "" }],
        cookTime: "19:30",
        shoppingNeeded: false,
        shoppingItems: [],
      }),
    }),
    env,
  );

  for (let index = 0; index < 3; index += 1) {
    const response = await handleRequest(
      new Request(`https://app.test/api/families/${familyId}/dinner/image`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ memberId: hostId, date: "2026-04-29" }),
      }),
      env,
    );
    assert.equal(response.status, 200);
  }

  const limitResponse = await handleRequest(
    new Request(`https://app.test/api/families/${familyId}/dinner/image`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ memberId: hostId, date: "2026-04-29" }),
    }),
    env,
  );
  assert.equal(limitResponse.status, 429);
  const payload = await readJson(limitResponse);
  assert.equal(payload.error.code, "image_generation_limit_reached");
});
