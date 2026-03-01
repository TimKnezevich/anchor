import { AxisError, errorCodes } from "../../../shared/observability/src/index.mjs";

export class StorageAdapter {
  constructor(name) {
    this.name = name;
  }

  notImplemented(methodName) {
    throw new AxisError(`Storage adapter '${this.name}' does not implement method '${methodName}'.`, {
      code: errorCodes.INTERNAL_ERROR,
      details: {
        adapter: this.name,
        method: methodName
      }
    });
  }

  initialize() {
    this.notImplemented("initialize");
  }

  migrate() {
    this.notImplemented("migrate");
  }

  getNode(_nodeId) {
    this.notImplemented("getNode");
  }

  upsertNode(_node) {
    this.notImplemented("upsertNode");
  }

  listNodes(_nodeIds = null) {
    this.notImplemented("listNodes");
  }

  listEdges() {
    this.notImplemented("listEdges");
  }

  upsertEdge(_edge) {
    this.notImplemented("upsertEdge");
  }

  upsertSession(_session) {
    this.notImplemented("upsertSession");
  }

  listSessions() {
    this.notImplemented("listSessions");
  }

  attachEvidence(_taskId, _evidence) {
    this.notImplemented("attachEvidence");
  }

  getEvidence(_taskId) {
    this.notImplemented("getEvidence");
  }

  setValidation(_taskId, _validation) {
    this.notImplemented("setValidation");
  }

  getValidation(_taskId) {
    this.notImplemented("getValidation");
  }

  upsertClause(_clause) {
    this.notImplemented("upsertClause");
  }

  getClause(_clauseId) {
    this.notImplemented("getClause");
  }

  listClauses() {
    this.notImplemented("listClauses");
  }

  upsertTaskClauseLink(_link) {
    this.notImplemented("upsertTaskClauseLink");
  }

  getTaskClauseLinks(_taskId) {
    this.notImplemented("getTaskClauseLinks");
  }
}
