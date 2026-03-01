import { axisPolicyDefaults } from "../../shared/policy/src/index.mjs";

export function createValidAxisPolicyFixture(overrides = {}) {
  return {
    ...axisPolicyDefaults,
    actor_scope: "allowlist",
    allowed_actors: ["codex", "copilot"],
    ...overrides
  };
}

export function createInvalidAxisPolicyFixtures() {
  return [
    {
      name: "invalid actor scope",
      policy: createValidAxisPolicyFixture({ actor_scope: "team" })
    },
    {
      name: "allowlist with no actors",
      policy: createValidAxisPolicyFixture({ allowed_actors: [] })
    },
    {
      name: "invalid ttl",
      policy: createValidAxisPolicyFixture({ acknowledgment_ttl_minutes: 0 })
    }
  ];
}
