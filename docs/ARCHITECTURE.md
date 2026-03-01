# Axis v0 for VS Code: Architecture Spec

## Purpose
Axis v0 is a deterministic intent engine used by a VS Code extension to coordinate AI-driven development. Axis state is authoritative; extension state is a cache/UI concern only.

## Product Shape
- VS Code extension provides commands, visual graph navigation, and operator feedback.
- Axis server (MCP) enforces invariants and persistence.
- Optional vector/event sidecars augment discovery and observability but never mutate authoritative state.

## Hard Invariants
1. All mutations go through MCP.
2. No manual edits to Axis-managed state artifacts.
3. Orchestrator loop is mandatory:
   1. read Axis
   2. write intent
   3. re-read Axis
   4. modify code
   5. confirm with evidence + validation
   6. re-read + report
4. Single writer per repo.
5. Exactly one active `work_session` per task.
6. Writes require ETag and idempotent `command_id`.

## Components
### 1) VS Code Extension
- `extension.ts`: activation and command registration.
- `axisClient.ts`: typed MCP client.
- `orchestratorLoop.ts`: enforces 6-step sequence client-side.
- `sessionManager.ts`: open/close/heartbeat work sessions.
- `evidenceCollector.ts`: touched files, command output, test summaries.
- `graphViewProvider.ts`: Graph Explorer webview.

### 2) Axis MCP Server
- Authoritative graph + invariants.
- State machine transitions for task/session.
- Drift detection and stale marking.
- Evidence persistence and acceptance validation.

### 3) Storage
- Postgres recommended for team/shared mode.
- SQLite permitted for local single-user dev mode.

### 4) Optional Sidecars
- Vector service: ranking/suggestions/search only.
- Event outbox/stream: snapshot events, at-least-once delivery.

## Graph Explorer (VS Code)
Purpose: Inspect graph topology and changing status in real time.

### Required UX
- Canvas graph by node/edge type.
- Details pane with selected node status, hashes, revisions, links.
- Filters: node type, task status, stale/conflicted only, ID search.
- Trace mode: `SPEC -> TASK -> CODE_UNIT -> EVIDENCE`.
- Highlight stale links (hash drift).

### Update Model
- Preferred: subscribe to event stream and patch incrementally.
- Fallback: poll `read_state` every 1-2s and diff client-side.
- Visual pulse for changed nodes/edges.

## Node Model
Core types:
- `SPEC`, `TASK`, `CODE_UNIT`, `ADR`, `POLICY`, `CONTRACT`, `EVIDENCE`, `IDEA`, `DRAFT`, optional `EPIC`.

Shared fields:
- `id`, `type`, `revision`, `etag`, `meta.*`, `created_at`, `updated_at`.

## Error Semantics
- `409 TASK_LOCKED`
- `409 ETAG_MISMATCH`
- `423 REPO_LOCKED`

Extension behavior:
- Never force write by default.
- Prompt operator with safe retry path.
- Keep failed operation evidence for audit.

## Security and Integrity
- Extension must not bypass MCP.
- All write commands include actor identity + `command_id`.
- Axis server logs invariant failures as structured events.

## MVP Exit Criteria
1. Extension can run tasks through full 6-step loop.
2. Graph Explorer reflects live node status.
3. Stale task detection visible and actionable.
4. Concurrency errors are reproducible and handled in UI.
5. Evidence-backed acceptance validation gates task completion.
