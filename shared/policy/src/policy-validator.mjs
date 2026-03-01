const enforcementModes = new Set(["warn", "enforce"]);
const actorScopes = new Set(["any", "allowlist"]);
const allowedFields = new Set([
  "schema_version",
  "enforcement_mode",
  "actor_scope",
  "allowed_actors",
  "acknowledgment_ttl_minutes"
]);

export const axisPolicyDefaults = Object.freeze({
  schema_version: "1",
  enforcement_mode: "enforce",
  actor_scope: "any",
  allowed_actors: [],
  acknowledgment_ttl_minutes: 1440
});

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

export function normalizeAxisPolicy(policy = {}) {
  const base = isObject(policy) ? policy : {};
  return {
    ...axisPolicyDefaults,
    ...base,
    allowed_actors: Array.isArray(base.allowed_actors)
      ? [...base.allowed_actors]
      : [...axisPolicyDefaults.allowed_actors]
  };
}

export function validateAxisPolicy(policy) {
  const errors = [];

  if (!isObject(policy)) {
    return {
      ok: false,
      errors: ["Axis policy must be an object."]
    };
  }

  for (const fieldName of Object.keys(policy)) {
    if (!allowedFields.has(fieldName)) {
      errors.push(`Field '${fieldName}' is not allowed in axis policy.`);
    }
  }

  if (!isNonEmptyString(policy.schema_version)) {
    errors.push("Field 'schema_version' must be a non-empty string.");
  }

  if (!enforcementModes.has(policy.enforcement_mode)) {
    errors.push("Field 'enforcement_mode' must be one of: warn, enforce.");
  }

  if (!actorScopes.has(policy.actor_scope)) {
    errors.push("Field 'actor_scope' must be one of: any, allowlist.");
  }

  if (!Array.isArray(policy.allowed_actors)) {
    errors.push("Field 'allowed_actors' must be an array.");
  } else {
    const uniqueActors = new Set();
    for (const [index, actor] of policy.allowed_actors.entries()) {
      if (!isNonEmptyString(actor)) {
        errors.push(`allowed_actors[${index}] must be a non-empty string.`);
        continue;
      }

      if (uniqueActors.has(actor)) {
        errors.push(`allowed_actors[${index}] duplicates actor '${actor}'.`);
        continue;
      }

      uniqueActors.add(actor);
    }
  }

  if (!Number.isInteger(policy.acknowledgment_ttl_minutes) || policy.acknowledgment_ttl_minutes <= 0) {
    errors.push("Field 'acknowledgment_ttl_minutes' must be a positive integer.");
  }

  if (policy.actor_scope === "allowlist" && Array.isArray(policy.allowed_actors) && policy.allowed_actors.length === 0) {
    errors.push("Field 'allowed_actors' must include at least one actor when actor_scope is 'allowlist'.");
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
