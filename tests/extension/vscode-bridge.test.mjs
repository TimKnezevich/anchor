import test from "node:test";
import assert from "node:assert/strict";
import { CommandRegistry } from "../../extension/src/command-registry.mjs";
import { createSimpleLogger } from "../../extension/src/simple-logger.mjs";
import { registerVsCodeCommands } from "../../extension/src/vscode-bridge.mjs";

function createMockVsCode() {
  const registrations = [];

  return {
    registrations,
    commands: {
      registerCommand(commandId, handler) {
        registrations.push({ commandId, handler });
        return {
          dispose() {
            return undefined;
          }
        };
      }
    }
  };
}

test("registerVsCodeCommands wires all registry commands", async () => {
  const registry = new CommandRegistry();
  registry.register("axis.commandA", async () => ({ ok: true }));
  registry.register("axis.commandB", async () => ({ ok: true }));

  const mockVsCode = createMockVsCode();
  const context = { subscriptions: [] };
  const logger = createSimpleLogger({ sink: { info: () => {}, log: () => {} } });

  const result = registerVsCodeCommands(mockVsCode, context, registry, logger);

  assert.equal(result.count, 2);
  assert.equal(mockVsCode.registrations.length, 2);
  assert.equal(context.subscriptions.length, 2);

  const invoke = await mockVsCode.registrations[0].handler({ taskId: "task-1" });
  assert.equal(invoke.ok, true);
});

test("registerVsCodeCommands supports skipping specific commands", () => {
  const registry = new CommandRegistry();
  registry.register("axis.commandA", async () => ({ ok: true }));
  registry.register("axis.commandB", async () => ({ ok: true }));

  const mockVsCode = createMockVsCode();
  const context = { subscriptions: [] };
  const logger = createSimpleLogger({ sink: { info: () => {}, log: () => {} } });

  const result = registerVsCodeCommands(mockVsCode, context, registry, logger, {
    skipCommandIds: ["axis.commandB"]
  });

  assert.equal(result.count, 1);
  assert.deepEqual(result.commandIds, ["axis.commandA"]);
});
