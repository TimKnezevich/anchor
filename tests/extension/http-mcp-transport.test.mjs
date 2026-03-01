import test from "node:test";
import assert from "node:assert/strict";
import { createHttpMcpTransport } from "../../extension/src/http-mcp-transport.mjs";
import { resolveTransportConfig } from "../../extension/src/transport-config.mjs";

test("http transport returns MCP response payload", async () => {
  const config = resolveTransportConfig({ baseUrl: "http://test.local", retries: 0, timeoutMs: 1000 });

  const transport = createHttpMcpTransport(config, {
    fetchFn: async () => ({
      ok: true,
      json: async () => ({ ok: true, data: { nodes: [] } })
    })
  });

  const response = await transport({ command: "read_state" }, "corr-1");
  assert.equal(response.ok, true);
  assert.deepEqual(response.data.nodes, []);
});

test("http transport retries transient failure then succeeds", async () => {
  const config = resolveTransportConfig({
    baseUrl: "http://test.local",
    retries: 1,
    retryDelayMs: 1,
    timeoutMs: 1000
  });

  let calls = 0;
  const transport = createHttpMcpTransport(config, {
    fetchFn: async () => {
      calls += 1;
      if (calls === 1) {
        return {
          ok: false,
          status: 503,
          json: async () => ({ ok: false, error: { message: "temporary" } })
        };
      }

      return {
        ok: true,
        json: async () => ({ ok: true, data: { ok: true } })
      };
    }
  });

  const response = await transport({ command: "read_state" }, "corr-2");
  assert.equal(response.ok, true);
  assert.equal(calls, 2);
});

test("http transport returns unreachable envelope on network error", async () => {
  const config = resolveTransportConfig({ baseUrl: "http://test.local", retries: 0, timeoutMs: 1000 });

  const transport = createHttpMcpTransport(config, {
    fetchFn: async () => {
      throw new Error("connect refused");
    }
  });

  const response = await transport({ command: "read_state" }, "corr-3");
  assert.equal(response.ok, false);
  assert.equal(response.error.code, "TRANSPORT_UNREACHABLE");
  assert.equal(response.error.status, 503);
});
