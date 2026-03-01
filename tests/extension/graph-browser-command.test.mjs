import test from "node:test";
import assert from "node:assert/strict";
import { registerGraphExplorerBrowserCommand } from "../../extension/src/graph-browser-command.mjs";

function mockVsCode() {
  const registrations = [];
  const opened = [];

  return {
    registrations,
    opened,
    Uri: {
      parse(value) {
        return { toString: () => value };
      }
    },
    env: {
      async openExternal(uri) {
        opened.push(uri.toString());
        return true;
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

test("registerGraphExplorerBrowserCommand opens external graph url", async () => {
  const vscodeApi = mockVsCode();
  const context = { subscriptions: [] };
  const logger = { info: () => {} };

  registerGraphExplorerBrowserCommand(vscodeApi, context, logger, {
    baseUrl: "http://127.0.0.1:4317"
  });

  assert.equal(vscodeApi.registrations.length, 1);

  const result = await vscodeApi.registrations[0].handler({ repoId: "repo-x" });
  assert.equal(result.ok, true);
  assert.equal(vscodeApi.opened[0], "http://127.0.0.1:4317/graph-explorer?repo_id=repo-x");
});
