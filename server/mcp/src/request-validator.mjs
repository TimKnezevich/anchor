const allowedCommands = new Set([
  "read_state",
  "write_node",
  "open_work_session",
  "close_work_session",
  "attach_evidence",
  "validate_task",
  "upsert_clause",
  "link_task_clause"
]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateCommandEnvelope(request) {
  const errors = [];

  if (!isObject(request)) {
    return {
      ok: false,
      errors: ["Request must be an object."]
    };
  }

  if (typeof request.command !== "string" || !allowedCommands.has(request.command)) {
    errors.push("Field command must be a known command name.");
  }

  if (typeof request.repo_id !== "string" || request.repo_id.trim() === "") {
    errors.push("Field repo_id must be a non-empty string.");
  }

  if (typeof request.actor !== "string" || request.actor.trim() === "") {
    errors.push("Field actor must be a non-empty string.");
  }

  if (typeof request.command_id !== "string" || request.command_id.trim() === "") {
    errors.push("Field command_id must be a non-empty string.");
  }

  if (!isObject(request.payload)) {
    errors.push("Field payload must be an object.");
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
