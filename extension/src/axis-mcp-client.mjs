import { buildConflictMessage } from "./conflict-messages.mjs";

function unwrapOrThrow(response) {
  if (response.ok === true) {
    return response;
  }

  const error = new Error(response?.error?.message ?? "MCP command failed.");
  error.code = response?.error?.code ?? "UNKNOWN";
  error.status = response?.error?.status ?? 500;
  error.details = response?.error?.details ?? null;
  error.userMessage = buildConflictMessage(response?.error ?? {});
  throw error;
}

export class AxisMcpClient {
  constructor(transport, defaults = {}) {
    this.transport = transport;
    this.defaults = {
      repoId: defaults.repoId ?? "repo-1",
      actor: defaults.actor ?? "extension-user"
    };
  }

  async send(command, payload, commandId, context = {}) {
    const request = {
      command,
      command_id: commandId,
      repo_id: context.repoId ?? this.defaults.repoId,
      actor: context.actor ?? this.defaults.actor,
      payload
    };

    try {
      const response = await this.transport(request, context.correlationId ?? null);
      return unwrapOrThrow(response);
    } catch (error) {
      error.userMessage = error.userMessage ?? buildConflictMessage(error);
      throw error;
    }
  }

  readState(payload, commandId, context = {}) {
    return this.send("read_state", payload, commandId, context);
  }

  writeNode(payload, commandId, context = {}) {
    return this.send("write_node", payload, commandId, context);
  }

  openWorkSession(payload, commandId, context = {}) {
    return this.send("open_work_session", payload, commandId, context);
  }

  closeWorkSession(payload, commandId, context = {}) {
    return this.send("close_work_session", payload, commandId, context);
  }

  attachEvidence(payload, commandId, context = {}) {
    return this.send("attach_evidence", payload, commandId, context);
  }

  validateTask(payload, commandId, context = {}) {
    return this.send("validate_task", payload, commandId, context);
  }

  async checkConnection(context = {}) {
    if (typeof this.transport.healthCheck === "function") {
      const response = await this.transport.healthCheck(context.correlationId ?? null);
      return unwrapOrThrow(response);
    }

    return this.readState({ include_edges: false }, `check-connection:${Date.now()}`, context);
  }
}
