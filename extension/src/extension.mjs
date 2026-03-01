import { AxisMcpClient } from "./axis-mcp-client.mjs";
import { CommandRegistry } from "./command-registry.mjs";
import { GraphExplorerController } from "./graph-explorer-controller.mjs";
import { createSimpleLogger } from "./simple-logger.mjs";
import { WorkflowController } from "./workflow-controller.mjs";

export const commandIds = Object.freeze({
  START_TASK: "axis.startTask",
  CONFIRM_TASK: "axis.confirmTask",
  SHOW_TASK_STATE: "axis.showTaskState",
  OPEN_GRAPH_EXPLORER: "axis.openGraphExplorer",
  CHECK_CONNECTION: "axis.checkConnection"
});

export function activateExtension(options) {
  const logger = options.logger ?? createSimpleLogger({ service: "axis-extension" });
  const client = options.client ?? new AxisMcpClient(options.transport, options.defaults);
  const controller = new WorkflowController(client, logger);
  const graphExplorer = new GraphExplorerController(client, logger);
  const registry = new CommandRegistry();

  registry.register(commandIds.START_TASK, (input) => controller.startTask(input));
  registry.register(commandIds.CONFIRM_TASK, (input) => controller.confirmTask(input));
  registry.register(commandIds.SHOW_TASK_STATE, (input) => controller.showTaskState(input));
  registry.register(commandIds.CHECK_CONNECTION, (input) => controller.checkConnection(input));
  registry.register(commandIds.OPEN_GRAPH_EXPLORER, (input) => graphExplorer.openGraphExplorer(input));

  logger.info("Extension activated", { commands: registry.list() });

  return {
    registry,
    controller,
    graphExplorer,
    client
  };
}
