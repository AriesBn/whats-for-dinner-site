# AGENTS 指南

本仓库是一个 **Vite + Cloudflare Worker + KV** 的单页站点。

## 项目关键入口与配置
- 前端入口：`src/main.js`
- 链接配置：`src/button-links.js`
- Worker 入口：`worker/index.js`
- Cloudflare 配置：`wrangler.jsonc`

## 修改约束（请严格遵守）
1. 不要随意改动 `wrangler.jsonc`、KV namespace、部署配置和生产域名。
2. 修改链接、按钮、文案时，优先保持现有结构，避免不必要的重构。
3. 每次改代码后，至少运行一次：`npm run build`。
4. 如果改动涉及 Worker/API，请重点检查 `/api/button-links` 相关逻辑。
5. 不要自动部署，不要自动合并。

## 质量与审查
- Claude Code会再次审查你的代码。
