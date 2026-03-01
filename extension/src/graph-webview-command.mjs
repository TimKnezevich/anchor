import { commandIds } from "./extension.mjs";
import { GraphWebviewPanelManager } from "./graph-webview-panel.mjs";

export function registerGraphExplorerWebviewCommand(
  vscodeApi,
  context,
  registry,
  logger,
  options = {}
) {
  const commandId = options.commandId ?? commandIds.OPEN_GRAPH_EXPLORER;
  const handler = registry.get(commandId);

  if (!handler) {
    throw new Error(`Command handler not found for ${commandId}.`);
  }

  const panelManager = new GraphWebviewPanelManager(vscodeApi, logger, options.panel ?? {});
  const disposable = vscodeApi.commands.registerCommand(commandId, async (...args) => {
    const input = args.length > 0 ? args[0] : {};
    return panelManager.open(handler, input ?? {});
  });

  context.subscriptions.push(disposable);
  logger.info("Graph explorer webview command registered", { command: commandId });

  return {
    commandId,
    panelManager
  };
}
