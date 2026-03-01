import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../shared/observability/src/index.mjs";

const logger = createLogger({ service: "axis-sign-artifacts" });
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const checksumsPath = join(distDir, "checksums.txt");

function fileSha256(path) {
  const hash = createHash("sha256");
  hash.update(readFileSync(path));
  return hash.digest("hex");
}

function main() {
  if (!existsSync(distDir)) {
    throw new Error("dist directory does not exist. Build artifacts before signing.");
  }

  const files = readdirSync(distDir)
    .filter((name) => name.endsWith(".vsix") || name.endsWith(".tgz") || name.endsWith(".zip"))
    .sort();

  if (files.length === 0) {
    throw new Error("No release artifacts found in dist/. Expected .vsix, .tgz, or .zip files.");
  }

  const lines = files.map((file) => {
    const digest = fileSha256(join(distDir, file));
    return `${digest}  ${file}`;
  });

  writeFileSync(checksumsPath, `${lines.join("\n")}\n`);
  logger.info("Artifact checksums generated", {
    output: "dist/checksums.txt",
    files
  });
}

try {
  main();
} catch (error) {
  logger.error("Artifact signing failed", {}, error);
  process.exit(1);
}
