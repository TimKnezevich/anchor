import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createLogger } from "../shared/observability/src/index.mjs";

const logger = createLogger({ service: "axis-icon-assets" });
const defaultRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const requiredSizes = [16, 32, 48, 64, 128, 256, 512];

function requiredIconPaths(rootDir) {
  return requiredSizes.map((size) => join(rootDir, "extension", "media", `icon-${size}.png`));
}

function missingIconPaths(rootDir) {
  return requiredIconPaths(rootDir).filter((path) => !existsSync(path));
}

function defaultGenerate(rootDir) {
  const result = spawnSync("node", ["./scripts/generate-icon-set.mjs"], {
    cwd: rootDir,
    stdio: "pipe",
    encoding: "utf8"
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim() ?? result.stdout?.trim() ?? "icon generation failed";
    throw new Error(stderr);
  }
}

export function ensureIconAssets(options = {}) {
  const rootDir = options.rootDir ? resolve(options.rootDir) : defaultRoot;
  const generate = options.generate ?? defaultGenerate;
  const beforeMissing = missingIconPaths(rootDir);

  let fallbackUsed = false;
  if (beforeMissing.length > 0) {
    fallbackUsed = true;
    logger.warn("Missing icon assets detected, generating fallback icon set", {
      missing: beforeMissing.map((path) => path.replace(`${rootDir}/`, ""))
    });
    generate(rootDir);
  }

  const afterMissing = missingIconPaths(rootDir);
  if (afterMissing.length > 0) {
    throw new Error(`Icon asset check failed. Missing: ${afterMissing.join(", ")}`);
  }

  return {
    ok: true,
    root_dir: rootDir,
    fallback_used: fallbackUsed,
    required_count: requiredSizes.length
  };
}

function main() {
  const result = ensureIconAssets();
  console.log(JSON.stringify(result, null, 2));
}

const thisScriptPath = fileURLToPath(import.meta.url);
if (resolve(process.argv[1] ?? "") === resolve(thisScriptPath)) {
  main();
}
