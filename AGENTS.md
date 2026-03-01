# AGENTS.md

## Purpose
This file tells coding agents how to work in this repo.

## Project Summary
- Axis is a deterministic intent engine for AI-driven development.
- Product shape:
  - VS Code extension for workflow and graph UI.
  - Axis MCP server as authoritative state and invariant enforcement.

## Source of Truth
- Canonical spec: `docs/SPEC-v0.md`
- Architecture reference: `docs/ARCHITECTURE.md`
- Build order: `docs/IMPLEMENTATION-PLAN.md`
- Decision logs:
  - Active: `docs/ADR-0021-plus.md`
  - Historical: `docs/ADR.md` (ADR-0001 through ADR-0020)
- Root summary: `README.md`

If docs conflict, resolve in this order:
1. `docs/SPEC-v0.md`
2. `docs/ARCHITECTURE.md`
3. `docs/IMPLEMENTATION-PLAN.md`
4. `docs/ADR-0021-plus.md`
5. `docs/ADR.md`
6. `README.md`

## Hard Rules
1. Keep language plain and technical. Avoid marketing wording.
2. Design nodes and edges before endpoint or UI expansion.
3. Do not introduce flows that bypass MCP for Axis state mutations.
4. Preserve these invariants:
   - single writer per repo
   - exactly one active `work_session` per task
   - ETag required for writes
   - idempotent `command_id` required for writes
5. Keep vector and event layers non-authoritative.
6. Any code developed must include thorough error handling and logging at all levels (API, domain logic, storage, extension UI flow, and background jobs).
7. Follow naming conventions that match the language/file type being edited (for example: `snake_case`, `camelCase`, `PascalCase`, `kebab-case` as appropriate). Do not mix styles arbitrarily.
8. Follow standard file/folder structure conventions for the code type or framework when such conventions exist.
9. Keep files under 400 lines when practical.
10. If a file is between 400 and 1000 lines, evaluate how to split it and flag that evaluation to the developer.
11. Refactoring between tasks is allowed when needed to keep file structure and file size within these rules.

## Working Style for Agents
1. For new features, update docs first when behavior changes:
   - node or relation changes -> update `NODE-MODEL.md` / `EDGE-MODEL.md` (when created)
   - invariant changes -> update `SPEC-v0.md`
   - workflow changes -> update `ARCHITECTURE.md`
   - development decisions -> append entry to `docs/ADR-0021-plus.md`
2. Prefer small, reviewable commits and patches.
3. Add tests for:
   - lock behavior
   - ETag mismatch handling
   - idempotency behavior
   - stale task detection
4. Do not remove or weaken acceptance checks tied to `acc` clauses.

## Phase Task Breakdown and Test Rules
1. Before implementing a new phase, break that phase TODO file into the smallest practical tasks.
2. A task should be small enough that one test can verify it in one step.
3. If a task is too large for one test, split it into sub-tasks.
4. Sub-tasks do not need the same rules as tasks:
   - sub-tasks may be implemented without tests
5. Every task must have at least one associated test.
6. Every task and every sub-task must be checked off when completed.
7. After completing any task and its associated test, run:
   - relevant test commands
   - typecheck
   - lint
8. Treat agent-written tests as part of the required test run for that task.

## ADR Requirement
1. Any agent making a development decision must update `docs/ADR-0021-plus.md` in the same change.
2. Interpret \"decision\" broadly:
   - schema choice
   - API shape
   - naming conventions
   - state machine transitions
   - validation behavior
   - UI behavior that changes workflow
3. If uncertain whether something counts as a decision, log it anyway.

## Implementation Priorities
1. Node and edge definitions
2. State machines (`TASK`, `work_session`)
3. MCP contracts
4. Axis server basics
5. VS Code extension commands
6. Graph Explorer
7. Optional vector/event layers

## Non-Goals (v0)
- No unconstrained multi-writer support.
- No exactly-once event guarantee.
- No direct/manual mutation path for Axis-managed state.
