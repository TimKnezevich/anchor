import { AxisError, createLogger, errorCodes } from "../../../shared/observability/src/index.mjs";
import { validateEvidence } from "../../../shared/evidence/src/index.mjs";
import { validateNode } from "../../../shared/models/nodes/src/index.mjs";
import { InvariantEngine, toErrorResponse } from "../../invariants/src/index.mjs";
import { EventSidecar, VectorSidecar, resolveFeatureFlags } from "../../optional/src/index.mjs";
import { SpecService } from "../../spec/src/index.mjs";
import { InMemoryStore } from "./in-memory-store.mjs";
import { validateCommandEnvelope } from "./request-validator.mjs";

const workspaceInitializationArtifacts = Object.freeze([
  ".axis/",
  ".axis/policy.json",
  ".axis/evidence/",
  ".axis/acknowledgments/",
  "axis.json"
]);

function assertString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AxisError(`Field '${fieldName}' must be a non-empty string.`, {
      code: errorCodes.VALIDATION_ERROR,
      details: { field: fieldName }
    });
  }
}

export class AxisMcpService {
  constructor(options = {}) {
    this.invariants = options.invariants ?? new InvariantEngine();
    this.store = options.store ?? new InMemoryStore();
    this.spec = options.spec ?? new SpecService();
    this.flags = resolveFeatureFlags(options.flags);
    this.vectorSidecar = options.vectorSidecar ?? new VectorSidecar();
    this.eventSidecar = options.eventSidecar ?? new EventSidecar();
    this.logger = options.logger ?? createLogger({ service: "axis-mcp", minLevel: "debug" });
  }

  handle(request, correlationId = null) {
    const envelopeResult = validateCommandEnvelope(request);
    if (!envelopeResult.ok) {
      const error = new AxisError("Invalid request envelope.", {
        code: errorCodes.VALIDATION_ERROR,
        details: { errors: envelopeResult.errors }
      });
      this.logger.warn("Rejected invalid request envelope", { errors: envelopeResult.errors }, error);
      return toErrorResponse(error, correlationId);
    }

    try {
      const handler = this.getHandler(request.command);
      const result = this.invariants.runIdempotent(request.command_id, () => handler(request));
      this.logger.info("Handled MCP command", {
        command: request.command,
        repo_id: request.repo_id,
        actor: request.actor,
        replayed: result.replayed
      });
      const response = {
        ok: true,
        data: result.result,
        replayed: result.replayed
      };
      this.publishEventSnapshot(request, response);
      return response;
    } catch (error) {
      this.logger.error("MCP command failed", {
        command: request.command,
        repo_id: request.repo_id,
        actor: request.actor
      }, error);
      return toErrorResponse(error, correlationId);
    }
  }

  getHandler(command) {
    const handlers = {
      read_state: (request) => this.handleReadState(request),
      write_node: (request) => this.handleWriteNode(request),
      open_work_session: (request) => this.handleOpenWorkSession(request),
      close_work_session: (request) => this.handleCloseWorkSession(request),
      attach_evidence: (request) => this.handleAttachEvidence(request),
      validate_task: (request) => this.handleValidateTask(request),
      upsert_clause: (request) => this.handleUpsertClause(request),
      link_task_clause: (request) => this.handleLinkTaskClause(request),
      initialize_workspace: (request) => this.handleInitializeWorkspace(request)
    };

    if (!(command in handlers)) {
      throw new AxisError(`Unknown command '${command}'.`, {
        code: errorCodes.VALIDATION_ERROR,
        details: { command }
      });
    }

    return handlers[command];
  }

  handleReadState(request) {
    const nodeIds = Array.isArray(request.payload.node_ids) ? request.payload.node_ids : null;
    const includeEdges = request.payload.include_edges === true;
    const staleOnly = request.payload.stale_only === true;

    let nodes = this.store.listNodes(nodeIds);
    if (staleOnly) {
      const staleTaskIds = new Set(this.spec.listStaleTasks().map((item) => item.task_id));
      nodes = nodes.filter((node) => node.type === "TASK" && staleTaskIds.has(node.id));
    }

    const response = {
      nodes,
      edges: includeEdges ? this.store.listEdges() : [],
      sessions: this.store.listSessions(),
      stale_tasks: this.spec.listStaleTasks()
    };

    if (this.flags.vectorSidecarEnabled) {
      response.vector_suggestions = this.vectorSidecar.rankNodes(
        request.payload.query ?? "",
        response.nodes
      );
    }

    return response;
  }

  handleWriteNode(request) {
    this.invariants.acquireRepoWriterLock(request.repo_id, request.actor);

    const node = request.payload.node;
    const expectedEtag = request.payload.expected_etag;
    const nextEtag = request.payload.next_etag;

    if (node === null || typeof node !== "object" || Array.isArray(node)) {
      throw new AxisError("Payload field 'node' must be an object.", {
        code: errorCodes.VALIDATION_ERROR,
        details: { field: "node" }
      });
    }

    const validation = validateNode(node);
    if (!validation.ok) {
      throw new AxisError("Node validation failed.", {
        code: errorCodes.VALIDATION_ERROR,
        details: { errors: validation.errors }
      });
    }

    const existing = this.store.getNode(node.id);
    if (existing) {
      assertString(expectedEtag, "expected_etag");
      this.invariants.seedEtag(node.id, existing.etag);
      this.invariants.assertEtag(node.id, expectedEtag);
    }

    assertString(nextEtag, "next_etag");

    const storedNode = {
      ...node,
      etag: nextEtag
    };

    this.store.upsertNode(storedNode);
    this.invariants.updateEtag(node.id, nextEtag);

    return {
      node: storedNode
    };
  }

  handleOpenWorkSession(request) {
    this.invariants.acquireRepoWriterLock(request.repo_id, request.actor);

    const taskId = request.payload.task_id;
    const sessionId = request.payload.session_id;

    assertString(taskId, "task_id");
    assertString(sessionId, "session_id");

    this.invariants.openTaskSession(taskId, sessionId);

    const session = this.store.upsertSession({
      task_id: taskId,
      session_id: sessionId,
      state: "opened"
    });

    return session;
  }

  handleCloseWorkSession(request) {
    this.invariants.acquireRepoWriterLock(request.repo_id, request.actor);

    const taskId = request.payload.task_id;
    const sessionId = request.payload.session_id;

    assertString(taskId, "task_id");
    assertString(sessionId, "session_id");

    this.invariants.closeTaskSession(taskId, sessionId);

    const session = this.store.upsertSession({
      task_id: taskId,
      session_id: sessionId,
      state: "closed"
    });

    return session;
  }

  handleAttachEvidence(request) {
    this.invariants.acquireRepoWriterLock(request.repo_id, request.actor);

    const taskId = request.payload.task_id;
    const evidence = request.payload.evidence;

    assertString(taskId, "task_id");

    if (evidence === null || typeof evidence !== "object" || Array.isArray(evidence)) {
      throw new AxisError("Payload field 'evidence' must be an object.", {
        code: errorCodes.VALIDATION_ERROR,
        details: { field: "evidence" }
      });
    }

    const evidenceValidation = validateEvidence(evidence);
    if (!evidenceValidation.ok) {
      throw new AxisError("Evidence validation failed.", {
        code: errorCodes.VALIDATION_ERROR,
        details: { errors: evidenceValidation.errors }
      });
    }

    this.store.attachEvidence(taskId, evidence);

    return {
      task_id: taskId,
      evidence_id: evidence.id
    };
  }

  handleValidateTask(request) {
    this.invariants.acquireRepoWriterLock(request.repo_id, request.actor);

    const taskId = request.payload.task_id;
    const accClauseIds = request.payload.acc_clause_ids;
    const passed = request.payload.passed;
    const notes = request.payload.notes ?? null;

    assertString(taskId, "task_id");

    if (!Array.isArray(accClauseIds) || accClauseIds.length === 0) {
      throw new AxisError("Field 'acc_clause_ids' must be a non-empty array.", {
        code: errorCodes.VALIDATION_ERROR,
        details: { field: "acc_clause_ids" }
      });
    }

    const accValidation = this.spec.validateAcceptanceClauseIds(accClauseIds);
    if (!accValidation.ok) {
      throw new AxisError("Acceptance clause validation failed.", {
        code: errorCodes.VALIDATION_ERROR,
        details: { errors: accValidation.errors }
      });
    }

    if (typeof passed !== "boolean") {
      throw new AxisError("Field 'passed' must be a boolean.", {
        code: errorCodes.VALIDATION_ERROR,
        details: { field: "passed" }
      });
    }

    const evidence = this.store.getEvidence(taskId);
    if (evidence.length === 0) {
      throw new AxisError("Validation requires at least one evidence record.", {
        code: errorCodes.VALIDATION_ERROR,
        details: {
          task_id: taskId
        }
      });
    }

    const validationState = passed ? "validated" : "failed_validation";

    this.store.setValidation(taskId, {
      task_id: taskId,
      acc_clause_ids: accClauseIds,
      passed,
      notes
    });

    return {
      task_id: taskId,
      validation_state: validationState
    };
  }

  handleUpsertClause(request) {
    this.invariants.acquireRepoWriterLock(request.repo_id, request.actor);

    const clause = request.payload.clause;
    if (clause === null || typeof clause !== "object" || Array.isArray(clause)) {
      throw new AxisError("Payload field 'clause' must be an object.", {
        code: errorCodes.VALIDATION_ERROR,
        details: { field: "clause" }
      });
    }

    const stored = this.spec.upsertClause(clause);
    return {
      clause: stored
    };
  }

  handleLinkTaskClause(request) {
    this.invariants.acquireRepoWriterLock(request.repo_id, request.actor);

    const taskId = request.payload.task_id;
    const clauseId = request.payload.clause_id;

    assertString(taskId, "task_id");
    assertString(clauseId, "clause_id");

    const link = this.spec.linkTaskToClause(taskId, clauseId);

    return {
      link
    };
  }

  handleInitializeWorkspace(request) {
    this.invariants.acquireRepoWriterLock(request.repo_id, request.actor);

    const payload = request.payload ?? {};
    const allowedFields = new Set(["schema_version"]);
    for (const fieldName of Object.keys(payload)) {
      if (!allowedFields.has(fieldName)) {
        throw new AxisError(`Field '${fieldName}' is not allowed for initialize_workspace.`, {
          code: errorCodes.VALIDATION_ERROR,
          details: { field: fieldName }
        });
      }
    }

    const schemaVersion = payload.schema_version ?? "1";
    assertString(schemaVersion, "schema_version");

    const existing = this.store.getRepoInitialization(request.repo_id);
    if (existing) {
      return {
        repo_id: request.repo_id,
        created: false,
        initialization: existing
      };
    }

    const initialization = {
      status: "initialized",
      initialized: true,
      schema_version: schemaVersion,
      initialized_at: new Date().toISOString(),
      initialized_by: request.actor,
      artifact_paths: [...workspaceInitializationArtifacts]
    };

    this.store.upsertRepoInitialization(request.repo_id, initialization);

    return {
      repo_id: request.repo_id,
      created: true,
      initialization
    };
  }

  publishEventSnapshot(request, response) {
    if (!this.flags.eventSidecarEnabled) {
      return;
    }

    this.eventSidecar.publishSnapshot(request.repo_id, `mcp.${request.command}`, {
      command_id: request.command_id,
      actor: request.actor,
      ok: response.ok,
      data: response.data
    });
  }
}
