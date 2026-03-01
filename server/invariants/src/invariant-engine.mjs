import { AxisError, errorCodes } from "../../../shared/observability/src/index.mjs";

export class InvariantEngine {
  constructor() {
    this.repoLocks = new Map();
    this.taskActiveSession = new Map();
    this.etags = new Map();
    this.commandResults = new Map();
  }

  acquireRepoWriterLock(repoId, lockOwner) {
    const current = this.repoLocks.get(repoId);

    if (current && current !== lockOwner) {
      throw new AxisError(`Repository '${repoId}' is currently locked.`, {
        code: errorCodes.REPO_LOCKED,
        details: {
          repo_id: repoId,
          lock_owner: current
        }
      });
    }

    this.repoLocks.set(repoId, lockOwner);
    return {
      ok: true,
      repo_id: repoId,
      lock_owner: lockOwner
    };
  }

  releaseRepoWriterLock(repoId, lockOwner) {
    const current = this.repoLocks.get(repoId);

    if (current === lockOwner) {
      this.repoLocks.delete(repoId);
    }

    return {
      ok: true,
      repo_id: repoId
    };
  }

  openTaskSession(taskId, sessionId) {
    const current = this.taskActiveSession.get(taskId);

    if (current && current !== sessionId) {
      throw new AxisError(`Task '${taskId}' already has an active session.`, {
        code: errorCodes.TASK_LOCKED,
        details: {
          task_id: taskId,
          active_session_id: current
        }
      });
    }

    this.taskActiveSession.set(taskId, sessionId);
    return {
      ok: true,
      task_id: taskId,
      session_id: sessionId
    };
  }

  closeTaskSession(taskId, sessionId) {
    const current = this.taskActiveSession.get(taskId);

    if (current === sessionId) {
      this.taskActiveSession.delete(taskId);
    }

    return {
      ok: true,
      task_id: taskId,
      session_id: sessionId
    };
  }

  seedEtag(resourceId, etag) {
    this.etags.set(resourceId, etag);
  }

  assertEtag(resourceId, expectedEtag) {
    const currentEtag = this.etags.get(resourceId);

    if (currentEtag !== expectedEtag) {
      throw new AxisError(`ETag mismatch for resource '${resourceId}'.`, {
        code: errorCodes.ETAG_MISMATCH,
        details: {
          resource_id: resourceId,
          expected_etag: expectedEtag,
          current_etag: currentEtag ?? null
        }
      });
    }

    return {
      ok: true,
      resource_id: resourceId
    };
  }

  updateEtag(resourceId, nextEtag) {
    this.etags.set(resourceId, nextEtag);
    return {
      ok: true,
      resource_id: resourceId,
      etag: nextEtag
    };
  }

  runIdempotent(commandId, execute) {
    if (this.commandResults.has(commandId)) {
      return {
        replayed: true,
        result: this.commandResults.get(commandId)
      };
    }

    const result = execute();
    this.commandResults.set(commandId, result);

    return {
      replayed: false,
      result
    };
  }
}
