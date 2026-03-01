import test from "node:test";
import assert from "node:assert/strict";
import { AxisMcpService } from "../../server/mcp/src/index.mjs";

function baseRequest() {
  return {
    command: "read_state",
    command_id: "cmd-1",
    repo_id: "repo-1",
    actor: "dev-1",
    payload: {}
  };
}

function sampleTaskNode() {
  return {
    id: "task.phase5.api",
    type: "TASK",
    status: "ready",
    revision: 1,
    etag: "etag-initial",
    meta: {},
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    title: "Implement API",
    clause_links: ["req.orchestrator.loop"]
  };
}

function sampleEvidence(evidenceId = "evidence-1") {
  return {
    id: evidenceId,
    artifacts: ["npm run test"],
    touched_files: ["server/mcp/src/mcp-service.mjs"],
    command_results: [{ command: "npm run test", passed: true }],
    validation_assertions: [
      { clause_id: "acc.validation_gate", passed: true, note: "Acceptance satisfied" }
    ]
  };
}

test("read_state returns empty baseline", () => {
  const service = new AxisMcpService();
  const request = baseRequest();

  const response = service.handle(request, "corr-1");
  assert.equal(response.ok, true);
  assert.deepEqual(response.data.nodes, []);
  assert.deepEqual(response.data.sessions, []);
});

test("write_node stores node and supports idempotent replay", () => {
  const service = new AxisMcpService();
  const request = {
    ...baseRequest(),
    command: "write_node",
    command_id: "cmd-write-1",
    payload: {
      node: sampleTaskNode(),
      next_etag: "etag-1"
    }
  };

  const first = service.handle(request, "corr-2");
  const second = service.handle(request, "corr-2");

  assert.equal(first.ok, true);
  assert.equal(first.replayed, false);
  assert.equal(first.data.node.etag, "etag-1");

  assert.equal(second.ok, true);
  assert.equal(second.replayed, true);
  assert.equal(second.data.node.etag, "etag-1");
});

test("write_node fails with deterministic ETag mismatch", () => {
  const service = new AxisMcpService();

  const create = {
    ...baseRequest(),
    command: "write_node",
    command_id: "cmd-write-create",
    payload: {
      node: sampleTaskNode(),
      next_etag: "etag-1"
    }
  };

  const update = {
    ...baseRequest(),
    command: "write_node",
    command_id: "cmd-write-update",
    payload: {
      node: {
        ...sampleTaskNode(),
        revision: 2
      },
      expected_etag: "wrong-etag",
      next_etag: "etag-2"
    }
  };

  service.handle(create, "corr-3");
  const response = service.handle(update, "corr-3");

  assert.equal(response.ok, false);
  assert.equal(response.error.code, "ETAG_MISMATCH");
  assert.equal(response.error.status, 409);
});

test("open_work_session enforces one active session per task", () => {
  const service = new AxisMcpService();

  const first = {
    ...baseRequest(),
    command: "open_work_session",
    command_id: "cmd-open-1",
    payload: {
      task_id: "task-1",
      session_id: "ws-1"
    }
  };

  const second = {
    ...baseRequest(),
    command: "open_work_session",
    command_id: "cmd-open-2",
    payload: {
      task_id: "task-1",
      session_id: "ws-2"
    }
  };

  const firstResponse = service.handle(first, "corr-4");
  const secondResponse = service.handle(second, "corr-4");

  assert.equal(firstResponse.ok, true);
  assert.equal(secondResponse.ok, false);
  assert.equal(secondResponse.error.code, "TASK_LOCKED");
  assert.equal(secondResponse.error.status, 409);
});

test("validate_task fails when evidence does not exist", () => {
  const service = new AxisMcpService();
  const request = {
    ...baseRequest(),
    command: "validate_task",
    command_id: "cmd-validate-1",
    payload: {
      task_id: "task-1",
      acc_clause_ids: ["acc.validation_gate"],
      passed: true,
      notes: "ok"
    }
  };

  const response = service.handle(request, "corr-5");
  assert.equal(response.ok, false);
  assert.equal(response.error.code, "VALIDATION_ERROR");
  assert.equal(response.error.status, 400);
});

test("attach_evidence + validate_task succeeds", () => {
  const service = new AxisMcpService();

  const accClause = {
    ...baseRequest(),
    command: "upsert_clause",
    command_id: "cmd-acc-clause-1",
    payload: {
      clause: {
        id: "acc.validation_gate",
        kind: "acc",
        text: "Task requires evidence-backed validation",
        revision: 1
      }
    }
  };

  const attach = {
    ...baseRequest(),
    command: "attach_evidence",
    command_id: "cmd-evidence-1",
    payload: {
      task_id: "task-1",
      evidence: sampleEvidence("evidence-1")
    }
  };

  const validate = {
    ...baseRequest(),
    command: "validate_task",
    command_id: "cmd-validate-2",
    payload: {
      task_id: "task-1",
      acc_clause_ids: ["acc.validation_gate"],
      passed: true,
      notes: "ok"
    }
  };

  const accResponse = service.handle(accClause, "corr-6");
  const attachResponse = service.handle(attach, "corr-6");
  const validateResponse = service.handle(validate, "corr-6");

  assert.equal(accResponse.ok, true);
  assert.equal(attachResponse.ok, true);
  assert.equal(validateResponse.ok, true);
  assert.equal(validateResponse.data.validation_state, "validated");
});

test("invalid envelope returns validation error response", () => {
  const service = new AxisMcpService();
  const response = service.handle({ command: "read_state" }, "corr-7");

  assert.equal(response.ok, false);
  assert.equal(response.error.code, "VALIDATION_ERROR");
  assert.equal(response.error.status, 400);
});

test("stale task query returns only stale task nodes", () => {
  const service = new AxisMcpService();

  const taskNode = {
    ...sampleTaskNode(),
    id: "task-stale-1"
  };

  service.handle(
    {
      ...baseRequest(),
      command: "write_node",
      command_id: "cmd-stale-node-1",
      payload: {
        node: taskNode,
        next_etag: "etag-stale-1"
      }
    },
    "corr-8"
  );

  service.handle(
    {
      ...baseRequest(),
      command: "upsert_clause",
      command_id: "cmd-clause-1",
      payload: {
        clause: {
          id: "req.stale.case",
          kind: "req",
          text: "Initial text",
          revision: 1
        }
      }
    },
    "corr-8"
  );

  service.handle(
    {
      ...baseRequest(),
      command: "link_task_clause",
      command_id: "cmd-link-1",
      payload: {
        task_id: "task-stale-1",
        clause_id: "req.stale.case"
      }
    },
    "corr-8"
  );

  service.handle(
    {
      ...baseRequest(),
      command: "upsert_clause",
      command_id: "cmd-clause-2",
      payload: {
        clause: {
          id: "req.stale.case",
          kind: "req",
          text: "Changed text",
          revision: 2
        }
      }
    },
    "corr-8"
  );

  const response = service.handle(
    {
      ...baseRequest(),
      command: "read_state",
      command_id: "cmd-read-stale",
      payload: {
        stale_only: true
      }
    },
    "corr-8"
  );

  assert.equal(response.ok, true);
  assert.equal(response.data.nodes.length, 1);
  assert.equal(response.data.nodes[0].id, "task-stale-1");
  assert.equal(response.data.stale_tasks[0].task_id, "task-stale-1");
});

test("validate_task rejects non-acc clause ids", () => {
  const service = new AxisMcpService();

  service.handle(
    {
      ...baseRequest(),
      command: "upsert_clause",
      command_id: "cmd-clause-req-1",
      payload: {
        clause: {
          id: "req.not.acceptance",
          kind: "req",
          text: "Requirement clause",
          revision: 1
        }
      }
    },
    "corr-9"
  );

  service.handle(
    {
      ...baseRequest(),
      command: "attach_evidence",
      command_id: "cmd-evidence-non-acc",
      payload: {
        task_id: "task-2",
        evidence: sampleEvidence("evidence-2")
      }
    },
    "corr-9"
  );

  const response = service.handle(
    {
      ...baseRequest(),
      command: "validate_task",
      command_id: "cmd-validate-non-acc",
      payload: {
        task_id: "task-2",
        acc_clause_ids: ["req.not.acceptance"],
        passed: true,
        notes: "not ok"
      }
    },
    "corr-9"
  );

  assert.equal(response.ok, false);
  assert.equal(response.error.code, "VALIDATION_ERROR");
  assert.equal(response.error.status, 400);
});

test("attach_evidence rejects incomplete evidence payload", () => {
  const service = new AxisMcpService();

  const response = service.handle(
    {
      ...baseRequest(),
      command: "attach_evidence",
      command_id: "cmd-evidence-invalid-1",
      payload: {
        task_id: "task-invalid-evidence",
        evidence: {
          id: "evidence-invalid",
          artifacts: ["npm run test"]
        }
      }
    },
    "corr-10"
  );

  assert.equal(response.ok, false);
  assert.equal(response.error.code, "VALIDATION_ERROR");
  assert.equal(response.error.status, 400);
});
