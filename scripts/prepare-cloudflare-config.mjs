import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const cwd = process.cwd();
const outputConfigCandidates = [
  {
    absolutePath: resolve(
      cwd,
      "dist",
      "whats_for_dinner_site",
      "wrangler.json",
    ),
    relativePath: "../../dist/whats_for_dinner_site/wrangler.json",
  },
  {
    absolutePath: resolve(
      cwd,
      "dist",
      "playful_personal_site",
      "wrangler.json",
    ),
    relativePath: "../../dist/playful_personal_site/wrangler.json",
  },
];
const selectedOutputConfig = outputConfigCandidates.find(({ absolutePath }) =>
  existsSync(absolutePath),
);

if (!selectedOutputConfig) {
  console.error(
    "Missing build output:",
    outputConfigCandidates.map(({ absolutePath }) => absolutePath).join(" or "),
  );
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
      configPath: selectedOutputConfig.relativePath,
      auxiliaryWorkers: [],
    },
    null,
    2,
  ),
);
