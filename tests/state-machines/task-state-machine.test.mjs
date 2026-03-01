import test from "node:test";
import assert from "node:assert/strict";
import {
  getAllowedTaskTransitions,
  isValidTaskTransition,
  assertTaskTransition
} from "../../shared/workflow/state-machines/src/index.mjs";

test("task state machine allows valid transition", () => {
  assert.equal(isValidTaskTransition("ready", "in_progress"), true);
  assert.doesNotThrow(() => assertTaskTransition("ready", "in_progress"));
});

test("task state machine rejects invalid transition", () => {
  assert.equal(isValidTaskTransition("draft", "done"), false);
  assert.throws(() => assertTaskTransition("draft", "done"), /Invalid TASK transition/);
});

test("task state machine returns allowed transitions", () => {
  assert.deepEqual(getAllowedTaskTransitions("validated"), ["done", "failed_validation", "stale"]);
});
