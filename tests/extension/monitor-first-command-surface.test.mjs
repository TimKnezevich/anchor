import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AxisSidebarProvider } from "../../extension/src/axis-sidebar-provider.mjs";

function loadManifest() {
  return JSON.parse(readFileSync("extension/package.json", "utf8"));
}

test("sidebar prioritizes initialize/check/graph commands and omits start task action", async () => {
  const provider = new AxisSidebarProvider();
  const items = await provider.getChildren();
  const commandIds = items
    .filter((item) => item.command?.command)
    .map((item) => item.command.command);

  assert.deepEqual(commandIds.slice(0, 3), [
    "axis.initializeRepository",
    "axis.checkConnection",
    "axis.openGraphExplorer"
  ]);
  assert.equal(commandIds.includes("axis.startTask"), false);
  assert.equal(commandIds.includes("axis.showTaskState"), false);
});

test("manifest command list is monitor-only", () => {
  const manifest = loadManifest();
  const commands = manifest.contributes.commands.map((item) => item.command);

  assert.deepEqual(commands, [
    "axis.initializeRepository",
    "axis.checkConnection",
    "axis.openGraphExplorer"
  ]);
});
