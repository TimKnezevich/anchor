import { AxisMcpClient } from "./axis-mcp-client.mjs";
import { CommandRegistry } from "./command-registry.mjs";
import { createSimpleLogger } from "./simple-logger.mjs";
import { WorkflowController } from "./workflow-controller.mjs";

export const commandIds = Object.freeze({
  INITIALIZE_REPOSITORY: "axis.initializeRepository",
  OPEN_GRAPH_EXPLORER: "axis.openGraphExplorer",
  CHECK_CONNECTION: "axis.checkConnection"
});

export function activateExtension(options) {
  const logger = options.logger ?? createSimpleLogger({ service: "axis-extension" });
  const client = options.client ?? new AxisMcpClient(options.transport, options.defaults);
  const controller = new WorkflowController(client, logger);
  const registry = new CommandRegistry();

  registry.register(commandIds.INITIALIZE_REPOSITORY, (input) => controller.initializeRepository(input));
  registry.register(commandIds.CHECK_CONNECTION, (input) => controller.checkConnection(input));

  logger.info("Extension activated", { commands: registry.list() });

  return {
    registry,
    controller,
    client
  };
}
