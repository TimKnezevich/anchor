# Enforcement Record Schemas

This document defines schema contracts for enforcement metadata under `.axis/`.

Paths:
- `.axis/evidence/*.json`
- `.axis/acknowledgments/*.json`

## Axis Evidence Link Record
Required fields:
- `schema_version` (string)
- `evidence_id` (string)
- `task_id` (string)
- `work_session_id` (string)
- `actor` (string)
- `files` (non-empty array of unique file path strings)
- `recorded_at` (ISO timestamp string)

Validation rules:
1. Unknown fields are rejected.
2. `files` must be non-empty and unique.
3. `recorded_at` must be a valid ISO timestamp.

## Axis Acknowledgment Record
Required fields:
- `schema_version` (string)
- `ack_id` (string)
- `task_id` (string)
- `work_session_id` (string)
- `actor` (string)
- `files` (non-empty array of unique file path strings)
- `reason` (string)
- `approved_by` (string)
- `created_at` (ISO timestamp string)
- `expires_at` (ISO timestamp string; must be after `created_at`)

Validation rules:
1. Unknown fields are rejected.
2. `files` must be non-empty and unique.
3. `created_at` and `expires_at` must be valid ISO timestamps.
4. `expires_at` must be after `created_at`.
