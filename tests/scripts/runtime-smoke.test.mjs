import test from "node:test";
import assert from "node:assert/strict";
import { startMcpRuntime } from "../../scripts/run-mcp-server.mjs";

test("runtime can start, serve health, and stop", async (t) => {
  let runtime = null;

  try {
    runtime = await startMcpRuntime({
      profile: "local",
      host: "127.0.0.1",
      port: 4324
    });
  } catch (error) {
    if (error?.code === "EPERM") {
      t.skip("Socket binding is not allowed in this runtime.");
      return;
    }
    throw error;
  }

  try {
    const health = await fetch(`http://127.0.0.1:${runtime.runtime.port}/health`);
    const ready = await fetch(`http://127.0.0.1:${runtime.runtime.port}/health/ready`);

    assert.equal(health.status, 200);
    assert.equal(ready.status, 200);

    const healthPayload = await health.json();
    const readyPayload = await ready.json();

    assert.equal(healthPayload.ok, true);
    assert.equal(readyPayload.ready, true);
  } finally {
    await runtime.stop();
  }
});
