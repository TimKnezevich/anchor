import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

function pngDimensions(path) {
  const content = readFileSync(path);
  const signature = content.subarray(0, 8);
  const expected = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.deepEqual(signature, expected);

  const ihdrType = content.subarray(12, 16).toString("ascii");
  assert.equal(ihdrType, "IHDR");

  return {
    width: content.readUInt32BE(16),
    height: content.readUInt32BE(20)
  };
}

test("release workflows are present", () => {
  assert.equal(existsSync(".github/workflows/ci.yml"), true);
  assert.equal(existsSync(".github/workflows/release.yml"), true);
});

test("icon source and exports exist with expected dimensions", () => {
  assert.equal(existsSync("assets/brand/axis-mark.svg"), true);

  const expectedSizes = [16, 32, 48, 64, 128, 256, 512];
  for (const size of expectedSizes) {
    const path = `extension/media/icon-${size}.png`;
    assert.equal(existsSync(path), true, `missing ${path}`);
    const { width, height } = pngDimensions(path);
    assert.equal(width, size);
    assert.equal(height, size);
  }
});

test("release dry-run validate-only succeeds", () => {
  const run = spawnSync("node", ["./scripts/release-dry-run.mjs", "--validate-only"], {
    stdio: "pipe",
    encoding: "utf8"
  });

  assert.equal(run.status, 0, run.stderr || run.stdout);
});
