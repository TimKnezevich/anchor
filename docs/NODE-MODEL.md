# Node Model

This document defines Axis node types in plain terms.

## Shared Fields (all node types)
- `id` (string): stable node identifier.
- `type` (string): one of the supported node types.
- `status` (string): lifecycle status for the node type.
- `revision` (integer >= 1): revision counter for node updates.
- `etag` (string): concurrency token for safe writes.
- `meta` (object): namespaced metadata (`meta.*`).
- `created_at` (ISO string): creation timestamp.
- `updated_at` (ISO string): last update timestamp.

## Node Types

### SPEC
- Meaning: machine-readable clause specification stream.
- Required fields:
  - shared fields
  - `spec_key`
  - `semantic_version`
  - `clause_index` (array)
- Allowed statuses: `draft`, `active`, `superseded`, `archived`
- Example:
```json
{
  "id": "spec.axis.v0.core",
  "type": "SPEC",
  "status": "active",
  "revision": 1,
  "etag": "etag-001",
  "meta": { "owner": "platform" },
  "created_at": "2026-03-01T13:00:00Z",
  "updated_at": "2026-03-01T13:00:00Z",
  "spec_key": "axis.v0.core",
  "semantic_version": "0.1.0",
  "clause_index": ["def.axis.authority", "req.orchestrator.loop"]
}
```

### TASK
- Meaning: actionable implementation unit linked to SPEC clauses.
- Required fields:
  - shared fields
  - `title`
  - `clause_links` (array)
- Allowed statuses: `draft`, `ready`, `in_progress`, `validated`, `done`, `stale`, `blocked`, `failed_validation`
- Example:
```json
{
  "id": "task.phase2.node-model",
  "type": "TASK",
  "status": "in_progress",
  "revision": 2,
  "etag": "etag-002",
  "meta": { "priority": "high" },
  "created_at": "2026-03-01T13:05:00Z",
  "updated_at": "2026-03-01T13:10:00Z",
  "title": "Implement node model",
  "clause_links": ["req.graph.core_types", "req.meta.namespace"]
}
```

### CODE_UNIT
- Meaning: module-level code area touched by work.
- Required fields:
  - shared fields
  - `module_key`
- Allowed statuses: `active`, `deprecated`
- Example:
```json
{
  "id": "codeunit.shared.models.nodes",
  "type": "CODE_UNIT",
  "status": "active",
  "revision": 1,
  "etag": "etag-003",
  "meta": {},
  "created_at": "2026-03-01T13:12:00Z",
  "updated_at": "2026-03-01T13:12:00Z",
  "module_key": "shared/models/nodes"
}
```

### ADR
- Meaning: architecture decision record node.
- Required fields:
  - shared fields
  - `title`
  - `decision`
- Allowed statuses: `proposed`, `accepted`, `superseded`
- Example:
```json
{
  "id": "adr-0011",
  "type": "ADR",
  "status": "accepted",
  "revision": 1,
  "etag": "etag-004",
  "meta": {},
  "created_at": "2026-03-01T13:15:00Z",
  "updated_at": "2026-03-01T13:15:00Z",
  "title": "Define node schema",
  "decision": "Use shared fields and type-specific required fields"
}
```

### POLICY
- Meaning: operational rule set.
- Required fields:
  - shared fields
  - `policy_key`
- Allowed statuses: `draft`, `active`, `retired`
- Example:
```json
{
  "id": "policy.mcp.only",
  "type": "POLICY",
  "status": "active",
  "revision": 1,
  "etag": "etag-005",
  "meta": {},
  "created_at": "2026-03-01T13:20:00Z",
  "updated_at": "2026-03-01T13:20:00Z",
  "policy_key": "mcp.only"
}
```

### CONTRACT
- Meaning: explicit interface or integration contract.
- Required fields:
  - shared fields
  - `contract_key`
- Allowed statuses: `draft`, `active`, `retired`
- Example:
```json
{
  "id": "contract.mcp.api.v0",
  "type": "CONTRACT",
  "status": "draft",
  "revision": 1,
  "etag": "etag-006",
  "meta": {},
  "created_at": "2026-03-01T13:25:00Z",
  "updated_at": "2026-03-01T13:25:00Z",
  "contract_key": "mcp.api.v0"
}
```

### EVIDENCE
- Meaning: execution proof and validation artifacts for tasks.
- Required fields:
  - shared fields
  - `task_id`
  - `artifacts` (array)
- Allowed statuses: `collected`, `verified`, `rejected`
- Example:
```json
{
  "id": "evidence.task.phase2.node-model.1",
  "type": "EVIDENCE",
  "status": "collected",
  "revision": 1,
  "etag": "etag-007",
  "meta": {},
  "created_at": "2026-03-01T13:30:00Z",
  "updated_at": "2026-03-01T13:30:00Z",
  "task_id": "task.phase2.node-model",
  "artifacts": ["npm run test", "npm run typecheck", "npm run lint"]
}
```

### IDEA
- Meaning: uncommitted concept that may become planned work.
- Required fields:
  - shared fields
  - `summary`
- Allowed statuses: `captured`, `triaged`, `rejected`, `promoted`
- Example:
```json
{
  "id": "idea.graph.diff.view",
  "type": "IDEA",
  "status": "captured",
  "revision": 1,
  "etag": "etag-008",
  "meta": {},
  "created_at": "2026-03-01T13:35:00Z",
  "updated_at": "2026-03-01T13:35:00Z",
  "summary": "Add a graph diff mode for state snapshots"
}
```

### DRAFT
- Meaning: working draft content that is not finalized.
- Required fields:
  - shared fields
  - `draft_kind`
- Allowed statuses: `open`, `closed`, `promoted`
- Example:
```json
{
  "id": "draft.node-model.notes",
  "type": "DRAFT",
  "status": "open",
  "revision": 1,
  "etag": "etag-009",
  "meta": {},
  "created_at": "2026-03-01T13:40:00Z",
  "updated_at": "2026-03-01T13:40:00Z",
  "draft_kind": "design-notes"
}
```

### EPIC
- Meaning: optional grouping node for related tasks.
- Required fields:
  - shared fields
  - `title`
- Allowed statuses: `draft`, `active`, `done`, `archived`
- Example:
```json
{
  "id": "epic.phase2.models",
  "type": "EPIC",
  "status": "active",
  "revision": 1,
  "etag": "etag-010",
  "meta": {},
  "created_at": "2026-03-01T13:45:00Z",
  "updated_at": "2026-03-01T13:45:00Z",
  "title": "Model definitions"
}
```
