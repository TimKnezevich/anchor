import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../shared/observability/src/index.mjs";

const logger = createLogger({ service: "axis-changelog" });
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const changelogPath = join(root, "CHANGELOG.md");

function changelogEntry(version, date) {
  return `## [${version}] - ${date}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n`;
}

function main() {
  const version = process.argv[2];
  const date = process.argv[3] ?? new Date().toISOString().slice(0, 10);

  if (!version) {
    throw new Error("Usage: node ./scripts/update-changelog.mjs <version> [YYYY-MM-DD]");
  }

  const existing = existsSync(changelogPath)
    ? readFileSync(changelogPath, "utf8")
    : "# Changelog\n\nAll notable changes to this project are documented in this file.\n\n";

  if (existing.includes(`## [${version}]`)) {
    logger.warn("Changelog already contains version", { version });
    return;
  }

  const marker = "# Changelog\n\nAll notable changes to this project are documented in this file.\n\n";
  const prefix = existing.startsWith(marker) ? marker : "# Changelog\n\n";
  const remainder = existing.startsWith(prefix) ? existing.slice(prefix.length) : existing;

  writeFileSync(changelogPath, `${prefix}${changelogEntry(version, date)}${remainder}`);
  logger.info("Changelog updated", { version, date, path: "CHANGELOG.md" });
}

try {
  main();
} catch (error) {
  logger.error("Changelog update failed", {}, error);
  process.exit(1);
}
