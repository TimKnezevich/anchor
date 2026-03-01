export class InMemoryStore {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.sessions = new Map();
    this.evidenceByTask = new Map();
    this.validationByTask = new Map();
    this.repoInitialization = new Map();
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId) ?? null;
  }

  upsertNode(node) {
    this.nodes.set(node.id, node);
    return node;
  }

  listNodes(nodeIds = null) {
    if (Array.isArray(nodeIds) && nodeIds.length > 0) {
      return nodeIds.map((id) => this.nodes.get(id)).filter(Boolean);
    }

    return [...this.nodes.values()];
  }

  listEdges() {
    return [...this.edges.values()];
  }

  upsertEdge(edge) {
    this.edges.set(edge.id, edge);
    return edge;
  }

  upsertSession(session) {
    this.sessions.set(session.session_id, session);
    return session;
  }

  listSessions() {
    return [...this.sessions.values()];
  }

  attachEvidence(taskId, evidence) {
    const current = this.evidenceByTask.get(taskId) ?? [];
    current.push(evidence);
    this.evidenceByTask.set(taskId, current);
    return evidence;
  }

  getEvidence(taskId) {
    return this.evidenceByTask.get(taskId) ?? [];
  }

  setValidation(taskId, validation) {
    this.validationByTask.set(taskId, validation);
    return validation;
  }

  getValidation(taskId) {
    return this.validationByTask.get(taskId) ?? null;
  }

  getRepoInitialization(repoId) {
    return this.repoInitialization.get(repoId) ?? null;
  }

  upsertRepoInitialization(repoId, initialization) {
    this.repoInitialization.set(repoId, initialization);
    return initialization;
  }
}
