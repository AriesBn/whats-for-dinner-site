import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const from = resolve(rootDir, "public", "notes.html");
const to = resolve(rootDir, "dist", "client", "notes.html");

await mkdir(dirname(to), { recursive: true });
await copyFile(from, to);
