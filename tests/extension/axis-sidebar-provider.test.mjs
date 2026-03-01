import test from "node:test";
import assert from "node:assert/strict";
import { AxisSidebarProvider } from "../../extension/src/axis-sidebar-provider.mjs";

test("AxisSidebarProvider returns default command items", async () => {
  const provider = new AxisSidebarProvider();
  const items = await provider.getChildren();

  assert.equal(items.length, 4);
  assert.equal(items[0].id, "axis.initializationStatus");
  assert.equal(items[1].command.command, "axis.initializeRepository");
  assert.equal(items[2].command.command, "axis.checkConnection");
  assert.equal(items[3].command.command, "axis.openGraphExplorer");
});
