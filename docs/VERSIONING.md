# Versioning and Release Flow

## Scope
Axis releases track two version surfaces:
- Root project runtime/tooling release (server + shared code)
- VS Code extension package release (`extension/package.json`)

## Version Rules
- Use semantic versioning: `MAJOR.MINOR.PATCH`.
- `MAJOR`: incompatible contract/runtime changes.
- `MINOR`: backward-compatible features.
- `PATCH`: backward-compatible fixes.

## Release Steps
1. Update extension version in `extension/package.json`.
2. Update changelog entry:
   - `npm run changelog:update -- <version> <YYYY-MM-DD>`
3. Run release dry-run:
   - `npm run release:dry-run`
4. Build extension artifact:
   - `npm run extension:package`
5. Generate artifact checksums:
   - `npm run release:sign`
6. Create git tag `v<version>` and push.
7. Run release workflow to publish artifacts.

## Artifact Contract
Required release artifacts:
- `dist/axis-vscode-extension.vsix`
- `dist/checksums.txt`

## Compatibility Notes
- Extension versions should be aligned with runtime compatibility boundaries documented in ADR and API contract changes.
- If API-breaking changes occur, bump `MAJOR` and call out migration notes in changelog.
