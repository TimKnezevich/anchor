# Release Rollback

## Trigger Conditions
- Critical runtime regression after deploy.
- Extension install/activation failure in target environment.
- API behavior drift that blocks core commands.

## Rollback Procedure
1. Stop rollout and freeze new deployments.
2. Revert to previous stable git tag.
3. Rebuild prior artifacts from the stable tag.
4. Re-deploy runtime and re-install previous extension package.
5. Verify runtime health endpoints:
   - `/health`
   - `/health/live`
   - `/health/ready`
6. Verify extension command smoke tests.
7. Open incident record with root cause and preventive action.

## Validation Checklist
- Runtime starts and serves MCP requests.
- `Axis: Check Connection` succeeds.
- Graph Explorer opens and renders.
- No new critical errors in structured logs.

## Follow-up
- Mark failed release in changelog as withdrawn or superseded.
- Add ADR entry if rollback changes release policy.
