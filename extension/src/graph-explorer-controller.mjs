import {
  buildDetailsPanelModel,
  buildGraphViewModel,
  buildTracePath,
  diffSnapshots
} from "./graph-explorer-model.mjs";

export class GraphExplorerController {
  constructor(client, logger) {
    this.client = client;
    this.logger = logger;
    this.lastSnapshot = null;
  }

  async openGraphExplorer(input) {
    return this.refreshGraph({
      ...input,
      commandId: input.commandId
    });
  }

  async refreshGraph(input) {
    const response = await this.client.readState(
      {
        include_edges: true,
        stale_only: input.filters?.staleOnly === true
      },
      input.commandId,
      {
        repoId: input.repoId,
        actor: input.actor,
        correlationId: input.correlationId
      }
    );

    const nextSnapshot = response.data;
    const diff = this.lastSnapshot
      ? diffSnapshots(this.lastSnapshot, nextSnapshot)
      : { changedNodeIds: [], changedEdgeIds: [] };

    const graph = buildGraphViewModel(nextSnapshot, {
      filters: input.filters,
      changedNodeIds: diff.changedNodeIds,
      changedEdgeIds: diff.changedEdgeIds
    });

    const details = input.selectedNodeId
      ? buildDetailsPanelModel(graph, input.selectedNodeId)
      : null;

    const trace = input.traceFromSpecId
      ? buildTracePath(graph, input.traceFromSpecId)
      : [];

    this.lastSnapshot = nextSnapshot;

    this.logger.info("Graph explorer refresh", {
      filtered_nodes: graph.summary.filtered_nodes,
      filtered_edges: graph.summary.filtered_edges,
      stale_tasks: graph.summary.stale_tasks,
      changed_nodes: diff.changedNodeIds.length,
      changed_edges: diff.changedEdgeIds.length
    });

    return {
      ok: true,
      data: {
        graph,
        details,
        trace,
        diff
      }
    };
  }

  startPolling(config) {
    const intervalMs = config.intervalMs ?? 1000;

    const timer = setInterval(async () => {
      try {
        await this.refreshGraph(config);
      } catch (error) {
        this.logger.error("Graph explorer poll failed", { interval_ms: intervalMs }, error);
      }
    }, intervalMs);

    return {
      stop() {
        clearInterval(timer);
      }
    };
  }
}
