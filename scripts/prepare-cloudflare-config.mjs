import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const cwd = process.cwd();
const outputConfigPath = resolve(
  cwd,
  "dist",
  "playful_personal_site",
  "wrangler.json",
);

if (!existsSync(outputConfigPath)) {
  console.error("Missing build output:", outputConfigPath);
  console.error("Run `npm run build` before preview or deploy.");
  process.exit(1);
}

const deployConfigDir = resolve(cwd, ".wrangler", "deploy");
const deployConfigPath = resolve(deployConfigDir, "config.json");

mkdirSync(deployConfigDir, { recursive: true });
writeFileSync(
  deployConfigPath,
  JSON.stringify(
    {
      configPath: "../../dist/playful_personal_site/wrangler.json",
      auxiliaryWorkers: [],
    },
    null,
    2,
  ),
);
