import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { installGitHooks } from "../../scripts/install-git-hooks.mjs";
import { validateCommitMessageText } from "../../scripts/axis-validate-commit-msg.mjs";

function runGit(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}

test("githook files exist for pre-commit and commit-msg", () => {
  assert.equal(existsSync(".githooks/pre-commit"), true);
  assert.equal(existsSync(".githooks/commit-msg"), true);
});

test("validateCommitMessageText enforces axis_task and axis_session metadata", () => {
  const valid = validateCommitMessageText("feat: update\n\naxis_task=task-1 axis_session=ws-1\n");
  const invalid = validateCommitMessageText("feat: update without metadata\n");

  assert.equal(valid.ok, true);
  assert.equal(invalid.ok, false);
  assert.equal(invalid.missing.length, 2);
});

test("installGitHooks sets local core.hooksPath to .githooks", () => {
  const root = mkdtempSync(join(tmpdir(), "axis-hooks-"));
  runGit(root, ["init"]);
  mkdirSync(join(root, ".githooks"), { recursive: true });
  writeFileSync(join(root, ".githooks", "pre-commit"), "#!/usr/bin/env bash\nexit 0\n");
  writeFileSync(join(root, ".githooks", "commit-msg"), "#!/usr/bin/env bash\nexit 0\n");

  const result = installGitHooks({ cwd: root });
  const configured = runGit(root, ["config", "--get", "core.hooksPath"]);

  assert.equal(result.ok, true);
  assert.equal(result.hooks_path, ".githooks");
  assert.equal(configured, ".githooks");
});
