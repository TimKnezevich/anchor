import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createAcknowledgment, evaluateAcknowledgmentState } from "../../scripts/axis-acknowledgment-lib.mjs";
import { evaluateAxisDiff } from "../../scripts/axis-validate-diff.mjs";

function runGit(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function createRepoFixture() {
  const root = mkdtempSync(join(tmpdir(), "axis-ack-"));

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
      acknowledgment_ttl_minutes: 60
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
      files: ["different-file.txt"],
      recorded_at: "2026-03-01T20:00:00Z"
    }, null, 2)}\n`
  );

  writeFileSync(join(root, "tracked.txt"), "changed\n");
  runGit(root, ["add", "tracked.txt"]);

  return root;
}

test("createAcknowledgment creates valid acknowledgment record", () => {
  const root = createRepoFixture();
  const created = createAcknowledgment(root, {
    task_id: "task-1",
    work_session_id: "ws-1",
    actor: "codex",
    files: ["tracked.txt"],
    reason: "Known temporary drift",
    approved_by: "lead-dev",
    ttl_minutes: 30,
    created_at: "2026-03-01T20:00:00Z"
  });

  assert.equal(created.record.ack_id.startsWith("ack-"), true);
  assert.equal(created.record.files[0], "tracked.txt");
  assert.equal(evaluateAcknowledgmentState(created.record, "2026-03-01T20:10:00Z"), "active");
});

test("evaluateAxisDiff honors active acknowledgment and ignores expired acknowledgment", () => {
  const root = createRepoFixture();

  const beforeAck = evaluateAxisDiff({
    cwd: root,
    includeWorking: false,
    includeStaged: true,
    nowIso: "2026-03-01T20:10:00Z"
  });
  assert.equal(beforeAck.status, "fail");
  assert.ok(beforeAck.unlinked_files.includes("tracked.txt"));

  createAcknowledgment(root, {
    task_id: "task-1",
    work_session_id: "ws-1",
    actor: "codex",
    files: ["tracked.txt"],
    reason: "Known temporary drift",
    approved_by: "lead-dev",
    ttl_minutes: 30,
    created_at: "2026-03-01T20:00:00Z"
  });

  const duringAck = evaluateAxisDiff({
    cwd: root,
    includeWorking: false,
    includeStaged: true,
    nowIso: "2026-03-01T20:10:00Z"
  });
  assert.equal(duringAck.status, "pass");
  assert.ok(duringAck.acknowledged_unlinked_files.includes("tracked.txt"));

  const afterExpiry = evaluateAxisDiff({
    cwd: root,
    includeWorking: false,
    includeStaged: true,
    nowIso: "2026-03-01T22:10:00Z"
  });
  assert.equal(afterExpiry.status, "fail");
  assert.ok(afterExpiry.unlinked_files.includes("tracked.txt"));
});
