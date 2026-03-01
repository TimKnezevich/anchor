import test from "node:test";
import assert from "node:assert/strict";
import { CommandRegistry } from "../../extension/src/command-registry.mjs";
import { commandIds } from "../../extension/src/extension.mjs";
import { registerGraphExplorerWebviewCommand } from "../../extension/src/graph-webview-command.mjs";

function createMockVsCode() {
  const registrations = [];

  return {
    registrations,
    ViewColumn: {
      One: 1
    },
    commands: {
      registerCommand(commandId, handler) {
        registrations.push({ commandId, handler });
        return {
          dispose() {}
        };
      }
    },
    window: {
      createWebviewPanel() {
        return {
          webview: { html: "" },
          reveal() {},
          onDidDispose() {
            return { dispose() {} };
          }
        };
      }
    }
  };
}

function createLogger() {
  return {
    info: () => {},
    error: () => {}
  };
}

test("registerGraphExplorerWebviewCommand opens panel and renders command data", async () => {
  const registry = new CommandRegistry();
  registry.register(commandIds.OPEN_GRAPH_EXPLORER, async () => ({
    ok: true,
    data: {
      graph: {
        nodes: [{ id: "task.1", label: "Task 1", type: "TASK" }],
        edges: [],
        summary: {
          total_nodes: 1,
          filtered_nodes: 1,
          total_edges: 0,
          filtered_edges: 0,
          stale_tasks: 0
        }
      },
      details: null,
      trace: []
    }
  }));

  const vscodeApi = createMockVsCode();
  const context = { subscriptions: [] };

  registerGraphExplorerWebviewCommand(vscodeApi, context, registry, createLogger());

  assert.equal(vscodeApi.registrations.length, 1);
  assert.equal(vscodeApi.registrations[0].commandId, commandIds.OPEN_GRAPH_EXPLORER);
  assert.equal(context.subscriptions.length, 1);

  const response = await vscodeApi.registrations[0].handler({});
  assert.equal(response.ok, true);
});
