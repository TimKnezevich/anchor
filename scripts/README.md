# Scripts

Local development automation scripts live here.

## Runtime Scripts
- `run-mcp-server.mjs`: start runtime using current environment or defaults.
- `run-mcp-server-local.mjs`: force local profile defaults.
- `run-mcp-server-shared.mjs`: force shared profile defaults.

## Release Scripts
- `generate-icon-set.mjs`: generate extension PNG icon set from `assets/brand/axis-mark.svg`.
- `ensure-icon-assets.mjs`: verify generated icon assets exist and regenerate if missing.
- `update-changelog.mjs`: add a release section to `CHANGELOG.md`.
- `release-dry-run.mjs`: validate release prerequisites and optionally run full release checks.
- `sign-artifacts.mjs`: generate SHA-256 checksums for release artifacts in `dist/`.

## Enforcement Scripts
- `axis-validate-diff.mjs`: validate changed files against `.axis/evidence` linkage and policy mode.
- `axis-acknowledge.mjs`: create acknowledgment records under `.axis/acknowledgments`.
- `axis-rollback-unlinked.mjs`: preview or rollback unlinked changed files using git restore.
- `axis-validate-commit-msg.mjs`: enforce `axis_task` and `axis_session` metadata in commit messages.
- `install-git-hooks.mjs`: set `core.hooksPath` to `.githooks` for local enforcement.

Enforcement scripts emit structured audit events to `.axis/audit.log`.
