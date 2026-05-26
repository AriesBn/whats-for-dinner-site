import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const cwd = process.cwd();
const distDir = resolve(cwd, "dist");
const wranglerConfigPath = resolve(cwd, "wrangler.jsonc");

if (!existsSync(distDir)) {
  console.error("Missing build output:", distDir);
  console.error("Run `npm run build` before preview or deploy.");
  process.exit(1);
}

const workerBuildConfigs = readdirSync(distDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .map((name) => ({
    name,
    path: resolve(distDir, name, "wrangler.json"),
  }))
  .filter((config) => existsSync(config.path));

const wranglerConfig = readFileSync(wranglerConfigPath, "utf8");
const workerName = wranglerConfig.match(/"name"\s*:\s*"([^"]+)"/)?.[1];
const matchingWorkerBuildConfigs = workerName
  ? workerBuildConfigs.filter((config) => {
      const outputConfig = JSON.parse(readFileSync(config.path, "utf8"));
      return outputConfig.name === workerName;
    })
  : workerBuildConfigs;

if (matchingWorkerBuildConfigs.length !== 1) {
  console.error(
    `Expected exactly one Worker build output for ${workerName ?? "current config"}, found ${matchingWorkerBuildConfigs.length}.`,
  );
  if (workerBuildConfigs.length > 0) {
    console.error(
      "Found:",
      workerBuildConfigs.map((config) => config.name).join(", "),
    );
  }
  console.error("Run `npm run build` before preview or deploy.");
  process.exit(1);
}

const workerBuildDir = matchingWorkerBuildConfigs[0].name;
const outputConfigPath = resolve(distDir, workerBuildDir, "wrangler.json");

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
      configPath: `../../dist/${workerBuildDir}/wrangler.json`,
      auxiliaryWorkers: [],
    },
    null,
    2,
  ),
);
