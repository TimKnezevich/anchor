# Axis

Axis is a deterministic intent engine for AI-driven development, delivered as a VS Code plugin plus an authoritative Axis MCP server.

## What Axis Is
- A spec-first system where clause-based `SPEC` is the source of truth.
- A graph model connecting intent, tasks, code impact, and evidence.
- A strict orchestration loop that prevents requirement drift.

## Core Rules
1. Axis state is authoritative.
2. All mutations occur through MCP.
3. No manual edits to Axis-managed state.
4. Orchestrator loop is mandatory:
   1. read Axis
   2. write intent
   3. re-read Axis
   4. modify code
   5. confirm with evidence + validation
   6. re-read and report
5. Concurrency safety:
   - single writer per repo
   - one active `work_session` per task
   - ETag on writes
   - idempotent `command_id` on writes

## Product Shape
- VS Code extension:
  - command palette workflows
  - Graph Explorer for visual status/navigation
  - evidence capture and validation UX
- Axis MCP server:
  - authoritative graph persistence
  - invariant enforcement
  - drift detection and task/session lifecycle control
- Optional sidecars:
  - vector layer for ranking/suggestions/search (non-authoritative)
  - event layer for derived snapshots (at-least-once delivery)

## Docs
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Canonical SPEC draft: [docs/SPEC-v0.md](docs/SPEC-v0.md)
- Implementation roadmap: [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md)

## Current Status
v0 architecture and implementation plan are defined. Next step is scaffolding the extension and MCP contracts from the docs above.
