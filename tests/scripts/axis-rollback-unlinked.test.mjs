import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { rollbackUnlinkedDiff } from "../../scripts/axis-rollback-unlinked.mjs";

function runGit(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}

function createRepoFixture() {
  const root = mkdtempSync(join(tmpdir(), "axis-rollback-"));

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
      acknowledgment_ttl_minutes: 1440
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
      files: ["another-file.txt"],
      recorded_at: "2026-03-01T20:00:00Z"
    }, null, 2)}\n`
  );

  writeFileSync(join(root, "tracked.txt"), "changed\n");
  runGit(root, ["add", "tracked.txt"]);

  return root;
}

test("rollbackUnlinkedDiff preview mode reports unlinked files without editing", () => {
  const root = createRepoFixture();
  const preview = rollbackUnlinkedDiff({
    cwd: root,
    apply: false
  });

  assert.equal(preview.mode, "preview");
  assert.equal(preview.status, "preview");
  assert.ok(preview.preview_files.includes("tracked.txt"));

  const staged = runGit(root, ["diff", "--cached", "--name-only"]);
  assert.ok(staged.includes("tracked.txt"));
});

test("rollbackUnlinkedDiff apply mode restores staged and working tree changes", () => {
  const root = createRepoFixture();
  const result = rollbackUnlinkedDiff({
    cwd: root,
    apply: true
  });

  assert.equal(result.mode, "apply");
  assert.equal(result.status, "rolled_back");
  assert.ok(result.rolled_back_files.includes("tracked.txt"));
  assert.equal(readFileSync(join(root, "tracked.txt"), "utf8"), "base\n");
  assert.equal(runGit(root, ["diff", "--cached", "--name-only"]), "");
  assert.equal(runGit(root, ["diff", "--name-only"]), "");
});
