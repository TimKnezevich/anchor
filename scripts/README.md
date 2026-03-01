# Scripts

Local development automation scripts live here.

## Runtime Scripts
- `run-mcp-server.mjs`: start runtime using current environment or defaults.
- `run-mcp-server-local.mjs`: force local profile defaults.
- `run-mcp-server-shared.mjs`: force shared profile defaults.

## Release Scripts
- `generate-icon-set.mjs`: generate extension PNG icon set from `assets/brand/axis-mark.svg`.
- `update-changelog.mjs`: add a release section to `CHANGELOG.md`.
- `release-dry-run.mjs`: validate release prerequisites and optionally run full release checks.
- `sign-artifacts.mjs`: generate SHA-256 checksums for release artifacts in `dist/`.
