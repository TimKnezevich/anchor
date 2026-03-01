import test from "node:test";
import assert from "node:assert/strict";
import {
  getAllowedWorkSessionTransitions,
  isValidWorkSessionTransition,
  assertWorkSessionTransition
} from "../../shared/workflow/state-machines/src/index.mjs";

test("work session state machine allows valid transition", () => {
  assert.equal(isValidWorkSessionTransition("opened", "active"), true);
  assert.doesNotThrow(() => assertWorkSessionTransition("opened", "active"));
});

test("work session state machine rejects invalid transition", () => {
  assert.equal(isValidWorkSessionTransition("closed", "active"), false);
  assert.throws(() => assertWorkSessionTransition("closed", "active"), /Invalid work_session transition/);
});

test("work session state machine returns allowed transitions", () => {
  assert.deepEqual(getAllowedWorkSessionTransitions("opened"), ["active", "closed"]);
});
