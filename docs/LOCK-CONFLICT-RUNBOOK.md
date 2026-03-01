# Lock and Conflict Recovery Runbook

## Error: `TASK_LOCKED` (409)
Meaning:
- Another active session already holds this task.

Recovery:
1. Check active session owner and session ID.
2. Wait for session close or coordinate with owner.
3. Retry `open_work_session`.

## Error: `ETAG_MISMATCH` (409)
Meaning:
- Node version changed since last read.

Recovery:
1. Re-run `read_state` for latest node.
2. Reapply intent against current node state.
3. Retry `write_node` with updated `expected_etag`.

## Error: `REPO_LOCKED` (423)
Meaning:
- Another writer currently holds repo lock.

Recovery:
1. Identify lock owner.
2. Wait for lock release or schedule writer window.
3. Retry command.

## Validation Failures (`VALIDATION_ERROR`)
Meaning:
- Request shape, evidence schema, or acceptance mapping check failed.

Recovery:
1. Check `error.details.errors` in response.
2. Fix payload fields.
3. Retry command with a new `command_id`.

## General Guidance
1. Do not force write or bypass MCP checks.
2. Keep evidence payloads complete and structured.
3. Log correlation IDs for each retry attempt.
