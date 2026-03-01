import test from "node:test";
import assert from "node:assert/strict";
import { CommandRegistry } from "../../extension/src/command-registry.mjs";
import { registerInitializeRepositoryCommand } from "../../extension/src/initialize-repository-command.mjs";

function mockVsCode() {
  const registrations = [];
  const messages = [];
  const executed = [];

  return {
    registrations,
    messages,
    executed,
    window: {
      showInformationMessage(message) {
        messages.push({ level: "info", message });
        return Promise.resolve(undefined);
      },
      showWarningMessage(message) {
        messages.push({ level: "warn", message });
        return Promise.resolve(undefined);
      }
    },
    commands: {
      registerCommand(commandId, handler) {
        registrations.push({ commandId, handler });
        return { dispose() {} };
      },
      async executeCommand(commandId, input) {
        executed.push({ commandId, input });
      }
    }
  };
}

test("registerInitializeRepositoryCommand shows success guidance on create", async () => {
  const registry = new CommandRegistry();
  registry.register("axis.initializeRepository", async () => ({
    ok: true,
    data: { created: true }
  }));

  const vscodeApi = mockVsCode();
  const context = { subscriptions: [] };
  const logger = { warn: () => {} };

  registerInitializeRepositoryCommand(vscodeApi, context, registry, logger);
  await vscodeApi.registrations[0].handler({});

  assert.equal(vscodeApi.messages[0].level, "info");
  assert.ok(vscodeApi.messages[0].message.includes("initialized"));
});

test("registerInitializeRepositoryCommand shows warning on failure", async () => {
  const registry = new CommandRegistry();
  registry.register("axis.initializeRepository", async () => ({
    ok: false,
    code: "UNKNOWN",
    message: "init failed"
  }));

  const vscodeApi = mockVsCode();
  const context = { subscriptions: [] };
  const logger = { warn: () => {} };

  registerInitializeRepositoryCommand(vscodeApi, context, registry, logger);
  await vscodeApi.registrations[0].handler({});

  assert.equal(vscodeApi.messages[0].level, "warn");
});
