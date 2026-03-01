import { commandIds } from "./extension.mjs";

export function registerGraphExplorerBrowserCommand(vscodeApi, context, logger, transportConfig, options = {}) {
  const commandId = options.commandId ?? commandIds.OPEN_GRAPH_EXPLORER;
  const defaultRepoId = options.defaultRepoId ?? "repo-1";

  const disposable = vscodeApi.commands.registerCommand(commandId, async (...args) => {
    const input = args.length > 0 ? args[0] ?? {} : {};
    const repoId = input.repoId ?? defaultRepoId;

    const url = new URL("/graph-explorer", transportConfig.baseUrl);
    url.searchParams.set("repo_id", repoId);

    await vscodeApi.env.openExternal(vscodeApi.Uri.parse(url.toString()));
    logger.info("Opened graph explorer in browser", {
      repo_id: repoId,
      url: url.toString()
    });

    return {
      ok: true,
      data: {
        url: url.toString()
      }
    };
  });

  context.subscriptions.push(disposable);

  return {
    commandId
  };
}
