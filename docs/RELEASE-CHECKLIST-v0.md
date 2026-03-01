# Release Checklist v0

## Code and Docs
- [x] Phase TODO files up to target release are complete.
- [x] ADR log updated for all implementation decisions.
- [x] API contract reflects implemented command set.
- [x] Evidence schema doc matches runtime validator.

## Validation
- [x] `npm run test` passes.
- [x] `npm run typecheck` passes.
- [x] `npm run lint` passes.
- [x] Integration paths for lock/stale/validation are verified.

## Runtime
- [x] `npm run db:migrate` succeeds in target environment.
- [x] `npm run db:seed` succeeds in target environment.
- [x] Storage adapter choice is documented (`memory` or `sqlite`).

## Operational
- [x] Lock/conflict runbook reviewed.
- [x] Release pass/fail report generated and attached.
- [x] Post-release verification checklist documented (`docs/RELEASE-VERIFICATION.md`).
- [x] Rollback procedure documented (`docs/RELEASE-ROLLBACK.md`).
