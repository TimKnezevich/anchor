# Project Structure

## Top Level
- `server/`: Axis MCP server implementation.
- `extension/`: VS Code extension implementation.
- `shared/`: Shared code used by server and extension.
- `tests/`: Cross-cutting and integration tests.
- `scripts/`: Local automation scripts (`lint`, `typecheck`, helpers).
- `docs/`: Specs, plans, ADRs, and task trackers.

## Ownership and Intent
- Server code owns authoritative state mutation and invariant checks.
- Extension code owns UX and orchestrator command flow.
- Shared code owns common contracts, errors, logging, and utility code.
- Tests validate behavior at unit and integration levels.

## Current Shared Package Layout
- `shared/observability/src/error-codes.mjs`: Canonical error code list.
- `shared/observability/src/axis-error.mjs`: Shared error shape.
- `shared/observability/src/logger.mjs`: Structured logger.
- `shared/observability/src/error-log-mapper.mjs`: Error severity mapping and safe serialization.
- `shared/observability/src/redaction.mjs`: Sensitive field redaction.
