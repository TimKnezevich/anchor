import { renderGraphExplorerErrorHtml, renderGraphExplorerHtml } from "./graph-webview-renderer.mjs";

export { renderGraphExplorerErrorHtml, renderGraphExplorerHtml };

function emptyPayload() {
  return {
    graph: {
      nodes: [],
      edges: [],
      summary: {
        total_nodes: 0,
        total_edges: 0,
        filtered_nodes: 0,
        filtered_edges: 0,
        stale_tasks: 0
      }
    },
    details: null,
    trace: [],
    diff: {
      changedNodeIds: [],
      changedEdgeIds: []
    }
  };
}

function nextUiState(currentState, overrides = {}) {
  const mergedFilters = {
    ...(currentState.filters ?? {}),
    ...(overrides.filters ?? {})
  };

  const selectedNodeId = Object.prototype.hasOwnProperty.call(overrides, "selectedNodeId")
    ? overrides.selectedNodeId
    : currentState.selectedNodeId;

  const traceFromSpecId = Object.prototype.hasOwnProperty.call(overrides, "traceFromSpecId")
    ? overrides.traceFromSpecId
    : currentState.traceFromSpecId;

  return {
    filters: mergedFilters,
    selectedNodeId: selectedNodeId ?? null,
    traceFromSpecId: traceFromSpecId ?? null
  };
}

export class GraphWebviewPanelManager {
  constructor(vscodeApi, logger, options = {}) {
    this.vscodeApi = vscodeApi;
    this.logger = logger;
    this.viewType = options.viewType ?? "axis.graphExplorer";
    this.title = options.title ?? "Axis Graph Explorer";
    this.column = options.column ?? vscodeApi.ViewColumn?.One ?? 1;
    this.panel = null;
    this.onMessageDisposable = null;
    this.inputBase = {};
    this.uiState = {
      filters: {},
      selectedNodeId: null,
      traceFromSpecId: null
    };
    this.loadGraph = null;
    this.requestCounter = 0;
  }

  getOrCreatePanel() {
    if (this.panel) {
      this.panel.reveal(this.column);
      return this.panel;
    }

    const panel = this.vscodeApi.window.createWebviewPanel(this.viewType, this.title, this.column, {
      enableScripts: true,
      retainContextWhenHidden: true
    });

    panel.onDidDispose(() => {
      this.panel = null;
      this.inputBase = {};
      this.uiState = {
        filters: {},
        selectedNodeId: null,
        traceFromSpecId: null
      };
      this.loadGraph = null;
      this.onMessageDisposable?.dispose?.();
      this.onMessageDisposable = null;
    });

    this.panel = panel;
    return panel;
  }

  bindWebviewMessages() {
    if (!this.panel || this.onMessageDisposable) {
      return;
    }

    const messageHandler = async (message) => {
      if (!message || typeof message !== "object") {
        return;
      }

      if (message.type === "refresh") {
        await this.refresh();
        return;
      }

      if (message.type === "applyFilters") {
        await this.refresh({ filters: message.filters ?? {} });
        return;
      }

      if (message.type === "selectNode") {
        await this.refresh({ selectedNodeId: message.nodeId ?? null });
        return;
      }

      if (message.type === "applyTrace") {
        await this.refresh({ traceFromSpecId: message.traceFromSpecId ?? null });
      }
    };

    if (typeof this.panel.webview.onDidReceiveMessage === "function") {
      this.onMessageDisposable = this.panel.webview.onDidReceiveMessage((message) => {
        messageHandler(message).catch((error) => {
          this.logger.error("Graph explorer message handling failed", {}, error);
        });
      });
    }
  }

  buildRequestInput(overrides = {}) {
    this.uiState = nextUiState(this.uiState, overrides);
    this.requestCounter += 1;

    return {
      ...this.inputBase,
      filters: this.uiState.filters,
      selectedNodeId: this.uiState.selectedNodeId,
      traceFromSpecId: this.uiState.traceFromSpecId,
      commandId: `cmd-graph-webview-${this.requestCounter}`
    };
  }

  async open(loadGraph, input = {}) {
    this.loadGraph = loadGraph;
    this.inputBase = { ...input };

    const panel = this.getOrCreatePanel();
    this.bindWebviewMessages();
    panel.webview.html = renderGraphExplorerHtml(emptyPayload(), this.uiState);

    return this.refresh();
  }

  async refresh(overrides = {}) {
    if (!this.panel || typeof this.loadGraph !== "function") {
      throw new Error("Graph webview is not open.");
    }

    const input = this.buildRequestInput(overrides);

    try {
      const response = await this.loadGraph(input);
      if (!response?.ok) {
        throw new Error(response?.error?.message ?? "Unknown graph load failure.");
      }

      this.panel.webview.html = renderGraphExplorerHtml(response.data, this.uiState);
      this.logger.info("Graph explorer webview rendered", {
        nodes: response.data?.graph?.summary?.filtered_nodes ?? 0,
        edges: response.data?.graph?.summary?.filtered_edges ?? 0
      });
      return response;
    } catch (error) {
      this.panel.webview.html = renderGraphExplorerErrorHtml(error?.message ?? String(error));
      this.logger.error("Graph explorer webview render failed", {}, error);
      return {
        ok: false,
        error: {
          code: error?.code ?? "GRAPH_WEBVIEW_RENDER_FAILED",
          message: error?.message ?? String(error)
        }
      };
    }
  }
}
