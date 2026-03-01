function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildErrorEnvelope(status, code, message, details = null) {
  return {
    ok: false,
    error: {
      status,
      code,
      message,
      details
    }
  };
}

function shouldRetry(status) {
  return status >= 500 || status === 429;
}

async function fetchWithTimeout(fetchFn, url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchFn(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export function createHttpMcpTransport(config, deps = {}) {
  const fetchFn = deps.fetchFn ?? globalThis.fetch;

  if (typeof fetchFn !== "function") {
    throw new Error("No fetch implementation available for HTTP MCP transport.");
  }

  const mcpUrl = `${config.baseUrl}${config.mcpPath}`;
  const healthUrl = `${config.baseUrl}${config.healthPath}`;

  async function sendRequest(request, correlationId = null) {
    let lastEnvelope = null;

    for (let attempt = 0; attempt <= config.retries; attempt += 1) {
      try {
        const response = await fetchWithTimeout(
          fetchFn,
          mcpUrl,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              ...(correlationId ? { "x-correlation-id": correlationId } : {})
            },
            body: JSON.stringify(request)
          },
          config.timeoutMs
        );

        const payload = await response.json();

        if (response.ok) {
          return payload;
        }

        lastEnvelope = buildErrorEnvelope(
          response.status,
          payload?.error?.code ?? "TRANSPORT_HTTP_ERROR",
          payload?.error?.message ?? `HTTP ${response.status}`,
          payload?.error?.details ?? null
        );

        if (!shouldRetry(response.status) || attempt >= config.retries) {
          return lastEnvelope;
        }
      } catch (error) {
        if (error?.name === "AbortError") {
          lastEnvelope = buildErrorEnvelope(
            504,
            "TRANSPORT_TIMEOUT",
            "MCP request timed out.",
            {
              timeout_ms: config.timeoutMs,
              url: mcpUrl
            }
          );
        } else {
          lastEnvelope = buildErrorEnvelope(
            503,
            "TRANSPORT_UNREACHABLE",
            "Cannot reach MCP server.",
            {
              url: mcpUrl,
              reason: error?.message ?? "unknown"
            }
          );
        }

        if (attempt >= config.retries) {
          return lastEnvelope;
        }
      }

      await sleep(config.retryDelayMs * (attempt + 1));
    }

    return lastEnvelope ?? buildErrorEnvelope(500, "TRANSPORT_UNKNOWN", "Unknown transport failure.");
  }

  sendRequest.healthCheck = async function healthCheck(correlationId = null) {
    try {
      const response = await fetchWithTimeout(
        fetchFn,
        healthUrl,
        {
          method: "GET",
          headers: {
            ...(correlationId ? { "x-correlation-id": correlationId } : {})
          }
        },
        config.timeoutMs
      );

      if (!response.ok) {
        return buildErrorEnvelope(response.status, "TRANSPORT_HTTP_ERROR", `Health check HTTP ${response.status}`, {
          url: healthUrl
        });
      }

      const payload = await response.json();
      return {
        ok: true,
        data: payload
      };
    } catch (error) {
      return buildErrorEnvelope(503, "TRANSPORT_UNREACHABLE", "Health check failed.", {
        url: healthUrl,
        reason: error?.message ?? "unknown"
      });
    }
  };

  return sendRequest;
}
