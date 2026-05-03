# Cloudflare KV 按钮映射

这个站点已经改成通过 Cloudflare Worker 读取 `BUTTON_LINKS` KV。

规则：

- K：网页上的按钮文字
- V：按钮直达链接

当前默认映射定义在：

- `src/button-links.js`

## 1. 安装依赖

```bash
npm install
```

## 2. 登录 Cloudflare

```bash
npx wrangler login
```

## 3. 创建 KV Namespace

```bash
npx wrangler kv namespace create BUTTON_LINKS
```

把输出里的 namespace id 填回：

- `wrangler.jsonc`

把 `kv_namespaces[0].id` 从占位值改成真实 id。

## 4. 把按钮链接写入远端 KV

```bash
npm run kv:seed
```

这个脚本会把 `src/button-links.js` 里的所有 K/V 写入远端 KV。

## 5. 本地开发

```bash
npm run dev
```

页面会请求：

- `GET /api/button-links`

Worker 会从 `BUTTON_LINKS` 里读取同名 key，并覆盖前端默认链接。

## 6. 构建生产包

```bash
npm run build
```

用途：执行 Vite 生产构建，输出可部署的前端静态资源（通常在 `dist/` 目录）。

## 7. 预览生产包

```bash
npm run preview
```

用途：在本地启动预览服务，验证 `npm run build` 产物在生产模式下的效果。

## 8. 部署

```bash
npm run deploy
```

用途：将站点和 Worker 发布到 Cloudflare（请在确认配置与内容无误后手动执行）。

## 9. 初始化/更新 KV 数据

```bash
npm run kv:seed
```

用途：把 `src/button-links.js` 中的按钮键值对批量写入远端 `BUTTON_LINKS` KV，用于初始化或覆盖更新链接数据。
