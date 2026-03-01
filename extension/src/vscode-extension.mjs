import * as vscode from "vscode";
import { activateExtension } from "./extension.mjs";
import { commandIds } from "./extension.mjs";
import { registerGraphExplorerWebviewCommand } from "./graph-webview-command.mjs";
import { createHttpMcpTransport } from "./http-mcp-transport.mjs";
import { resolveTransportConfig } from "./transport-config.mjs";
import { createSimpleLogger } from "./simple-logger.mjs";
import { registerVsCodeCommands } from "./vscode-bridge.mjs";

export function activate(context) {
  const logger = createSimpleLogger({ service: "axis-vscode" });
  const transportConfig = resolveTransportConfig();
  const transport = createHttpMcpTransport(transportConfig);

  const activated = activateExtension({
    transport,
    defaults: {
      repoId: "repo-1",
      actor: "vscode-user"
    },
    logger
  });

  registerVsCodeCommands(vscode, context, activated.registry, logger, {
    skipCommandIds: [commandIds.OPEN_GRAPH_EXPLORER]
  });
  registerGraphExplorerWebviewCommand(vscode, context, activated.registry, logger);

  transport.healthCheck().then((response) => {
    if (response.ok) {
      logger.info("MCP health check ok", { base_url: transportConfig.baseUrl });
      return;
    }

    logger.warn("MCP health check failed", {
      base_url: transportConfig.baseUrl,
      code: response?.error?.code ?? "UNKNOWN"
    });
  });

  logger.info("Axis VS Code extension activated", {
    subscriptions: context.subscriptions.length,
    mcp_base_url: transportConfig.baseUrl
  });
}

export function deactivate() {
  return undefined;
}
