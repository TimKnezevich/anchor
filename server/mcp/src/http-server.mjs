import { createServer } from "node:http";

export function createMcpHttpServer(options = {}) {
  const service = options.service;
  const logger = options.logger;
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 4317;
  const mcpPath = options.mcpPath ?? "/mcp";
  const healthPath = options.healthPath ?? "/health";
  const livePath = options.livePath ?? "/health/live";
  const readyPath = options.readyPath ?? "/health/ready";
  const runtimeProfile = options.runtimeProfile ?? "local";
  const storageAdapter = options.storageAdapter ?? "memory";
  const sidecars = options.sidecars ?? { vectorEnabled: false, eventEnabled: false };
  const startedAt = new Date().toISOString();

  if (!service) {
    throw new Error("Missing mcp service for HTTP server.");
  }

  const server = createServer((req, res) => {
    const requestStart = Date.now();
    const correlationId = req.headers["x-correlation-id"] ?? null;
    const requestPath = req.url ?? "/";
    const requestMethod = req.method ?? "UNKNOWN";

    function writeJson(status, payload) {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(payload));
      logger?.info("MCP HTTP request complete", {
        method: requestMethod,
        path: requestPath,
        status,
        correlation_id: correlationId,
        duration_ms: Date.now() - requestStart
      });
    }

    if (requestMethod === "GET" && requestPath === healthPath) {
      writeJson(200, {
        ok: true,
        service: "axis-mcp-http",
        profile: runtimeProfile,
        started_at: startedAt,
        mcp_path: mcpPath,
        health_path: healthPath,
        live_path: livePath,
        ready_path: readyPath
      });
      return;
    }

    if (requestMethod === "GET" && requestPath === livePath) {
      writeJson(200, {
        ok: true,
        live: true,
        profile: runtimeProfile,
        started_at: startedAt
      });
      return;
    }

    if (requestMethod === "GET" && requestPath === readyPath) {
      writeJson(200, {
        ok: true,
        ready: true,
        profile: runtimeProfile,
        storage_adapter: storageAdapter,
        sidecars: {
          vector_enabled: sidecars.vectorEnabled === true,
          event_enabled: sidecars.eventEnabled === true
        }
      });
      return;
    }

    if (requestMethod === "POST" && requestPath === mcpPath) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        let request;
        try {
          request = JSON.parse(body || "{}");
        } catch {
          writeJson(400, {
            ok: false,
            error: {
              status: 400,
              code: "BAD_JSON",
              message: "Invalid JSON body.",
              details: null,
              correlationId
            }
          });
          return;
        }

        const response = service.handle(request, correlationId);
        const status = response.ok ? 200 : (response.error?.status ?? 500);
        writeJson(status, response);
      });

      return;
    }

    writeJson(404, {
      ok: false,
      error: {
        status: 404,
        code: "NOT_FOUND",
        message: "Route not found.",
        details: {
          method: requestMethod,
          path: requestPath
        },
        correlationId
      }
    });
  });

  return {
    server,
    async start() {
      try {
        await new Promise((resolve, reject) => {
          const handleListening = () => {
            server.off("error", handleError);
            resolve();
          };
          const handleError = (error) => {
            server.off("listening", handleListening);
            reject(error);
          };

          server.once("listening", handleListening);
          server.once("error", handleError);
          server.listen(port, host);
        });
      } catch (error) {
        logger?.error("Failed to start MCP HTTP server", {
          host,
          port,
          mcp_path: mcpPath,
          health_path: healthPath,
          code: error?.code ?? null
        });
        throw error;
      }

      const address = server.address();
      const boundPort = typeof address === "object" && address && "port" in address ? address.port : port;

      logger?.info("MCP HTTP server started", {
        host,
        port: boundPort,
        mcp_path: mcpPath,
        health_path: healthPath,
        live_path: livePath,
        ready_path: readyPath,
        profile: runtimeProfile
      });

      return {
        host,
        port: boundPort,
        mcpPath,
        healthPath,
        livePath,
        readyPath,
        profile: runtimeProfile
      };
    },
    async stop() {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
      logger?.info("MCP HTTP server stopped", { host, port, profile: runtimeProfile });
    }
  };
}
