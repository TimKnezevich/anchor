import test from "node:test";
import assert from "node:assert/strict";
import { AxisError, errorCodes } from "../../shared/observability/src/index.mjs";

test("AxisError stores code, details, and correlation id", () => {
  const error = new AxisError("Task is locked", {
    code: errorCodes.TASK_LOCKED,
    details: { taskId: "task-1" },
    correlationId: "corr-123"
  });

  assert.equal(error.name, "AxisError");
  assert.equal(error.code, "TASK_LOCKED");
  assert.deepEqual(error.details, { taskId: "task-1" });
  assert.equal(error.correlationId, "corr-123");
});

test("AxisError serializes to a stable JSON object", () => {
  const error = new AxisError("Validation failed", {
    code: errorCodes.VALIDATION_ERROR,
    details: { field: "specKey" }
  });

  assert.deepEqual(error.toJSON(), {
    name: "AxisError",
    message: "Validation failed",
    code: "VALIDATION_ERROR",
    details: { field: "specKey" },
    correlationId: null,
    cause: null
  });
});
