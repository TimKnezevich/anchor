import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function readText(path) {
  return readFileSync(path, "utf8");
}

test("ci workflow includes axis enforcement gate and report artifact upload", () => {
  const workflow = readText(".github/workflows/ci.yml");

  assert.ok(workflow.includes("Axis diff enforcement (CI strict)"));
  assert.ok(workflow.includes("scripts/axis-validate-diff.mjs"));
  assert.ok(workflow.includes("--strict"));
  assert.ok(workflow.includes("--base-ref origin/main"));
  assert.ok(workflow.includes("axis-ci-enforcement-report"));
  assert.ok(workflow.includes("Fail on axis enforcement drift"));
});

test("ci enforcement documentation exists with branch protection guidance", () => {
  assert.equal(existsSync("docs/CI-ENFORCEMENT.md"), true);

  const doc = readText("docs/CI-ENFORCEMENT.md");
  assert.ok(doc.includes("Branch and PR Gate"));
  assert.ok(doc.includes("required status check"));
});
