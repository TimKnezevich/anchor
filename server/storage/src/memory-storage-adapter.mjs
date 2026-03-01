import { StorageAdapter } from "./storage-adapter.mjs";

function clone(value) {
  return structuredClone(value);
}

export class MemoryStorageAdapter extends StorageAdapter {
  constructor() {
    super("memory");
    this.nodes = new Map();
    this.edges = new Map();
    this.sessions = new Map();
    this.evidenceByTask = new Map();
    this.validationByTask = new Map();
    this.clauses = new Map();
    this.taskClauseLinks = new Map();
  }

  initialize() {
    return { ok: true, adapter: this.name };
  }

  migrate() {
    return { ok: true, adapter: this.name, migrations: 0 };
  }

  getNode(nodeId) {
    const value = this.nodes.get(nodeId);
    return value ? clone(value) : null;
  }

  upsertNode(node) {
    this.nodes.set(node.id, clone(node));
    return clone(node);
  }

  listNodes(nodeIds = null) {
    if (Array.isArray(nodeIds) && nodeIds.length > 0) {
      return nodeIds.map((id) => this.nodes.get(id)).filter(Boolean).map(clone);
    }

    return [...this.nodes.values()].map(clone);
  }

  listEdges() {
    return [...this.edges.values()].map(clone);
  }

  upsertEdge(edge) {
    this.edges.set(edge.id, clone(edge));
    return clone(edge);
  }

  upsertSession(session) {
    this.sessions.set(session.session_id, clone(session));
    return clone(session);
  }

  listSessions() {
    return [...this.sessions.values()].map(clone);
  }

  attachEvidence(taskId, evidence) {
    const current = this.evidenceByTask.get(taskId) ?? [];
    current.push(clone(evidence));
    this.evidenceByTask.set(taskId, current);
    return clone(evidence);
  }

  getEvidence(taskId) {
    return (this.evidenceByTask.get(taskId) ?? []).map(clone);
  }

  setValidation(taskId, validation) {
    this.validationByTask.set(taskId, clone(validation));
    return clone(validation);
  }

  getValidation(taskId) {
    const value = this.validationByTask.get(taskId);
    return value ? clone(value) : null;
  }

  upsertClause(clause) {
    this.clauses.set(clause.id, clone(clause));
    return clone(clause);
  }

  getClause(clauseId) {
    const value = this.clauses.get(clauseId);
    return value ? clone(value) : null;
  }

  listClauses() {
    return [...this.clauses.values()].map(clone);
  }

  upsertTaskClauseLink(link) {
    const current = this.taskClauseLinks.get(link.task_id) ?? [];
    const next = current.filter((item) => item.clause_id !== link.clause_id);
    next.push(clone(link));
    this.taskClauseLinks.set(link.task_id, next);
    return clone(link);
  }

  getTaskClauseLinks(taskId) {
    return (this.taskClauseLinks.get(taskId) ?? []).map(clone);
  }
}
