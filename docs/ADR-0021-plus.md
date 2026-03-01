# ADR Log (Active)

This file records new architecture and development decisions for Axis.

Historical entries `ADR-0001` through `ADR-0020` are in `docs/ADR.md`.

## How to Use This File
- Add a new entry at the bottom for each decision.
- Keep entries short and plain.
- If a choice affects behavior, data model, API shape, workflow, or validation, log it.
- When in doubt, log it.

## Entry Template
```md
## ADR-XXXX: Short Title
- Date: YYYY-MM-DD
- Status: proposed | accepted | superseded
- Context:
  - Why this decision is needed.
- Decision:
  - What we decided.
- Consequences:
  - What this changes now.
  - Tradeoffs or follow-up work.
- Related:
  - docs/FILE.md
```

## ADR-0021: Start a New Active ADR File
- Date: 2026-03-01
- Status: accepted
- Context:
  - `docs/ADR.md` exceeded the preferred file-size guideline.
  - We need to keep capturing decisions without repeatedly loading a very large file.
- Decision:
  - Start `docs/ADR-0021-plus.md` as the active ADR file.
  - Keep `docs/ADR.md` as historical archive for ADR-0001 through ADR-0020.
  - Route all new ADR entries to this new file.
- Consequences:
  - Ongoing decision logging stays lighter and easier to maintain.
  - Contributors must check both files when reviewing full decision history.
- Related:
  - `AGENTS.md`
  - `docs/ADR.md`

## ADR-0022: Add Phase 12 for VS Code Packaging and Local Install
- Date: 2026-03-01
- Status: accepted
- Context:
  - Core extension logic exists, but it is not yet installable as a VS Code extension package.
  - Local trial requires manifest, activation wiring, and `.vsix` packaging steps.
- Decision:
  - Add a dedicated Phase 12 focused on extension packaging and installability.
  - Track packaging tasks in a separate phase TODO file.
- Consequences:
  - Clear path to actual manual installation and smoke testing in VS Code.
  - One more implementation phase before calling extension delivery complete.
- Related:
  - `docs/IMPLEMENTATION-PLAN.md`
  - `docs/todos/phase-12-extension-packaging-and-install.md`

## ADR-0023: Package Extension with Dedicated Manifest and VS Code Activation Bridge
- Date: 2026-03-01
- Status: accepted
- Context:
  - Extension logic existed but could not be installed as a real VS Code extension package.
  - Packaging requires manifest metadata, activation hooks, and local install workflow.
- Decision:
  - Add `extension/package.json` with command contributions and activation events.
  - Add `extension/src/vscode-extension.mjs` as VS Code runtime entrypoint with command registration bridge.
  - Add `npm run extension:package` workflow via `scripts/package-extension.mjs`.
  - Add install and smoke-test guide for local `.vsix` usage.
- Consequences:
  - Project now has a concrete packaging path for VS Code install testing.
  - Runtime still uses placeholder MCP transport until a live bridge is configured.
- Related:
  - `extension/package.json`
  - `extension/src/vscode-extension.mjs`
  - `scripts/package-extension.mjs`
  - `docs/EXTENSION-INSTALL.md`

## ADR-0024: Make Extension Packaging Non-Interactive and Ensure Dist Output Path Exists
- Date: 2026-03-01
- Status: accepted
- Context:
  - Packaging failed when `dist/` did not exist.
  - `vsce` prompts can block unattended packaging runs.
- Decision:
  - Ensure `dist/` is created before running `vsce package`.
  - Use explicit `vsce` allow flags to avoid interactive prompts for missing repository/license files.
  - Restrict packaged extension contents via `files` in extension manifest.
- Consequences:
  - `npm run extension:package` is more reliable and script-friendly.
  - License/repository metadata warnings are acknowledged explicitly.
- Related:
  - `scripts/package-extension.mjs`
  - `extension/package.json`

## ADR-0025: Require Local vsce Install for Deterministic Packaging
- Date: 2026-03-01
- Status: accepted
- Context:
  - `npx` packaging depends on live registry access and can fail in offline/intermittent network conditions.
  - Packaging failures should clearly indicate missing prerequisites.
- Decision:
  - Package via local `extension/node_modules/.bin/vsce` binary.
  - Fail fast with an explicit instruction to run `npm --prefix extension install` when the binary is missing.
- Consequences:
  - Packaging behavior is deterministic once dependencies are installed.
  - Initial setup requires one explicit install step in the `extension` directory.
- Related:
  - `scripts/package-extension.mjs`
  - `docs/EXTENSION-INSTALL.md`

## ADR-0026: Remove Unsupported vsce Flags and Use License File for Compatibility
- Date: 2026-03-01
- Status: accepted
- Context:
  - Installed `vsce` version rejected `--allow-missing-license`.
  - Packaging should work with current toolchain without version-specific flags.
- Decision:
  - Remove `--allow-missing-license` and `--allow-missing-repository` flags from packaging commands.
  - Add `extension/LICENSE` to satisfy package expectations directly.
- Consequences:
  - Packaging works across more `vsce` versions.
  - License intent is explicit in extension package contents.
- Related:
  - `scripts/package-extension.mjs`
  - `extension/package.json`
  - `extension/LICENSE`

## ADR-0027: Package Extension with vsce --no-dependencies for Stable Local Build
- Date: 2026-03-01
- Status: accepted
- Context:
  - `vsce package` dependency scanning path produced a false entrypoint error in this environment.
  - Direct packaging with `--no-dependencies` succeeded and produced a valid VSIX.
- Decision:
  - Use `--no-dependencies` in extension packaging commands.
- Consequences:
  - Packaging is stable for local install workflow.
  - Dependency bundling checks are skipped in package step and should be reviewed separately if needed.
- Related:
  - `scripts/package-extension.mjs`
  - `extension/package.json`

## ADR-0028: Add Post-v0 Phases for Live Runtime Integration and Release Automation
- Date: 2026-03-01
- Status: accepted
- Context:
  - Foundation and installability phases are complete, but live runtime integration is still incomplete.
  - We need an explicit roadmap for transport wiring, real webview UI, operations, and automated release.
- Decision:
  - Add Phase 13 through Phase 16:
    - Live MCP transport integration
    - Real graph webview UI
    - Runtime operations
    - Publish/release automation
  - Create one dedicated TODO tracker file for each new phase.
- Consequences:
  - Work can continue with clear milestones beyond foundation build.
  - Scope and priority are explicit for production readiness path.
- Related:
  - `docs/IMPLEMENTATION-PLAN.md`
  - `docs/todos/phase-13-live-mcp-transport.md`
  - `docs/todos/phase-14-graph-webview-ui.md`
  - `docs/todos/phase-15-runtime-ops.md`
  - `docs/todos/phase-16-publish-and-release-automation.md`

## ADR-0029: Use HTTP MCP Transport with Startup Health Check and Retry Policy
- Date: 2026-03-01
- Status: accepted
- Context:
  - The extension was installable but still used a placeholder in-process transport.
  - We need real request/response behavior against a running Axis MCP server.
- Decision:
  - Add transport config resolution from defaults + environment variables.
  - Implement HTTP MCP transport with timeout and retry/backoff for transient failures.
  - Add `Axis: Check Connection` command and run startup health check in VS Code activation.
  - Add a scriptable local HTTP MCP server runtime entrypoint.
- Consequences:
  - Extension commands can run against a live local server without code edits.
  - Transport failures are surfaced with deterministic user-facing error classes.
  - Tests that bind local sockets may need skip behavior in restricted runtimes.
- Related:
  - `extension/src/http-mcp-transport.mjs`
  - `extension/src/transport-config.mjs`
  - `extension/src/vscode-extension.mjs`
  - `extension/src/workflow-controller.mjs`
  - `server/mcp/src/http-server.mjs`
  - `scripts/run-mcp-server.mjs`
  - `docs/todos/phase-13-live-mcp-transport.md`

## ADR-0030: Build Icon Set from a Single SVG Source in Release Phase
- Date: 2026-03-01
- Status: accepted
- Context:
  - The extension needs a recognizable icon set for install and publishing surfaces.
  - We want one source asset to avoid icon drift across sizes.
- Decision:
  - Add icon/logo generation as a tracked task in Phase 16.
  - Use one source SVG for an `A` mark built from straight node/edge lines in a half-star shape.
  - Export required PNG sizes from that source for extension and marketplace/repo use.
- Consequences:
  - Branding work is explicitly planned and versioned with release automation.
  - Icon updates become deterministic and repeatable from one source file.
- Related:
  - `docs/IMPLEMENTATION-PLAN.md`
  - `docs/todos/phase-16-publish-and-release-automation.md`
  - `docs/ICON-SPEC.md`

## ADR-0031: Use a Dedicated Graph Explorer Webview Command Adapter
- Date: 2026-03-01
- Status: accepted
- Context:
  - `axis.openGraphExplorer` needs to open a VS Code webview and render graph payloads, while other commands stay simple request handlers.
  - The existing generic command bridge should remain lightweight for non-UI commands.
- Decision:
  - Add a dedicated graph webview command adapter that wraps `axis.openGraphExplorer`.
  - Keep generic command registration for all other commands and allow skipping specific command IDs.
  - Render a deterministic HTML view from graph model payloads (summary, nodes, edges, details, trace) with error fallback rendering.
- Consequences:
  - Graph Explorer has a concrete UI entrypoint without overloading the generic command bridge.
  - UI behavior is testable with isolated webview unit tests.
- Related:
  - `extension/src/graph-webview-command.mjs`
  - `extension/src/graph-webview-panel.mjs`
  - `extension/src/vscode-bridge.mjs`
  - `extension/src/vscode-extension.js`
  - `extension/src/vscode-extension.mjs`
  - `tests/extension/graph-webview-command.test.mjs`
  - `tests/extension/graph-webview-panel.test.mjs`

## ADR-0032: Keep Graph Explorer UI State in Webview Manager and Recompute via MCP Reads
- Date: 2026-03-01
- Status: accepted
- Context:
  - Graph explorer now supports interactive filters, node selection, and trace mode from the webview UI.
  - We need deterministic refresh behavior and changed-node/edge highlighting.
- Decision:
  - Store UI state (`filters`, `selectedNodeId`, `traceFromSpecId`) in the webview panel manager.
  - On each UI action, trigger a fresh MCP-backed graph read through the existing graph controller.
  - Render changed-node/edge indicators from controller diff output in the webview HTML.
- Consequences:
  - UI actions always reflect authoritative server state.
  - Diff highlights are tied to refresh cycles and controller snapshots.
  - HTML renderer remains server-driven and easier to test in unit tests.
- Related:
  - `extension/src/graph-webview-panel.mjs`
  - `extension/src/graph-explorer-controller.mjs`
  - `docs/todos/phase-14-graph-webview-ui.md`
  - `docs/EXTENSION-INSTALL.md`

## ADR-0033: Introduce Runtime Profiles and Expanded Health Surface for Operations
- Date: 2026-03-01
- Status: accepted
- Context:
  - Runtime operations needed explicit local/shared startup profiles, better health visibility, and consistent request-level logs.
  - Existing runtime startup path did not expose liveness/readiness endpoints or profile defaults in one place.
- Decision:
  - Add runtime profile resolver (`local` and `shared`) with validated environment mapping.
  - Add startup scripts for base/local/shared runtime execution.
  - Expand HTTP health surface to include `/health/live` and `/health/ready`.
  - Emit structured per-request completion logs with correlation id and duration.
  - Document backup/restore and incident runbook in a dedicated runtime ops doc.
- Consequences:
  - Runtime startup behavior is deterministic and profile-driven.
  - Operators have explicit liveness/readiness probes and log standards.
  - Shared profile defaults to `sqlite`; local profile defaults to `memory`.
- Related:
  - `server/mcp/src/runtime-profile.mjs`
  - `server/mcp/src/http-server.mjs`
  - `scripts/run-mcp-server.mjs`
  - `scripts/run-mcp-server-local.mjs`
  - `scripts/run-mcp-server-shared.mjs`
  - `docs/RUNTIME-OPS.md`
  - `docs/todos/phase-15-runtime-ops.md`

## ADR-0034: Automate Release Pipeline with CI Workflows, Dry-Run Checks, and Deterministic Icon Assets
- Date: 2026-03-01
- Status: accepted
- Context:
  - Release process needed formal CI stages, version/changelog handling, artifact integrity checks, and repeatable icon generation.
  - Manual release steps were not yet codified in automation.
- Decision:
  - Add CI and release workflows under `.github/workflows`.
  - Add release dry-run validation script and artifact checksum signing script.
  - Add changelog update script and versioning documentation.
  - Generate extension icon set from one source SVG using a deterministic local script.
  - Wire extension manifest icon to generated `media/icon-128.png`.
- Consequences:
  - Release requirements are executable and testable.
  - Artifact set includes integrity checksums.
  - Icon assets are reproducible from source geometry and avoid per-size manual edits.
- Related:
  - `.github/workflows/ci.yml`
  - `.github/workflows/release.yml`
  - `scripts/release-dry-run.mjs`
  - `scripts/sign-artifacts.mjs`
  - `scripts/update-changelog.mjs`
  - `scripts/generate-icon-set.mjs`
  - `assets/brand/axis-mark.svg`
  - `extension/media/icon-128.png`
  - `docs/VERSIONING.md`
  - `docs/RELEASE-VERIFICATION.md`
  - `docs/RELEASE-ROLLBACK.md`
  - `docs/todos/phase-16-publish-and-release-automation.md`
