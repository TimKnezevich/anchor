export function buildConflictMessage(error) {
  const code = error?.code ?? "UNKNOWN";

  if (code === "TASK_LOCKED") {
    return "Task is already locked by another session. Retry after the active session closes.";
  }

  if (code === "ETAG_MISMATCH") {
    return "Node version changed (ETag mismatch). Refresh state and retry with the latest ETag.";
  }

  if (code === "REPO_LOCKED") {
    return "Repository is locked by another writer. Retry after the writer lock is released.";
  }

  if (code === "TRANSPORT_UNREACHABLE") {
    return "Cannot reach Axis MCP server. Verify server is running and MCP URL settings are correct.";
  }

  if (code === "TRANSPORT_TIMEOUT") {
    return "Axis MCP request timed out. Retry, then check server health and timeout settings.";
  }

  if (code === "TRANSPORT_HTTP_ERROR") {
    return "Axis MCP server returned an HTTP error. Check server logs and retry.";
  }

  return "Command failed. Check logs and retry.";
}
