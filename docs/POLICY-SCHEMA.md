# Axis Policy Schema

This document defines the repository policy file used for Axis enforcement controls.

Path:
- `.axis/policy.json`

## Fields
- `schema_version` (string, required): policy schema version.
- `enforcement_mode` (string, required): `warn` or `enforce`.
- `actor_scope` (string, required): `any` or `allowlist`.
- `allowed_actors` (array of non-empty strings, required): actor IDs allowed when `actor_scope=allowlist`.
- `acknowledgment_ttl_minutes` (positive integer, required): validity window for drift acknowledgments.

## Defaults
```json
{
  "schema_version": "1",
  "enforcement_mode": "enforce",
  "actor_scope": "any",
  "allowed_actors": [],
  "acknowledgment_ttl_minutes": 1440
}
```

## Validation Rules
1. Unknown fields are rejected.
2. `enforcement_mode` must be `warn` or `enforce`.
3. `actor_scope` must be `any` or `allowlist`.
4. `acknowledgment_ttl_minutes` must be a positive integer.
5. If `actor_scope=allowlist`, `allowed_actors` must contain at least one unique actor ID.
