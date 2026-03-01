import test from "node:test";
import assert from "node:assert/strict";
import { AxisMcpService } from "../../server/mcp/src/index.mjs";
import { createMcpHttpServer } from "../../server/mcp/src/http-server.mjs";
import { AxisMcpClient, createHttpMcpTransport, resolveTransportConfig } from "../../extension/src/index.mjs";

function taskNode() {
  return {
    id: "task.live.transport",
    type: "TASK",
    status: "ready",
    revision: 1,
    etag: "etag-init",
    meta: {},
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    title: "Live transport task",
    clause_links: []
  };
}

test("client can call live MCP server over HTTP", async (t) => {
  const service = new AxisMcpService();
  const server = createMcpHttpServer({
    service,
    host: "127.0.0.1",
    port: 4323
  });

  try {
    await server.start();
  } catch (error) {
    if (error?.code === "EPERM") {
      t.skip("Socket binding is not allowed in this runtime.");
      return;
    }
    throw error;
  }

  const config = resolveTransportConfig({
    baseUrl: "http://127.0.0.1:4323",
    retries: 0,
    timeoutMs: 2000
  });
  const transport = createHttpMcpTransport(config);
  const client = new AxisMcpClient(transport, {
    repoId: "repo-1",
    actor: "dev-1"
  });

  try {
    const write = await client.writeNode(
      {
        node: taskNode(),
        next_etag: "etag-1"
      },
      "cmd-live-write-1"
    );

    const read = await client.readState(
      {
        node_ids: ["task.live.transport"],
        include_edges: false
      },
      "cmd-live-read-1"
    );

    assert.equal(write.ok, true);
    assert.equal(read.ok, true);
    assert.equal(read.data.nodes.length, 1);
    assert.equal(read.data.nodes[0].id, "task.live.transport");
  } finally {
    await server.stop();
  }
});
