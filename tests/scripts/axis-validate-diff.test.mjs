import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { evaluateAxisDiff } from "../../scripts/axis-validate-diff.mjs";

function runGit(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

function createRepoFixture(options = {}) {
  const root = mkdtempSync(join(tmpdir(), "axis-diff-"));

  runGit(root, ["init"]);
  runGit(root, ["config", "user.email", "axis@example.com"]);
  runGit(root, ["config", "user.name", "Axis Test"]);

  writeFileSync(join(root, "tracked.txt"), "base\n");
  runGit(root, ["add", "tracked.txt"]);
  runGit(root, ["commit", "-m", "base"]);

  mkdirSync(join(root, ".axis", "evidence"), { recursive: true });

  const policy = {
    schema_version: "1",
    enforcement_mode: options.enforcementMode ?? "enforce",
    actor_scope: "any",
    allowed_actors: [],
    acknowledgment_ttl_minutes: 1440
  };
  writeFileSync(join(root, ".axis", "policy.json"), JSON.stringify(policy, null, 2));

  const evidence = {
    schema_version: "1",
    evidence_id: "ev-1",
    task_id: "task-1",
    work_session_id: "ws-1",
    actor: "codex",
    files: options.linkedFiles ?? ["tracked.txt"],
    recorded_at: "2026-03-01T20:00:00Z"
  };
  writeFileSync(join(root, ".axis", "evidence", "ev-1.json"), JSON.stringify(evidence, null, 2));

  writeFileSync(join(root, "tracked.txt"), "changed\n");
  runGit(root, ["add", "tracked.txt"]);

  return root;
}

test("evaluateAxisDiff returns pass when all changed files are linked", () => {
  const root = createRepoFixture({
    enforcementMode: "enforce",
    linkedFiles: ["tracked.txt"]
  });

  const result = evaluateAxisDiff({
    cwd: root,
    includeWorking: false,
    includeStaged: true
  });

  assert.equal(result.status, "pass");
  assert.equal(result.exit_code, 0);
  assert.deepEqual(result.unlinked_files, []);
});

test("evaluateAxisDiff returns warn in warn mode when changed files are unlinked", () => {
  const root = createRepoFixture({
    enforcementMode: "warn",
    linkedFiles: ["docs/only.md"]
  });

  const result = evaluateAxisDiff({
    cwd: root,
    includeWorking: false,
    includeStaged: true
  });

  assert.equal(result.status, "warn");
  assert.equal(result.exit_code, 10);
  assert.ok(result.unlinked_files.includes("tracked.txt"));
});

test("evaluateAxisDiff returns fail in enforce mode when changed files are unlinked", () => {
  const root = createRepoFixture({
    enforcementMode: "enforce",
    linkedFiles: ["docs/only.md"]
  });

  const result = evaluateAxisDiff({
    cwd: root,
    includeWorking: false,
    includeStaged: true
  });

  assert.equal(result.status, "fail");
  assert.equal(result.exit_code, 20);
  assert.ok(result.unlinked_files.includes("tracked.txt"));
});
