import * as vscode from "vscode";
import { activateExtension, commandIds } from "./extension.mjs";
import { AxisSidebarProvider } from "./axis-sidebar-provider.mjs";
import { registerCheckConnectionCommand } from "./connection-command.mjs";
import { registerGraphExplorerBrowserCommand } from "./graph-browser-command.mjs";
import { registerInitializeRepositoryCommand } from "./initialize-repository-command.mjs";
import { createHttpMcpTransport } from "./http-mcp-transport.mjs";
import { resolveInitializationStatus } from "./initialization-status-provider.mjs";
import { RuntimeAutoStarter } from "./runtime-autostart.mjs";
import { resolveTransportConfig } from "./transport-config.mjs";
import { createSimpleLogger } from "./simple-logger.mjs";
import { registerVsCodeCommands } from "./vscode-bridge.mjs";

let runtimeAutoStarter = null;

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

  const sidebarProvider = new AxisSidebarProvider();
  const treeView = vscode.window.createTreeView("axisControl", {
    treeDataProvider: sidebarProvider,
    showCollapseAll: false
  });
  context.subscriptions.push(treeView);

  registerVsCodeCommands(vscode, context, activated.registry, logger, {
    skipCommandIds: [
      commandIds.OPEN_GRAPH_EXPLORER,
      commandIds.CHECK_CONNECTION,
      commandIds.INITIALIZE_REPOSITORY
    ]
  });

  registerCheckConnectionCommand(vscode, context, activated.registry, logger);
  registerInitializeRepositoryCommand(vscode, context, activated.registry, logger, {
    onStatusChange: (status) => sidebarProvider.refreshStatus(status)
  });
  registerGraphExplorerBrowserCommand(vscode, context, logger, transportConfig);

  runtimeAutoStarter = new RuntimeAutoStarter(vscode, logger, transport);
  runtimeAutoStarter.ensureStartedIfNeeded().catch((error) => {
    logger.warn("Axis runtime auto-start attempt failed", {}, error);
  });

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

  resolveInitializationStatus(vscode, transport).then((status) => {
    sidebarProvider.refreshStatus(status);
    logger.info("Axis initialization status resolved", {
      state: status.state,
      detail: status.detail
    });
  }).catch((error) => {
    sidebarProvider.refreshStatus({
      state: "error",
      label: "Initialization: Status Error",
      detail: "Failed to resolve initialization status."
    });
    logger.warn("Axis initialization status check failed", {}, error);
  });

  logger.info("Axis VS Code extension activated", {
    subscriptions: context.subscriptions.length,
    mcp_base_url: transportConfig.baseUrl
  });
}

export function deactivate() {
  runtimeAutoStarter?.dispose();
  runtimeAutoStarter = null;
  return undefined;
}
