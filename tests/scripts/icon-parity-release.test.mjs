import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureIconAssets } from "../../scripts/ensure-icon-assets.mjs";

const iconSizes = [16, 32, 48, 64, 128, 256, 512];

test("ensureIconAssets passes for repository icon set", () => {
  const result = ensureIconAssets();
  assert.equal(result.ok, true);
  assert.equal(result.required_count, iconSizes.length);
});

test("ensureIconAssets uses fallback generator when icon files are missing", () => {
  const root = mkdtempSync(join(tmpdir(), "axis-icon-fallback-"));
  mkdirSync(join(root, "extension", "media"), { recursive: true });

  let generateCalls = 0;
  const result = ensureIconAssets({
    rootDir: root,
    generate: (cwd) => {
      generateCalls += 1;
      for (const size of iconSizes) {
        writeFileSync(join(cwd, "extension", "media", `icon-${size}.png`), "placeholder");
      }
    }
  });

  assert.equal(result.ok, true);
  assert.equal(result.fallback_used, true);
  assert.equal(generateCalls, 1);
});

test("release dry-run includes icon parity gate call", () => {
  const source = readFileSync("scripts/release-dry-run.mjs", "utf8");
  assert.ok(source.includes("ensureIconAssets"));
});

test("extension package includes media files for icon assets", () => {
  const manifest = JSON.parse(readFileSync("extension/package.json", "utf8"));
  assert.ok(Array.isArray(manifest.files));
  assert.ok(manifest.files.includes("media/**"));
  assert.equal(existsSync("extension/media/icon-512.png"), true);
});
