import test from "node:test";
import assert from "node:assert/strict";
import { validateEvidence } from "../../shared/evidence/src/index.mjs";

function validEvidence() {
  return {
    id: "evidence.1",
    artifacts: ["npm run test", "npm run lint"],
    touched_files: ["server/mcp/src/mcp-service.mjs"],
    command_results: [
      { command: "npm run test", passed: true },
      { command: "npm run lint", passed: true }
    ],
    validation_assertions: [
      { clause_id: "acc.validation_gate", passed: true, note: "Acceptance met" }
    ]
  };
}

test("validateEvidence accepts complete valid payload", () => {
  const result = validateEvidence(validEvidence());
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("validateEvidence rejects missing required arrays", () => {
  const evidence = validEvidence();
  delete evidence.touched_files;
  delete evidence.command_results;

  const result = validateEvidence(evidence);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("touched_files")));
  assert.ok(result.errors.some((error) => error.includes("command_results")));
});

test("validateEvidence rejects invalid assertion fields", () => {
  const evidence = validEvidence();
  evidence.validation_assertions = [{ clause_id: "", passed: "yes", note: "" }];

  const result = validateEvidence(evidence);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("clause_id")));
  assert.ok(result.errors.some((error) => error.includes("passed")));
  assert.ok(result.errors.some((error) => error.includes("note")));
});
