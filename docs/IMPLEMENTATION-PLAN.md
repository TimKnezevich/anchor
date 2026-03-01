# Axis v0 (VS Code Plugin) Implementation Plan

Progress tracking:
- Use per-phase TODO files in `docs/todos/` (not a single monolithic checklist).
- Update only the phase file being worked.

## Phase 1: Repo Structure and Architecture Baseline (Week 1)
1. Design and implement a centralized error and logging system shared by server and extension.
2. Create the base project layout for:
   - Axis server code
   - VS Code extension code
   - shared schema/types package
   - tests
3. Document module boundaries and ownership.
4. Lock architecture rules from `docs/ARCHITECTURE.md` into implementation notes.

Deliverables:
- centralized logging/error package and usage guidelines
- directory skeleton committed
- `docs/PROJECT-STRUCTURE.md`
- `docs/IMPLEMENTATION-NOTES.md` with architecture guardrails
- TODO tracker: `docs/todos/phase-01-repo-structure-and-architecture.md`

## Phase 2: Node Model Feature (Week 1-2)
1. Define each node type in plain terms:
   - meaning
   - required fields
   - allowed statuses
2. Define validation rules and JSON schemas for nodes.
3. Add sample node payloads for quick testing.

Deliverables:
- `docs/NODE-MODEL.md`
- node schemas in code
- node schema tests
- TODO tracker: `docs/todos/phase-02-node-model.md`

## Phase 3: Edge Model Feature (Week 2)
1. Define each edge type in plain terms:
   - valid source and target node types
   - required edge fields
   - edge meaning
   - required vs optional
2. Add schema checks for edge validity.
3. Add sample graph fixtures for test use.

Deliverables:
- `docs/EDGE-MODEL.md`
- edge schemas in code
- edge validation tests
- TODO tracker: `docs/todos/phase-03-edge-model.md`

## Phase 4: State Machine and Invariants Feature (Week 2-3)
1. Define `TASK` and `work_session` state transitions.
2. Implement and test:
   - single writer per repo
   - one active `work_session` per task
   - ETag checks
   - idempotent `command_id`
3. Document conflict/error handling behavior.

Deliverables:
- state machine docs and diagrams
- invariant engine in Axis server
- deterministic error responses for lock and ETag conflicts
- TODO tracker: `docs/todos/phase-04-state-machine-and-invariants.md`

## Phase 5: MCP API Feature (Week 3)
1. Define API contract from node/edge/state machine model.
2. Implement core commands:
   - read state
   - write intent/state
   - open/close session
   - attach evidence
   - validate task
3. Add API contract tests.

Deliverables:
- `docs/API-CONTRACT.md`
- MCP server endpoints/handlers
- API integration tests
- TODO tracker: `docs/todos/phase-05-mcp-api.md`

## Phase 6: SPEC and Drift Feature (Week 3-4)
1. Implement clause storage and hash tracking.
2. Link tasks to clause hashes at link time.
3. Mark tasks stale on hash mismatch.

Deliverables:
- working drift detection path
- stale task query support
- tests for drift behavior
- TODO tracker: `docs/todos/phase-06-spec-and-drift.md`

## Phase 7: Axis Server Storage and Runtime Feature (Week 4)
1. Implement storage adapter (SQLite first, Postgres-ready interface).
2. Implement core persistence for nodes, edges, sessions, and evidence.
3. Add migration and seed scripts.

Deliverables:
- runnable Axis server
- storage layer tests
- local dev bootstrap script
- TODO tracker: `docs/todos/phase-07-server-storage-and-runtime.md`

## Phase 8: VS Code Workflow Feature (Week 4-5)
1. Scaffold extension and MCP client.
2. Implement command flows:
   - `Axis: Start Task`
   - `Axis: Confirm Task`
   - `Axis: Show Task State`
3. Enforce 6-step orchestrator loop from extension actions.
4. Show clear conflict/retry messages.

Deliverables:
- working extension commands
- extension-to-MCP integration
- workflow tests
- TODO tracker: `docs/todos/phase-08-vscode-workflow.md`

## Phase 9: Graph Explorer Feature (Week 5)
1. Build Graph Explorer webview.
2. Add filters, details panel, and trace path view.
3. Add live refresh via polling first; event-driven updates later.
4. Highlight stale and conflict states.

Deliverables:
- `Axis: Open Graph Explorer`
- SPEC -> TASK -> CODE_UNIT -> EVIDENCE trace mode
- graph rendering and refresh tests
- TODO tracker: `docs/todos/phase-09-graph-explorer.md`

## Phase 10: Validation and Release Hardening Feature (Week 6)
1. Finalize evidence schema and acceptance mapping checks.
2. Run full integration suite for concurrency and stale behavior.
3. Write operator runbook for common failures.

Deliverables:
- release checklist
- pass/fail report for v0 acceptance tests
- lock/conflict recovery runbook
- TODO tracker: `docs/todos/phase-10-validation-and-release-hardening.md`

## Phase 11: Optional Feature Flags (Week 6+)
1. Vector ranking/suggestion sidecar (read-only influence).
2. Event outbox/stream with monotonic `repo_seq` snapshots.

Deliverables:
- optional services behind feature flags
- proof that authoritative mutation path is unchanged
- TODO tracker: `docs/todos/phase-11-optional-feature-flags.md`

## Phase 12: Extension Packaging and Installability (Week 6+)
1. Add VS Code extension manifest (`extension/package.json`) with command contributions.
2. Add extension activation entrypoint that binds command handlers to VS Code APIs.
3. Add packaging workflow for local `.vsix` build and install.
4. Add smoke test steps for local install and command execution in VS Code.

Deliverables:
- installable `.vsix` package path documented
- extension manifest + activation wiring
- local install guide and smoke test checklist
- TODO tracker: `docs/todos/phase-12-extension-packaging-and-install.md`

## Phase 13: Live MCP Transport Integration (Week 7)
1. Implement real extension transport to local Axis MCP server.
2. Add connection config, health checks, and retry strategy.
3. Replace placeholder transport in VS Code activation with live bridge.
4. Add integration tests for real command execution path.

Deliverables:
- live extension-to-server command flow
- transport config docs and troubleshooting guide
- TODO tracker: `docs/todos/phase-13-live-mcp-transport.md`

## Phase 14: Real Graph Explorer Webview UI (Week 7-8)
1. Build VS Code webview panel for graph explorer models.
2. Render nodes/edges visually with filters and detail pane.
3. Add trace path UX and refresh/diff highlights.
4. Add UI smoke tests for command-to-view behavior.

Deliverables:
- interactive graph webview in VS Code
- graph UI usage guide and known limits
- TODO tracker: `docs/todos/phase-14-graph-webview-ui.md`

## Phase 15: Runtime Deployment and Operations (Week 8)
1. Add server startup scripts and environment profiles.
2. Define local process model (single user) and shared model (team usage).
3. Add runtime health endpoints and structured operational logs.
4. Add backup/restore strategy for storage.

Deliverables:
- runtime operations doc and startup profiles
- deployment smoke checklist
- TODO tracker: `docs/todos/phase-15-runtime-ops.md`

## Phase 16: Publish and Release Automation (Week 8+)
1. Add CI workflow for test/typecheck/lint/package.
2. Add extension release workflow for signed versioned artifacts.
3. Add changelog and versioning process for extension + server.
4. Add post-release verification and rollback checklist.
5. Create extension logo icon set from one source SVG and wire it into release assets.

Deliverables:
- CI release pipeline docs and scripts
- publish checklist and rollback runbook
- source SVG logo + exported icon set for extension/publishing surfaces
- TODO tracker: `docs/todos/phase-16-publish-and-release-automation.md`

## Test Matrix (Must Pass Before v0 Release)
1. Single writer lock is exclusive per repo.
2. One active session per task enforced.
3. Duplicate `command_id` is idempotent.
4. ETag mismatch returns deterministic error.
5. Clause hash drift marks task stale.
6. Task completion blocked without evidence + `acc` validation mapping.
7. Graph Explorer reflects status changes within configured latency budget.
