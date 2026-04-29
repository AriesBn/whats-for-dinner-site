import "./style.css";

const APP_VERSION = "0.1.0";
const APP_DATE = new Date().toISOString().slice(0, 10);

const quickChips = ["15分钟快手", "冰箱剩菜", "想吃热乎的"];

const fallbackRecipe = {
  recipeId: "recipe-fallback",
  title: "番茄滑蛋牛肉盖饭",
  summary: "20 分钟做好一顿热乎晚饭，适合 3 人一起吃。",
  imageUrl:
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
  imageStatus: "ready",
  fallbackUsed: false,
  servings: 3,
  cookTime: 20,
  flavor: "酸甜暖胃",
  nutrition: "蛋白质、蔬菜和主食都齐了，适合作为工作日晚餐。",
  ingredients: ["牛肉", "番茄", "鸡蛋", "米饭"],
  steps: ["牛肉快炒锁汁", "番茄炒出汁水", "滑蛋回锅盖在热米饭上"],
};

const fallbackFamily = {
  familyId: "fam-demo",
  familyName: "王家晚餐组",
  inviteCode: "A7K2Q9",
  shareUrl: `${window.location.origin}/family-groups/fam-demo/tonight-meal?code=A7K2Q9`,
  members: [
    { id: "mom", name: "妈妈", role: "host", status: "viewed", note: "18:42 已查看" },
    { id: "me", name: "你", role: "member", status: "confirmed", note: "18:45 已确认" },
    { id: "dad", name: "爸爸", role: "member", status: "pending", note: "未回复" },
  ],
  plan: fallbackRecipe,
};

const releaseNotes = [
  "AI 生菜谱图",
  "家庭共享晚餐",
  "官网已更新",
];

const siteHighlights = [
  {
    title: "AI 生菜谱图",
    text: "输入几条晚餐条件，先给出一张真实感菜谱图，再附上食材、步骤和口味说明。",
  },
  {
    title: "家庭共享今晚菜单",
    text: "生成后直接保存到今晚，分享给家人查看和确认，不再围着餐桌问半天。",
  },
  {
    title: "版本更新入口",
    text: "首页、更新页、官网首页统一到“今晚吃什么”语境，用户更容易找到下载与更新说明。",
  },
];

const appState = {
  links: {
    download: "#release",
    updates: "#release",
    help: "#help",
  },
  plannerForm: {
    mode: "",
    ingredients: "牛肉、番茄、鸡蛋、米饭",
    servings: 3,
    flavor: "想吃热乎的",
    notes: "下班后 20 分钟内能做完",
  },
  selectedChip: "",
  recipeStatus: "idle",
  recipeError: "",
  recipe: null,
  familyStatus: "loading",
  familyError: "",
  family: null,
  releaseStatus: "loading",
  release: null,
  toast: "",
};

const app = document.querySelector("#app");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isCurrentChip(label) {
  return appState.selectedChip === label;
}

function getFamilyConfirmationState(family) {
  if (!family?.members?.length) {
    return "empty";
  }

  return family.members.every((member) => member.status === "confirmed")
    ? "done"
    : "waiting";
}

function renderStatusPill(status) {
  const mapping = {
    idle: ["待生成", "pill-neutral"],
    loading: ["生成中", "pill-warn"],
    success: ["已生成", "pill-success"],
    saved: ["已保存到今晚", "pill-success"],
    error: ["生成失败", "pill-danger"],
  };
  const [label, className] = mapping[status] ?? mapping.idle;
  return `<span class="status-pill ${className}">${label}</span>`;
}

function renderHero() {
  const onlineCount = appState.family?.members?.length ?? 3;
  return `
    <section class="hero-panel" id="hero">
      <div class="hero-copy">
        <p class="eyebrow">今晚吃什么 v2.3</p>
        <h1>和家人今晚吃得更快定下来</h1>
        <p class="hero-text">
          AI 帮你想菜，家人一起确认今晚菜单。别再围着餐桌问半天，今晚吃什么现在两步定下来。
        </p>
        <div class="hero-actions">
          <a class="button button-primary" href="#planner">立即生成晚餐方案</a>
          <a class="button button-secondary" href="#release">下载 App / 查看更新</a>
        </div>
      </div>

      <div class="hero-card">
        <div class="hero-card-top">
          <span class="hero-sticker">今晚晚餐</span>
          <span class="hero-reminder">提醒入口</span>
        </div>
        <div class="question-card">
          <div class="mascot" aria-hidden="true">🍅</div>
          <div>
            <strong>今晚吃什么？</strong>
            <p>从快手、清冰箱、想吃热乎的开始，5 秒进入晚餐决策。</p>
          </div>
        </div>
        <div class="chips" role="list" aria-label="快捷条件">
          ${quickChips
            .map(
              (chip) => `
                <button
                  class="chip ${isCurrentChip(chip) ? "is-selected" : ""}"
                  type="button"
                  data-chip="${chip}"
                >
                  ${chip}
                </button>
              `,
            )
            .join("")}
        </div>
        <div class="family-summary">
          <div>
            <span class="summary-label">家庭晚餐组</span>
            <strong>${onlineCount} 位成员在线，随时同步今晚菜单</strong>
          </div>
          <a href="#family" class="summary-link">查看共享状态</a>
        </div>
      </div>
    </section>
  `;
}

function renderPlanner() {
  const recipe = appState.recipe;
  const isLoading = appState.recipeStatus === "loading";
  const canSave = recipe && ["success", "saved"].includes(appState.recipeStatus);
  const saveLabel = appState.recipeStatus === "saved" ? "已保存到今晚" : "保存到今晚";

  return `
    <section class="content-panel planner-panel" id="planner">
      <div class="section-heading">
        <p class="eyebrow">AI 生菜谱图</p>
        <h2>先决定今晚吃什么，再决定谁来确认</h2>
        <p>和现有 Worker API 对接，补齐加载、空态、错误态和降级态。</p>
      </div>

      <div class="planner-layout">
        <form class="planner-form" id="planner-form">
          <label>
            <span>晚餐模式</span>
            <input name="mode" value="${escapeHtml(appState.plannerForm.mode)}" placeholder="例如：15 分钟快手晚餐" />
          </label>
          <label>
            <span>已有食材</span>
            <textarea name="ingredients" rows="4" placeholder="例如：牛肉、番茄、鸡蛋、米饭">${escapeHtml(appState.plannerForm.ingredients)}</textarea>
          </label>
          <div class="form-grid">
            <label>
              <span>人数</span>
              <input name="servings" type="number" min="1" max="12" value="${escapeHtml(appState.plannerForm.servings)}" />
            </label>
            <label>
              <span>想吃的口味</span>
              <input name="flavor" value="${escapeHtml(appState.plannerForm.flavor)}" placeholder="想吃热乎的" />
            </label>
          </div>
          <label>
            <span>备注</span>
            <textarea name="notes" rows="3" placeholder="例如：少油、不吃辣、今晚 19:00 开饭">${escapeHtml(appState.plannerForm.notes)}</textarea>
          </label>
          <div class="form-actions">
            <button class="button button-primary" type="submit" ${isLoading ? "disabled" : ""}>
              ${isLoading ? "正在生成..." : "立即生成晚餐方案"}
            </button>
            <button class="button button-secondary" type="button" data-action="regenerate" ${
              isLoading ? "disabled" : ""
            }>
              重新生成
            </button>
          </div>
        </form>

        <article class="recipe-card" aria-live="polite">
          <div class="recipe-card-head">
            <div>
              <p class="card-label">AI 生菜谱图</p>
              <h3>${recipe ? escapeHtml(recipe.title) : "输入食材后生成今晚菜谱图"}</h3>
            </div>
            ${renderStatusPill(
              appState.recipeStatus === "loading"
                ? "loading"
                : appState.recipeStatus === "error"
                  ? "error"
                  : appState.recipeStatus === "saved"
                    ? "saved"
                    : recipe
                      ? "success"
                      : "idle",
            )}
          </div>

          ${
            isLoading
              ? `
                <div class="recipe-skeleton">
                  <div class="skeleton-block skeleton-image"></div>
                  <div class="skeleton-block"></div>
                  <div class="skeleton-block skeleton-short"></div>
                </div>
              `
              : recipe
                ? `
                  <img class="recipe-image" src="${escapeHtml(recipe.imageUrl)}" alt="${escapeHtml(recipe.title)}" />
                  <div class="recipe-meta">
                    <span>${recipe.cookTime} 分钟</span>
                    <span>${recipe.servings} 人份</span>
                    <span>${escapeHtml(recipe.flavor)}</span>
                  </div>
                  <p class="recipe-summary">${escapeHtml(recipe.summary)}</p>
                  <div class="ingredient-row">
                    ${recipe.ingredients.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
                  </div>
                  <div class="info-block">
                    <strong>营养搭配建议</strong>
                    <p>${escapeHtml(recipe.nutrition)}</p>
                  </div>
                  <div class="info-block">
                    <strong>做法提示</strong>
                    <ol>
                      ${recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
                    </ol>
                  </div>
                `
                : `
                  <div class="recipe-empty">
                    <div class="placeholder-plate" aria-hidden="true">🥗</div>
                    <p>输入食材后生成今晚菜谱图，也支持直接用文字版菜谱开始共享。</p>
                  </div>
                `
          }

          ${
            appState.recipeStatus === "error"
              ? `<p class="feedback error">${escapeHtml(appState.recipeError || "本次生成失败，可重试或直接使用文字版菜谱。")}</p>`
              : ""
          }

          ${
            recipe?.fallbackUsed
              ? `<p class="feedback warn">AI 图片暂时不可用，已降级为文字版晚餐建议。</p>`
              : ""
          }

          <div class="card-actions">
            <button class="button button-secondary" type="button" data-action="regenerate" ${
              isLoading ? "disabled" : ""
            }>
              重新生成
            </button>
            <button class="button button-primary" type="button" data-action="save-tonight" ${
              canSave ? "" : "disabled"
            }>
              ${saveLabel}
            </button>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderFamily() {
  if (appState.familyStatus === "loading") {
    return `
      <section class="content-panel family-panel" id="family">
        <div class="section-heading">
          <p class="eyebrow">家庭晚餐组</p>
          <h2>谁看了、谁确认了、谁还没回，一眼就看见</h2>
        </div>
        <div class="empty-panel">正在同步家庭晚餐组...</div>
      </section>
    `;
  }

  if (appState.familyStatus === "error") {
    return `
      <section class="content-panel family-panel" id="family">
        <div class="section-heading">
          <p class="eyebrow">家庭晚餐组</p>
          <h2>谁看了、谁确认了、谁还没回，一眼就看见</h2>
        </div>
        <div class="empty-panel error-panel">
          <p>${escapeHtml(appState.familyError || "家庭组同步失败，请稍后重试。")}</p>
          <button class="button button-secondary" type="button" data-action="retry-family">重新拉取</button>
        </div>
      </section>
    `;
  }

  if (!appState.family) {
    return `
      <section class="content-panel family-panel" id="family">
        <div class="section-heading">
          <p class="eyebrow">家庭晚餐组</p>
          <h2>先保存一份今晚菜单，再分享给家人</h2>
        </div>
        <div class="empty-panel">当前还没有家庭组数据，先在上面生成并保存今晚菜谱。</div>
      </section>
    `;
  }

  const family = appState.family;
  const confirmState = getFamilyConfirmationState(family);

  return `
    <section class="content-panel family-panel" id="family">
      <div class="section-heading">
        <p class="eyebrow">家庭晚餐组</p>
        <h2>今晚菜单已同步，家人确认状态实时更新</h2>
        <p>生成方案后保存到今晚，再分享给家人，最后由成员查看和确认。</p>
      </div>

      <div class="family-layout">
        <article class="family-card">
          <div class="member-row">
            ${family.members
              .map(
                (member) => `
                  <div class="member-pill">
                    <span class="avatar">${escapeHtml(member.name.slice(0, 1))}</span>
                    <strong>${escapeHtml(member.name)}</strong>
                    <small>${member.role === "host" ? "发起人" : "成员"}</small>
                  </div>
                `,
              )
              .join("")}
            <button class="member-pill member-pill-invite" type="button" data-action="share-family">邀请</button>
          </div>

          <div class="sync-banner">
            <div>
              <p class="card-label">今晚菜单已同步</p>
              <strong>${escapeHtml(family.plan.title)}</strong>
            </div>
            <span class="invite-code">邀请码 ${escapeHtml(family.inviteCode)}</span>
          </div>

          <div class="family-recipe">
            <img src="${escapeHtml(family.plan.imageUrl)}" alt="${escapeHtml(family.plan.title)}" />
            <div>
              <div class="recipe-meta">
                <span>${family.plan.cookTime} 分钟</span>
                <span>${family.plan.servings} 人份</span>
              </div>
              <p>${escapeHtml(family.plan.summary)}</p>
            </div>
          </div>

          <div class="timeline">
            ${family.members
              .map(
                (member) => `
                  <div class="timeline-item">
                    <span class="timeline-dot status-${escapeHtml(member.status)}" aria-hidden="true"></span>
                    <div>
                      <strong>${escapeHtml(member.name)}${member.status === "confirmed" ? "已确认" : member.status === "viewed" ? "已查看" : "未回复"}</strong>
                      <p>${escapeHtml(member.note)}</p>
                    </div>
                  </div>
                `,
              )
              .join("")}
          </div>

          <div class="card-actions">
            <button class="button button-primary" type="button" data-action="share-family">分享给家人</button>
            <button class="button button-disabled" type="button" ${confirmState === "done" ? "" : "disabled"}>
              ${confirmState === "done" ? "今晚就吃这个" : "等待成员确认"}
            </button>
          </div>
        </article>

        <aside class="flow-card">
          <p class="card-label">家庭同步流程</p>
          <div class="flow-steps">
            <span>生成方案</span>
            <span>分享给家人</span>
            <span>家人确认</span>
            <span>菜单敲定</span>
          </div>
          <p class="help-copy">分享成功后顶部会出现“已同步到家庭晚餐组”的提示，方便在 App 内继续操作。</p>
        </aside>
      </div>
    </section>
  `;
}

function renderRelease() {
  const version = appState.release?.version ?? APP_VERSION;
  return `
    <section class="content-panel release-panel" id="release">
      <div class="section-heading">
        <p class="eyebrow">已发布 ${escapeHtml(version)}</p>
        <h2>更新反馈页与官网首页一起发版</h2>
        <p>从首页或设置页进入更新页，继续查看完整更新日志与官网详情页。</p>
      </div>

      <div class="release-layout">
        <article class="release-card">
          <div class="release-header">
            <div>
              <p class="card-label">更新反馈页</p>
              <strong>已发布 ${escapeHtml(version)}</strong>
            </div>
            <span class="release-badge">官网同步中</span>
          </div>
          <div class="release-list">
            ${releaseNotes.map((item) => `<span>${item}</span>`).join("")}
          </div>
          <div class="card-actions">
            <a class="button button-primary" href="#hero">查看更新</a>
            <a class="button button-secondary" href="#help">了解新版本</a>
          </div>
        </article>

        <article class="website-card">
          <p class="card-label">官网首页信息架构</p>
          <h3>下载入口、更新日志、功能亮点合并呈现</h3>
          <div class="highlight-list">
            ${siteHighlights
              .map(
                (item) => `
                  <div class="highlight-item">
                    <strong>${escapeHtml(item.title)}</strong>
                    <p>${escapeHtml(item.text)}</p>
                  </div>
                `,
              )
              .join("")}
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderSiteSections() {
  return `
    <section class="content-panel site-panel" id="features">
      <div class="section-heading">
        <p class="eyebrow">功能</p>
        <h2>今晚吃什么，从建议到确认不再断开</h2>
      </div>
      <div class="site-grid">
        ${siteHighlights
          .map(
            (item) => `
              <article class="mini-panel">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>

    <section class="content-panel help-panel" id="help">
      <div class="section-heading">
        <p class="eyebrow">帮助中心</p>
        <h2>用户常见问题</h2>
      </div>
      <div class="faq-list">
        <details class="faq-item">
          <summary>AI 生菜谱图失败了怎么办？</summary>
          <p>页面会自动降级为文字版菜谱建议，并保留重新生成入口，不阻塞保存到今晚。</p>
        </details>
        <details class="faq-item">
          <summary>家庭组成员没有回复怎么办？</summary>
          <p>家庭组页会明确显示未回复、已查看、已确认三态，方便继续提醒或直接改菜单。</p>
        </details>
        <details class="faq-item">
          <summary>更新入口在哪里？</summary>
          <p>首页和更新页都保留“下载 App / 查看更新”入口，官网首页也同步更新发布信息。</p>
        </details>
      </div>
    </section>
  `;
}

function renderToast() {
  return appState.toast ? `<div class="toast" role="status">${escapeHtml(appState.toast)}</div>` : "";
}

function renderApp() {
  app.innerHTML = `
    <div class="site-shell">
      <div class="bg-blur blur-one"></div>
      <div class="bg-blur blur-two"></div>
      <header class="topbar">
        <a class="brand" href="#hero">
          <span class="brand-mark">今</span>
          <div>
            <strong>今晚吃什么</strong>
            <span>AI 帮你想菜，家人一起确认今晚菜单</span>
          </div>
        </a>
        <nav class="nav">
          <a href="#hero">首页</a>
          <a href="#features">功能</a>
          <a href="#release">更新日志</a>
          <a href="#help">帮助中心</a>
        </nav>
      </header>

      <main>
        ${renderHero()}
        ${renderPlanner()}
        ${renderFamily()}
        ${renderRelease()}
        ${renderSiteSections()}
      </main>

      <footer class="footer">
        <p>今晚吃什么 ${escapeHtml(appState.release?.version ?? APP_VERSION)} · 官网与 App 文案已统一</p>
      </footer>
      ${renderToast()}
    </div>
  `;

  bindEvents();
}

function syncFormState(formData) {
  appState.plannerForm = {
    mode: formData.get("mode")?.trim() ?? "",
    ingredients: formData.get("ingredients")?.trim() ?? "",
    servings: Number(formData.get("servings") || 1),
    flavor: formData.get("flavor")?.trim() ?? "",
    notes: formData.get("notes")?.trim() ?? "",
  };
}

async function generateRecipe() {
  appState.recipeStatus = "loading";
  appState.recipeError = "";
  renderApp();

  try {
    const response = await fetch("/api/meal-plan/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients: appState.plannerForm.ingredients
          .split(/[,，、\n]/)
          .map((item) => item.trim())
          .filter(Boolean),
        servings: appState.plannerForm.servings,
        flavor: appState.plannerForm.flavor || appState.selectedChip,
        dietaryNotes: appState.plannerForm.notes
          .split(/[,，、\n]/)
          .map((item) => item.trim())
          .filter(Boolean),
        style: "homey",
      }),
    });

    if (!response.ok) {
      throw new Error("晚餐方案暂时没生成出来，请重试。");
    }

    const data = await response.json();
    appState.recipe = {
      ...fallbackRecipe,
      ...data,
      servings: data.servings ?? appState.plannerForm.servings,
      flavor:
        data.flavor ??
        appState.plannerForm.flavor ??
        appState.selectedChip ??
        "家常暖胃",
    };
    appState.recipeStatus = "success";
    renderApp();
    document.querySelector(".recipe-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    appState.recipeStatus = "error";
    appState.recipe = {
      ...fallbackRecipe,
      fallbackUsed: true,
      summary: "AI 图片暂时不可用，先给你一版文字菜谱，仍可保存到今晚。",
    };
    appState.recipeError = error instanceof Error ? error.message : "晚餐方案暂时没生成出来，请重试。";
    renderApp();
  }
}

async function ensureFamilyGroup() {
  if (appState.family?.familyId && appState.family?.inviteCode) {
    return appState.family;
  }

  const createResponse = await fetch("/api/family-groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      groupName: fallbackFamily.familyName,
      ownerName: "你",
    }),
  });

  if (!createResponse.ok) {
    throw new Error("家庭组创建失败。");
  }

  const created = await createResponse.json();
  appState.family = {
    familyId: created.groupId,
    familyName: created.groupName,
    inviteCode: created.inviteCode,
    shareUrl: created.shareUrl,
    members: fallbackFamily.members,
    plan: fallbackRecipe,
  };

  return appState.family;
}

async function loadFamily() {
  appState.familyStatus = "loading";
  renderApp();

  try {
    const family = await ensureFamilyGroup();
    const response = await fetch(
      `/api/family-groups/${family.familyId}/tonight-meal?code=${encodeURIComponent(family.inviteCode)}`,
    );
    if (!response.ok) {
      throw new Error("家庭组数据拉取失败。");
    }
    const data = await response.json();
    appState.family = {
      familyId: data.groupId,
      familyName: data.groupName,
      inviteCode: data.inviteCode ?? fallbackFamily.inviteCode,
      shareUrl: data.shareUrl ?? fallbackFamily.shareUrl,
      members: data.members ?? fallbackFamily.members,
      plan: {
        ...fallbackRecipe,
        ...(data.meal ?? {}),
      },
    };
    appState.familyStatus = "ready";
    renderApp();
  } catch (error) {
    appState.familyStatus = "error";
    appState.familyError = error instanceof Error ? error.message : "家庭组数据拉取失败。";
    renderApp();
  }
}

async function loadRelease() {
  try {
    const response = await fetch("/api/release");
    if (!response.ok) {
      return;
    }
    appState.release = await response.json();
    renderApp();
  } catch {
    // Ignore release hydration errors and keep local defaults.
  }
}

async function saveTonight() {
  if (!appState.recipe) {
    return;
  }

  try {
    const family = await ensureFamilyGroup();
    const response = await fetch(`/api/family-groups/${family.familyId}/tonight-meal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: family.inviteCode,
        updatedBy: "你",
        date: APP_DATE,
        meal: {
          recipeId: appState.recipe.recipeId,
          title: appState.recipe.title,
          summary: appState.recipe.summary,
          imageUrl: appState.recipe.imageUrl,
          ingredients: appState.recipe.ingredients,
          steps: appState.recipe.steps,
          servings: appState.recipe.servings,
          cookTime: appState.recipe.cookTime,
          flavor: appState.recipe.flavor,
          nutrition: appState.recipe.nutrition,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("保存失败");
    }

    appState.recipeStatus = "saved";
    appState.toast = "已同步到家庭晚餐组";
    await loadFamily();
    renderApp();
    window.setTimeout(() => {
      appState.toast = "";
      renderApp();
    }, 2500);
  } catch {
    appState.toast = "保存到今晚失败，请稍后重试";
    renderApp();
  }
}

async function shareFamily() {
  const shareText = `${appState.family?.familyName ?? "家庭晚餐组"}已同步今晚菜单：${appState.family?.plan?.title ?? fallbackRecipe.title}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "今晚吃什么",
        text: shareText,
        url: appState.family?.shareUrl ?? fallbackFamily.shareUrl,
      });
      return;
    } catch {
      // Fall through to clipboard.
    }
  }

  try {
    await navigator.clipboard.writeText(appState.family?.shareUrl ?? fallbackFamily.shareUrl);
    appState.toast = "分享链接已复制，已同步到家庭晚餐组";
  } catch {
    appState.toast = "分享入口已准备好，请手动复制当前页面链接";
  }
  renderApp();
  window.setTimeout(() => {
    appState.toast = "";
    renderApp();
  }, 2500);
}

function bindEvents() {
  document.querySelectorAll("[data-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      const chip = button.getAttribute("data-chip") ?? "";
      appState.selectedChip = chip;
      appState.plannerForm.flavor = chip;
      renderApp();
    });
  });

  document.querySelector("#planner-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    syncFormState(formData);
    generateRecipe();
  });

  document.querySelectorAll('[data-action="regenerate"]').forEach((button) => {
    button.addEventListener("click", () => {
      generateRecipe();
    });
  });

  document.querySelector('[data-action="save-tonight"]')?.addEventListener("click", () => {
    saveTonight();
  });

  document.querySelectorAll('[data-action="share-family"]').forEach((button) => {
    button.addEventListener("click", () => {
      shareFamily();
    });
  });

  document.querySelector('[data-action="retry-family"]')?.addEventListener("click", () => {
    loadFamily();
  });
}

renderApp();
loadFamily();
loadRelease();
