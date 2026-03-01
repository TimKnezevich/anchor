import test from "node:test";
import assert from "node:assert/strict";
import { AxisMcpService } from "../../server/mcp/src/index.mjs";
import { AxisMcpClient, WorkflowController } from "../../extension/src/index.mjs";
import { createSimpleLogger } from "../../extension/src/simple-logger.mjs";

function createSilentLogger() {
  const sink = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    log: () => {}
  };

  return createSimpleLogger({ service: "test", sink });
}

function createClientFromService(service) {
  return new AxisMcpClient((request, correlationId) => service.handle(request, correlationId), {
    repoId: "repo-1",
    actor: "dev-1"
  });
}

function taskNode() {
  return {
    id: "task.phase8.workflow",
    type: "TASK",
    status: "in_progress",
    revision: 1,
    etag: "etag-init",
    meta: {},
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    title: "Phase 8 workflow",
    clause_links: ["acc.validation_gate"]
  };
}

test("startTask opens work session", async () => {
  const service = new AxisMcpService();
  const controller = new WorkflowController(createClientFromService(service), createSilentLogger());

  const result = await controller.startTask({
    taskId: "task.phase8.workflow",
    sessionId: "ws-8",
    commandId: "cmd-start-1",
    repoId: "repo-1",
    actor: "dev-1",
    correlationId: "corr-8a"
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.session_id, "ws-8");
});

test("confirmTask enforces full 6-step loop and validates", async () => {
  const service = new AxisMcpService();
  const controller = new WorkflowController(createClientFromService(service), createSilentLogger());

  service.handle(
    {
      command: "upsert_clause",
      command_id: "cmd-acc-1",
      repo_id: "repo-1",
      actor: "dev-1",
      payload: {
        clause: {
          id: "acc.validation_gate",
          kind: "acc",
          text: "Validation gate",
          revision: 1
        }
      }
    },
    "corr-8b"
  );

  const result = await controller.confirmTask({
    commandId: "cmd-confirm-1",
    repoId: "repo-1",
    actor: "dev-1",
    correlationId: "corr-8b",
    taskNode: taskNode(),
    expectedEtag: undefined,
    nextEtag: "etag-next-1",
    evidence: {
      id: "evidence.phase8.1",
      artifacts: ["modified files"],
      touched_files: ["extension/src/workflow-controller.mjs"],
      command_results: [{ command: "npm run test", passed: true }],
      validation_assertions: [
        { clause_id: "acc.validation_gate", passed: true, note: "Acceptance satisfied" }
      ]
    },
    accClauseIds: ["acc.validation_gate"],
    validationNotes: "ok",
    codeModifier: async () => ({ touched_files: ["extension/src/workflow-controller.mjs"] })
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.data.loop.steps, [
    "read_axis_before_intent",
    "write_intent",
    "read_axis_after_intent",
    "modify_code",
    "confirm_with_axis",
    "read_axis_and_report"
  ]);
  assert.equal(result.data.validation.validation_state, "validated");
});

test("showTaskState reads current task state", async () => {
  const service = new AxisMcpService();
  const controller = new WorkflowController(createClientFromService(service), createSilentLogger());

  service.handle(
    {
      command: "write_node",
      command_id: "cmd-seed-task-1",
      repo_id: "repo-1",
      actor: "dev-1",
      payload: {
        node: taskNode(),
        next_etag: "etag-seed-1"
      }
    },
    "corr-8c"
  );

  const result = await controller.showTaskState({
    taskId: "task.phase8.workflow",
    commandId: "cmd-show-1",
    repoId: "repo-1",
    actor: "dev-1",
    correlationId: "corr-8c"
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.nodes[0].id, "task.phase8.workflow");
});

test("startTask returns friendly conflict message for task lock", async () => {
  const service = new AxisMcpService();
  const controller = new WorkflowController(createClientFromService(service), createSilentLogger());

  await controller.startTask({
    taskId: "task.locked",
    sessionId: "ws-1",
    commandId: "cmd-start-lock-1",
    repoId: "repo-1",
    actor: "dev-1",
    correlationId: "corr-8d"
  });

  const result = await controller.startTask({
    taskId: "task.locked",
    sessionId: "ws-2",
    commandId: "cmd-start-lock-2",
    repoId: "repo-1",
    actor: "dev-1",
    correlationId: "corr-8d"
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "TASK_LOCKED");
  assert.ok(result.userMessage.includes("Retry"));
});
