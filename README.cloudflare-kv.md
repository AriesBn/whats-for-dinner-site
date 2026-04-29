# Cloudflare 0.1.0 发布说明

晚餐 APP `0.1.0` 首发仍使用单个 Cloudflare Worker 承接官网与 API，当前线上资源口径如下：

- `BUTTON_LINKS`：官网按钮链接 KV
- `DINNER_APP_KV`：家庭组、今晚菜谱、分享码等业务数据 KV
- `DINNER_IMAGES`：AI 生菜谱图图片存储 R2
- `AI`：Cloudflare Workers AI 绑定
- `APP_VERSION`：当前首发版本号，固定为 `0.1.0`
- `APP_BASE_URL`：站点对外访问基址，用于拼接分享链接和图片 URL

## 1. 安装依赖并登录

```bash
npm install
npx wrangler login
```

## 2. 校对 `wrangler.jsonc`

当前发布配置文件是 `wrangler.jsonc`，上线前确认以下字段都已替换为真实值：

```jsonc
{
  "name": "whats-for-dinner-site",
  "kv_namespaces": [
    {
      "binding": "BUTTON_LINKS",
      "id": "dea87f1e1d67441bac8cc98abd2ed792",
      "remote": true
    },
    {
      "binding": "DINNER_APP_KV",
      "id": "REPLACE_WITH_DINNER_APP_KV_ID",
      "preview_id": "REPLACE_WITH_DINNER_APP_KV_PREVIEW_ID"
    }
  ],
  "r2_buckets": [
    {
      "binding": "DINNER_IMAGES",
      "bucket_name": "dinner-images-prod",
      "preview_bucket_name": "dinner-images-preview"
    }
  ],
  "ai": {
    "binding": "AI"
  },
  "vars": {
    "APP_VERSION": "0.1.0",
    "APP_BASE_URL": "https://whats-for-dinner-site.dinnerapp.workers.dev"
  }
}
```

说明：

- `DINNER_APP_KV` 是 0.1.0 首发的业务主存储，已收口为单一 KV binding，不再拆成多个 namespace。
- `DINNER_IMAGES` 必须是可写的 R2 bucket，否则 AI 出图只能退化成文字菜谱。
- `AI` 使用 Cloudflare Workers AI binding，当前实现不依赖额外第三方 provider secret。
- `APP_BASE_URL` 必须是最终对外域名；分享链接和图片 URL 都依赖它生成。

## 3. 创建或补齐 Cloudflare 资源

如果资源尚未创建，按下面顺序补齐：

```bash
npx wrangler kv namespace create DINNER_APP_KV
npx wrangler kv namespace create DINNER_APP_KV --preview
npx wrangler r2 bucket create dinner-images-prod
npx wrangler r2 bucket create dinner-images-preview
```

然后把返回的 KV namespace id、preview id、R2 bucket 名称写回 `wrangler.jsonc`。

`BUTTON_LINKS` 已存在；只有在新环境首配时才需要重新创建。

## 4. 写入按钮链接数据

```bash
npm run kv:seed
```

这个脚本会把 `src/button-links.js` 的默认按钮映射写入远端 `BUTTON_LINKS`。

## 5. 本地构建与 Worker 自测

部署前至少执行一次构建与 Worker 测试：

```bash
npm run build
node --test worker/test/worker.test.js
```

这组测试覆盖：

- `POST /api/family-groups`
- `GET /api/family-groups/:groupId/tonight-meal`
- `POST /api/family-groups/:groupId/tonight-meal`
- `PATCH /api/family-groups/:groupId/tonight-meal/status`
- `POST /api/meal-plan/generate-image`

## 6. 部署步骤

按下面顺序执行，避免先发代码后补资源导致 500/503：

1. 确认 `wrangler.jsonc` 中 `DINNER_APP_KV`、`DINNER_IMAGES`、`AI`、`APP_VERSION`、`APP_BASE_URL` 已配置完成。
2. 执行 `npm run kv:seed`，确保 `BUTTON_LINKS` 已同步。
3. 执行 `npm run build`。
4. 执行 `npm run deploy`。

`npm run deploy` 会先运行 `scripts/prepare-cloudflare-config.mjs`，把部署配置指向当前 Worker 产物后再调用 `wrangler deploy`。

## 7. 线上 Smoke Test

部署完成后，至少验证下面几项：

1. 打开首页，确认页面显示版本号 `0.1.0`。
2. 请求 `GET /api/button-links`，确认返回 200。
3. 在首页生成一份菜谱，确认 `POST /api/meal-plan/generate-image` 返回 200。
4. 新建家庭组，确认 `POST /api/family-groups` 返回 `groupId`、`inviteCode`、`shareUrl`。
5. 保存今晚菜谱，确认 `POST /api/family-groups/:groupId/tonight-meal` 返回 `status: "shared"`。
6. 用分享链接打开家庭组页面，确认 `GET /api/family-groups/:groupId/tonight-meal?code=...` 返回今晚菜谱。
7. 提交成员查看状态，确认 `PATCH /api/family-groups/:groupId/tonight-meal/status` 返回 200，且再次读取时状态已更新。
8. 若 AI 出图失败，确认前端仍展示文字版菜谱和默认占位图，而不是整页报错。

可直接用 curl 做最小 API 冒烟：

```bash
curl -i https://<app-base-url>/api/button-links
```

```bash
curl -i -X POST https://<app-base-url>/api/family-groups \
  -H 'content-type: application/json' \
  -d '{"groupName":"我们家","ownerName":"Mia"}'
```

## 8. 回滚口径

若 0.1.0 部署后出现问题，按下面顺序回滚：

1. 先回滚到上一个已知稳定的 Worker 部署版本。
2. 如果问题只在 AI 出图，优先回退首页生成入口或让它继续走文字版降级，不要先下掉家庭组读取链路。
3. 不删除 `BUTTON_LINKS`、`DINNER_APP_KV` 或 `DINNER_IMAGES` 中已有数据；数据保留不应成为回滚阻塞项。
4. 回滚完成后，重新执行首页与家庭组最小 smoke test，确认 `GET /api/button-links` 和 `GET /api/family-groups/:groupId/tonight-meal` 可用。

这次首发的关键顺序是：先配资源，再 deploy，最后 smoke test；回滚以 Worker 版本回退为主，不以清理 KV/R2 为前提。
