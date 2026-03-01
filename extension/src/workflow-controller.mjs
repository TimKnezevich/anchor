import { buildConflictMessage } from "./conflict-messages.mjs";

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

  async initializeRepository(input = {}) {
    try {
      const commandId = input.commandId ?? `cmd-initialize-repo:${Date.now()}`;
      const schemaVersion = input.schemaVersion ?? "1";

      const response = await this.client.initializeWorkspace(
        {
          schema_version: schemaVersion
        },
        commandId,
        {
          repoId: input.repoId,
          actor: input.actor,
          correlationId: input.correlationId
        }
      );

      this.logger.info("Initialize repository succeeded", {
        repo_id: input.repoId,
        created: response?.data?.created === true
      });

      return {
        ok: true,
        data: response.data
      };
    } catch (error) {
      this.logger.error("Initialize repository failed", { repo_id: input.repoId }, error);
      return formatError(error);
    }
  }
}
