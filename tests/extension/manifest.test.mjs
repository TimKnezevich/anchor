import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function loadManifest() {
  const raw = readFileSync(new URL("../../extension/package.json", import.meta.url), "utf8");
  return JSON.parse(raw);
}

test("extension manifest declares required commands", () => {
  const manifest = loadManifest();

  const commands = manifest.contributes.commands.map((item) => item.command).sort();
  assert.deepEqual(commands, [
    "axis.initializeRepository",
    "axis.checkConnection",
    "axis.openGraphExplorer"
  ].sort());
});

test("extension manifest main and activation events are configured", () => {
  const manifest = loadManifest();

  assert.equal(manifest.main, "./src/vscode-extension.js");
  assert.ok(Array.isArray(manifest.activationEvents));
  assert.ok(manifest.activationEvents.includes("onCommand:axis.initializeRepository"));
  assert.ok(manifest.activationEvents.includes("onCommand:axis.openGraphExplorer"));
});
