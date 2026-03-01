function toInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl).replace(/\/+$/, "");
}

export function resolveTransportConfig(input = {}, env = process.env) {
  const baseUrl = normalizeBaseUrl(input.baseUrl ?? env.AXIS_MCP_BASE_URL ?? "http://127.0.0.1:4317");
  const mcpPath = input.mcpPath ?? env.AXIS_MCP_PATH ?? "/mcp";
  const healthPath = input.healthPath ?? env.AXIS_MCP_HEALTH_PATH ?? "/health";

  return {
    baseUrl,
    mcpPath,
    healthPath,
    timeoutMs: toInt(input.timeoutMs ?? env.AXIS_MCP_TIMEOUT_MS, 5000),
    retries: toInt(input.retries ?? env.AXIS_MCP_RETRIES, 2),
    retryDelayMs: toInt(input.retryDelayMs ?? env.AXIS_MCP_RETRY_DELAY_MS, 250)
  };
}
