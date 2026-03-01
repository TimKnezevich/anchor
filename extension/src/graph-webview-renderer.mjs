function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function encodeJson(value) {
  return JSON.stringify(value ?? {}).replaceAll("<", "\\u003c");
}

function renderNodes(nodes = []) {
  if (nodes.length === 0) {
    return "<p>No visible nodes.</p>";
  }

  const items = nodes.map((node) => {
    const flags = [];
    if (node.stale) {
      flags.push("stale");
    }
    if (node.conflict) {
      flags.push("conflict");
    }
    if (node.changed) {
      flags.push("changed");
    }

    const classes = ["node-row"];
    if (node.changed) {
      classes.push("node-changed");
    }

    const meta = flags.length > 0 ? ` <span class="flags">[${flags.join(", ")}]</span>` : "";

    return `<li class="${classes.join(" ")}">
      <button class="node-select" data-node-id="${escapeHtml(node.id)}">${escapeHtml(node.label)}</button>
      <span>(${escapeHtml(node.type)})</span>${meta}
    </li>`;
  });

  return `<ul>${items.join("")}</ul>`;
}

function renderEdges(edges = []) {
  if (edges.length === 0) {
    return "<p>No visible edges.</p>";
  }

  const items = edges.map((edge) => {
    const classes = edge.changed ? "edge-row edge-changed" : "edge-row";
    return `<li class="${classes}">${escapeHtml(edge.type)}: ${escapeHtml(edge.source)} -> ${escapeHtml(
      edge.target
    )}</li>`;
  });

  return `<ul>${items.join("")}</ul>`;
}

function toOptions(values, selectedValue) {
  const normalized = [...new Set(values.filter(Boolean))].sort();
  const base = ['<option value="">(any)</option>'];

  for (const value of normalized) {
    const selected = value === selectedValue ? ' selected="selected"' : "";
    base.push(`<option value="${escapeHtml(value)}"${selected}>${escapeHtml(value)}</option>`);
  }

  return base.join("");
}

function renderFilterControls(payload, uiState) {
  const nodeTypes = (payload?.graph?.nodes ?? []).map((node) => node.type);
  const statuses = (payload?.graph?.nodes ?? []).map((node) => node.status);
  const filters = uiState?.filters ?? {};

  return `<section>
    <h2>Filters</h2>
    <div class="controls">
      <label>Node Type
        <select id="filter-node-type">${toOptions(nodeTypes, filters.nodeType ?? "")}</select>
      </label>
      <label>Status
        <select id="filter-status">${toOptions(statuses, filters.status ?? "")}</select>
      </label>
      <label><input id="filter-stale-only" type="checkbox" ${filters.staleOnly ? "checked" : ""} /> Stale only</label>
      <label><input id="filter-conflict-only" type="checkbox" ${filters.conflictOnly ? "checked" : ""} /> Conflict only</label>
      <button id="apply-filters" type="button">Apply Filters</button>
      <button id="refresh-graph" type="button">Refresh</button>
    </div>
  </section>`;
}

function renderTraceControls(uiState) {
  return `<section>
    <h2>Trace Mode</h2>
    <div class="controls">
      <label>Start SPEC Node ID
        <input id="trace-spec-id" type="text" value="${escapeHtml(uiState?.traceFromSpecId ?? "")}" />
      </label>
      <button id="apply-trace" type="button">Apply Trace</button>
      <button id="clear-trace" type="button">Clear Trace</button>
    </div>
  </section>`;
}

export function renderGraphExplorerHtml(payload, uiState = {}) {
  const graph = payload?.graph ?? { nodes: [], edges: [], summary: {} };
  const details = payload?.details ?? null;
  const trace = Array.isArray(payload?.trace) ? payload.trace : [];
  const summary = graph.summary ?? {};
  const diff = payload?.diff ?? { changedNodeIds: [], changedEdgeIds: [] };

  const detailHtml = details
    ? `
      <p><strong>${escapeHtml(details.id)}</strong> (${escapeHtml(details.type)})</p>
      <p>Status: ${escapeHtml(details.status ?? "none")}</p>
      <p>Incoming: ${details.incoming.length} | Outgoing: ${details.outgoing.length}</p>
    `
    : "<p>No node selected. Click a node label in the list.</p>";

  const traceHtml =
    trace.length > 0
      ? `<ol>${trace
          .map(
            (item) =>
              `<li>${escapeHtml(item.from_type)}:${escapeHtml(item.from)} -> ${escapeHtml(
                item.to_type
              )}:${escapeHtml(item.to)} (${escapeHtml(item.edge_type)})</li>`
          )
          .join("")}</ol>`
      : "<p>No trace path.</p>";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Axis Graph Explorer</title>
    <style>
      :root { color-scheme: light dark; font-family: ui-sans-serif, system-ui, sans-serif; }
      body { margin: 0; padding: 16px; }
      h2 { margin-top: 20px; margin-bottom: 8px; }
      .summary { display: grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap: 8px; }
      .card { border: 1px solid #8884; border-radius: 8px; padding: 8px; }
      .controls { display: flex; flex-wrap: wrap; gap: 10px; align-items: end; }
      .controls label { display: flex; flex-direction: column; gap: 4px; }
      .flags { color: #b45309; }
      .node-row, .edge-row { margin-bottom: 6px; }
      .node-changed, .edge-changed { background: #fef3c7; border-radius: 4px; padding: 2px 4px; }
      .node-select { font: inherit; background: none; border: 1px solid #8884; border-radius: 4px; cursor: pointer; }
      ul, ol { padding-left: 20px; }
    </style>
  </head>
  <body>
    <h1>Axis Graph Explorer</h1>
    ${renderFilterControls(payload, uiState)}
    ${renderTraceControls(uiState)}
    <section class="summary">
      <div class="card">Nodes: ${escapeHtml(summary.filtered_nodes ?? 0)} / ${escapeHtml(
    summary.total_nodes ?? 0
  )}</div>
      <div class="card">Edges: ${escapeHtml(summary.filtered_edges ?? 0)} / ${escapeHtml(
    summary.total_edges ?? 0
  )}</div>
      <div class="card">Stale Tasks: ${escapeHtml(summary.stale_tasks ?? 0)}</div>
      <div class="card">Changed: ${escapeHtml(diff.changedNodeIds?.length ?? 0)} nodes, ${escapeHtml(
    diff.changedEdgeIds?.length ?? 0
  )} edges</div>
    </section>
    <h2>Nodes</h2>
    ${renderNodes(graph.nodes)}
    <h2>Edges</h2>
    ${renderEdges(graph.edges)}
    <h2>Details</h2>
    ${detailHtml}
    <h2>Trace</h2>
    ${traceHtml}
    <script>
      const vscode = acquireVsCodeApi();
      const uiState = ${encodeJson(uiState)};

      function collectFilters() {
        const nodeType = document.getElementById("filter-node-type").value;
        const status = document.getElementById("filter-status").value;
        const staleOnly = document.getElementById("filter-stale-only").checked;
        const conflictOnly = document.getElementById("filter-conflict-only").checked;
        return {
          nodeType: nodeType || undefined,
          status: status || undefined,
          staleOnly,
          conflictOnly
        };
      }

      document.getElementById("apply-filters")?.addEventListener("click", () => {
        vscode.postMessage({ type: "applyFilters", filters: collectFilters() });
      });

      document.getElementById("refresh-graph")?.addEventListener("click", () => {
        vscode.postMessage({ type: "refresh" });
      });

      document.getElementById("apply-trace")?.addEventListener("click", () => {
        const specId = document.getElementById("trace-spec-id").value;
        vscode.postMessage({ type: "applyTrace", traceFromSpecId: specId || null });
      });

      document.getElementById("clear-trace")?.addEventListener("click", () => {
        vscode.postMessage({ type: "applyTrace", traceFromSpecId: null });
      });

      document.querySelectorAll(".node-select").forEach((button) => {
        button.addEventListener("click", () => {
          const nodeId = button.getAttribute("data-node-id");
          vscode.postMessage({ type: "selectNode", nodeId });
        });
      });
    </script>
  </body>
</html>`;
}

export function renderGraphExplorerErrorHtml(message) {
  return `<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8" /><title>Axis Graph Explorer</title></head>
  <body>
    <h1>Axis Graph Explorer</h1>
    <p>Failed to load graph data.</p>
    <pre>${escapeHtml(message ?? "Unknown error")}</pre>
  </body>
</html>`;
}
