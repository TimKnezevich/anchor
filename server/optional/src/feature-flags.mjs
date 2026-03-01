const defaultFlags = Object.freeze({
  vectorSidecarEnabled: false,
  eventSidecarEnabled: false
});

function parseBoolean(value, fallback) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return fallback;
}

export function resolveFeatureFlags(input = {}, env = process.env) {
  return {
    vectorSidecarEnabled: parseBoolean(
      input.vectorSidecarEnabled ?? env.AXIS_ENABLE_VECTOR_SIDECAR,
      defaultFlags.vectorSidecarEnabled
    ),
    eventSidecarEnabled: parseBoolean(
      input.eventSidecarEnabled ?? env.AXIS_ENABLE_EVENT_SIDECAR,
      defaultFlags.eventSidecarEnabled
    )
  };
}

export function getDefaultFeatureFlags() {
  return { ...defaultFlags };
}
