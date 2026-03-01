import test from "node:test";
import assert from "node:assert/strict";
import { activateExtension, commandIds } from "../../extension/src/index.mjs";
import { AxisMcpService } from "../../server/mcp/src/index.mjs";

test("extension activation registers expected commands", () => {
  const service = new AxisMcpService();
  const extension = activateExtension({
    transport: (request, correlationId) => service.handle(request, correlationId),
    defaults: {
      repoId: "repo-1",
      actor: "dev-1"
    }
  });

  const commandList = extension.registry.list();

  assert.deepEqual(commandList.sort(), [
    commandIds.CHECK_CONNECTION,
    commandIds.CONFIRM_TASK,
    commandIds.OPEN_GRAPH_EXPLORER,
    commandIds.SHOW_TASK_STATE,
    commandIds.START_TASK
  ].sort());
});
