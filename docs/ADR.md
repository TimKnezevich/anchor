# ADR Log

Active ADR file for new entries: `docs/ADR-0021-plus.md`.
This file remains as historical archive for ADR-0001 through ADR-0020.

This file records architecture and development decisions for Axis.

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

## ADR-0001: Keep a Single ADR Log and Update It Liberally
- Date: 2026-03-01
- Status: accepted
- Context:
  - Project work is moving fast and decisions can be made during implementation details.
  - Unlogged decisions create confusion and rework.
- Decision:
  - Use `docs/ADR.md` as the central decision log.
  - Agents must update this file whenever they make a development decision.
  - \"Decision\" is interpreted broadly and includes technical and workflow-level choices.
- Consequences:
  - Better traceability for why behavior changed.
  - Slight overhead on each change, but lower ambiguity later.
- Related:
  - `AGENTS.md`
  - `docs/ARCHITECTURE.md`
  - `docs/SPEC-v0.md`

## ADR-0002: Organize Delivery Plan by Discrete Features
- Date: 2026-03-01
- Status: accepted
- Context:
  - Implementation phases should be easy to execute in logical chunks.
  - Broad foundations (repo structure and architecture) must come before detailed runtime work.
- Decision:
  - Rewrite the implementation plan so phases are grouped by major discrete features.
  - Start with broad foundation features, then move to model, API, runtime, extension workflow, and UI features.
  - Keep phase language plain and direct.
- Consequences:
  - Planning and execution are easier to track and assign.
  - More phases in the plan, but each phase has a clearer scope.
- Related:
  - `docs/IMPLEMENTATION-PLAN.md`

## ADR-0003: Track Work with Per-Phase TODO Files
- Date: 2026-03-01
- Status: accepted
- Context:
  - A single checklist across all phases forces repeated context loading of old tasks.
  - Work should be tracked in smaller phase-scoped units.
- Decision:
  - Use one TODO file per phase under `docs/todos/`.
  - Do not use a monolithic all-phase checklist.
  - Update only the active phase tracker during implementation.
- Consequences:
  - Lower context overhead while implementing.
  - Progress history is split and easier to scan by phase.
- Related:
  - `docs/IMPLEMENTATION-PLAN.md`
  - `docs/todos/README.md`

## ADR-0004: Require Testable Task Breakdown Per Phase
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase TODOs should be executable in small, verifiable units.
  - Large tasks without clear tests are harder to validate and track.
- Decision:
  - Before starting a phase, split its TODO list into small tasks.
  - Each task must be small enough for one test to verify in one step.
  - If needed, split large tasks into sub-tasks.
  - Sub-tasks may be completed without tests.
  - Every task must have an associated test.
  - Every task and sub-task must be checked off when done.
  - After completing a task and its test, run tests plus typecheck and lint.
- Consequences:
  - Better step-by-step verification and progress tracking.
  - More upfront planning work in each phase file.
- Related:
  - `AGENTS.md`
  - `docs/todos/README.md`

## ADR-0005: Use a Comprehensive Root .gitignore Baseline
- Date: 2026-03-01
- Status: accepted
- Context:
  - The project will include a VS Code extension, server code, tests, and local tooling.
  - We need to avoid committing generated files, caches, local secrets, and editor noise.
- Decision:
  - Add a thorough root `.gitignore` with standard entries for OS/editor files, Node/TypeScript outputs, VS Code extension artifacts, test outputs, local env/secrets, and common tooling caches.
- Consequences:
  - Cleaner diffs and fewer accidental commits of local/generated files.
  - May require occasional allow-listing if a generated file should be committed.
- Related:
  - `.gitignore`
  - `AGENTS.md`

## ADR-0006: Require Thorough Error Handling and Logging in All New Code
- Date: 2026-03-01
- Status: accepted
- Context:
  - This project coordinates stateful workflows where silent failures cause drift and hard-to-debug behavior.
  - Consistent logging and error handling is needed across server and extension layers.
- Decision:
  - Require thorough error handling and logging at all levels for all new code.
  - This includes API handlers, core logic, storage adapters, extension commands, and background workflows.
- Consequences:
  - Better operational visibility and easier debugging.
  - Slightly more implementation overhead per feature.
- Related:
  - `AGENTS.md`
  - `docs/ARCHITECTURE.md`

## ADR-0007: Build Centralized Error and Logging System Early in Phase 1
- Date: 2026-03-01
- Status: accepted
- Context:
  - Error handling and logging quality is a hard rule for all new code.
  - Waiting until later phases would cause rework and inconsistent patterns.
- Decision:
  - Move centralized error/logging system development to the start of Phase 1.
  - Define shared error and logging conventions before broader implementation.
- Consequences:
  - Early consistency across server and extension layers.
  - Slightly more upfront setup work in Phase 1.
- Related:
  - `docs/IMPLEMENTATION-PLAN.md`
  - `docs/todos/phase-01-repo-structure-and-architecture.md`
  - `AGENTS.md`

## ADR-0008: Enforce Language-Appropriate Naming Conventions
- Date: 2026-03-01
- Status: accepted
- Context:
  - Mixed or inconsistent naming styles make code harder to read and maintain.
  - This repo will contain multiple code types that use different naming standards.
- Decision:
  - Require naming to follow conventions of the target language/file type.
  - Use styles like `snake_case`, `camelCase`, `PascalCase`, and `kebab-case` where they are standard.
  - Do not mix naming styles arbitrarily.
- Consequences:
  - Better readability and consistency across the codebase.
  - Slightly stricter review expectations for naming.
- Related:
  - `AGENTS.md`

## ADR-0009: Enforce File Structure Conventions and File Size Limits
- Date: 2026-03-01
- Status: accepted
- Context:
  - Consistent project structure improves maintainability across mixed code types.
  - Very large files are harder to review, test, and modify safely.
- Decision:
  - Follow standard file/folder structure conventions for the language/framework when they exist.
  - Aim to keep files under 400 lines.
  - For files between 400 and 1000 lines, perform a split/refactor evaluation and flag it to the developer.
  - Allow refactoring between tasks to satisfy structure and size constraints.
- Consequences:
  - Better maintainability and easier reviews.
  - Additional refactor work may be introduced during implementation phases.
- Related:
  - `AGENTS.md`

## ADR-0010: Start with a Dependency-Free Observability Baseline
- Date: 2026-03-01
- Status: accepted
- Context:
  - We need early centralized error/logging support in Phase 1.
  - TypeScript and ESLint are not installed yet in the current environment.
- Decision:
  - Implement a shared observability baseline using Node built-ins only.
  - Provide root `test`, `typecheck`, and `lint` scripts that run without external dependencies.
  - Add shared `AxisError`, error codes, structured logger, redaction, and error-to-log mapping in `shared/observability`.
- Consequences:
  - Phase 1 can proceed immediately without dependency setup blockers.
  - Tooling internals can later be swapped to TypeScript/ESLint while keeping command names stable.
- Related:
  - `package.json`
  - `scripts/typecheck.mjs`
  - `scripts/lint.mjs`
  - `shared/observability/src/index.mjs`

## ADR-0011: Use Shared-Field + Type-Specific Validation for Node Schemas
- Date: 2026-03-01
- Status: accepted
- Context:
  - Node model needs consistent validation across all core node types.
  - Some fields are common to all nodes, while others depend on node type.
- Decision:
  - Define one shared required field set for all nodes.
  - Define per-type required fields and allowed status values.
  - Validate nodes using shared checks first, then type-specific checks.
  - Use `created_at` and `updated_at` for timestamp fields in node payloads.
- Consequences:
  - Predictable schema behavior and easier extension for future node types.
  - Additional maintenance when required fields change for a type.
- Related:
  - `docs/NODE-MODEL.md`
  - `shared/models/nodes/src/node-validators.mjs`
  - `shared/models/nodes/src/node-status.mjs`

## ADR-0012: Use Typed Edge Endpoints with Required/Optional Edge Policy
- Date: 2026-03-01
- Status: accepted
- Context:
  - Graph relations need clear source/target constraints and priority.
  - Some relations are mandatory for workflow traceability and others are optional.
- Decision:
  - Define edge types with explicit allowed source/target node types.
  - Validate edges in two stages: shared field checks, then endpoint checks.
  - Maintain a separate required/optional edge policy map.
  - Use shared edge fields (`id`, `type`, endpoints, revision/etag/meta, timestamps) across all edges.
- Consequences:
  - Safer graph writes and predictable relation semantics.
  - Policy and endpoint maps must be kept in sync as edge types evolve.
- Related:
  - `docs/EDGE-MODEL.md`
  - `shared/models/edges/src/edge-endpoints.mjs`
  - `shared/models/edges/src/edge-policy.mjs`
  - `shared/models/edges/src/edge-validators.mjs`

## ADR-0013: Implement State Machines and Invariants as Shared Validators + Server Engine
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 4 requires explicit transition rules and runtime invariants.
  - We need deterministic conflict behavior for lock and ETag failures.
- Decision:
  - Define `TASK` and `work_session` transitions in docs and code validators.
  - Implement invariant runtime behavior in a dedicated server `InvariantEngine`.
  - Enforce single repo writer lock, one active session per task, ETag checks, and idempotent command replay.
  - Normalize failures to deterministic error responses with stable HTTP-like status mapping.
- Consequences:
  - Transition and invariant rules are testable in isolation.
  - Storage-backed persistence can later replace in-memory maps without changing behavior contracts.
- Related:
  - `docs/STATE-MACHINES.md`
  - `shared/workflow/state-machines/src/index.mjs`
  - `server/invariants/src/invariant-engine.mjs`
  - `server/invariants/src/error-response.mjs`

## ADR-0014: Implement MCP v0 as Envelope-Validated Commands Backed by Invariant Engine
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 5 needs concrete API contracts and executable handlers.
  - Invariant enforcement from Phase 4 must be applied consistently to writes and sessions.
- Decision:
  - Use a common request envelope (`command`, `command_id`, `repo_id`, `actor`, `payload`) for all commands.
  - Validate envelope shape before command dispatch.
  - Implement handlers for `read_state`, `write_node`, `open_work_session`, `close_work_session`, `attach_evidence`, and `validate_task`.
  - Back mutating behavior with invariant checks (repo lock, task lock, ETag, idempotent command replay).
  - Return deterministic error envelopes through shared error mapping.
- Consequences:
  - API behavior is consistent and testable with a single command dispatcher.
  - Current implementation uses in-memory storage and will need storage adapter integration later.
- Related:
  - `docs/API-CONTRACT.md`
  - `server/mcp/src/mcp-service.mjs`
  - `server/mcp/src/request-validator.mjs`
  - `tests/mcp/mcp-service.test.mjs`

## ADR-0015: Implement SPEC Drift via Link-Time Clause Hash Tracking
- Date: 2026-03-01
- Status: accepted
- Context:
  - Tasks must become stale when linked SPEC clauses change.
  - Drift detection requires deterministic hashing and link-time hash capture.
- Decision:
  - Normalize clause payload (`id`, `kind`, normalized `text`, `revision`) and compute SHA-256 hash.
  - Store clause hashes with clauses and capture `clause_hash_at_link_time` when linking task->clause.
  - Mark task state `stale` when current clause hash differs from link-time hash.
  - Expose stale task list through MCP `read_state`.
  - Require `validate_task.acc_clause_ids` to reference existing `acc` kind clauses.
- Consequences:
  - Drift behavior is deterministic and testable.
  - Clause updates can invalidate active tasks, requiring re-planning workflow.
- Related:
  - `shared/spec/src/clause-hash.mjs`
  - `server/spec/src/spec-service.mjs`
  - `server/mcp/src/mcp-service.mjs`
  - `tests/spec/spec-service.test.mjs`

## ADR-0016: Use Database-Agnostic Storage Adapter Surface with Memory Default and SQLite Path
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 7 requires storage/runtime progress while keeping future Postgres support open.
  - Current environment does not include a SQLite driver binary/package by default.
- Decision:
  - Define a database-agnostic storage adapter interface for nodes, edges, sessions, evidence, clauses, links, and validations.
  - Implement a working in-memory adapter as the default local runtime path.
  - Implement a SQLite adapter with explicit dependency/runtime checks and clear failure messages when the driver is unavailable.
  - Add SQL migration files and seed scripts independent of the adapter selection.
- Consequences:
  - Runtime remains usable immediately with memory adapter.
  - SQLite path is ready structurally but requires driver wiring in environment setup.
- Related:
  - `server/storage/src/storage-adapter.mjs`
  - `server/storage/src/memory-storage-adapter.mjs`
  - `server/storage/src/sqlite-storage-adapter.mjs`
  - `server/storage/migrations/001_initial_schema.sql`

## ADR-0017: Implement Extension Workflow as Command Registry + MCP Client + Loop Guard
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 8 requires extension command flows with deterministic orchestration behavior.
  - Command flows need consistent error messaging for lock/ETag conflicts.
- Decision:
  - Implement extension activation with explicit command registry entries for start/confirm/show flows.
  - Use `AxisMcpClient` as the typed command-envelope wrapper over MCP transport.
  - Enforce the 6-step orchestrator sequence in `confirmTask` using a dedicated loop guard.
  - Normalize conflict retry text with shared extension-side message mapping.
- Consequences:
  - Extension workflow logic is isolated and testable without VS Code runtime boot.
  - Additional adapter glue will be needed when wiring real VS Code command APIs and UI messaging.
- Related:
  - `extension/src/extension.mjs`
  - `extension/src/workflow-controller.mjs`
  - `extension/src/axis-mcp-client.mjs`
  - `tests/extension/workflow-controller.test.mjs`

## ADR-0018: Implement Graph Explorer as View-Model + Controller with Polling Diff
- Date: 2026-03-01
- Status: accepted
- Context:
  - Phase 9 requires graph navigation, filtering, trace mode, and live update behavior.
  - We need deterministic logic that is testable without VS Code webview runtime.
- Decision:
  - Implement graph rendering logic as pure view-model builders over `read_state` data.
  - Implement Graph Explorer runtime behavior in a dedicated controller with refresh and polling hooks.
  - Expose stale/conflict/changed highlighting metadata in node/edge view models.
  - Register `axis.openGraphExplorer` command in extension activation.
- Consequences:
  - Core graph behavior is unit-testable and UI-framework agnostic.
  - A webview UI layer still needs to bind to these models in later integration work.
- Related:
  - `extension/src/graph-explorer-model.mjs`
  - `extension/src/graph-explorer-controller.mjs`
  - `extension/src/extension.mjs`
  - `tests/extension/graph-explorer.test.mjs`

## ADR-0019: Finalize Evidence Schema and Enforce It in MCP Attach Flow
- Date: 2026-03-01
- Status: accepted
- Context:
  - Evidence quality directly affects deterministic validation and auditability.
  - Minimal evidence fields were too weak for reliable acceptance checks.
- Decision:
  - Define a finalized evidence schema with required fields:
    - `id`
    - `artifacts`
    - `touched_files`
    - `command_results`
    - `validation_assertions`
  - Enforce schema validation in MCP `attach_evidence`.
  - Keep `validate_task` acceptance mapping strict: clause IDs must exist and be kind `acc`.
  - Publish runbook, release checklist, and acceptance report artifacts for v0 hardening.
- Consequences:
  - Better evidence quality and clearer validation failures.
  - Callers must supply complete evidence payloads.
- Related:
  - `docs/EVIDENCE-SCHEMA.md`
  - `shared/evidence/src/evidence-validator.mjs`
  - `server/mcp/src/mcp-service.mjs`
  - `docs/LOCK-CONFLICT-RUNBOOK.md`

## ADR-0020: Implement Optional Sidecars Behind Feature Flags with Non-Authoritative Guarantees
- Date: 2026-03-01
- Status: accepted
- Context:
  - Vector and event layers are optional and must not become authoritative.
  - We need predictable enable/disable behavior per environment.
- Decision:
  - Add feature flags for vector and event sidecars with defaults disabled.
  - Implement vector sidecar as read-only ranking/suggestion metadata for `read_state`.
  - Implement event sidecar as snapshot outbox with monotonic `repo_seq` per repository.
  - Integrate sidecar hooks in MCP as additive behavior only; no node/edge/session mutation authority.
- Consequences:
  - Optional capabilities can be enabled incrementally without changing core state semantics.
  - Additional operational setup may be needed for event outbox delivery workers later.
- Related:
  - `server/optional/src/feature-flags.mjs`
  - `server/optional/src/vector-sidecar.mjs`
  - `server/optional/src/event-sidecar.mjs`
  - `server/mcp/src/mcp-service.mjs`
