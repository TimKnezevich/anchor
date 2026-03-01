import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function read(path) {
  return readFileSync(path, "utf8");
}

test("phase 17 docs exist and include setup/enforcement runbook links", () => {
  assert.equal(existsSync("docs/ENFORCEMENT-RUNBOOK.md"), true);
  assert.equal(existsSync("docs/CI-ENFORCEMENT.md"), true);

  const install = read("docs/EXTENSION-INSTALL.md");
  assert.ok(install.includes("Axis: Initialize Repository"));
  assert.ok(install.includes("docs/ENFORCEMENT-RUNBOOK.md"));
});

test("architecture and spec include initialization and enforcement references", () => {
  const architecture = read("docs/ARCHITECTURE.md");
  const spec = read("docs/SPEC-v0.md");

  assert.ok(architecture.includes("Enforcement and Initialization References"));
  assert.ok(architecture.includes("initialize_workspace"));
  assert.ok(spec.includes("req.workspace.initialize"));
  assert.ok(spec.includes("req.drift.enforcement"));
  assert.ok(spec.includes("con.enforcement.error_codes"));
});
