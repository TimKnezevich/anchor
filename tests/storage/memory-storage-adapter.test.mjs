import test from "node:test";
import assert from "node:assert/strict";
import { MemoryStorageAdapter } from "../../server/storage/src/index.mjs";

test("memory adapter stores and reads nodes", () => {
  const adapter = new MemoryStorageAdapter();
  adapter.initialize();

  adapter.upsertNode({ id: "node-1", type: "TASK" });
  const node = adapter.getNode("node-1");

  assert.equal(node.id, "node-1");
  assert.equal(adapter.listNodes().length, 1);
});

test("memory adapter stores evidence and validation", () => {
  const adapter = new MemoryStorageAdapter();

  adapter.attachEvidence("task-1", { id: "evidence-1" });
  adapter.setValidation("task-1", { passed: true });

  assert.equal(adapter.getEvidence("task-1").length, 1);
  assert.equal(adapter.getValidation("task-1").passed, true);
});

test("memory adapter stores clauses and task clause links", () => {
  const adapter = new MemoryStorageAdapter();

  adapter.upsertClause({ id: "acc.validation_gate", kind: "acc" });
  adapter.upsertTaskClauseLink({
    task_id: "task-1",
    clause_id: "acc.validation_gate",
    clause_hash_at_link_time: "hash-1"
  });

  assert.equal(adapter.getClause("acc.validation_gate").kind, "acc");
  assert.equal(adapter.getTaskClauseLinks("task-1").length, 1);
});
