import { handleButtonLinks } from "./routes/button-links.js";
import { HttpError } from "./lib/errors.js";
import { json } from "./lib/http.js";
import { kvGetJson, kvPutJson } from "./lib/store.js";
import { validateRsvpStatus } from "./lib/validation.js";

const APP_VERSION = "0.1.0";
const IMAGE_PLACEHOLDER_URL = "/images/meal-placeholder.jpg";

function ok(data, status = 200) {
  return json(data, { status, headers: corsHeaders() });
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

function errorResponse(status, code, message, details) {
  return json(
    {
      error: {
        code,
        message,
        details,
      },
    },
    { status, headers: corsHeaders() },
  );
}

async function readJson(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new HttpError(415, "unsupported_media_type", "Expected application/json request body.");
  }

  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "invalid_json", "Request body is not valid JSON.");
  }
}

function requireObject(value, name = "body") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "invalid_request", `${name} must be a JSON object.`);
  }
  return value;
}

function requireNonEmptyString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, "invalid_request", `${field} is required.`);
  }
  return value.trim();
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function randomInviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 8; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function groupKey(groupId) {
  return `group:${groupId}`;
}

function latestMealKey(groupId) {
  return `group:${groupId}:meal:latest`;
}

function datedMealKey(groupId, date) {
  return `group:${groupId}:meal:${date}`;
}

function recipeKey(recipeId) {
  return `recipe:${recipeId}`;
}

function buildShareUrl(baseUrl, groupId, inviteCode) {
  const url = new URL(baseUrl);
  url.pathname = `/family-groups/${groupId}/tonight-meal`;
  url.search = "";
  url.hash = "";
  url.searchParams.set("code", inviteCode);
  return url.toString();
}

async function createGroup(env, request, body) {
  const groupName = requireNonEmptyString(body.groupName, "groupName");
  const ownerName = requireNonEmptyString(body.ownerName, "ownerName");
  const groupId = randomId("grp");
  const inviteCode = randomInviteCode();
  const createdAt = nowIso();
  const shareUrl = buildShareUrl(env.APP_BASE_URL || request.url, groupId, inviteCode);
  const group = { groupId, groupName, inviteCode, ownerName, createdAt, shareUrl };

  await kvPutJson(env, groupKey(groupId), group);

  return ok({
    groupId,
    inviteCode,
    shareUrl,
  }, 201);
}

async function getGroup(env, groupId) {
  const group = await kvGetJson(env, groupKey(groupId));
  if (!group) {
    throw new HttpError(404, "group_not_found", "Family group does not exist.");
  }
  return group;
}

async function getTonightMeal(env, groupId, url) {
  const code = requireNonEmptyString(url.searchParams.get("code") || "", "code");
  const group = await getGroup(env, groupId);
  if (group.inviteCode !== code) {
    throw new HttpError(403, "invalid_invite_code", "Invite code is invalid.");
  }

  const latestMeal = await kvGetJson(env, latestMealKey(groupId));
  if (!latestMeal) {
    return ok({
      groupId: group.groupId,
      groupName: group.groupName,
      date: todayDate(),
      status: "empty",
      updatedAt: null,
      updatedBy: null,
      meal: null,
      viewers: [],
    });
  }

  return ok({
    groupId: group.groupId,
    groupName: group.groupName,
    date: latestMeal.date,
    status: latestMeal.status,
    updatedAt: latestMeal.updatedAt,
    updatedBy: latestMeal.updatedBy,
    meal: latestMeal.meal,
    viewers: latestMeal.viewers || [],
  });
}

function buildRecipe(payload, imageUrl, imageStatus, fallbackUsed) {
  const ingredients = normalizeStringArray(payload.ingredients);
  if (!ingredients.length) {
    throw new HttpError(400, "invalid_request", "ingredients is required.");
  }

  const servings = Number.isFinite(payload.servings) && payload.servings > 0
    ? payload.servings
    : 2;
  const flavor = typeof payload.flavor === "string" && payload.flavor.trim()
    ? payload.flavor.trim()
    : "家常";
  const title = `${ingredients.slice(0, 2).join("") || "今晚"}暖心晚餐`;

  return {
    recipeId: randomId("rp"),
    title,
    summary: `${servings} 人份，${flavor}口味，15 分钟内可准备完成。`,
    imageUrl,
    imageStatus,
    fallbackUsed,
    ingredients,
    steps: [
      "先清洗并切好主要食材。",
      "优先处理蛋白质食材，再补蔬菜和调味。",
      "装盘后立即分享给家庭组，确认今晚菜单。",
    ],
    servings,
  };
}

async function maybeGenerateImage(env, prompt) {
  if (!env.AI?.run) {
    throw new Error("AI binding not configured");
  }

  const result = await env.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", {
    prompt,
  });

  if (result?.imageUrl && typeof result.imageUrl === "string") {
    return result.imageUrl;
  }

  if (result instanceof Uint8Array && env.DINNER_IMAGES?.put) {
    const objectKey = `generated/${Date.now()}.png`;
    await env.DINNER_IMAGES.put(objectKey, result);
    const baseUrl = (env.APP_BASE_URL || "").replace(/\/$/, "");
    return baseUrl ? `${baseUrl}/${objectKey}` : IMAGE_PLACEHOLDER_URL;
  }

  throw new Error("AI image result not usable");
}

async function generateMealPlan(env, body) {
  const payload = requireObject(body);
  const prompt = `Create a home-cooked dinner illustration with ${normalizeStringArray(payload.ingredients).join(", ")}`;

  try {
    const imageUrl = await maybeGenerateImage(env, prompt);
    const recipe = buildRecipe(payload, imageUrl, "ready", false);
    await kvPutJson(env, recipeKey(recipe.recipeId), {
      recipeId: recipe.recipeId,
      prompt: payload,
      title: recipe.title,
      summary: recipe.summary,
      imageUrl: recipe.imageUrl,
      imageStatus: recipe.imageStatus,
      createdAt: nowIso(),
    });
    return ok(recipe);
  } catch {
    const recipe = buildRecipe(payload, IMAGE_PLACEHOLDER_URL, "fallback", true);
    await kvPutJson(env, recipeKey(recipe.recipeId), {
      recipeId: recipe.recipeId,
      prompt: payload,
      title: recipe.title,
      summary: recipe.summary,
      imageUrl: recipe.imageUrl,
      imageStatus: recipe.imageStatus,
      createdAt: nowIso(),
    });
    return ok(recipe);
  }
}

async function saveTonightMeal(env, groupId, body) {
  const payload = requireObject(body);
  const code = requireNonEmptyString(payload.code, "code");
  const updatedBy = requireNonEmptyString(payload.updatedBy || "匿名成员", "updatedBy");
  const group = await getGroup(env, groupId);
  if (group.inviteCode !== code) {
    throw new HttpError(403, "invalid_invite_code", "Invite code is invalid.");
  }

  const meal = requireObject(payload.meal, "meal");
  requireNonEmptyString(meal.title, "meal.title");
  const date = todayDate();
  const record = {
    groupId,
    date,
    status: "shared",
    updatedAt: nowIso(),
    updatedBy,
    meal: {
      recipeId: typeof meal.recipeId === "string" && meal.recipeId ? meal.recipeId : randomId("rp"),
      title: meal.title.trim(),
      summary: typeof meal.summary === "string" ? meal.summary.trim() : "",
      imageUrl: typeof meal.imageUrl === "string" && meal.imageUrl ? meal.imageUrl : IMAGE_PLACEHOLDER_URL,
      ingredients: normalizeStringArray(meal.ingredients),
      steps: normalizeStringArray(meal.steps),
      servings: Number.isFinite(meal.servings) && meal.servings > 0 ? meal.servings : 2,
      fallbackUsed: Boolean(meal.fallbackUsed),
    },
    viewers: [],
  };

  await Promise.all([
    kvPutJson(env, latestMealKey(groupId), record),
    kvPutJson(env, datedMealKey(groupId, date), record),
  ]);

  return ok({
    ok: true,
    status: record.status,
    updatedAt: record.updatedAt,
  });
}

async function updateTonightMealStatus(env, groupId, body) {
  const payload = requireObject(body);
  const code = requireNonEmptyString(payload.code, "code");
  const status = validateRsvpStatus(payload.status);
  const group = await getGroup(env, groupId);
  if (group.inviteCode !== code) {
    throw new HttpError(403, "invalid_invite_code", "Invite code is invalid.");
  }

  const latestMeal = await kvGetJson(env, latestMealKey(groupId));
  if (!latestMeal) {
    throw new HttpError(404, "tonight_meal_not_found", "Tonight meal does not exist.");
  }

  const next = {
    ...latestMeal,
    status,
    viewers: latestMeal.viewers || [],
  };

  await Promise.all([
    kvPutJson(env, latestMealKey(groupId), next),
    kvPutJson(env, datedMealKey(groupId, next.date), next),
  ]);

  return ok({
    ok: true,
    status: next.status,
  });
}

export async function handleRequest(request, env) {
  const url = new URL(request.url);

  try {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (url.pathname === "/api/button-links" && request.method === "GET") {
      return handleButtonLinks(env);
    }

    if (url.pathname === "/api/release" && request.method === "GET") {
      return ok({
        version: env.APP_VERSION || APP_VERSION,
        publishedAt: todayDate(),
        features: ["AI 生菜谱图", "家庭组共享今晚菜谱", "官网更新"],
      });
    }

    if (url.pathname === "/api/meal-plan/generate-image" && request.method === "POST") {
      return await generateMealPlan(env, await readJson(request));
    }

    if (url.pathname === "/api/family-groups" && request.method === "POST") {
      return await createGroup(env, request, await readJson(request));
    }

    const mealMatch = url.pathname.match(/^\/api\/family-groups\/([^/]+)\/tonight-meal$/);
    if (mealMatch && request.method === "GET") {
      return await getTonightMeal(env, mealMatch[1], url);
    }
    if (mealMatch && request.method === "POST") {
      return await saveTonightMeal(env, mealMatch[1], await readJson(request));
    }

    const statusMatch = url.pathname.match(/^\/api\/family-groups\/([^/]+)\/tonight-meal\/status$/);
    if (statusMatch && request.method === "PATCH") {
      return await updateTonightMealStatus(env, statusMatch[1], await readJson(request));
    }

    return errorResponse(404, "not_found", "Route not found.");
  } catch (error) {
    if (error instanceof HttpError) {
      return errorResponse(error.status, error.code, error.message, error.details);
    }
    console.error("Unhandled worker error", error);
    return errorResponse(500, "internal_error", "Unexpected server error.");
  }
}

export default {
  fetch: handleRequest,
};
