import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { AxisMcpService } from "../../server/mcp/src/index.mjs";
import { createAcknowledgment } from "../../scripts/axis-acknowledgment-lib.mjs";
import { rollbackUnlinkedDiff } from "../../scripts/axis-rollback-unlinked.mjs";
import { evaluateAxisDiff } from "../../scripts/axis-validate-diff.mjs";

function runGit(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function createRepoFixture(policyMode = "warn") {
  const root = mkdtempSync(join(tmpdir(), "axis-lifecycle-"));

  runGit(root, ["init"]);
  runGit(root, ["config", "user.email", "axis@example.com"]);
  runGit(root, ["config", "user.name", "Axis Test"]);

  writeFileSync(join(root, "tracked.txt"), "base\n");
  runGit(root, ["add", "tracked.txt"]);
  runGit(root, ["commit", "-m", "base axis_task=task-1 axis_session=ws-1"]);

  mkdirSync(join(root, ".axis", "evidence"), { recursive: true });
  writeFileSync(
    join(root, ".axis", "policy.json"),
    `${JSON.stringify({
      schema_version: "1",
      enforcement_mode: policyMode,
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

  return root;
}

test("integration lifecycle: initialize -> edit -> warn -> acknowledge -> CI strict fail on committed drift", () => {
  const root = createRepoFixture("warn");
  const service = new AxisMcpService();
  const initResponse = service.handle({
    command: "initialize_workspace",
    command_id: "cmd-init-1",
    repo_id: "repo-1",
    actor: "codex",
    payload: {}
  });
  assert.equal(initResponse.ok, true);

  writeFileSync(join(root, "tracked.txt"), "changed\n");
  runGit(root, ["add", "tracked.txt"]);

  const warnResult = evaluateAxisDiff({
    cwd: root,
    includeStaged: true,
    includeWorking: false
  });
  assert.equal(warnResult.status, "warn");
  assert.ok(warnResult.unlinked_files.includes("tracked.txt"));

  createAcknowledgment(root, {
    task_id: "task-1",
    work_session_id: "ws-1",
    actor: "codex",
    files: ["tracked.txt"],
    reason: "temporary",
    approved_by: "lead-dev",
    ttl_minutes: 30,
    created_at: "2026-03-01T20:00:00Z"
  });

  const afterAck = evaluateAxisDiff({
    cwd: root,
    includeStaged: true,
    includeWorking: false,
    nowIso: "2026-03-01T20:05:00Z"
  });
  assert.equal(afterAck.status, "pass");

  runGit(root, ["commit", "-m", "change axis_task=task-1 axis_session=ws-1"]);

  const strictCiResult = evaluateAxisDiff({
    cwd: root,
    baseRef: "HEAD~1",
    headRef: "HEAD",
    strict: true,
    nowIso: "2026-03-01T23:00:00Z"
  });
  assert.equal(strictCiResult.status, "fail");
  assert.ok(strictCiResult.unlinked_files.includes("tracked.txt"));
});

test("integration lifecycle: rollback path clears unlinked staged diff", () => {
  const root = createRepoFixture("enforce");

  writeFileSync(join(root, "tracked.txt"), "changed\n");
  runGit(root, ["add", "tracked.txt"]);

  const before = evaluateAxisDiff({
    cwd: root,
    includeStaged: true,
    includeWorking: false
  });
  assert.equal(before.status, "fail");

  const rollback = rollbackUnlinkedDiff({
    cwd: root,
    apply: true
  });
  assert.equal(rollback.status, "rolled_back");

  const after = evaluateAxisDiff({
    cwd: root,
    includeStaged: true,
    includeWorking: false
  });
  assert.equal(after.status, "pass");
});
