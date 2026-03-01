export function registerVsCodeCommands(vscodeApi, context, registry, logger, options = {}) {
  const skipCommandIds = new Set(options.skipCommandIds ?? []);
  const commandIds = registry.list().filter((commandId) => !skipCommandIds.has(commandId));

  for (const commandId of commandIds) {
    const handler = registry.get(commandId);

    const disposable = vscodeApi.commands.registerCommand(commandId, async (...args) => {
      const input = args.length > 0 ? args[0] : {};
      return handler(input ?? {});
    });

    context.subscriptions.push(disposable);
  }

  logger.info("VS Code commands registered", { commands: commandIds });

  return {
    count: commandIds.length,
    commandIds
  };
}
