import test from "node:test";
import assert from "node:assert/strict";
import {
  axisPolicyDefaults,
  normalizeAxisPolicy,
  validateAxisPolicy
} from "../../shared/policy/src/index.mjs";
import {
  createInvalidAxisPolicyFixtures,
  createValidAxisPolicyFixture
} from "../fixtures/axis-policy-fixtures.mjs";

test("validateAxisPolicy accepts valid policy fixture", () => {
  const policy = createValidAxisPolicyFixture();
  const result = validateAxisPolicy(policy);

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test("normalizeAxisPolicy applies defaults", () => {
  const policy = normalizeAxisPolicy({
    actor_scope: "allowlist",
    allowed_actors: ["codex"]
  });

  assert.equal(policy.schema_version, axisPolicyDefaults.schema_version);
  assert.equal(policy.enforcement_mode, axisPolicyDefaults.enforcement_mode);
  assert.equal(policy.actor_scope, "allowlist");
  assert.deepEqual(policy.allowed_actors, ["codex"]);
  assert.equal(policy.acknowledgment_ttl_minutes, axisPolicyDefaults.acknowledgment_ttl_minutes);
});

test("validateAxisPolicy rejects invalid fixtures with deterministic messages", () => {
  for (const fixture of createInvalidAxisPolicyFixtures()) {
    const result = validateAxisPolicy(fixture.policy);

    assert.equal(result.ok, false, `${fixture.name}: expected validation failure`);
    assert.ok(result.errors.length > 0, `${fixture.name}: expected at least one validation error`);
  }
});

test("validateAxisPolicy rejects unknown fields", () => {
  const policy = createValidAxisPolicyFixture({
    unrecognized_field: true
  });
  const result = validateAxisPolicy(policy);

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("not allowed")));
});
