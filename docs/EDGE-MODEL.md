# Edge Model

This document defines Axis graph edge types in plain terms.

## Shared Fields (all edge types)
- `id` (string): stable edge identifier.
- `type` (string): one of the supported edge types.
- `source_id` (string): source node ID.
- `source_type` (string): source node type.
- `target_id` (string): target node ID.
- `target_type` (string): target node type.
- `revision` (integer >= 1): revision counter.
- `etag` (string): concurrency token.
- `meta` (object): namespaced metadata (`meta.*`).
- `created_at` (ISO string): creation timestamp.
- `updated_at` (ISO string): update timestamp.

## Edge Types

### SPEC_DEFINES_TASK
- Meaning: links a SPEC to a TASK that implements a clause.
- Source -> Target: `SPEC` -> `TASK`
- Policy: `required`
- Example:
```json
{
  "id": "edge.spec.axis.v0.task.node-model",
  "type": "SPEC_DEFINES_TASK",
  "source_id": "spec.axis.v0.core",
  "source_type": "SPEC",
  "target_id": "task.phase2.node-model",
  "target_type": "TASK",
  "revision": 1,
  "etag": "etag-edge-001",
  "meta": {},
  "created_at": "2026-03-01T14:00:00Z",
  "updated_at": "2026-03-01T14:00:00Z"
}
```

### TASK_TOUCHES_CODE_UNIT
- Meaning: links a task to module-level code it touched.
- Source -> Target: `TASK` -> `CODE_UNIT`
- Policy: `optional`
- Example:
```json
{
  "id": "edge.task.node-model.codeunit.nodes",
  "type": "TASK_TOUCHES_CODE_UNIT",
  "source_id": "task.phase2.node-model",
  "source_type": "TASK",
  "target_id": "codeunit.shared.models.nodes",
  "target_type": "CODE_UNIT",
  "revision": 1,
  "etag": "etag-edge-002",
  "meta": { "touches_count": 3 },
  "created_at": "2026-03-01T14:05:00Z",
  "updated_at": "2026-03-01T14:05:00Z"
}
```

### TASK_PRODUCES_EVIDENCE
- Meaning: links task execution to its evidence records.
- Source -> Target: `TASK` -> `EVIDENCE`
- Policy: `required`
- Example:
```json
{
  "id": "edge.task.node-model.evidence.1",
  "type": "TASK_PRODUCES_EVIDENCE",
  "source_id": "task.phase2.node-model",
  "source_type": "TASK",
  "target_id": "evidence.task.phase2.node-model.1",
  "target_type": "EVIDENCE",
  "revision": 1,
  "etag": "etag-edge-003",
  "meta": {},
  "created_at": "2026-03-01T14:10:00Z",
  "updated_at": "2026-03-01T14:10:00Z"
}
```

### TASK_HAS_WORK_SESSION
- Meaning: links a task to its session tracking node in v0.
- Source -> Target: `TASK` -> `TASK`
- Policy: `required`
- Example:
```json
{
  "id": "edge.task.session.link",
  "type": "TASK_HAS_WORK_SESSION",
  "source_id": "task.phase2.node-model",
  "source_type": "TASK",
  "target_id": "task.phase2.node-model.session",
  "target_type": "TASK",
  "revision": 1,
  "etag": "etag-edge-004",
  "meta": { "session_key": "ws-123" },
  "created_at": "2026-03-01T14:15:00Z",
  "updated_at": "2026-03-01T14:15:00Z"
}
```

### TASK_TRACKED_BY_EPIC
- Meaning: groups a task under an epic.
- Source -> Target: `EPIC` -> `TASK`
- Policy: `optional`
- Example:
```json
{
  "id": "edge.epic.phase2.task.node-model",
  "type": "TASK_TRACKED_BY_EPIC",
  "source_id": "epic.phase2.models",
  "source_type": "EPIC",
  "target_id": "task.phase2.node-model",
  "target_type": "TASK",
  "revision": 1,
  "etag": "etag-edge-005",
  "meta": {},
  "created_at": "2026-03-01T14:20:00Z",
  "updated_at": "2026-03-01T14:20:00Z"
}
```

### ADR_GOVERNS_POLICY
- Meaning: links architectural decisions to policies.
- Source -> Target: `ADR` -> `POLICY`
- Policy: `optional`
- Example:
```json
{
  "id": "edge.adr.logging.policy",
  "type": "ADR_GOVERNS_POLICY",
  "source_id": "adr-0010",
  "source_type": "ADR",
  "target_id": "policy.mcp.only",
  "target_type": "POLICY",
  "revision": 1,
  "etag": "etag-edge-006",
  "meta": {},
  "created_at": "2026-03-01T14:25:00Z",
  "updated_at": "2026-03-01T14:25:00Z"
}
```

### POLICY_GOVERNS_CONTRACT
- Meaning: links policies to contracts they constrain.
- Source -> Target: `POLICY` -> `CONTRACT`
- Policy: `optional`
- Example:
```json
{
  "id": "edge.policy.contract.mcp",
  "type": "POLICY_GOVERNS_CONTRACT",
  "source_id": "policy.mcp.only",
  "source_type": "POLICY",
  "target_id": "contract.mcp.api.v0",
  "target_type": "CONTRACT",
  "revision": 1,
  "etag": "etag-edge-007",
  "meta": {},
  "created_at": "2026-03-01T14:30:00Z",
  "updated_at": "2026-03-01T14:30:00Z"
}
```

### DRAFT_PROMOTES_TO_IDEA
- Meaning: tracks promotion from draft content to idea node.
- Source -> Target: `DRAFT` -> `IDEA`
- Policy: `optional`
- Example:
```json
{
  "id": "edge.draft.idea.graph-diff",
  "type": "DRAFT_PROMOTES_TO_IDEA",
  "source_id": "draft.graph.diff.notes",
  "source_type": "DRAFT",
  "target_id": "idea.graph.diff.view",
  "target_type": "IDEA",
  "revision": 1,
  "etag": "etag-edge-008",
  "meta": {},
  "created_at": "2026-03-01T14:35:00Z",
  "updated_at": "2026-03-01T14:35:00Z"
}
```
