function toNodeView(node, staleTaskIds, changedNodeIds) {
  const isStale = node.type === "TASK" && staleTaskIds.has(node.id);
  const isConflict = node.type === "TASK" && (node.status === "failed_validation" || isStale);

  return {
    id: node.id,
    type: node.type,
    status: node.status ?? null,
    label: node.title ?? node.id,
    node,
    stale: isStale,
    conflict: isConflict,
    changed: changedNodeIds.has(node.id)
  };
}

function toEdgeView(edge, changedEdgeIds) {
  return {
    id: edge.id,
    type: edge.type,
    source: edge.source_id,
    target: edge.target_id,
    edge,
    changed: changedEdgeIds.has(edge.id)
  };
}

function matchFilters(nodeView, filters) {
  if (filters.nodeType && nodeView.type !== filters.nodeType) {
    return false;
  }

  if (filters.status && nodeView.status !== filters.status) {
    return false;
  }

  if (filters.staleOnly === true && nodeView.stale !== true) {
    return false;
  }

  if (filters.conflictOnly === true && nodeView.conflict !== true) {
    return false;
  }

  return true;
}

export function buildGraphViewModel(stateData, options = {}) {
  const nodes = Array.isArray(stateData?.nodes) ? stateData.nodes : [];
  const edges = Array.isArray(stateData?.edges) ? stateData.edges : [];
  const staleTasks = Array.isArray(stateData?.stale_tasks) ? stateData.stale_tasks : [];

  const staleTaskIds = new Set(staleTasks.map((item) => item.task_id));
  const changedNodeIds = new Set(options.changedNodeIds ?? []);
  const changedEdgeIds = new Set(options.changedEdgeIds ?? []);

  const nodeViews = nodes.map((node) => toNodeView(node, staleTaskIds, changedNodeIds));
  const edgeViews = edges.map((edge) => toEdgeView(edge, changedEdgeIds));
  const filters = options.filters ?? {};

  const filteredNodes = nodeViews.filter((nodeView) => matchFilters(nodeView, filters));
  const visibleNodeIds = new Set(filteredNodes.map((nodeView) => nodeView.id));

  const filteredEdges = edgeViews.filter(
    (edgeView) => visibleNodeIds.has(edgeView.source) && visibleNodeIds.has(edgeView.target)
  );

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    summary: {
      total_nodes: nodeViews.length,
      total_edges: edgeViews.length,
      filtered_nodes: filteredNodes.length,
      filtered_edges: filteredEdges.length,
      stale_tasks: staleTaskIds.size
    }
  };
}

export function buildDetailsPanelModel(graphModel, nodeId) {
  const selected = graphModel.nodes.find((node) => node.id === nodeId) ?? null;

  if (!selected) {
    return null;
  }

  const incoming = graphModel.edges.filter((edge) => edge.target === nodeId);
  const outgoing = graphModel.edges.filter((edge) => edge.source === nodeId);

  return {
    id: selected.id,
    type: selected.type,
    status: selected.status,
    stale: selected.stale,
    conflict: selected.conflict,
    changed: selected.changed,
    incoming,
    outgoing,
    node: selected.node
  };
}

export function buildTracePath(graphModel, startSpecId) {
  const edgeBySource = new Map();
  for (const edge of graphModel.edges) {
    const current = edgeBySource.get(edge.source) ?? [];
    current.push(edge);
    edgeBySource.set(edge.source, current);
  }

  const trace = [];
  const visited = new Set();
  const queue = [startSpecId];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (visited.has(nodeId)) {
      continue;
    }
    visited.add(nodeId);

    const outgoing = edgeBySource.get(nodeId) ?? [];
    for (const edge of outgoing) {
      const sourceNode = graphModel.nodes.find((node) => node.id === edge.source);
      const targetNode = graphModel.nodes.find((node) => node.id === edge.target);

      if (!sourceNode || !targetNode) {
        continue;
      }

      trace.push({
        from: sourceNode.id,
        from_type: sourceNode.type,
        to: targetNode.id,
        to_type: targetNode.type,
        edge_type: edge.type
      });

      queue.push(targetNode.id);
    }
  }

  return trace.filter(
    (item) =>
      ["SPEC", "TASK", "CODE_UNIT", "EVIDENCE"].includes(item.from_type) &&
      ["SPEC", "TASK", "CODE_UNIT", "EVIDENCE"].includes(item.to_type)
  );
}

export function diffSnapshots(previous, next) {
  const previousNodes = new Set((previous?.nodes ?? []).map((node) => node.id));
  const previousEdges = new Set((previous?.edges ?? []).map((edge) => edge.id));
  const nextNodes = new Set((next?.nodes ?? []).map((node) => node.id));
  const nextEdges = new Set((next?.edges ?? []).map((edge) => edge.id));

  const changedNodeIds = [];
  const changedEdgeIds = [];

  for (const id of nextNodes) {
    if (!previousNodes.has(id)) {
      changedNodeIds.push(id);
      continue;
    }

    const prevNode = previous.nodes.find((node) => node.id === id);
    const nextNode = next.nodes.find((node) => node.id === id);
    if (JSON.stringify(prevNode) !== JSON.stringify(nextNode)) {
      changedNodeIds.push(id);
    }
  }

  for (const id of nextEdges) {
    if (!previousEdges.has(id)) {
      changedEdgeIds.push(id);
      continue;
    }

    const prevEdge = previous.edges.find((edge) => edge.id === id);
    const nextEdge = next.edges.find((edge) => edge.id === id);
    if (JSON.stringify(prevEdge) !== JSON.stringify(nextEdge)) {
      changedEdgeIds.push(id);
    }
  }

  return {
    changedNodeIds,
    changedEdgeIds
  };
}
