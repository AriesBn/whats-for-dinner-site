const APP_VERSION = "v2.3";
const today = new Date().toISOString().slice(0, 10);

const defaultButtonLinks = {
  "下载 App / 查看更新": "#release",
  "了解新版本": "#release",
  "查看更新": "#release",
  "帮助中心": "#help",
  "立即生成晚餐方案": "#planner",
};

const recipeTemplate = {
  recipeId: `rp_${today.replaceAll("-", "")}_demo`,
  title: "番茄滑蛋牛肉盖饭",
  summary: "20 分钟可完成，适合 3 人晚餐。",
  imageUrl:
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  imageStatus: "ready",
  fallbackUsed: false,
  cookTime: 20,
  flavor: "热乎家常",
  nutrition: "牛肉补充蛋白质，番茄和鸡蛋补足蔬菜与饱腹感。",
  ingredients: ["牛肉", "番茄", "鸡蛋", "米饭"],
  steps: ["牛肉快炒锁汁", "番茄炒出汁水", "滑蛋回锅盖在热米饭上"],
};

const defaultGroup = {
  groupId: "demo-group",
  groupName: "王家晚餐组",
  inviteCode: "A7K2Q9",
  shareUrl: "https://whats-for-dinner-site.dinnerapp.workers.dev/?view=family&group=demo-group&code=A7K2Q9",
  updatedAt: new Date().toISOString(),
  updatedBy: "你",
  status: "shared",
  meal: {
    ...recipeTemplate,
    servings: 3,
  },
  members: [
    { id: "mom", name: "妈妈", role: "host", status: "viewed", note: "18:42 已查看" },
    { id: "me", name: "你", role: "member", status: "confirmed", note: "18:45 已确认" },
    { id: "dad", name: "爸爸", role: "member", status: "pending", note: "未回复" },
  ],
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

function normalizeRecipe(payload) {
  const ingredients = Array.isArray(payload.ingredients) ? payload.ingredients.filter(Boolean) : [];
  if (!ingredients.length) {
    return null;
  }

  const titleBase = ingredients.slice(0, 2).join("");
  return {
    recipeId: `rp_${Date.now()}`,
    title: titleBase ? `${titleBase}暖胃晚餐` : recipeTemplate.title,
    summary: `${payload.servings || 2} 人份，${payload.flavor || "家常口味"}，今晚可以更快定下来。`,
    imageUrl: recipeTemplate.imageUrl,
    imageStatus: "ready",
    fallbackUsed: false,
    cookTime: 15,
    servings: payload.servings || 2,
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

async function getStoredGroup(env) {
  const stored = await env.DINNER_STATE?.get("family:demo-group", { type: "json" });
  return stored || defaultGroup;
}

async function saveStoredGroup(env, group) {
  if (!env.DINNER_STATE) {
    return;
  }
  await env.DINNER_STATE.put("family:demo-group", JSON.stringify(group));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return json({ ok: true });
    }

    if (url.pathname === "/api/button-links" && request.method === "GET") {
      const links = { ...defaultButtonLinks };
      if (env.BUTTON_LINKS?.get) {
        const entries = await Promise.all(
          Object.keys(defaultButtonLinks).map(async (key) => [key, (await env.BUTTON_LINKS.get(key)) || defaultButtonLinks[key]]),
        );
        return json({ links: Object.fromEntries(entries) });
      }
      return json({ links });
    }

    if (url.pathname === "/api/release" && request.method === "GET") {
      return json({
        version: env.APP_VERSION || APP_VERSION,
        publishedAt: today,
        features: ["AI 生菜谱图", "家庭共享晚餐", "官网已更新"],
      });
    }

    if (url.pathname === "/api/meal-plan/generate-image" && request.method === "POST") {
      const payload = await request.json().catch(() => null);
      const recipe = payload ? normalizeRecipe(payload) : null;
      if (!recipe) {
        return json({ error: "ingredients is required" }, 400);
      }
      return json(recipe);
    }

    if (url.pathname === "/api/family-groups" && request.method === "POST") {
      return json(defaultGroup, 201);
    }

    if (url.pathname === "/api/family-groups/demo-group/tonight-meal" && request.method === "GET") {
      const code = url.searchParams.get("code");
      if (code !== defaultGroup.inviteCode) {
        return json({ error: "invalid invite code" }, 403);
      }
      const group = await getStoredGroup(env);
      return json(group);
    }

    if (url.pathname === "/api/family-groups/demo-group/tonight-meal" && request.method === "POST") {
      const payload = await request.json().catch(() => null);
      if (!payload?.meal?.title) {
        return json({ error: "meal.title is required" }, 400);
      }

      const group = {
        ...(await getStoredGroup(env)),
        updatedAt: new Date().toISOString(),
        updatedBy: payload.updatedBy || "你",
        meal: {
          ...recipeTemplate,
          ...payload.meal,
        },
      };

      await saveStoredGroup(env, group);
      return json(group);
    }

    return json({ error: "not found" }, 404);
  },
};
