# Runtime Operations

## Runtime Profiles

### Local Profile
- Command: `npm run runtime:start:local`
- Defaults:
  - `AXIS_RUNTIME_PROFILE=local`
  - `AXIS_MCP_HOST=127.0.0.1`
  - `AXIS_MCP_PORT=4317`
  - `AXIS_STORAGE_ADAPTER=memory`
  - `AXIS_LOG_LEVEL=debug`
- Use for single-developer local testing.

### Shared Profile
- Command: `npm run runtime:start:shared`
- Defaults:
  - `AXIS_RUNTIME_PROFILE=shared`
  - `AXIS_MCP_HOST=0.0.0.0`
  - `AXIS_MCP_PORT=4317`
  - `AXIS_STORAGE_ADAPTER=sqlite`
  - `AXIS_LOG_LEVEL=info`
- Use for team/devbox use where other clients connect to the runtime.

## Environment Variables
- `AXIS_RUNTIME_PROFILE`: `local` or `shared`.
- `AXIS_MCP_HOST`: bind host.
- `AXIS_MCP_PORT`: bind port.
- `AXIS_MCP_PATH`: MCP command endpoint path (default `/mcp`).
- `AXIS_MCP_HEALTH_PATH`: base health endpoint (default `/health`).
- `AXIS_MCP_LIVE_PATH`: liveness endpoint (default `/health/live`).
- `AXIS_MCP_READY_PATH`: readiness endpoint (default `/health/ready`).
- `AXIS_STORAGE_ADAPTER`: `memory` or `sqlite`.
- `AXIS_ENABLE_VECTOR_SIDECAR`: `true|false`.
- `AXIS_ENABLE_EVENT_SIDECAR`: `true|false`.

## Health Endpoints
- `GET /health`: runtime summary and configured paths.
- `GET /health/live`: process liveness.
- `GET /health/ready`: service readiness with storage/sidecar state.

## Operational Logging Standard
All runtime logs are structured JSON with:
- `timestamp`
- `level`
- `service`
- `message`
- `context`

Required context fields for runtime request logs:
- `method`
- `path`
- `status`
- `correlation_id`
- `duration_ms`

Correlation standard:
- Clients should send `x-correlation-id` header.
- If missing, server logs `correlation_id: null`.

## Backup and Restore

### SQLite (recommended for shared profile)
Backup:
1. Stop runtime.
2. Copy DB file: `cp "$AXIS_SQLITE_PATH" "$AXIS_SQLITE_PATH.bak.$(date +%Y%m%d%H%M%S)"`.

Restore:
1. Stop runtime.
2. Replace DB with a backup copy.
3. Start runtime and check `GET /health/ready`.

### Memory Adapter
- No persistence. Restart clears state.
- Use only for local development.

## Runtime Smoke Procedure
1. Start runtime profile (`local` or `shared`).
2. Check `GET /health` returns `200` and `ok: true`.
3. Check `GET /health/live` returns `200` and `live: true`.
4. Check `GET /health/ready` returns `200` and `ready: true`.
5. Stop runtime with `Ctrl+C` and confirm clean shutdown log.

## Incident Runbook

### Port Already In Use (`EADDRINUSE`)
1. Identify process on port.
2. Stop conflicting process or choose a new `AXIS_MCP_PORT`.
3. Restart runtime.

### Permission Error Binding Port (`EPERM`)
1. Use non-privileged port (`>=1024`).
2. Confirm container/sandbox allows binding.

### Readiness Failing
1. Confirm storage adapter config.
2. If using SQLite, verify DB path and file permissions.
3. Check recent runtime logs for request and startup errors.

### Extension Cannot Connect
1. Verify extension transport config matches runtime host/port/path.
2. Run `Axis: Check Connection` command.
3. Confirm `x-correlation-id` appears in server logs for the request.
