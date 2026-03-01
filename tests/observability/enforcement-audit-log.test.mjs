import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createAcknowledgment } from "../../scripts/axis-acknowledgment-lib.mjs";
import { rollbackUnlinkedDiff } from "../../scripts/axis-rollback-unlinked.mjs";
import { readEnforcementAuditEvents } from "../../shared/observability/src/index.mjs";

function runGit(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function createRepoFixture() {
  const root = mkdtempSync(join(tmpdir(), "axis-audit-"));

  runGit(root, ["init"]);
  runGit(root, ["config", "user.email", "axis@example.com"]);
  runGit(root, ["config", "user.name", "Axis Test"]);

  writeFileSync(join(root, "tracked.txt"), "base\n");
  runGit(root, ["add", "tracked.txt"]);
  runGit(root, ["commit", "-m", "base"]);

  mkdirSync(join(root, ".axis", "evidence"), { recursive: true });
  writeFileSync(
    join(root, ".axis", "policy.json"),
    `${JSON.stringify({
      schema_version: "1",
      enforcement_mode: "enforce",
      actor_scope: "any",
      allowed_actors: [],
      acknowledgment_ttl_minutes: 30
    }, null, 2)}\n`
  );
  writeFileSync(
    join(root, ".axis", "evidence", "ev-1.json"),
    `${JSON.stringify({
      schema_version: "1",
      evidence_id: "ev-1",
      task_id: "task-1",
      work_session_id: "ws-1",
      actor: "codex",
      files: ["other.txt"],
      recorded_at: "2026-03-01T20:00:00Z"
    }, null, 2)}\n`
  );

  writeFileSync(join(root, "tracked.txt"), "changed\n");
  runGit(root, ["add", "tracked.txt"]);

  return root;
}

test("enforcement scripts emit structured audit events with correlation fields", () => {
  const root = createRepoFixture();

  const validateRun = spawnSync("node", ["scripts/axis-validate-diff.mjs", "--cwd", root, "--staged-only"], {
    cwd: process.cwd(),
    stdio: "pipe",
    encoding: "utf8"
  });
  assert.notEqual(validateRun.status, null);

  createAcknowledgment(root, {
    task_id: "task-1",
    work_session_id: "ws-1",
    actor: "codex",
    files: ["tracked.txt"],
    reason: "temporary",
    approved_by: "lead-dev",
    created_at: "2026-03-01T20:00:00Z",
    ttl_minutes: 30
  });

  rollbackUnlinkedDiff({
    cwd: root,
    apply: false
  });

  const events = readEnforcementAuditEvents(root);
  const eventTypes = events.map((item) => item.event_type);

  assert.ok(eventTypes.includes("diff_validation"));
  assert.ok(eventTypes.includes("acknowledgment_created"));
  assert.ok(eventTypes.includes("rollback_preview"));

  for (const event of events) {
    assert.ok(Object.hasOwn(event, "repo_id"));
    assert.ok(Object.hasOwn(event, "task_id"));
    assert.ok(Object.hasOwn(event, "work_session_id"));
    assert.ok(Object.hasOwn(event, "actor"));
  }
});
