const APP_VERSION = "v2.3";
const today = new Date().toISOString().slice(0, 10);
const FALLBACK_IMAGE = "/images/meal-placeholder.jpg";

const defaultButtonKeys = [
  "GitHub",
  "下载 App / 查看更新",
  "了解新版本",
  "查看更新",
  "帮助中心",
  "立即生成晚餐方案",
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function randomInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function getStore(env) {
  return env.DINNER_STATE || env.DINNER_APP_KV;
}

function groupKey(groupId) {
  return `family:${groupId}`;
}

function buildRecipeFromPayload(payload, imageUrl, fallbackUsed) {
  const ingredients = Array.isArray(payload.ingredients) ? payload.ingredients.filter(Boolean) : [];
  const titleBase = ingredients.slice(0, 2).join("");

  return {
    recipeId: `rp_${Date.now()}`,
    title: titleBase ? `${titleBase}暖胃晚餐` : "番茄滑蛋牛肉盖饭",
    summary: `${payload.servings || 2} 人份，${payload.flavor || "家常口味"}，今晚可以更快定下来。`,
    imageUrl,
    imageStatus: fallbackUsed ? "fallback" : "ready",
    fallbackUsed,
    servings: payload.servings || 2,
    cookTime: 15,
    flavor: payload.flavor || "热乎家常",
    nutrition: "主食、蛋白质和蔬菜搭配完整，适合作为工作日晚餐。",
    ingredients,
    steps: [
      "先把现有食材按主菜和配菜分开准备",
      "先炒主菜再补蔬菜，保证 15 到 20 分钟内完成",
      "出锅后直接保存到今晚并同步给家人",
    ],
  };
}

async function readGroup(env, groupId) {
  const store = getStore(env);
  if (!store) {
    return null;
  }
  return store.get(groupKey(groupId), "json");
}

async function writeGroup(env, group) {
  const store = getStore(env);
  if (!store) {
    return;
  }
  await store.put(groupKey(group.groupId), JSON.stringify(group));
}

async function readButtonLinks(env) {
  if (!env.BUTTON_LINKS?.get) {
    return {};
  }

  const values = await env.BUTTON_LINKS.get(defaultButtonKeys);
  if (values instanceof Map) {
    return Object.fromEntries(
      [...values.entries()].filter(([, value]) => typeof value === "string" && value.length > 0),
    );
  }

  const entries = await Promise.all(
    defaultButtonKeys.map(async (key) => {
      const value = await env.BUTTON_LINKS.get(key);
      return [key, value];
    }),
  );

  return Object.fromEntries(entries.filter(([, value]) => typeof value === "string" && value.length > 0));
}

async function handleGenerateImage(request, env) {
  const payload = await request.json().catch(() => null);
  if (!payload || !Array.isArray(payload.ingredients) || payload.ingredients.filter(Boolean).length === 0) {
    return json({ error: "ingredients is required" }, 400);
  }

  try {
    const aiResult = await env.AI?.run?.("@cf/stabilityai/stable-diffusion-xl-base-1.0", payload);
    const imageUrl = aiResult?.imageUrl || "https://cdn.example.com/generated/meal.png";
    return json(buildRecipeFromPayload(payload, imageUrl, false));
  } catch {
    return json(buildRecipeFromPayload(payload, FALLBACK_IMAGE, true));
  }
}

async function handleCreateFamily(request, env) {
  const payload = await request.json().catch(() => ({}));
  const groupId = randomId("grp");
  const inviteCode = randomInviteCode();
  const group = {
    groupId,
    groupName: payload.groupName || payload.familyName || "家庭晚餐组",
    inviteCode,
    shareUrl: `${env.APP_BASE_URL || "https://example.com"}/?view=family&group=${groupId}&code=${inviteCode}`,
    updatedAt: new Date().toISOString(),
    updatedBy: payload.ownerName || payload.hostName || "你",
    status: "empty",
    meal: null,
    viewers: [],
  };

  await writeGroup(env, group);
  return json(group, 201);
}

async function handleGetTonightMeal(url, env, groupId) {
  const group = await readGroup(env, groupId);
  if (!group) {
    return json({ error: "group not found" }, 404);
  }
  if (url.searchParams.get("code") !== group.inviteCode) {
    return json({ error: "invalid invite code" }, 403);
  }
  return json(group);
}

async function handleSaveTonightMeal(request, env, groupId) {
  const group = await readGroup(env, groupId);
  if (!group) {
    return json({ error: "group not found" }, 404);
  }

  const payload = await request.json().catch(() => null);
  if (!payload?.meal?.title) {
    return json({ error: "meal.title is required" }, 400);
  }
  if (payload.code && payload.code !== group.inviteCode) {
    return json({ error: "invalid invite code" }, 403);
  }

  const nextGroup = {
    ...group,
    updatedAt: new Date().toISOString(),
    updatedBy: payload.updatedBy || group.updatedBy,
    status: "shared",
    meal: payload.meal,
  };
  await writeGroup(env, nextGroup);

  return json({ ok: true, status: "shared", groupId, meal: nextGroup.meal });
}

async function handleUpdateStatus(request, env, groupId) {
  const group = await readGroup(env, groupId);
  if (!group) {
    return json({ error: "group not found" }, 404);
  }

  const payload = await request.json().catch(() => null);
  if (!payload?.status || !payload?.viewerName) {
    return json({ error: "status and viewerName are required" }, 400);
  }
  if (payload.code && payload.code !== group.inviteCode) {
    return json({ error: "invalid invite code" }, 403);
  }

  const viewers = Array.isArray(group.viewers) ? group.viewers.filter((item) => item.name !== payload.viewerName) : [];
  viewers.push({
    name: payload.viewerName,
    status: payload.status,
    updatedAt: new Date().toISOString(),
  });

  const nextGroup = {
    ...group,
    updatedAt: new Date().toISOString(),
    status: payload.status,
    viewers,
  };
  await writeGroup(env, nextGroup);
  return json({ ok: true, status: nextGroup.status, viewers: nextGroup.viewers });
}

export async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return json({ ok: true });
  }

  if (url.pathname === "/api/button-links" && request.method === "GET") {
    return json({ links: await readButtonLinks(env) });
  }

  if (url.pathname === "/api/release" && request.method === "GET") {
    return json({
      version: env.APP_VERSION || APP_VERSION,
      publishedAt: today,
      features: ["AI 生菜谱图", "家庭共享晚餐", "官网已更新"],
    });
  }

  if (url.pathname === "/api/meal-plan/generate-image" && request.method === "POST") {
    return handleGenerateImage(request, env);
  }

  if (url.pathname === "/api/family-groups" && request.method === "POST") {
    return handleCreateFamily(request, env);
  }

  const mealMatch = url.pathname.match(/^\/api\/family-groups\/([^/]+)\/tonight-meal$/);
  if (mealMatch && request.method === "GET") {
    return handleGetTonightMeal(url, env, mealMatch[1]);
  }
  if (mealMatch && request.method === "POST") {
    return handleSaveTonightMeal(request, env, mealMatch[1]);
  }

  const statusMatch = url.pathname.match(/^\/api\/family-groups\/([^/]+)\/tonight-meal\/status$/);
  if (statusMatch && request.method === "PATCH") {
    return handleUpdateStatus(request, env, statusMatch[1]);
  }

  return json({ error: "not found" }, 404);
}

export default {
  fetch: handleRequest,
};
