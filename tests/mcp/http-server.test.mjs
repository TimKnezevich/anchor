import test from "node:test";
import assert from "node:assert/strict";
import { createLogger } from "../../shared/observability/src/index.mjs";
import { AxisMcpService } from "../../server/mcp/src/index.mjs";
import { createMcpHttpServer } from "../../server/mcp/src/http-server.mjs";

function createSilentLogger() {
  return createLogger({
    service: "test-http-server",
    sink: {
      info: () => {},
      warn: () => {},
      error: () => {},
      log: () => {}
    }
  });
}

test("http server responds to health endpoint", async (t) => {
  const service = new AxisMcpService();
  const server = createMcpHttpServer({
    service,
    logger: createSilentLogger(),
    host: "127.0.0.1",
    port: 4321,
    runtimeProfile: "shared",
    storageAdapter: "sqlite",
    sidecars: {
      vectorEnabled: true,
      eventEnabled: false
    }
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

  try {
    const response = await fetch("http://127.0.0.1:4321/health");
    const payload = await response.json();
    const liveResponse = await fetch("http://127.0.0.1:4321/health/live");
    const livePayload = await liveResponse.json();
    const readyResponse = await fetch("http://127.0.0.1:4321/health/ready");
    const readyPayload = await readyResponse.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.equal(payload.profile, "shared");
    assert.equal(liveResponse.status, 200);
    assert.equal(livePayload.live, true);
    assert.equal(readyResponse.status, 200);
    assert.equal(readyPayload.ready, true);
    assert.equal(readyPayload.storage_adapter, "sqlite");
    assert.equal(readyPayload.sidecars.vector_enabled, true);
  } finally {
    await server.stop();
  }
});

test("http server handles mcp command request", async (t) => {
  const service = new AxisMcpService();
  const server = createMcpHttpServer({
    service,
    logger: createSilentLogger(),
    host: "127.0.0.1",
    port: 4322
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

  try {
    const response = await fetch("http://127.0.0.1:4322/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        command: "read_state",
        command_id: "cmd-http-1",
        repo_id: "repo-1",
        actor: "dev-1",
        payload: {}
      })
    });

    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.ok(Array.isArray(payload.data.nodes));
  } finally {
    await server.stop();
  }
});

test("http server serves graph explorer html page", async (t) => {
  const service = new AxisMcpService();
  const server = createMcpHttpServer({
    service,
    logger: createSilentLogger(),
    host: "127.0.0.1",
    port: 4325
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

  try {
    const response = await fetch("http://127.0.0.1:4325/graph-explorer");
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.ok(html.includes("Axis Graph Explorer"));
    assert.ok(html.includes("Refresh Graph"));
  } finally {
    await server.stop();
  }
});

test("http server serves graph explorer html page with query params", async (t) => {
  const service = new AxisMcpService();
  const server = createMcpHttpServer({
    service,
    logger: createSilentLogger(),
    host: "127.0.0.1",
    port: 4326
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

  try {
    const response = await fetch("http://127.0.0.1:4326/graph-explorer?repo_id=repo-1");
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.ok(html.includes("Axis Graph Explorer"));
  } finally {
    await server.stop();
  }
});
