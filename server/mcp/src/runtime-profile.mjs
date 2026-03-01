const allowedProfiles = new Set(["local", "shared"]);

function parseInteger(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid AXIS_MCP_PORT: ${value}`);
  }
  return parsed;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).toLowerCase().trim();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  return fallback;
}

function defaultConfigForProfile(profile) {
  if (profile === "shared") {
    return {
      host: "0.0.0.0",
      port: 4317,
      logLevel: "info",
      storageAdapter: "sqlite"
    };
  }

  return {
    host: "127.0.0.1",
    port: 4317,
    logLevel: "debug",
    storageAdapter: "memory"
  };
}

function validateConfig(config) {
  if (!allowedProfiles.has(config.profile)) {
    throw new Error(`Unsupported AXIS_RUNTIME_PROFILE: ${config.profile}`);
  }

  if (!Number.isInteger(config.port) || config.port < 0 || config.port > 65535) {
    throw new Error(`Invalid AXIS_MCP_PORT: ${config.port}`);
  }

  if (!config.host || typeof config.host !== "string") {
    throw new Error("AXIS_MCP_HOST must be a non-empty string.");
  }

  if (!config.paths.mcp.startsWith("/") || !config.paths.health.startsWith("/")) {
    throw new Error("AXIS_MCP_PATH and AXIS_MCP_HEALTH_PATH must start with '/'.");
  }

  if (!config.paths.live.startsWith("/") || !config.paths.ready.startsWith("/")) {
    throw new Error("AXIS_MCP_LIVE_PATH and AXIS_MCP_READY_PATH must start with '/'.");
  }
}

export function resolveRuntimeProfileConfig(env = process.env, overrides = {}) {
  const requestedProfile = overrides.profile ?? env.AXIS_RUNTIME_PROFILE ?? "local";
  const profile = String(requestedProfile).toLowerCase().trim();
  const defaults = defaultConfigForProfile(profile);

  const config = {
    profile,
    host: overrides.host ?? env.AXIS_MCP_HOST ?? defaults.host,
    port: parseInteger(overrides.port ?? env.AXIS_MCP_PORT, defaults.port),
    logLevel: overrides.logLevel ?? env.AXIS_LOG_LEVEL ?? defaults.logLevel,
    storageAdapter: overrides.storageAdapter ?? env.AXIS_STORAGE_ADAPTER ?? defaults.storageAdapter,
    paths: {
      mcp: overrides.mcpPath ?? env.AXIS_MCP_PATH ?? "/mcp",
      health: overrides.healthPath ?? env.AXIS_MCP_HEALTH_PATH ?? "/health",
      live: overrides.livePath ?? env.AXIS_MCP_LIVE_PATH ?? "/health/live",
      ready: overrides.readyPath ?? env.AXIS_MCP_READY_PATH ?? "/health/ready"
    },
    sidecars: {
      vectorEnabled: parseBoolean(overrides.vectorEnabled ?? env.AXIS_ENABLE_VECTOR_SIDECAR, false),
      eventEnabled: parseBoolean(overrides.eventEnabled ?? env.AXIS_ENABLE_EVENT_SIDECAR, false)
    }
  };

  validateConfig(config);
  return config;
}
