import { AxisError, errorCodes } from "../../../shared/observability/src/index.mjs";

const statusByCode = Object.freeze({
  [errorCodes.TASK_LOCKED]: 409,
  [errorCodes.ETAG_MISMATCH]: 409,
  [errorCodes.REPO_LOCKED]: 423,
  [errorCodes.VALIDATION_ERROR]: 400,
  [errorCodes.NOT_FOUND]: 404,
  [errorCodes.INTERNAL_ERROR]: 500,
  [errorCodes.UNKNOWN]: 500
});

export function toErrorResponse(error, correlationId = null) {
  const normalized = error instanceof AxisError
    ? error
    : new AxisError(error instanceof Error ? error.message : String(error), {
      code: errorCodes.INTERNAL_ERROR,
      cause: error
    });

  return {
    ok: false,
    error: {
      status: statusByCode[normalized.code] ?? 500,
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
      correlationId: normalized.correlationId ?? correlationId
    }
  };
}
