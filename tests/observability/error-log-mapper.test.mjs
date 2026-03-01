import test from "node:test";
import assert from "node:assert/strict";
import { AxisError, errorCodes, mapErrorToLog } from "../../shared/observability/src/index.mjs";

test("mapErrorToLog maps lock errors to warn level", () => {
  const error = new AxisError("task locked", { code: errorCodes.TASK_LOCKED });
  const mapped = mapErrorToLog(error);

  assert.equal(mapped.level, "warn");
  assert.equal(mapped.error.code, "TASK_LOCKED");
});

test("mapErrorToLog redacts sensitive details", () => {
  const error = new AxisError("bad token", {
    code: errorCodes.VALIDATION_ERROR,
    details: { token: "abc", safe: "ok" }
  });
  const mapped = mapErrorToLog(error);

  assert.equal(mapped.level, "info");
  assert.equal(mapped.error.details.token, "[REDACTED]");
  assert.equal(mapped.error.details.safe, "ok");
});
