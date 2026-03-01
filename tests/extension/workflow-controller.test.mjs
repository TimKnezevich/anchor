import test from "node:test";
import assert from "node:assert/strict";
import { AxisMcpService } from "../../server/mcp/src/index.mjs";
import { AxisMcpClient, WorkflowController } from "../../extension/src/index.mjs";
import { createSimpleLogger } from "../../extension/src/simple-logger.mjs";

function createSilentLogger() {
  const sink = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    log: () => {}
  };

  return createSimpleLogger({ service: "test", sink });
}

function createClientFromService(service) {
  return new AxisMcpClient((request, correlationId) => service.handle(request, correlationId), {
    repoId: "repo-1",
    actor: "dev-1"
  });
}

test("initializeRepository returns initialized payload", async () => {
  const service = new AxisMcpService();
  const controller = new WorkflowController(createClientFromService(service), createSilentLogger());

  const result = await controller.initializeRepository({
    commandId: "cmd-init-1",
    repoId: "repo-1",
    actor: "dev-1",
    correlationId: "corr-a"
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.initialization.status, "initialized");
});

test("checkConnection returns health response", async () => {
  const service = new AxisMcpService();
  const controller = new WorkflowController(createClientFromService(service), createSilentLogger());

  const result = await controller.checkConnection({
    repoId: "repo-1",
    actor: "dev-1",
    correlationId: "corr-b"
  });

  assert.equal(result.ok, true);
  assert.ok(Array.isArray(result.data.nodes));
});
