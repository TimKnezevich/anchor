import test from "node:test";
import assert from "node:assert/strict";
import { validateEdge } from "../../shared/models/edges/src/index.mjs";

function baseEdge() {
  return {
    id: "edge.spec.task.1",
    type: "SPEC_DEFINES_TASK",
    source_id: "spec.axis.v0.core",
    source_type: "SPEC",
    target_id: "task.phase2.node-model",
    target_type: "TASK",
    revision: 1,
    etag: "etag-1",
    meta: {},
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z"
  };
}

test("validateEdge accepts valid edge payload", () => {
  const result = validateEdge(baseEdge());
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("validateEdge fails for missing shared fields", () => {
  const edge = baseEdge();
  delete edge.source_id;

  const result = validateEdge(edge);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("source_id")));
});

test("validateEdge fails for invalid source endpoint", () => {
  const edge = baseEdge();
  edge.source_type = "TASK";

  const result = validateEdge(edge);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("Invalid source_type")));
});

test("validateEdge fails for invalid target endpoint", () => {
  const edge = baseEdge();
  edge.target_type = "CODE_UNIT";

  const result = validateEdge(edge);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("Invalid target_type")));
});
