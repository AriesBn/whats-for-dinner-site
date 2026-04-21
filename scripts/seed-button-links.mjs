import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { buttonLinks } from "../src/button-links.js";

const wranglerPath = resolve(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "wrangler.cmd" : "wrangler",
);

for (const { key, url } of buttonLinks) {
  const result = spawnSync(
    wranglerPath,
    ["kv", "key", "put", "--binding=BUTTON_LINKS", key, url, "--remote"],
    {
      stdio: "inherit",
      shell: false,
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
