import { buildConflictMessage } from "./conflict-messages.mjs";
import { OrchestratorLoopGuard } from "./orchestrator-loop-guard.mjs";

function formatError(error) {
  return {
    ok: false,
    code: error?.code ?? "UNKNOWN",
    message: error?.message ?? "Unknown error",
    userMessage: error?.userMessage ?? buildConflictMessage(error)
  };
}

export class WorkflowController {
  constructor(client, logger) {
    this.client = client;
    this.logger = logger;
    this.loopGuard = new OrchestratorLoopGuard();
  }

  async startTask(input) {
    try {
      const response = await this.client.openWorkSession(
        {
          task_id: input.taskId,
          session_id: input.sessionId
        },
        input.commandId,
        {
          repoId: input.repoId,
          actor: input.actor,
          correlationId: input.correlationId
        }
      );

      this.logger.info("Start task succeeded", {
        task_id: input.taskId,
        session_id: input.sessionId
      });

      return {
        ok: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error("Start task failed", { task_id: input.taskId }, error);
      return formatError(error);
    }
  }

  async confirmTask(input) {
    this.loopGuard.begin();

    try {
      this.loopGuard.mark("read_axis_before_intent");
      const before = await this.client.readState(
        {
          node_ids: [input.taskNode.id],
          include_edges: false
        },
        `${input.commandId}:read-before`,
        {
          repoId: input.repoId,
          actor: input.actor,
          correlationId: input.correlationId
        }
      );

      this.loopGuard.mark("write_intent");
      const writeResult = await this.client.writeNode(
        {
          node: input.taskNode,
          expected_etag: input.expectedEtag,
          next_etag: input.nextEtag
        },
        `${input.commandId}:write-intent`,
        {
          repoId: input.repoId,
          actor: input.actor,
          correlationId: input.correlationId
        }
      );

      this.loopGuard.mark("read_axis_after_intent");
      const afterIntent = await this.client.readState(
        {
          node_ids: [input.taskNode.id],
          include_edges: false
        },
        `${input.commandId}:read-after-intent`,
        {
          repoId: input.repoId,
          actor: input.actor,
          correlationId: input.correlationId
        }
      );

      this.loopGuard.mark("modify_code");
      const codeChange = await input.codeModifier();

      this.loopGuard.mark("confirm_with_axis");
      const evidenceResult = await this.client.attachEvidence(
        {
          task_id: input.taskNode.id,
          evidence: input.evidence
        },
        `${input.commandId}:attach-evidence`,
        {
          repoId: input.repoId,
          actor: input.actor,
          correlationId: input.correlationId
        }
      );

      const validationResult = await this.client.validateTask(
        {
          task_id: input.taskNode.id,
          acc_clause_ids: input.accClauseIds,
          passed: true,
          notes: input.validationNotes ?? "confirmed"
        },
        `${input.commandId}:validate-task`,
        {
          repoId: input.repoId,
          actor: input.actor,
          correlationId: input.correlationId
        }
      );

      this.loopGuard.mark("read_axis_and_report");
      const finalState = await this.client.readState(
        {
          node_ids: [input.taskNode.id],
          include_edges: true
        },
        `${input.commandId}:read-final`,
        {
          repoId: input.repoId,
          actor: input.actor,
          correlationId: input.correlationId
        }
      );

      const loop = this.loopGuard.end();

      this.logger.info("Confirm task completed", {
        task_id: input.taskNode.id,
        steps: loop.steps
      });

      return {
        ok: true,
        data: {
          before: before.data,
          write: writeResult.data,
          after_intent: afterIntent.data,
          code_change: codeChange,
          evidence: evidenceResult.data,
          validation: validationResult.data,
          final_state: finalState.data,
          loop
        }
      };
    } catch (error) {
      this.logger.error("Confirm task failed", { task_id: input.taskNode.id }, error);
      return formatError(error);
    }
  }

  async showTaskState(input) {
    try {
      const response = await this.client.readState(
        {
          node_ids: [input.taskId],
          include_edges: true
        },
        input.commandId,
        {
          repoId: input.repoId,
          actor: input.actor,
          correlationId: input.correlationId
        }
      );

      this.logger.info("Show task state succeeded", { task_id: input.taskId });

      return {
        ok: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error("Show task state failed", { task_id: input.taskId }, error);
      return formatError(error);
    }
  }

  async checkConnection(input) {
    try {
      const response = await this.client.checkConnection({
        repoId: input.repoId,
        actor: input.actor,
        correlationId: input.correlationId
      });

      this.logger.info("Connection check succeeded", {
        repo_id: input.repoId
      });

      return {
        ok: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error("Connection check failed", { repo_id: input.repoId }, error);
      return formatError(error);
    }
  }
}
