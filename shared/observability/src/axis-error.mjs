import { errorCodes } from "./error-codes.mjs";

/**
 * Shared application error for server and extension layers.
 */
export class AxisError extends Error {
  constructor(message, options = {}) {
    super(message, { cause: options.cause });
    this.name = "AxisError";
    this.code = options.code ?? errorCodes.UNKNOWN;
    this.details = options.details ?? null;
    this.correlationId = options.correlationId ?? null;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      correlationId: this.correlationId,
      cause: this.cause instanceof Error ? this.cause.message : null
    };
  }
}
