import { AxisError } from "./axis-error.mjs";
import { createRedactKeySet, redactContext } from "./redaction.mjs";

function levelFromErrorCode(code) {
  if (code === "TASK_LOCKED" || code === "ETAG_MISMATCH" || code === "REPO_LOCKED") {
    return "warn";
  }

  if (code === "VALIDATION_ERROR") {
    return "info";
  }

  return "error";
}

export function mapErrorToLog(error, options = {}) {
  const redactKeys = createRedactKeySet(options.extraRedactKeys ?? []);

  if (error instanceof AxisError) {
    return {
      level: levelFromErrorCode(error.code),
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        correlationId: error.correlationId,
        details: redactContext(error.details, redactKeys)
      }
    };
  }

  return {
    level: "error",
    error: {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
      code: "UNKNOWN",
      correlationId: null,
      details: null
    }
  };
}
