import test from "node:test";
import assert from "node:assert/strict";
import { validateNode } from "../../shared/models/nodes/src/index.mjs";

function baseNode() {
  return {
    id: "task.1",
    type: "TASK",
    status: "ready",
    revision: 1,
    etag: "etag-1",
    meta: {},
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    title: "Task",
    clause_links: ["req.orchestrator.loop"]
  };
}

test("validateNode accepts valid shared and task fields", () => {
  const result = validateNode(baseNode());
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("validateNode fails when required shared fields are missing", () => {
  const node = baseNode();
  delete node.etag;
  const result = validateNode(node);

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("etag")));
});

test("validateNode fails for invalid status per type", () => {
  const node = baseNode();
  node.status = "archived";

  const result = validateNode(node);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("Invalid status")));
});

test("validateNode fails when task required fields are wrong", () => {
  const node = baseNode();
  node.clause_links = "req.orchestrator.loop";

  const result = validateNode(node);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("clause_links")));
});

test("validateNode enforces spec array field", () => {
  const node = {
    id: "spec.1",
    type: "SPEC",
    status: "active",
    revision: 1,
    etag: "etag-spec",
    meta: {},
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    spec_key: "axis.v0",
    semantic_version: "0.1.0",
    clause_index: "def.axis.authority"
  };

  const result = validateNode(node);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("clause_index")));
});
