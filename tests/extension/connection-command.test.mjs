import test from "node:test";
import assert from "node:assert/strict";
import { CommandRegistry } from "../../extension/src/command-registry.mjs";
import { registerCheckConnectionCommand } from "../../extension/src/connection-command.mjs";

function mockVsCode() {
  const registrations = [];
  const messages = [];

  return {
    registrations,
    messages,
    window: {
      showInformationMessage(message) {
        messages.push({ level: "info", message });
      },
      showWarningMessage(message) {
        messages.push({ level: "warn", message });
      }
    },
    commands: {
      registerCommand(commandId, handler) {
        registrations.push({ commandId, handler });
        return { dispose() {} };
      }
    }
  };
}

test("registerCheckConnectionCommand shows info on success", async () => {
  const registry = new CommandRegistry();
  registry.register("axis.checkConnection", async () => ({ ok: true, data: {} }));

  const vscodeApi = mockVsCode();
  const context = { subscriptions: [] };
  const logger = { warn: () => {} };

  registerCheckConnectionCommand(vscodeApi, context, registry, logger);
  await vscodeApi.registrations[0].handler({});

  assert.equal(vscodeApi.messages[0].level, "info");
});
