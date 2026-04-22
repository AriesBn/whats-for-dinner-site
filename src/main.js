import "./style.css";
import { defaultLinkMap } from "./button-links.js";

const brandName = "没有偏见摁头钻研";

const appCards = [
  {
    name: "生活小助手",
    eyebrow: "APP 01",
    description:
      "把提醒、清单、日常习惯和碎片记录揉进一个轻松好用的小工具，重点是减少生活管理的心理负担。",
    accent: "mint",
    items: [
      {
        name: "今晚吃什么",
        note: "一个帮你快速决定今天吃什么的小工具，减少纠结，马上出发去吃饭。",
        linkKey: "今晚吃什么",
        iconEmoji: "🍽️",
      },
    ],
  },
  {
    name: "交易功能",
    eyebrow: "APP 02",
    description:
      "围绕交易场景做策略执行、记录复盘和风险提示，帮助自己把直觉经验慢慢沉淀成可重复的动作。",
    accent: "gold",
    items: [
      {
        name: "盘前计划台",
        note: "先写计划、再决定是否出手，把随意开仓压到最低。",
      },
      {
        name: "仓位计算器",
        note: "把风险、止损和资金暴露换成更清楚的数字，不靠感觉硬扛。",
      },
      {
        name: "复盘时间线",
        note: "记录进场、离场、情绪和偏差，方便把执行力一点点磨出来。",
      },
    ],
  },
  {
    name: "正在孵化",
    eyebrow: "NEXT",
    description:
      "保留给未来的新项目实验位，可以放自动化工具、内容产品或者面向特定场景的垂直小应用。",
    accent: "peach",
    items: [
      {
        name: "灵感链接盒",
        note: "把看到的好工具、好页面和好想法先收集起来，再决定值不值得继续做。",
      },
      {
        name: "内容切片器",
        note: "把长内容拆成短笔记、短标题和短视频提纲，方便持续输出。",
      },
      {
        name: "小场景工作台",
        note: "围绕某个具体麻烦点，快速做出能立刻上手的小原型。",
      },
    ],
  },
];

const agentCards = [
  {
    title: "研究型 Agent",
    description:
      "负责信息检索、结构化提炼和知识整理，把复杂问题先拆开，再交给不同流程处理。",
    items: [
      {
        name: "资料侦察员",
        note: "搜集网页、文档和讨论脉络，先把上下文补齐。",
      },
      {
        name: "结构提炼器",
        note: "把分散的信息压缩成清晰提纲、对比项和结论。",
      },
      {
        name: "交易书摘助手",
        note: "从书籍和文章里抽出能直接落地的原则与提醒。",
      },
    ],
  },
  {
    title: "执行型 Agent",
    description:
      "用来跑自动化任务、批量处理、内容生成和日常运营，让重复动作更省心。",
    items: [
      {
        name: "内容生产助手",
        note: "批量整理标题、摘要和发布草稿，把重复编辑时间省下来。",
      },
      {
        name: "数据搬运工",
        note: "把固定格式的信息同步到页面、表格和发布入口里。",
      },
      {
        name: "KV 配置助手",
        note: "专门管理按钮文字和直达链接映射，让页面链接更好维护。",
      },
    ],
  },
  {
    title: "审查型 Agent",
    description:
      "给代码、提示词和流程做第二轮检查，尽量把风险、遗漏和表达不清的地方提前抓出来。",
    items: [
      {
        name: "代码复查员",
        note: "先看行为风险，再找遗漏和潜在回归点。",
      },
      {
        name: "提示词质检员",
        note: "检查目标、约束和输出格式是否足够清晰稳定。",
      },
      {
        name: "发布前验收官",
        note: "确认链接、文案和关键流程都能正常打开，不留明显断点。",
      },
    ],
  },
];

const books = [
  {
    title: "李笑来的《韭菜的自我修养》",
    linkKey: "李笑来的《韭菜的自我修养》",
  },
  {
    title: "《定投改变命运》",
    linkKey: "《定投改变命运》",
  },
  { title: "《Market Wizards》", linkKey: "《Market Wizards》" },
  { title: "《The Daily Trading Coach》", linkKey: "《The Daily Trading Coach》" },
];

const notes = [
  {
    title: "把交易变成可以复盘的系统",
    summary:
      "记录情绪、执行、结果和偏差，长期看比一次漂亮的收益更有价值。",
  },
  {
    title: "教育感设计的真正重点",
    summary:
      "不是把页面做幼，而是让信息更友好、更可学、更愿意被探索。",
  },
  {
    title: "AI Agent 更像团队而不是工具",
    summary:
      "一个好的 Agent 体系要会拆解、会协作、会验证，而不只是会生成文本。",
  },
];

const socials = [
  {
    label: "X / Twitter",
    value: "@AriesBn2",
    hint: "分享产品进展与交易观察",
    linkKey: "X / Twitter",
    icon: "x",
  },
  {
    label: "交易所注册",
    value: "购买比特币",
    hint: "统一返佣入口与注册链接合集",
    linkKey: "GitHub",
    icon: "bitcoin",
  },
  {
    label: "Bilibili",
    value: "没有偏见摁头钻研",
    hint: "视频、观点与研究记录",
    linkKey: "Bilibili",
    icon: "bilibili",
  },
  {
    label: "YouTube",
    value: "没有偏见摁头钻研",
    hint: "视频更新与内容归档",
    linkKey: "YouTube",
    icon: "youtube",
  },
];

const metrics = [
  { value: "02+", label: "核心 APP 方向" },
  { value: "03", label: "常用 Agent 角色" },
  { value: "∞", label: "持续迭代中的灵感" },
];

const socialIcons = {
  x: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h4.2l4.1 5.6L17.1 4H20l-6.2 7.2L20.5 20h-4.2l-4.4-6-5.1 6H4l6.9-7.9z" />
    </svg>
  `,
  github: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.36 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.03-.01-1.86-2.78.62-3.37-1.21-3.37-1.21-.46-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.85.09-.67.35-1.12.64-1.37-2.22-.26-4.56-1.15-4.56-5.12 0-1.13.39-2.05 1.04-2.78-.1-.26-.45-1.31.1-2.74 0 0 .85-.28 2.79 1.06a9.4 9.4 0 0 1 5.08 0c1.94-1.34 2.79-1.06 2.79-1.06.55 1.43.2 2.48.1 2.74.65.73 1.04 1.65 1.04 2.78 0 3.98-2.35 4.85-4.59 5.11.36.32.68.93.68 1.87 0 1.35-.01 2.43-.01 2.76 0 .27.18.59.69.49A10.28 10.28 0 0 0 22 12.24C22 6.58 17.52 2 12 2z" />
    </svg>
  `,
  bitcoin: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.6 10.37c.28-1.9-1.16-2.92-3.14-3.6l.64-2.55-1.55-.39-.62 2.48c-.41-.1-.84-.2-1.26-.3l.63-2.51-1.55-.39-.64 2.55c-.34-.08-.67-.16-.99-.24l.01-.01-2.14-.54-.41 1.65s1.15.26 1.12.28c.63.16.74.58.72.91l-.73 2.94c.04.01.09.02.14.05a.56.56 0 0 0-.14-.03l-1.03 4.12c-.08.19-.27.47-.71.36.02.03-1.12-.28-1.12-.28L2 18.24l2.02.51c.38.1.75.2 1.12.29l-.65 2.6 1.55.39.64-2.56c.43.12.85.23 1.26.33l-.64 2.53 1.55.39.65-2.59c2.68.51 4.69.31 5.54-2.11.68-1.95-.03-3.08-1.44-3.81 1.03-.24 1.81-.95 2.02-2.42Zm-3.62 5.08c-.48 1.95-3.78.89-4.85.62l.87-3.5c1.06.27 4.49.85 3.98 2.88Zm.48-5.1c-.43 1.78-3.18.88-4.08.65l.79-3.17c.9.22 3.74.67 3.29 2.52Z" />
    </svg>
  `,
  bilibili: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.2 4.5 5.3 2.6l1.1-1.1 2.3 2.3h6.6l2.3-2.3 1.1 1.1-1.9 1.9h1.7c2.02 0 3.7 1.67 3.7 3.75v8c0 2.08-1.68 3.75-3.7 3.75H5.5c-2.02 0-3.7-1.67-3.7-3.75v-8C1.8 6.17 3.48 4.5 5.5 4.5Zm-.7 3a1.2 1.2 0 0 0-1.2 1.2v7a1.2 1.2 0 0 0 1.2 1.2h11a1.2 1.2 0 0 0 1.2-1.2v-7a1.2 1.2 0 0 0-1.2-1.2Zm2.2 2.2c.44 0 .8.36.8.8v2.6a.8.8 0 1 1-1.6 0v-2.6c0-.44.36-.8.8-.8Zm6.6 0c.44 0 .8.36.8.8v2.6a.8.8 0 1 1-1.6 0v-2.6c0-.44.36-.8.8-.8Z" />
    </svg>
  `,
  youtube: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.8 8.3a2.9 2.9 0 0 0-2-2C18 5.8 12 5.8 12 5.8s-6 0-7.8.5a2.9 2.9 0 0 0-2 2A31.5 31.5 0 0 0 1.8 12c0 1.2.14 2.45.4 3.7a2.9 2.9 0 0 0 2 2c1.8.5 7.8.5 7.8.5s6 0 7.8-.5a2.9 2.9 0 0 0 2-2c.26-1.25.4-2.5.4-3.7s-.14-2.45-.4-3.7ZM10.1 15.2V8.8l5.4 3.2Z" />
    </svg>
  `,
};

const app = document.querySelector("#app");

let linkMap = { ...defaultLinkMap };

function getLink(key) {
  return linkMap[key] ?? defaultLinkMap[key] ?? "#";
}

function isExternalLink(url) {
  return /^(https?:|mailto:)/.test(url);
}

function renderAnchorClasses(baseClass, url) {
  return isExternalLink(url) ? `${baseClass} clickable-link` : baseClass;
}

function renderAnchorTarget(url) {
  return isExternalLink(url) ? 'target="_blank" rel="noreferrer"' : "";
}

function renderExpandableCard(item, options) {
  return `
    <details class="info-card ${options.cardClass} is-collapsible">
      <summary>
        ${options.renderHeader(item)}
        <p>${item.description}</p>
      </summary>
      <div class="card-detail-panel">
        <p class="detail-kicker">${options.kicker}</p>
        <div class="detail-grid">
          ${item.items
            .map(
              (entry) => {
                if (entry.linkKey) {
                  const url = getLink(entry.linkKey);
                  return `
                    <a
                      class="${renderAnchorClasses("detail-card detail-app-link", url)}"
                      href="${url}"
                      ${renderAnchorTarget(url)}
                      aria-label="打开 ${entry.name}"
                    >
                      <span class="detail-app-icon" aria-hidden="true">${entry.iconEmoji ?? "✨"}</span>
                      <span class="detail-app-copy">
                        <strong>${entry.name}</strong>
                        <p>${entry.note}</p>
                      </span>
                    </a>
                  `;
                }

                return `
                  <article class="detail-card">
                    <strong>${entry.name}</strong>
                    <p>${entry.note}</p>
                  </article>
                `;
              },
            )
            .join("")}
        </div>
      </div>
    </details>
  `;
}

function renderSocialItem(item) {
  const url = getLink(item.linkKey);
  return `
    <a
      class="${renderAnchorClasses("social-item social-link", url)}"
      href="${url}"
      ${renderAnchorTarget(url)}
      aria-label="${item.label}: ${item.value}"
    >
      <div class="social-main">
        <span class="social-icon social-icon-${item.icon}" aria-hidden="true">
          ${socialIcons[item.icon]}
        </span>
        <div class="social-copy">
          <p class="social-label">${item.label}</p>
          <strong>${item.value}</strong>
        </div>
      </div>
      <span>${item.hint}</span>
    </a>
  `;
}

function renderApp() {
  app.innerHTML = `
    <div class="site-shell">
      <div class="bg-orb orb-one"></div>
      <div class="bg-orb orb-two"></div>
      <div class="bg-grid" aria-hidden="true"></div>

      <header class="topbar">
        <a class="brand" href="#hero" aria-label="${brandName}">
          <span class="brand-badge image-badge">
            <img src="/avatar.jpg" alt="${brandName}头像" />
          </span>
          <span class="brand-text">${brandName}</span>
        </a>
        <nav class="nav">
          <a href="#apps">APP</a>
          <a href="#agents">Agent</a>
          <a href="#socials">社交媒体</a>
          <a href="#notes">心得</a>
          <a href="#books">书架</a>
        </nav>
      </header>

      <main>
        <section class="hero card-panel" id="hero">
          <div class="hero-copy">
            <h1>分享个人VIbe出来的APP、交易心得与有用链接</h1>
            <p class="hero-text">
              这里主要展示我正在开发的 APP、正在打磨的 Agent 工作流、影响我很深的交易书籍，
              以及一路做事时留下来的心得与分享。
            </p>
            <div class="hero-actions">
              <a class="button primary" href="${getLink("查看项目")}">查看项目</a>
              <a class="button secondary" href="${getLink("找到我")}">找到我</a>
            </div>
          </div>

          <div class="hero-board" aria-label="网站亮点概览">
            <button class="bookmark-button" type="button" data-action="bookmark-site">
              收藏网站
            </button>
            <div class="hero-visual">
              <div class="mini-card mini-card-large">
                <span>Focus</span>
                <strong>APP + Agent + Trading</strong>
              </div>
            </div>
            <div class="metrics">
              ${metrics
                .map(
                  (item) => `
                    <article class="metric-card">
                      <strong>${item.value}</strong>
                      <span>${item.label}</span>
                    </article>
                  `,
                )
                .join("")}
            </div>
          </div>
        </section>

        <section class="content-section" id="apps">
          <div class="section-heading">
            <p class="eyebrow">01. My Apps</p>
            <h2>我在做什么产品</h2>
            <p>从生活效率到交易执行，所有项目都围绕“把复杂事情变简单”展开。</p>
          </div>
          <div class="card-grid app-grid">
            ${appCards
              .map((item) =>
                renderExpandableCard(item, {
                  cardClass: `accent-${item.accent}`,
                  kicker: "点开后看到的是这一类型里我正在 vibe coding 的小 APP。",
                  renderHeader: (currentItem) => `
                    <p class="card-eyebrow">${currentItem.eyebrow}</p>
                    <h3>${currentItem.name}</h3>
                  `,
                }),
              )
              .join("")}
          </div>
        </section>

        <section class="content-section" id="agents">
          <div class="section-heading">
            <p class="eyebrow">02. Agent Studio</p>
            <h2>我如何用 Agent 协作</h2>
            <p>把一个人能做的事，逐渐变成一个能分工、能验证、能复用的小型系统。</p>
          </div>
          <div class="card-grid agent-grid">
            ${agentCards
              .map((item) =>
                renderExpandableCard(item, {
                  cardClass: "soft-card",
                  kicker: "点开后看到的是我在这个角色里已经搭过的 Agent。",
                  renderHeader: (currentItem) => `<h3>${currentItem.title}</h3>`,
                }),
              )
              .join("")}
          </div>
        </section>

        <section class="content-section" id="socials">
          <div class="section-heading">
            <p class="eyebrow">03. Socials</p>
            <h2>社交媒体与联系入口</h2>
          </div>
          <div class="social-board card-panel" id="social-links">
            ${socials.map(renderSocialItem).join("")}
          </div>
        </section>

        <section class="content-section" id="notes">
          <div class="section-heading">
            <p class="eyebrow">04. Notes</p>
            <div class="section-heading-row">
              <h2>个人心得分享</h2>
              <a class="section-more" href="/notes.html">
                查看更多
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div class="card-grid notes-grid">
            ${notes
              .map(
                (item) => `
                  <article class="note-card">
                    <h3>${item.title}</h3>
                    <p>${item.summary}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>

        <section class="content-section split-section" id="books">
          <div class="section-heading">
            <p class="eyebrow">05. Trading Books</p>
            <h2>我常翻的交易书籍</h2>
            <p>这些书不只是知识库，更是帮我校准心态、纪律和方法的长期参考。</p>
          </div>
          <div class="bookshelf">
            ${books
              .map((book, index) => {
                const url = getLink(book.linkKey);
                return `
                  <a
                    class="${renderAnchorClasses("book-card book-link", url)}"
                    href="${url}"
                    ${renderAnchorTarget(url)}
                    aria-label="打开 ${book.title}"
                  >
                    <span class="book-index">0${index + 1}</span>
                    <h3>${book.title}</h3>
                    <span class="book-cta">查看真实条目</span>
                  </a>
                `;
              })
              .join("")}
          </div>
        </section>
      </main>

      <footer class="footer">
        <a href="${getLink("回到顶部")}">回到顶部</a>
      </footer>
    </div>
  `;

  bindBookmarkButton();
}

function bindBookmarkButton() {
  const button = document.querySelector('[data-action="bookmark-site"]');
  if (!button) {
    return;
  }

  button.addEventListener("click", async () => {
    const targetUrl = window.location.origin;
    const pageTitle = document.title;

    if (window.external?.AddFavorite) {
      window.external.AddFavorite(targetUrl, pageTitle);
      return;
    }

    if (window.sidebar?.addPanel) {
      window.sidebar.addPanel(pageTitle, targetUrl, "");
      return;
    }

    try {
      await navigator.clipboard.writeText(targetUrl);
    } catch {
      // Ignore clipboard failures and still show browser shortcut guidance.
    }

    window.alert("浏览器通常不允许网页直接写入收藏夹。链接已准备好，请按 Ctrl+D（Mac 上是 Command+D）完成收藏。");
  });
}

async function hydrateLinksFromKv() {
  try {
    const response = await fetch("/api/button-links");
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    if (data?.links && typeof data.links === "object") {
      linkMap = { ...defaultLinkMap, ...data.links };
      renderApp();
    }
  } catch {
    // Keep default links when the Worker API is not available.
  }
}

renderApp();
hydrateLinksFromKv();
