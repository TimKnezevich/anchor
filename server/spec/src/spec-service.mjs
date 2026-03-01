import { AxisError, errorCodes } from "../../../shared/observability/src/index.mjs";
import { computeClauseHash, validateClause } from "../../../shared/spec/src/index.mjs";

export class SpecService {
  constructor() {
    this.clauses = new Map();
    this.taskClauseLinks = new Map();
    this.taskState = new Map();
  }

  upsertClause(clause) {
    const validation = validateClause(clause);
    if (!validation.ok) {
      throw new AxisError("Clause validation failed.", {
        code: errorCodes.VALIDATION_ERROR,
        details: { errors: validation.errors }
      });
    }

    const hash = computeClauseHash(clause);
    const storedClause = {
      ...clause,
      hash
    };

    this.clauses.set(clause.id, storedClause);
    this.evaluateDriftForClause(clause.id);

    return storedClause;
  }

  getClause(clauseId) {
    return this.clauses.get(clauseId) ?? null;
  }

  linkTaskToClause(taskId, clauseId) {
    const clause = this.getClause(clauseId);
    if (!clause) {
      throw new AxisError(`Clause '${clauseId}' not found.`, {
        code: errorCodes.NOT_FOUND,
        details: { clause_id: clauseId }
      });
    }

    const link = {
      task_id: taskId,
      clause_id: clauseId,
      clause_hash_at_link_time: clause.hash
    };

    const current = this.taskClauseLinks.get(taskId) ?? [];
    const next = current.filter((item) => item.clause_id !== clauseId);
    next.push(link);
    this.taskClauseLinks.set(taskId, next);

    if (!this.taskState.has(taskId)) {
      this.taskState.set(taskId, "ready");
    }

    return link;
  }

  getTaskClauseLinks(taskId) {
    return this.taskClauseLinks.get(taskId) ?? [];
  }

  getTaskState(taskId) {
    return this.taskState.get(taskId) ?? null;
  }

  setTaskState(taskId, state) {
    this.taskState.set(taskId, state);
    return state;
  }

  evaluateTaskDrift(taskId) {
    const links = this.getTaskClauseLinks(taskId);

    for (const link of links) {
      const clause = this.getClause(link.clause_id);
      if (!clause) {
        continue;
      }

      if (clause.hash !== link.clause_hash_at_link_time) {
        this.setTaskState(taskId, "stale");
        return {
          stale: true,
          task_id: taskId,
          clause_id: link.clause_id,
          clause_hash_at_link_time: link.clause_hash_at_link_time,
          current_clause_hash: clause.hash
        };
      }
    }

    return {
      stale: false,
      task_id: taskId
    };
  }

  evaluateDriftForClause(clauseId) {
    const impactedTasks = [];

    for (const taskId of this.taskClauseLinks.keys()) {
      const links = this.getTaskClauseLinks(taskId);
      const hasClause = links.some((link) => link.clause_id === clauseId);

      if (!hasClause) {
        continue;
      }

      const result = this.evaluateTaskDrift(taskId);
      if (result.stale) {
        impactedTasks.push(result);
      }
    }

    return impactedTasks;
  }

  listStaleTasks() {
    const stale = [];

    for (const [taskId, state] of this.taskState.entries()) {
      if (state === "stale") {
        stale.push({
          task_id: taskId,
          state
        });
      }
    }

    return stale;
  }

  validateAcceptanceClauseIds(accClauseIds) {
    if (!Array.isArray(accClauseIds) || accClauseIds.length === 0) {
      return {
        ok: false,
        errors: ["acc_clause_ids must be a non-empty array."]
      };
    }

    const errors = [];
    for (const clauseId of accClauseIds) {
      const clause = this.getClause(clauseId);
      if (!clause) {
        errors.push(`Acceptance clause not found: ${clauseId}`);
        continue;
      }

      if (clause.kind !== "acc") {
        errors.push(`Clause is not kind acc: ${clauseId}`);
      }
    }

    return {
      ok: errors.length === 0,
      errors
    };
  }
}
