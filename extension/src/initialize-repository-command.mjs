import { commandIds } from "./extension.mjs";

export function registerInitializeRepositoryCommand(vscodeApi, context, registry, logger, options = {}) {
  const commandId = options.commandId ?? commandIds.INITIALIZE_REPOSITORY;
  const onStatusChange = options.onStatusChange ?? null;
  const handler = registry.get(commandId);

  if (!handler) {
    throw new Error(`Command handler not found for ${commandId}.`);
  }

  const disposable = vscodeApi.commands.registerCommand(commandId, async (...args) => {
    const input = args.length > 0 ? args[0] ?? {} : {};
    const response = await handler(input);

    if (response?.ok) {
      const created = response?.data?.created === true;
      onStatusChange?.({
        state: "initialized",
        label: "Initialization: Ready",
        detail: "Axis initialization complete and ready."
      });
      const message = created
        ? "Axis repository initialized. Next: run Check Connection, then open Graph Explorer."
        : "Axis repository already initialized. Next: run Check Connection, then open Graph Explorer.";

      const selection = await vscodeApi.window.showInformationMessage(
        message,
        "Check Connection",
        "Open Graph Explorer"
      );

      if (selection === "Check Connection") {
        await vscodeApi.commands.executeCommand(commandIds.CHECK_CONNECTION, {});
      }

      if (selection === "Open Graph Explorer") {
        await vscodeApi.commands.executeCommand(commandIds.OPEN_GRAPH_EXPLORER, {});
      }

      return response;
    }

    const message = response?.userMessage ?? response?.message ?? "Axis repository initialization failed.";
    onStatusChange?.({
      state: "error",
      label: "Initialization: Failed",
      detail: message
    });
    const selection = await vscodeApi.window.showWarningMessage(
      message,
      "Retry Initialize",
      "Check Connection"
    );

    if (selection === "Retry Initialize") {
      await vscodeApi.commands.executeCommand(commandId, input);
    }

    if (selection === "Check Connection") {
      await vscodeApi.commands.executeCommand(commandIds.CHECK_CONNECTION, {});
    }

    logger.warn("Axis repository initialization failed", {
      code: response?.code ?? "UNKNOWN"
    });

    return response;
  });

  context.subscriptions.push(disposable);

  return {
    commandId
  };
}
