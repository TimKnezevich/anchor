function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderGraphExplorerPage(options = {}) {
  const mcpPath = options.mcpPath ?? "/mcp";
  const title = options.title ?? "Axis Graph Explorer";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        --bg: #f4f7fb;
        --panel: #ffffff;
        --text: #0f172a;
        --muted: #475569;
        --edge: #0b1220;
        --accent: #f97316;
        --line: #dbe2ea;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: linear-gradient(160deg, #eef3f9 0%, #f8fbff 100%);
        color: var(--text);
        font-family: "Segoe UI", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
      }
      header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--line);
        background: #ffffffcc;
        backdrop-filter: blur(4px);
        position: sticky;
        top: 0;
      }
      .layout {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 16px;
        padding: 16px;
      }
      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 14px;
      }
      .controls { display: grid; gap: 10px; }
      label { display: grid; gap: 4px; font-size: 13px; color: var(--muted); }
      input, select, button {
        font: inherit;
        border: 1px solid #c8d4e0;
        border-radius: 8px;
        padding: 8px 10px;
      }
      button {
        background: #fff;
        color: var(--edge);
        cursor: pointer;
      }
      button.primary {
        background: var(--edge);
        color: #fff;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(120px, 1fr));
        gap: 10px;
      }
      .stat {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 10px;
      }
      .lists {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      ul, ol { margin: 0; padding-left: 20px; }
      .muted { color: var(--muted); }
      .changed { background: #fef3c7; padding: 2px 4px; border-radius: 4px; }
      .node-btn {
        border: 0;
        background: transparent;
        padding: 0;
        color: #0b3a8d;
        cursor: pointer;
      }
      pre {
        margin: 0;
        overflow-x: auto;
        background: #f7fafc;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 10px;
        font-size: 12px;
      }
      @media (max-width: 960px) {
        .layout { grid-template-columns: 1fr; }
        .lists { grid-template-columns: 1fr; }
        .stats { grid-template-columns: repeat(2, minmax(120px, 1fr)); }
      }
    </style>
  </head>
  <body>
    <header>
      <strong>${escapeHtml(title)}</strong>
      <span class="muted">Authoritative state from Axis MCP</span>
    </header>

    <div class="layout">
      <section class="panel controls">
        <label>Repo ID
          <input id="repo-id" type="text" value="repo-1" />
        </label>
        <label>Node Type
          <select id="node-type">
            <option value="">(any)</option>
            <option>SPEC</option>
            <option>TASK</option>
            <option>CODE_UNIT</option>
            <option>EVIDENCE</option>
            <option>ADR</option>
            <option>POLICY</option>
            <option>CONTRACT</option>
            <option>IDEA</option>
            <option>DRAFT</option>
            <option>EPIC</option>
          </select>
        </label>
        <label>Status
          <input id="status" type="text" placeholder="in_progress" />
        </label>
        <label><input id="stale-only" type="checkbox" /> stale only</label>
        <label><input id="conflict-only" type="checkbox" /> conflict only</label>
        <label>Trace From SPEC ID
          <input id="trace-from" type="text" placeholder="spec.1" />
        </label>
        <button class="primary" id="refresh">Refresh Graph</button>
        <p id="status-line" class="muted">Ready.</p>
      </section>

      <section>
        <div class="stats" id="stats"></div>
        <div class="lists" style="margin-top: 12px;">
          <div class="panel">
            <h3>Nodes</h3>
            <ul id="nodes"></ul>
          </div>
          <div class="panel">
            <h3>Edges</h3>
            <ul id="edges"></ul>
          </div>
        </div>
        <div class="lists" style="margin-top: 12px;">
          <div class="panel">
            <h3>Selected Node</h3>
            <pre id="details">No node selected.</pre>
          </div>
          <div class="panel">
            <h3>Trace</h3>
            <ol id="trace"></ol>
          </div>
        </div>
      </section>
    </div>

    <script>
      const state = {
        snapshot: null,
        selectedNodeId: null
      };

      function el(id) {
        return document.getElementById(id);
      }

      function setStatus(text) {
        el("status-line").textContent = text;
      }

      function isConflict(node, staleTaskIds) {
        return node.type === "TASK" && (node.status === "failed_validation" || staleTaskIds.has(node.id));
      }

      function applyFilters(nodes, staleTaskIds) {
        const nodeType = el("node-type").value;
        const status = el("status").value.trim();
        const staleOnly = el("stale-only").checked;
        const conflictOnly = el("conflict-only").checked;

        return nodes.filter((node) => {
          if (nodeType && node.type !== nodeType) {
            return false;
          }
          if (status && (node.status ?? "") !== status) {
            return false;
          }
          if (staleOnly && !staleTaskIds.has(node.id)) {
            return false;
          }
          if (conflictOnly && !isConflict(node, staleTaskIds)) {
            return false;
          }
          return true;
        });
      }

      function renderStats(summary) {
        const cards = [
          "Nodes: " + summary.filteredNodes + " / " + summary.totalNodes,
          "Edges: " + summary.filteredEdges + " / " + summary.totalEdges,
          "Stale Tasks: " + summary.staleTasks,
          "Trace Items: " + summary.traceCount
        ];
        el("stats").innerHTML = cards.map((card) => '<div class="stat">' + card + "</div>").join("");
      }

      function renderDetails(node) {
        if (!node) {
          el("details").textContent = "No node selected.";
          return;
        }
        el("details").textContent = JSON.stringify(node, null, 2);
      }

      function buildTrace(edges, nodeIndex, startSpecId) {
        if (!startSpecId) {
          return [];
        }
        const queue = [startSpecId];
        const visited = new Set();
        const trace = [];

        while (queue.length > 0) {
          const current = queue.shift();
          if (visited.has(current)) {
            continue;
          }
          visited.add(current);

          for (const edge of edges) {
            if (edge.source_id !== current) {
              continue;
            }
            const source = nodeIndex.get(edge.source_id);
            const target = nodeIndex.get(edge.target_id);
            if (!source || !target) {
              continue;
            }
            trace.push(
              source.type + ":" + source.id + " -> " + target.type + ":" + target.id + " (" + edge.type + ")"
            );
            queue.push(edge.target_id);
          }
        }

        return trace.filter((item) =>
          item.includes("SPEC:") || item.includes("TASK:") || item.includes("CODE_UNIT:") || item.includes("EVIDENCE:")
        );
      }

      function renderGraph(payload) {
        const nodes = Array.isArray(payload.nodes) ? payload.nodes : [];
        const edges = Array.isArray(payload.edges) ? payload.edges : [];
        const staleTasks = Array.isArray(payload.stale_tasks) ? payload.stale_tasks : [];
        const staleTaskIds = new Set(staleTasks.map((item) => item.task_id));

        const filteredNodes = applyFilters(nodes, staleTaskIds);
        const visibleNodeIds = new Set(filteredNodes.map((node) => node.id));
        const filteredEdges = edges.filter((edge) => visibleNodeIds.has(edge.source_id) && visibleNodeIds.has(edge.target_id));

        const nodeIndex = new Map(filteredNodes.map((node) => [node.id, node]));
        const trace = buildTrace(filteredEdges, nodeIndex, el("trace-from").value.trim());

        renderStats({
          totalNodes: nodes.length,
          filteredNodes: filteredNodes.length,
          totalEdges: edges.length,
          filteredEdges: filteredEdges.length,
          staleTasks: staleTaskIds.size,
          traceCount: trace.length
        });

        el("nodes").innerHTML = filteredNodes
          .map((node) => {
            const flags = [];
            if (staleTaskIds.has(node.id)) flags.push("stale");
            if (isConflict(node, staleTaskIds)) flags.push("conflict");
            const flagHtml = flags.length ? ' <span class="changed">[' + flags.join(", ") + "]</span>" : "";
            return (
              '<li><button class="node-btn" data-node-id="' +
              node.id +
              '">' +
              (node.title ?? node.id) +
              "</button> (" +
              node.type +
              ")" +
              flagHtml +
              "</li>"
            );
          })
          .join("");

        el("edges").innerHTML = filteredEdges
          .map((edge) => "<li>" + edge.type + ": " + edge.source_id + " -> " + edge.target_id + "</li>")
          .join("");

        el("trace").innerHTML = trace.map((line) => "<li>" + line + "</li>").join("");

        renderDetails(nodeIndex.get(state.selectedNodeId) ?? null);

        document.querySelectorAll(".node-btn").forEach((button) => {
          button.addEventListener("click", () => {
            state.selectedNodeId = button.getAttribute("data-node-id");
            renderDetails(nodeIndex.get(state.selectedNodeId));
          });
        });
      }

      async function loadGraph() {
        const repoId = el("repo-id").value.trim() || "repo-1";
        setStatus("Loading graph...");

        const body = {
          command: "read_state",
          command_id: "cmd-browser-graph-" + Date.now(),
          repo_id: repoId,
          actor: "axis-browser",
          payload: {
            include_edges: true,
            stale_only: el("stale-only").checked
          }
        };

        const response = await fetch(${JSON.stringify(mcpPath)}, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body)
        });

        const payload = await response.json();
        if (!payload.ok) {
          throw new Error(payload.error?.message ?? "Graph load failed");
        }

        state.snapshot = payload.data;
        renderGraph(payload.data);
        setStatus("Loaded " + payload.data.nodes.length + " nodes.");
      }

      el("refresh").addEventListener("click", () => {
        loadGraph().catch((error) => {
          setStatus("Load failed: " + error.message);
        });
      });

      const params = new URLSearchParams(window.location.search);
      const repoParam = params.get("repo_id");
      if (repoParam) {
        el("repo-id").value = repoParam;
      }

      loadGraph().catch((error) => {
        setStatus("Load failed: " + error.message);
      });
    </script>
  </body>
</html>`;
}
