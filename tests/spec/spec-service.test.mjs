import test from "node:test";
import assert from "node:assert/strict";
import { SpecService } from "../../server/spec/src/index.mjs";

function reqClause() {
  return {
    id: "req.orchestrator.loop",
    kind: "req",
    text: "Orchestrator must follow six-step loop",
    revision: 1
  };
}

function accClause() {
  return {
    id: "acc.validation_gate",
    kind: "acc",
    text: "Task requires evidence-backed validation",
    revision: 1
  };
}

test("spec service stores clauses with hash", () => {
  const service = new SpecService();
  const stored = service.upsertClause(reqClause());

  assert.equal(typeof stored.hash, "string");
  assert.equal(stored.hash.length, 64);
});

test("link captures clause hash at link time", () => {
  const service = new SpecService();
  const clause = service.upsertClause(reqClause());

  const link = service.linkTaskToClause("task-1", clause.id);
  assert.equal(link.clause_hash_at_link_time, clause.hash);
});

test("drift marks task stale when clause hash changes", () => {
  const service = new SpecService();
  const initial = reqClause();

  service.upsertClause(initial);
  service.linkTaskToClause("task-1", initial.id);

  service.upsertClause({
    ...initial,
    text: "Orchestrator must follow strict six-step loop",
    revision: 2
  });

  const drift = service.evaluateTaskDrift("task-1");
  assert.equal(drift.stale, true);
  assert.equal(service.getTaskState("task-1"), "stale");
});

test("acceptance clause validation requires acc kind", () => {
  const service = new SpecService();
  service.upsertClause(reqClause());
  service.upsertClause(accClause());

  const ok = service.validateAcceptanceClauseIds(["acc.validation_gate"]);
  const bad = service.validateAcceptanceClauseIds(["req.orchestrator.loop"]);

  assert.equal(ok.ok, true);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors[0].includes("not kind acc"));
});
