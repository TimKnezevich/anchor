import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createLogger } from "../shared/observability/src/index.mjs";

const logger = createLogger({ service: "axis-extension-package" });

const here = dirname(fileURLToPath(import.meta.url));
const extensionDir = join(here, "..", "extension");
const distDir = join(here, "..", "dist");
const vsceBinary = join(extensionDir, "node_modules", ".bin", "vsce");

mkdirSync(distDir, { recursive: true });

if (!existsSync(vsceBinary)) {
  logger.error("Extension packaging prerequisites missing", {
    extension_dir: extensionDir,
    expected_binary: vsceBinary,
    action: "Run: npm --prefix extension install"
  });
  process.exit(1);
}

const result = spawnSync(
  vsceBinary,
  [
    "package",
    "--no-dependencies",
    "--out",
    "../dist/axis-vscode-extension.vsix"
  ],
  {
    cwd: extensionDir,
    stdio: "inherit"
  }
);

if (result.status !== 0) {
  logger.error("Extension packaging failed", {
    extension_dir: extensionDir,
    exit_code: result.status
  });
  process.exit(result.status ?? 1);
}

logger.info("Extension packaged", {
  output: "dist/axis-vscode-extension.vsix"
});
