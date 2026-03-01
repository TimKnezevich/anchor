import test from "node:test";
import assert from "node:assert/strict";
import {
  buildEnforcementMessages,
  enforcementErrorCodes,
  mapEnforcementCodeToGuidance
} from "../../shared/observability/src/index.mjs";
import { buildConflictMessage } from "../../extension/src/conflict-messages.mjs";

test("mapEnforcementCodeToGuidance returns deterministic guidance", () => {
  const guidance = mapEnforcementCodeToGuidance(enforcementErrorCodes.UNLINKED_DIFF_DETECTED);

  assert.equal(guidance.status, "fail");
  assert.ok(guidance.message.includes("not linked"));
});

test("buildEnforcementMessages de-duplicates repeated codes", () => {
  const messages = buildEnforcementMessages([
    enforcementErrorCodes.POLICY_FILE_MISSING,
    enforcementErrorCodes.POLICY_FILE_MISSING
  ]);

  assert.equal(messages.length, 1);
  assert.equal(messages[0].code, enforcementErrorCodes.POLICY_FILE_MISSING);
});

test("extension conflict message uses shared enforcement mapper", () => {
  const message = buildConflictMessage({
    code: enforcementErrorCodes.EVIDENCE_FILE_INVALID_SCHEMA
  });
  const shared = mapEnforcementCodeToGuidance(enforcementErrorCodes.EVIDENCE_FILE_INVALID_SCHEMA);

  assert.equal(message, shared.message);
});
