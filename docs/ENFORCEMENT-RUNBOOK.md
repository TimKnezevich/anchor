# Enforcement Runbook

This runbook covers warning, acknowledgment, and rollback handling for Axis diff enforcement.

## Prerequisites
1. Initialize repository from extension (`Axis: Initialize Repository`) or MCP command.
2. Install local git hooks:
   - `node ./scripts/install-git-hooks.mjs`
3. Ensure policy and evidence files exist:
   - `.axis/policy.json`
   - `.axis/evidence/*.json`

## Detect Drift
Run staged drift check:
```bash
node ./scripts/axis-validate-diff.mjs --staged-only
```

Common outcomes:
- `PASS`: no unlinked drift.
- `WARN`: unlinked drift exists in warn mode.
- `FAIL`: unlinked drift or invalid enforcement metadata.

## Acknowledge Drift (Temporary)
Use when drift is intentional and time-bound:
```bash
node ./scripts/axis-acknowledge.mjs \
  --task-id task-1 \
  --work-session-id ws-1 \
  --actor codex \
  --files file1.ts,file2.ts \
  --reason "temporary drift while refactoring" \
  --approved-by lead-dev \
  --ttl-minutes 60
```

Re-run validation after acknowledgment:
```bash
node ./scripts/axis-validate-diff.mjs --staged-only
```

## Roll Back Unlinked Drift
Preview rollback targets:
```bash
node ./scripts/axis-rollback-unlinked.mjs
```

Apply rollback:
```bash
node ./scripts/axis-rollback-unlinked.mjs --apply
```

## CI Gate Behavior
CI runs strict enforcement against `origin/main...HEAD` and uploads:
- artifact: `axis-ci-enforcement-report`

See:
- `docs/CI-ENFORCEMENT.md`

## Audit Trail
Enforcement lifecycle events are written to:
- `.axis/audit.log`

Event types include:
- `diff_validation`
- `acknowledgment_created`
- `rollback_preview`
- `rollback_applied`
