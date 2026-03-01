import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createLogger } from "../shared/observability/src/index.mjs";
import { ensureIconAssets } from "./ensure-icon-assets.mjs";

const logger = createLogger({ service: "axis-release-dry-run" });
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function requiredPath(relativePath) {
  return {
    relativePath,
    absolutePath: join(root, relativePath)
  };
}

function verifyRequiredFiles() {
  const required = [
    requiredPath(".github/workflows/ci.yml"),
    requiredPath(".github/workflows/release.yml"),
    requiredPath("assets/brand/axis-mark.svg"),
    requiredPath("extension/media/icon-128.png"),
    requiredPath("docs/VERSIONING.md"),
    requiredPath("CHANGELOG.md")
  ];

  const missing = required.filter((item) => !existsSync(item.absolutePath));
  if (missing.length > 0) {
    throw new Error(`Missing required release files: ${missing.map((item) => item.relativePath).join(", ")}`);
  }

  logger.info("Release files verified", {
    checked_files: required.map((item) => item.relativePath)
  });
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function main() {
  const validateOnly = process.argv.includes("--validate-only");
  ensureIconAssets({ rootDir: root });
  verifyRequiredFiles();

  if (validateOnly) {
    logger.info("Release dry-run validation-only complete", {});
    return;
  }

  runCommand("npm", ["run", "test"]);
  runCommand("npm", ["run", "typecheck"]);
  runCommand("npm", ["run", "lint"]);
  runCommand("npm", ["run", "extension:package"]);

  logger.info("Release dry-run complete", {
    steps: ["test", "typecheck", "lint", "extension:package"]
  });
}

try {
  main();
} catch (error) {
  logger.error("Release dry-run failed", {}, error);
  process.exit(1);
}
