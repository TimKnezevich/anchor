# Optional Layers and Feature Flags

Axis optional layers are non-authoritative and must not mutate core graph state.

## Feature Flags
- `AXIS_ENABLE_VECTOR_SIDECAR`
  - `true`: include read-only ranking suggestions in `read_state`.
  - `false` (default): no vector suggestions.
- `AXIS_ENABLE_EVENT_SIDECAR`
  - `true`: publish snapshot events to outbox with monotonic `repo_seq`.
  - `false` (default): no event sidecar activity.

## Vector Sidecar
- Role: ranking/suggestion helper only.
- No mutation rights on nodes, edges, sessions, clauses, or evidence.
- Output: deterministic ranked suggestions with rationale.

## Event Sidecar
- Role: derived event outbox for observability.
- Event payloads are snapshots from command responses.
- Delivery model: at-least-once via outbox processing.
- Ordering: monotonic `repo_seq` per repository.

## MCP Integration Rules
1. Sidecars are behind feature flags.
2. Sidecar failures must not block authoritative command handling.
3. Sidecar outputs are additive metadata only.
