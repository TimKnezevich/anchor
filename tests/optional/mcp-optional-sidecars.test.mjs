import test from "node:test";
import assert from "node:assert/strict";
import { AxisMcpService } from "../../server/mcp/src/index.mjs";

test("mcp read_state includes vector suggestions only when flag enabled", () => {
  const disabled = new AxisMcpService({
    flags: {
      vectorSidecarEnabled: false,
      eventSidecarEnabled: false
    }
  });

  const enabled = new AxisMcpService({
    flags: {
      vectorSidecarEnabled: true,
      eventSidecarEnabled: false
    }
  });

  const request = {
    command: "read_state",
    command_id: "cmd-read-optional",
    repo_id: "repo-1",
    actor: "dev-1",
    payload: {
      query: "task"
    }
  };

  const disabledResponse = disabled.handle(request, "corr-opt-1");
  const enabledResponse = enabled.handle(request, "corr-opt-1");

  assert.equal(disabledResponse.ok, true);
  assert.equal("vector_suggestions" in disabledResponse.data, false);

  assert.equal(enabledResponse.ok, true);
  assert.equal(Array.isArray(enabledResponse.data.vector_suggestions), true);
});

test("mcp publishes outbox events only when event flag enabled", () => {
  const disabled = new AxisMcpService({
    flags: {
      vectorSidecarEnabled: false,
      eventSidecarEnabled: false
    }
  });

  const enabled = new AxisMcpService({
    flags: {
      vectorSidecarEnabled: false,
      eventSidecarEnabled: true
    }
  });

  const request = {
    command: "read_state",
    command_id: "cmd-read-event-1",
    repo_id: "repo-1",
    actor: "dev-1",
    payload: {}
  };

  disabled.handle(request, "corr-opt-2");
  enabled.handle(request, "corr-opt-2");

  assert.equal(disabled.eventSidecar.listOutbox("repo-1").length, 0);
  assert.equal(enabled.eventSidecar.listOutbox("repo-1").length, 1);
});

test("optional sidecars do not mutate authoritative node state", () => {
  const service = new AxisMcpService({
    flags: {
      vectorSidecarEnabled: true,
      eventSidecarEnabled: true
    }
  });

  const node = {
    id: "task.optional.1",
    type: "TASK",
    status: "ready",
    revision: 1,
    etag: "etag-init",
    meta: {},
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    title: "Optional Task",
    clause_links: []
  };

  service.handle(
    {
      command: "write_node",
      command_id: "cmd-opt-write-1",
      repo_id: "repo-1",
      actor: "dev-1",
      payload: {
        node,
        next_etag: "etag-1"
      }
    },
    "corr-opt-3"
  );

  const read = service.handle(
    {
      command: "read_state",
      command_id: "cmd-opt-read-1",
      repo_id: "repo-1",
      actor: "dev-1",
      payload: {
        node_ids: ["task.optional.1"],
        include_edges: false,
        query: "optional"
      }
    },
    "corr-opt-3"
  );

  assert.equal(read.ok, true);
  assert.equal(read.data.nodes.length, 1);
  assert.equal(read.data.nodes[0].id, "task.optional.1");
  assert.equal(read.data.nodes[0].etag, "etag-1");
});
