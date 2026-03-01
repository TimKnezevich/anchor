import test from "node:test";
import assert from "node:assert/strict";
import {
  GraphWebviewPanelManager,
  renderGraphExplorerErrorHtml,
  renderGraphExplorerHtml
} from "../../extension/src/graph-webview-panel.mjs";

function createMockVsCode() {
  const panels = [];

  return {
    panels,
    ViewColumn: {
      One: 1
    },
    window: {
      createWebviewPanel(viewType, title, column) {
        const disposeHandlers = [];
        const messageHandlers = [];
        const panel = {
          viewType,
          title,
          column,
          revealed: false,
          webview: {
            html: "",
            onDidReceiveMessage(handler) {
              messageHandlers.push(handler);
              return { dispose() {} };
            }
          },
          reveal() {
            this.revealed = true;
          },
          onDidDispose(handler) {
            disposeHandlers.push(handler);
            return { dispose() {} };
          },
          _disposeHandlers: disposeHandlers,
          _messageHandlers: messageHandlers
        };

        panels.push(panel);
        return panel;
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

test("renderGraphExplorerHtml includes summary and escaped content", () => {
  const html = renderGraphExplorerHtml({
    graph: {
      nodes: [{ id: "task.1", label: "Task <One>", type: "TASK", stale: true, conflict: false }],
      edges: [{ id: "e1", type: "SPEC_DEFINES_TASK", source: "spec.1", target: "task.1" }],
      summary: {
        total_nodes: 2,
        filtered_nodes: 1,
        total_edges: 1,
        filtered_edges: 1,
        stale_tasks: 1
      }
    },
    details: {
      id: "task.1",
      type: "TASK",
      status: "in_progress",
      incoming: [{}],
      outgoing: [{}]
    },
    trace: [{ from_type: "SPEC", from: "spec.1", to_type: "TASK", to: "task.1", edge_type: "SPEC_DEFINES_TASK" }]
  });

  assert.ok(html.includes("Axis Graph Explorer"));
  assert.ok(html.includes("Nodes: 1 / 2"));
  assert.ok(html.includes("Task &lt;One&gt;"));
  assert.ok(html.includes("SPEC:spec.1"));
});

test("GraphWebviewPanelManager open sets success html", async () => {
  const vscodeApi = createMockVsCode();
  const manager = new GraphWebviewPanelManager(vscodeApi, createLogger());

  const result = await manager.open(async () => ({
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

  assert.equal(result.ok, true);
  assert.equal(vscodeApi.panels.length, 1);
  assert.ok(vscodeApi.panels[0].webview.html.includes("Task 1"));
});

test("GraphWebviewPanelManager open sets error html on load failure", async () => {
  const vscodeApi = createMockVsCode();
  const manager = new GraphWebviewPanelManager(vscodeApi, createLogger());

  const result = await manager.open(async () => {
    throw new Error("boom");
  });

  assert.equal(result.ok, false);
  assert.ok(vscodeApi.panels[0].webview.html.includes("Failed to load graph data"));
  assert.equal(renderGraphExplorerErrorHtml("boom").includes("boom"), true);
});

test("GraphWebviewPanelManager handles applyFilters message and refreshes", async () => {
  const vscodeApi = createMockVsCode();
  const manager = new GraphWebviewPanelManager(vscodeApi, createLogger());
  const calls = [];

  await manager.open(async (input) => {
    calls.push(input);
    return {
      ok: true,
      data: {
        graph: {
          nodes: [{ id: "task.1", label: "Task 1", type: "TASK", status: "ready" }],
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
        trace: [],
        diff: {
          changedNodeIds: [],
          changedEdgeIds: []
        }
      }
    };
  });

  assert.equal(calls.length, 1);

  await vscodeApi.panels[0]._messageHandlers[0]({
    type: "applyFilters",
    filters: {
      nodeType: "TASK",
      staleOnly: true
    }
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[1].filters.nodeType, "TASK");
  assert.equal(calls[1].filters.staleOnly, true);
});
