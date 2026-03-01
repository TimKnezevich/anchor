import test from "node:test";
import assert from "node:assert/strict";
import { resolveRuntimeProfileConfig } from "../../server/mcp/src/runtime-profile.mjs";

test("resolveRuntimeProfileConfig uses local defaults", () => {
  const config = resolveRuntimeProfileConfig({});

  assert.equal(config.profile, "local");
  assert.equal(config.host, "127.0.0.1");
  assert.equal(config.port, 4317);
  assert.equal(config.storageAdapter, "memory");
  assert.equal(config.paths.live, "/health/live");
  assert.equal(config.paths.ready, "/health/ready");
});

test("resolveRuntimeProfileConfig uses shared defaults", () => {
  const config = resolveRuntimeProfileConfig({ AXIS_RUNTIME_PROFILE: "shared" });

  assert.equal(config.profile, "shared");
  assert.equal(config.host, "0.0.0.0");
  assert.equal(config.storageAdapter, "sqlite");
});

test("resolveRuntimeProfileConfig applies env overrides", () => {
  const config = resolveRuntimeProfileConfig({
    AXIS_RUNTIME_PROFILE: "local",
    AXIS_MCP_HOST: "localhost",
    AXIS_MCP_PORT: "9999",
    AXIS_MCP_PATH: "/axis",
    AXIS_MCP_HEALTH_PATH: "/h",
    AXIS_MCP_LIVE_PATH: "/livez",
    AXIS_MCP_READY_PATH: "/readyz",
    AXIS_ENABLE_VECTOR_SIDECAR: "true"
  });

  assert.equal(config.host, "localhost");
  assert.equal(config.port, 9999);
  assert.equal(config.paths.mcp, "/axis");
  assert.equal(config.paths.health, "/h");
  assert.equal(config.paths.live, "/livez");
  assert.equal(config.paths.ready, "/readyz");
  assert.equal(config.sidecars.vectorEnabled, true);
});

test("resolveRuntimeProfileConfig rejects invalid port", () => {
  assert.throws(() => resolveRuntimeProfileConfig({ AXIS_MCP_PORT: "bad" }), /Invalid AXIS_MCP_PORT/);
});
