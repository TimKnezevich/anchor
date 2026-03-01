# Post-Release Verification

## Runtime Verification
1. Runtime process is up for target profile.
2. `GET /health` returns `ok: true`.
3. `GET /health/live` returns `live: true`.
4. `GET /health/ready` returns `ready: true`.

## Extension Verification
1. Install latest VSIX artifact.
2. Run `Axis: Check Connection` and confirm success.
3. Run `Axis: Start Task` and `Axis: Show Task State`.
4. Open Graph Explorer and verify data renders.

## Artifact Verification
1. Confirm artifact names in release match expected contract.
2. Verify `dist/checksums.txt` matches uploaded artifacts.
3. Confirm release notes/changelog section exists for version.

## Observability Verification
1. Request completion logs include `method`, `path`, `status`, `correlation_id`, `duration_ms`.
2. No startup errors or repeated health failures in logs.
