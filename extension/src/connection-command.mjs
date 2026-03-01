import { commandIds } from "./extension.mjs";

export function registerCheckConnectionCommand(vscodeApi, context, registry, logger, options = {}) {
  const commandId = options.commandId ?? commandIds.CHECK_CONNECTION;
  const handler = registry.get(commandId);

  if (!handler) {
    throw new Error(`Command handler not found for ${commandId}.`);
  }

  const disposable = vscodeApi.commands.registerCommand(commandId, async (...args) => {
    const input = args.length > 0 ? args[0] ?? {} : {};
    const response = await handler(input);

    if (response?.ok) {
      vscodeApi.window.showInformationMessage("Axis MCP connection OK.");
      return response;
    }

    const message = response?.userMessage ?? response?.message ?? "Axis MCP connection check failed.";
    vscodeApi.window.showWarningMessage(message);
    logger.warn("Axis MCP connection check failed", {
      code: response?.code ?? "UNKNOWN"
    });
    return response;
  });

  context.subscriptions.push(disposable);

  return {
    commandId
  };
}
