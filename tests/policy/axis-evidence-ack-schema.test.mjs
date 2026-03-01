import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeAxisAcknowledgmentRecord,
  normalizeAxisEvidenceLinkRecord,
  validateAxisAcknowledgmentRecord,
  validateAxisEvidenceLinkRecord
} from "../../shared/policy/src/index.mjs";
import {
  createInvalidAxisEvidenceAckFixtures,
  createValidAxisAcknowledgmentFixture,
  createValidAxisEvidenceLinkFixture
} from "../fixtures/axis-evidence-ack-fixtures.mjs";

test("validateAxisEvidenceLinkRecord accepts valid fixture", () => {
  const record = createValidAxisEvidenceLinkFixture();
  const result = validateAxisEvidenceLinkRecord(record);

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("validateAxisAcknowledgmentRecord accepts valid fixture", () => {
  const record = createValidAxisAcknowledgmentFixture();
  const result = validateAxisAcknowledgmentRecord(record);

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("normalizeAxisEvidenceLinkRecord and normalizeAxisAcknowledgmentRecord apply defaults", () => {
  const evidence = normalizeAxisEvidenceLinkRecord({
    task_id: "task-1",
    work_session_id: "ws-1",
    actor: "codex",
    files: ["README.md"],
    evidence_id: "ev-1",
    recorded_at: "2026-03-01T19:00:00Z"
  });
  const acknowledgment = normalizeAxisAcknowledgmentRecord({
    ack_id: "ack-1",
    task_id: "task-1",
    work_session_id: "ws-1",
    actor: "codex",
    files: ["README.md"],
    reason: "temporary exception",
    approved_by: "lead-dev",
    created_at: "2026-03-01T19:00:00Z",
    expires_at: "2026-03-01T20:00:00Z"
  });

  assert.equal(evidence.schema_version, "1");
  assert.equal(acknowledgment.schema_version, "1");
});

test("evidence/ack validators reject invalid fixtures with deterministic failures", () => {
  for (const fixture of createInvalidAxisEvidenceAckFixtures()) {
    if (fixture.evidence) {
      const evidenceResult = validateAxisEvidenceLinkRecord(fixture.evidence);
      assert.equal(evidenceResult.ok, false, `${fixture.name}: expected evidence validation failure`);
      assert.ok(evidenceResult.errors.length > 0, `${fixture.name}: expected evidence validation errors`);
    }

    if (fixture.acknowledgment) {
      const acknowledgmentResult = validateAxisAcknowledgmentRecord(fixture.acknowledgment);
      assert.equal(acknowledgmentResult.ok, false, `${fixture.name}: expected acknowledgment validation failure`);
      assert.ok(acknowledgmentResult.errors.length > 0, `${fixture.name}: expected acknowledgment validation errors`);
    }
  }
});

test("validators reject unknown fields", () => {
  const evidence = createValidAxisEvidenceLinkFixture({ extra_field: true });
  const acknowledgment = createValidAxisAcknowledgmentFixture({ unexpected: true });

  const evidenceResult = validateAxisEvidenceLinkRecord(evidence);
  const acknowledgmentResult = validateAxisAcknowledgmentRecord(acknowledgment);

  assert.equal(evidenceResult.ok, false);
  assert.ok(evidenceResult.errors.some((error) => error.includes("not allowed")));
  assert.equal(acknowledgmentResult.ok, false);
  assert.ok(acknowledgmentResult.errors.some((error) => error.includes("not allowed")));
});
