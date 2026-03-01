import test from "node:test";
import assert from "node:assert/strict";
import { createLogger } from "../../shared/observability/src/index.mjs";
import { AxisMcpService } from "../../server/mcp/src/index.mjs";
import { AxisMcpClient } from "../../extension/src/index.mjs";
import {
  buildDetailsPanelModel,
  buildGraphViewModel,
  buildTracePath,
  diffSnapshots
} from "../../extension/src/graph-explorer-model.mjs";
import { GraphExplorerController } from "../../extension/src/graph-explorer-controller.mjs";

function createSilentLogger() {
  const sink = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    log: () => {}
  };

  return createLogger({ service: "test", sink });
}

function sampleState() {
  return {
    nodes: [
      { id: "spec.1", type: "SPEC", status: "active" },
      { id: "task.1", type: "TASK", status: "in_progress", title: "Task 1" },
      { id: "code.1", type: "CODE_UNIT", status: "active" },
      { id: "evidence.1", type: "EVIDENCE", status: "collected" },
      { id: "task.2", type: "TASK", status: "failed_validation", title: "Task 2" }
    ],
    edges: [
      { id: "e1", type: "SPEC_DEFINES_TASK", source_id: "spec.1", target_id: "task.1" },
      { id: "e2", type: "TASK_TOUCHES_CODE_UNIT", source_id: "task.1", target_id: "code.1" },
      { id: "e3", type: "TASK_PRODUCES_EVIDENCE", source_id: "task.1", target_id: "evidence.1" }
    ],
    stale_tasks: [{ task_id: "task.1", state: "stale" }]
  };
}

test("buildGraphViewModel applies filters and stale/conflict flags", () => {
  const model = buildGraphViewModel(sampleState(), {
    filters: {
      nodeType: "TASK",
      staleOnly: true
    }
  });

  assert.equal(model.nodes.length, 1);
  assert.equal(model.nodes[0].id, "task.1");
  assert.equal(model.nodes[0].stale, true);
  assert.equal(model.nodes[0].conflict, true);
});

test("buildDetailsPanelModel returns selected node details", () => {
  const model = buildGraphViewModel(sampleState(), { filters: {} });
  const details = buildDetailsPanelModel(model, "task.1");

  assert.equal(details.id, "task.1");
  assert.equal(details.outgoing.length, 2);
  assert.equal(details.incoming.length, 1);
});

test("buildTracePath returns SPEC->TASK->CODE_UNIT->EVIDENCE path items", () => {
  const model = buildGraphViewModel(sampleState(), { filters: {} });
  const trace = buildTracePath(model, "spec.1");

  assert.equal(trace.length, 3);
  assert.deepEqual(
    trace.map((item) => item.edge_type),
    ["SPEC_DEFINES_TASK", "TASK_TOUCHES_CODE_UNIT", "TASK_PRODUCES_EVIDENCE"]
  );
});

test("diffSnapshots marks changed nodes and edges", () => {
  const prev = {
    nodes: [{ id: "task.1", status: "ready" }],
    edges: [{ id: "e1", type: "SPEC_DEFINES_TASK" }]
  };

  const next = {
    nodes: [{ id: "task.1", status: "in_progress" }, { id: "task.2", status: "ready" }],
    edges: [{ id: "e1", type: "SPEC_DEFINES_TASK" }, { id: "e2", type: "TASK_PRODUCES_EVIDENCE" }]
  };

  const diff = diffSnapshots(prev, next);
  assert.deepEqual(diff.changedNodeIds.sort(), ["task.1", "task.2"].sort());
  assert.deepEqual(diff.changedEdgeIds, ["e2"]);
});

test("GraphExplorerController refresh returns graph/details/trace", async () => {
  const service = new AxisMcpService();
  const client = new AxisMcpClient((request, correlationId) => service.handle(request, correlationId), {
    repoId: "repo-1",
    actor: "dev-1"
  });
  const controller = new GraphExplorerController(client, createSilentLogger());

  await service.handle(
    {
      command: "write_node",
      command_id: "cmd-graph-node-spec",
      repo_id: "repo-1",
      actor: "dev-1",
      payload: {
        node: {
          id: "spec.1",
          type: "SPEC",
          status: "active",
          revision: 1,
          etag: "etag-s1",
          meta: {},
          created_at: "2026-03-01T00:00:00Z",
          updated_at: "2026-03-01T00:00:00Z",
          spec_key: "axis.v0.core",
          semantic_version: "0.1.0",
          clause_index: []
        },
        next_etag: "etag-s1"
      }
    },
    "corr-g1"
  );

  await service.handle(
    {
      command: "write_node",
      command_id: "cmd-graph-node-task",
      repo_id: "repo-1",
      actor: "dev-1",
      payload: {
        node: {
          id: "task.1",
          type: "TASK",
          status: "in_progress",
          revision: 1,
          etag: "etag-t1",
          meta: {},
          created_at: "2026-03-01T00:00:00Z",
          updated_at: "2026-03-01T00:00:00Z",
          title: "Task 1",
          clause_links: []
        },
        next_etag: "etag-t1"
      }
    },
    "corr-g1"
  );

  service.store.upsertEdge({
    id: "e1",
    type: "SPEC_DEFINES_TASK",
    source_id: "spec.1",
    target_id: "task.1"
  });

  const result = await controller.refreshGraph({
    commandId: "cmd-open-graph",
    repoId: "repo-1",
    actor: "dev-1",
    correlationId: "corr-g1",
    filters: {},
    selectedNodeId: "task.1",
    traceFromSpecId: "spec.1"
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.graph.nodes.length, 2);
  assert.equal(result.data.details.id, "task.1");
  assert.equal(result.data.trace.length, 1);
});
