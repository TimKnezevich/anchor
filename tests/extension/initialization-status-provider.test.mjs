import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AxisSidebarProvider } from "../../extension/src/axis-sidebar-provider.mjs";
import { resolveInitializationStatus } from "../../extension/src/initialization-status-provider.mjs";

function vscodeApiForRoot(rootPath) {
  return {
    workspace: {
      workspaceFolders: [{ uri: { fsPath: rootPath } }]
    }
  };
}

test("resolveInitializationStatus returns uninitialized when no Axis markers exist", async () => {
  const rootPath = mkdtempSync(join(tmpdir(), "axis-status-uninit-"));
  const status = await resolveInitializationStatus(vscodeApiForRoot(rootPath), {
    healthCheck: async () => ({ ok: true })
  });

  assert.equal(status.state, "uninitialized");
});

test("resolveInitializationStatus returns initialized when marker exists and health check passes", async () => {
  const rootPath = mkdtempSync(join(tmpdir(), "axis-status-ready-"));
  mkdirSync(join(rootPath, ".axis"), { recursive: true });
  writeFileSync(join(rootPath, "axis.json"), "{\"ok\":true}\n");

  const status = await resolveInitializationStatus(vscodeApiForRoot(rootPath), {
    healthCheck: async () => ({ ok: true })
  });

  assert.equal(status.state, "initialized");
});

test("AxisSidebarProvider refreshStatus updates status item label", async () => {
  const provider = new AxisSidebarProvider();
  provider.refreshStatus({
    state: "initialized",
    label: "Initialization: Ready",
    detail: "Axis initialization complete."
  });

  const items = await provider.getChildren();
  assert.equal(items[0].label, "Initialization: Ready");
});
