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

## ADR-0035: Shift Graph Explorer to Browser UI, Add Axis Sidebar, and Auto-Start Runtime for Axis Repos
- Date: 2026-03-01
- Status: accepted
- Context:
  - Existing graph explorer opened inside an editor webview and required manual runtime startup.
  - Product direction calls for a more visible Axis presence in VS Code and a more user-friendly browser-based graph view.
- Decision:
  - Serve Graph Explorer UI from MCP server at `/graph-explorer`.
  - Change `axis.openGraphExplorer` to open the external browser URL instead of in-editor webview.
  - Add an Axis activity bar container/view with key actions.
  - Add best-effort runtime auto-start when opening an Axis-initialized workspace.
  - Surface check-connection feedback as VS Code notifications.
- Consequences:
  - Graph exploration is decoupled from editor tab space and can evolve as a richer web UI.
  - Axis is always visible in activity bar for discoverability.
  - Runtime startup friction is reduced for Axis repos; failures still require operator action.
- Related:
  - `server/mcp/src/graph-explorer-page.mjs`
  - `server/mcp/src/http-server.mjs`
  - `extension/src/vscode-extension.js`
  - `extension/src/vscode-extension.mjs`
  - `extension/src/axis-sidebar-provider.mjs`
  - `extension/src/runtime-autostart.mjs`
  - `extension/src/graph-browser-command.mjs`
  - `extension/src/connection-command.mjs`

## ADR-0036: Match HTTP Routes by URL Pathname to Support Query Strings
- Date: 2026-03-01
- Status: accepted
- Context:
  - Browser Graph Explorer opens `/graph-explorer` with query parameters (for example `repo_id`).
  - HTTP server route checks compared the raw `req.url` string, so query strings caused false `NOT_FOUND` responses.
- Decision:
  - Parse incoming request URL and match server routes using `pathname`.
  - Keep raw request path in logs and error details, and include normalized route path for debugging.
- Consequences:
  - `/graph-explorer?repo_id=...` resolves to the Graph Explorer page instead of returning 404.
  - Route behavior is consistent for all endpoints when optional query parameters are present.
- Related:
  - `server/mcp/src/http-server.mjs`
  - `tests/mcp/http-server.test.mjs`

## ADR-0037: Add Dedicated Phase for AI Edit Enforcement, One-Click Repo Init, and Install Icon Parity
- Date: 2026-03-01
- Status: accepted
- Context:
  - Current workflow and invariants do not yet provide full automation for detecting and governing code diffs not linked to Axis task/session evidence.
  - Repo onboarding lacks an explicit one-click initialization flow from the VS Code plugin window.
  - Installation and extension UI icon parity must be verified against generated Axis brand assets.
- Decision:
  - Add Phase 17 to deliver full AI edit-governance automation, including warning/acknowledge-ignore/rollback controls, hook+CI enforcement, and auditability.
  - Add a one-click `Axis: Initialize Repository` flow that creates required Axis root artifacts in the repo.
  - Add explicit install icon parity tasks and tests so install surfaces remain aligned to generated Axis icon assets.
- Consequences:
  - Enforcement work is tracked as a first-class phase with a dedicated TODO file and test scope.
  - End-user onboarding becomes explicit and repeatable instead of relying on marker-file inference.
  - Release/install UX gains deterministic icon consistency checks.
- Related:
  - `docs/IMPLEMENTATION-PLAN.md`
  - `docs/todos/phase-17-ai-enforcement-and-init.md`
  - `extension/src/axis-sidebar-provider.mjs`
  - `docs/EXTENSION-INSTALL.md`
  - `docs/ICON-SPEC.md`

## ADR-0038: Define Axis Policy Schema with Defaults and Deterministic Validation
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 17 enforcement work needs a single repo-level policy source for actor scope, enforcement mode, and acknowledgment TTL.
  - Validation must be deterministic so hook, CLI, and CI checks can produce the same failures.
- Decision:
  - Define `.axis/policy.json` schema with fields:
    - `schema_version`
    - `enforcement_mode` (`warn` | `enforce`)
    - `actor_scope` (`any` | `allowlist`)
    - `allowed_actors`
    - `acknowledgment_ttl_minutes`
  - Provide shared defaults and a shared validator in `shared/policy`.
  - Reject unknown fields and invalid enum/value combinations.
- Consequences:
  - Enforcement components can normalize policy consistently before evaluation.
  - Validation failures become reproducible across local and CI execution paths.
- Related:
  - `shared/policy/src/policy-validator.mjs`
  - `tests/policy/axis-policy-schema.test.mjs`
  - `docs/POLICY-SCHEMA.md`

## ADR-0039: Define Enforcement Evidence and Acknowledgment Record Schemas Under .axis
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 17 enforcement needs structured metadata for linking diffs to task/session evidence and for storing approved temporary exceptions.
  - Local hooks and CI checks need deterministic parsing and validation for these records.
- Decision:
  - Define evidence link records under `.axis/evidence/*.json` with required linkage fields:
    `task_id`, `work_session_id`, `actor`, `files`, plus identity/timestamp fields.
  - Define acknowledgment records under `.axis/acknowledgments/*.json` with required approval fields:
    `reason`, `approved_by`, `expires_at`, and linkage fields.
  - Implement shared validators that reject unknown fields and enforce timestamp ordering/unique file lists.
- Consequences:
  - Enforcement automation can use one validator path for CLI, hook, and CI behavior.
  - Acknowledgment expiry behavior is deterministic and auditable.
- Related:
  - `shared/policy/src/evidence-ack-validator.mjs`
  - `tests/policy/axis-evidence-ack-schema.test.mjs`
  - `docs/ENFORCEMENT-RECORD-SCHEMA.md`

## ADR-0040: Add initialize_workspace MCP Command for Deterministic Repo Bootstrap State
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 17 requires an explicit, one-step initialization path that can be invoked from extension UX.
  - Initialization status must be queryable and idempotent for repeated command execution.
- Decision:
  - Add MCP command `initialize_workspace`.
  - Command stores repo initialization status and returns deterministic artifact paths for bootstrap outputs.
  - Command is idempotent under `command_id` replay and returns existing initialization with `created: false` for subsequent non-replay calls.
  - Unknown payload fields are rejected with `VALIDATION_ERROR`.
- Consequences:
  - Extension-side one-click initialize can depend on a stable API contract.
  - Repeated initialization attempts remain safe and predictable.
- Related:
  - `server/mcp/src/request-validator.mjs`
  - `server/mcp/src/mcp-service.mjs`
  - `server/mcp/src/in-memory-store.mjs`
  - `tests/mcp/initialize-workspace-command.test.mjs`
  - `docs/API-CONTRACT.md`

## ADR-0041: Add One-Click Initialize Repository Command in Extension Sidebar with Guided Notifications
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 17 requires one-click repo initialization from the plugin window.
  - Initialization responses should guide operators to the next action after success or failure.
- Decision:
  - Add extension command `axis.initializeRepository` and include it in command contributions and activation events.
  - Add sidebar entry "Initialize Repository" as a one-click action.
  - Implement a dedicated VS Code command adapter that shows actionable notifications on success/failure.
- Consequences:
  - Initialization is directly discoverable in the Axis sidebar.
  - Operators receive deterministic success/failure guidance without reading logs.
- Related:
  - `extension/src/initialize-repository-command.mjs`
  - `extension/src/axis-sidebar-provider.mjs`
  - `extension/src/vscode-extension.mjs`
  - `extension/package.json`
  - `tests/extension/initialize-repository-command.test.mjs`

## ADR-0042: Add Initialization Status Resolver and Sidebar Status Row
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 17 requires initialization status visibility in the plugin window.
  - Operators need deterministic status messaging for initialized, uninitialized, and runtime-unreachable states.
- Decision:
  - Add initialization status resolver that checks workspace Axis markers and runtime health.
  - Add top-row status item in Axis sidebar with refresh support.
  - Run status resolution during extension activation and log the resolved state.
  - Allow initialize command flow to refresh sidebar status on success/failure.
- Consequences:
  - Initialization state becomes visible without manual command execution.
  - Startup path surfaces runtime-connectivity issues earlier.
- Related:
  - `extension/src/initialization-status-provider.mjs`
  - `extension/src/axis-sidebar-provider.mjs`
  - `extension/src/vscode-extension.mjs`
  - `tests/extension/initialization-status-provider.test.mjs`

## ADR-0043: Add axis-validate-diff Script with Deterministic pass/warn/fail Exit Codes
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 17 requires automated detection of changed files that are not linked to active Axis evidence metadata.
  - Local hooks and CI require deterministic machine-readable outcomes.
- Decision:
  - Add `scripts/axis-validate-diff.mjs` to collect staged/working changed files via git diff.
  - Validate `.axis/policy.json` and latest/selected evidence link record from `.axis/evidence`.
  - Emit deterministic statuses and exit codes:
    - `pass` -> `0`
    - `warn` -> `10`
    - `fail` -> `20`
- Consequences:
  - Enforcement behavior is scriptable and can be reused by hooks and CI.
  - Missing/invalid policy or evidence metadata deterministically fails validation.
- Related:
  - `scripts/axis-validate-diff.mjs`
  - `tests/scripts/axis-validate-diff.test.mjs`
  - `docs/todos/phase-17-ai-enforcement-and-init.md`

## ADR-0044: Add Acknowledgment CLI and Expiry-Aware Diff Validation
- Date: 2026-03-01
- Status: accepted
- Context:
  - Enforcement flow needs an explicit way to acknowledge temporary unlinked drift with reason and expiry.
  - Diff validation must distinguish active acknowledgments from expired records.
- Decision:
  - Add acknowledgment utility module and CLI:
    - `scripts/axis-acknowledgment-lib.mjs`
    - `scripts/axis-acknowledge.mjs`
  - Add acknowledgment record creation with policy-derived TTL defaults.
  - Extend `axis-validate-diff` to account for active acknowledgments and ignore expired acknowledgments.
- Consequences:
  - Teams can allow time-bound, auditable exceptions without disabling enforcement globally.
  - Drift checks remain strict after acknowledgment expiration.
- Related:
  - `scripts/axis-acknowledgment-lib.mjs`
  - `scripts/axis-acknowledge.mjs`
  - `scripts/axis-validate-diff.mjs`
  - `tests/scripts/axis-acknowledgment-flow.test.mjs`

## ADR-0045: Add Unlinked Drift Rollback Script with Preview and Apply Modes
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 17 requires a rollback option for unlinked diffs after warning/validation failures.
  - Operators need a non-destructive preview before applying rollback.
- Decision:
  - Add `scripts/axis-rollback-unlinked.mjs` with:
    - preview mode (default) listing rollback candidates
    - apply mode (`--apply`) using `git restore --staged --worktree` for unlinked files
  - Reuse `axis-validate-diff` evaluation to determine rollback candidate files.
- Consequences:
  - Teams can quickly recover from drift while preserving a reviewable preview-first workflow.
  - Rollback behavior stays deterministic and scriptable for future command wrappers.
- Related:
  - `scripts/axis-rollback-unlinked.mjs`
  - `scripts/axis-validate-diff.mjs`
  - `tests/scripts/axis-rollback-unlinked.test.mjs`

## ADR-0046: Add Local Git Hook Enforcement and Installer for Diff + Commit Metadata Checks
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 17 requires local enforcement of unlinked diff detection and commit metadata linkage.
  - Hook setup should be scriptable and repeatable per clone.
- Decision:
  - Add `.githooks/pre-commit` to run `axis-validate-diff` in staged mode.
  - Add `.githooks/commit-msg` to enforce `axis_task` and `axis_session` metadata via a validator script.
  - Add `scripts/install-git-hooks.mjs` to configure `core.hooksPath` to `.githooks`.
- Consequences:
  - Local commits are validated against Axis drift and linkage metadata by default once hooks are installed.
  - Hook setup is deterministic and can be re-applied automatically in bootstrap scripts.
- Related:
  - `.githooks/pre-commit`
  - `.githooks/commit-msg`
  - `scripts/axis-validate-commit-msg.mjs`
  - `scripts/install-git-hooks.mjs`
  - `tests/scripts/git-hooks-enforcement.test.mjs`

## ADR-0047: Add CI Enforcement Gate with Drift Report Artifact and Branch Protection Guidance
- Date: 2026-03-01
- Status: accepted
- Context:
  - Local hooks can be bypassed, so enforcement needs an upstream CI gate.
  - CI failures need a machine-readable artifact to support remediation.
- Decision:
  - Add CI workflow steps to run `axis-validate-diff` in strict mode against `origin/main...HEAD`.
  - Upload a JSON enforcement report artifact for both pass/fail runs.
  - Add explicit branch/PR gate documentation for required CI status checks.
- Consequences:
  - Unlinked or expired-ack drift cannot merge if CI gating is configured as required.
  - Operators can inspect the uploaded enforcement report to identify failing files/issues.
- Related:
  - `.github/workflows/ci.yml`
  - `scripts/axis-validate-diff.mjs`
  - `docs/CI-ENFORCEMENT.md`
  - `tests/scripts/ci-enforcement-workflow.test.mjs`

## ADR-0048: Standardize Enforcement Error Codes and Shared Guidance Mapper
- Date: 2026-03-01
- Status: accepted
- Context:
  - Enforcement tooling now spans CLI and extension surfaces.
  - User guidance must stay consistent across these surfaces for the same failure codes.
- Decision:
  - Define deterministic enforcement error codes in a shared observability mapper.
  - Provide code-to-guidance mapping with stable status classifications.
  - Use shared mapper in both:
    - CLI (`axis-validate-diff`)
    - extension conflict/user messaging fallback
- Consequences:
  - Operators receive consistent remediation text regardless of interface.
  - New enforcement failure classes can be added in one shared location.
- Related:
  - `shared/observability/src/enforcement-message-mapper.mjs`
  - `scripts/axis-validate-diff.mjs`
  - `extension/src/conflict-messages.mjs`
  - `tests/observability/enforcement-error-mapper.test.mjs`
  - `docs/ENFORCEMENT-ERRORS.md`

## ADR-0049: Add Structured Enforcement Audit Log Across Diff/Ack/Rollback Flows
- Date: 2026-03-01
- Status: accepted
- Context:
  - Enforcement actions require auditability for operations and post-incident review.
  - Events need consistent correlation fields to connect validation, acknowledgments, and rollback actions.
- Decision:
  - Add shared audit log writer/reader targeting `.axis/audit.log`.
  - Emit structured events from:
    - diff validation (`diff_validation`)
    - acknowledgment creation (`acknowledgment_created`)
    - rollback preview/apply (`rollback_preview`, `rollback_applied`)
  - Include correlation fields in each event:
    - `repo_id`, `task_id`, `work_session_id`, `actor`
- Consequences:
  - Enforcement lifecycle actions are traceable from a single local audit stream.
  - Future UI/reporting features can read audit records without custom parsers per command.
- Related:
  - `shared/observability/src/enforcement-audit-log.mjs`
  - `scripts/axis-validate-diff.mjs`
  - `scripts/axis-acknowledgment-lib.mjs`
  - `scripts/axis-rollback-unlinked.mjs`
  - `tests/observability/enforcement-audit-log.test.mjs`

## ADR-0050: Enforce Icon Asset Wiring and Add Fallback Generation Gate for Packaging/Release
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 17 requires extension install and sidebar icon paths to remain aligned with generated brand assets.
  - Packaging/release must not fail silently when icon files are missing.
- Decision:
  - Add icon asset guard script `scripts/ensure-icon-assets.mjs` that regenerates icons when missing.
  - Run icon asset guard in extension packaging and release dry-run flows.
  - Add tests for:
    - manifest/activity icon path wiring
    - package media inclusion
    - release dry-run icon parity gate presence
- Consequences:
  - Icon regressions are caught before extension/package artifacts are produced.
  - Missing icon files are recovered automatically in local packaging path.
- Related:
  - `scripts/ensure-icon-assets.mjs`
  - `scripts/package-extension.mjs`
  - `scripts/release-dry-run.mjs`
  - `tests/extension/icon-asset-wiring.test.mjs`
  - `tests/scripts/icon-parity-release.test.mjs`

## ADR-0051: Shift Extension Command Surface to Monitor-First Ordering
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 17 targets monitor-first user experience where initialize/check/graph actions are primary.
  - Manual task-driving commands should remain available but not foregrounded in sidebar UX.
- Decision:
  - Reorder command contributions in extension manifest to prioritize:
    - initialize repository
    - check connection
    - open graph explorer
    - show task state
  - Move manual task-driving commands to advanced trailing positions.
  - Remove `startTask` from sidebar shortcuts and replace with `showTaskState`.
  - Update initialize command guidance text and extension README flow ordering.
- Consequences:
  - Default user workflow aligns with monitoring and observability goals.
  - Manual task commands remain available via command palette for advanced workflows.
- Related:
  - `extension/package.json`
  - `extension/src/axis-sidebar-provider.mjs`
  - `extension/src/initialize-repository-command.mjs`
  - `extension/README.md`
  - `tests/extension/monitor-first-command-surface.test.mjs`

## ADR-0052: Add End-to-End Integration Coverage for Enforcement Lifecycle
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 17 behavior spans MCP initialization, diff validation, acknowledgment, rollback, and CI strict checks.
  - Unit tests alone do not confirm lifecycle behavior across these components.
- Decision:
  - Add integration test harness `tests/integration/axis-enforcement-lifecycle.test.mjs` covering:
    - initialize workspace command path
    - edit drift detection in warn/enforce modes
    - acknowledgment flow and expiry effect
    - rollback flow for unlinked staged changes
    - CI-style strict diff evaluation using commit range
- Consequences:
  - Enforcement flow regressions are detected in one consolidated lifecycle test.
  - Task-level acceptance for Phase 17 can rely on concrete end-to-end evidence.
- Related:
  - `tests/integration/axis-enforcement-lifecycle.test.mjs`
  - `scripts/axis-validate-diff.mjs`
  - `scripts/axis-acknowledgment-lib.mjs`
  - `scripts/axis-rollback-unlinked.mjs`
  - `server/mcp/src/mcp-service.mjs`

## ADR-0053: Document Monitor-First Setup and Enforcement Remediation Runbook
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 17 requires explicit operator documentation for initialization-first setup and enforcement remediation steps.
  - Architecture/spec docs need clear cross-references for new enforcement surfaces.
- Decision:
  - Update extension install guide with monitor-first setup and enforcement command flow.
  - Add dedicated enforcement runbook for warning, acknowledgment, rollback, CI gate, and audit log operations.
  - Add architecture/spec references for initialization and drift enforcement artifacts.
- Consequences:
  - Setup and remediation path is documented end-to-end.
  - Future contributors can trace enforcement behavior from spec/architecture to operational runbooks.
- Related:
  - `docs/EXTENSION-INSTALL.md`
  - `docs/ENFORCEMENT-RUNBOOK.md`
  - `docs/ARCHITECTURE.md`
  - `docs/SPEC-v0.md`
  - `tests/scripts/phase-17-doc-links.test.mjs`

## ADR-0054: Remove Manual Task Commands from Extension Surface for MCP-Driven Monitor-Only Workflow
- Date: 2026-03-01
- Status: accepted
- Context:
  - Product workflow is MCP-driven and monitor-only for end users.
  - Manual task commands in extension surface (`startTask`, `confirmTask`, `showTaskState`) conflict with this model.
- Decision:
  - Remove manual task command contributions and activation events from extension manifest.
  - Remove manual task command IDs/handlers from extension command registry and workflow controller.
  - Keep only monitor/init user commands:
    - `axis.initializeRepository`
    - `axis.checkConnection`
    - `axis.openGraphExplorer`
  - Remove legacy task command shortcuts from sidebar and related docs/tests.
- Consequences:
  - Extension UI now aligns with monitor-only workflow.
  - Legacy task command code paths are deleted rather than hidden.
- Related:
  - `extension/package.json`
  - `extension/src/extension.mjs`
  - `extension/src/workflow-controller.mjs`
  - `extension/src/axis-sidebar-provider.mjs`
  - `docs/EXTENSION-INSTALL.md`
