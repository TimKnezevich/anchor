import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function loadManifest() {
  const raw = readFileSync(new URL("../../extension/package.json", import.meta.url), "utf8");
  return JSON.parse(raw);
}

test("extension manifest icon references generated icon assets", () => {
  const manifest = loadManifest();

  assert.equal(manifest.icon, "media/icon-128.png");
  assert.equal(existsSync("extension/media/icon-128.png"), true);
});

test("activity bar icon uses generated asset path", () => {
  const manifest = loadManifest();
  const activityContainers = manifest.contributes?.viewsContainers?.activitybar ?? [];
  const axisContainer = activityContainers.find((item) => item.id === "axisSidebar");

  assert.ok(axisContainer);
  assert.equal(axisContainer.icon, "media/icon-32.png");
  assert.equal(existsSync("extension/media/icon-32.png"), true);
});
