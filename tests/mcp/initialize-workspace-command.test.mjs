import test from "node:test";
import assert from "node:assert/strict";
import { AxisMcpService } from "../../server/mcp/src/index.mjs";

function baseInitializeRequest(overrides = {}) {
  return {
    command: "initialize_workspace",
    command_id: "cmd-init-1",
    repo_id: "repo-init-1",
    actor: "dev-init",
    payload: {},
    ...overrides
  };
}

test("initialize_workspace creates deterministic initialization payload", () => {
  const service = new AxisMcpService();
  const response = service.handle(baseInitializeRequest(), "corr-init-1");

  assert.equal(response.ok, true);
  assert.equal(response.replayed, false);
  assert.equal(response.data.repo_id, "repo-init-1");
  assert.equal(response.data.created, true);
  assert.equal(response.data.initialization.status, "initialized");
  assert.equal(response.data.initialization.initialized, true);
  assert.equal(response.data.initialization.schema_version, "1");
  assert.equal(response.data.initialization.initialized_by, "dev-init");
  assert.ok(Array.isArray(response.data.initialization.artifact_paths));
  assert.ok(response.data.initialization.artifact_paths.includes(".axis/policy.json"));
});

test("initialize_workspace is idempotent and returns existing initialization for subsequent commands", () => {
  const service = new AxisMcpService();

  const first = service.handle(baseInitializeRequest(), "corr-init-2");
  const replay = service.handle(baseInitializeRequest(), "corr-init-2");
  const second = service.handle(
    baseInitializeRequest({
      command_id: "cmd-init-2"
    }),
    "corr-init-2"
  );

  assert.equal(first.ok, true);
  assert.equal(first.replayed, false);
  assert.equal(replay.ok, true);
  assert.equal(replay.replayed, true);
  assert.equal(second.ok, true);
  assert.equal(second.replayed, false);
  assert.equal(second.data.created, false);
  assert.equal(second.data.initialization.initialized_at, first.data.initialization.initialized_at);
});

test("initialize_workspace rejects unknown payload fields", () => {
  const service = new AxisMcpService();
  const response = service.handle(
    baseInitializeRequest({
      payload: {
        unexpected: true
      }
    }),
    "corr-init-3"
  );

  assert.equal(response.ok, false);
  assert.equal(response.error.code, "VALIDATION_ERROR");
});
