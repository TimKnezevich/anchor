import { createLogger } from "../shared/observability/src/index.mjs";
import { AxisMcpService } from "../server/mcp/src/index.mjs";
import { createMcpHttpServer } from "../server/mcp/src/http-server.mjs";
import { resolveRuntimeProfileConfig } from "../server/mcp/src/runtime-profile.mjs";

export async function startMcpRuntime(options = {}) {
  const config = resolveRuntimeProfileConfig(process.env, options);
  const logger = createLogger({
    service: "axis-mcp-runtime",
    minLevel: config.logLevel,
    baseContext: {
      runtime_profile: config.profile,
      host: config.host,
      port: config.port
    }
  });

  const service = new AxisMcpService();
  const server = createMcpHttpServer({
    service,
    logger,
    host: config.host,
    port: config.port,
    mcpPath: config.paths.mcp,
    healthPath: config.paths.health,
    livePath: config.paths.live,
    readyPath: config.paths.ready,
    runtimeProfile: config.profile,
    storageAdapter: config.storageAdapter,
    sidecars: config.sidecars
  });

  const runtime = await server.start();

  logger.info("Axis MCP runtime online", {
    runtime_profile: config.profile,
    host: runtime.host,
    port: runtime.port,
    mcp_path: runtime.mcpPath,
    health_path: runtime.healthPath,
    live_path: runtime.livePath,
    ready_path: runtime.readyPath,
    storage_adapter: config.storageAdapter,
    sidecars: {
      vector_enabled: config.sidecars.vectorEnabled,
      event_enabled: config.sidecars.eventEnabled
    }
  });

  return {
    config,
    runtime,
    stop: async () => {
      await server.stop();
      logger.info("Axis MCP runtime offline", {
        runtime_profile: config.profile,
        host: runtime.host,
        port: runtime.port
      });
    }
  };
}

async function runMain() {
  const runtime = await startMcpRuntime();

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, async () => {
      await runtime.stop();
      process.exit(0);
    });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMain().catch((error) => {
    const logger = createLogger({ service: "axis-mcp-runtime" });
    logger.error("Axis MCP runtime failed to start", {}, error);
    process.exit(1);
  });
}
