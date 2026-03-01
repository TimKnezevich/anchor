# API Contract (MCP)

This contract defines command shapes for Axis MCP v0.

## Common Request Envelope
```json
{
  "command": "read_state",
  "command_id": "cmd-123",
  "repo_id": "repo-1",
  "actor": "dev-or-agent-id",
  "payload": {}
}
```

Fields:
- `command` (string): command name.
- `command_id` (string): idempotency key for mutating commands.
- `repo_id` (string): repository scope.
- `actor` (string): caller identity.
- `payload` (object): command-specific data.

## Common Success Envelope
```json
{
  "ok": true,
  "data": {}
}
```

## Common Error Envelope
```json
{
  "ok": false,
  "error": {
    "status": 409,
    "code": "ETAG_MISMATCH",
    "message": "ETag mismatch for resource 'task-1'.",
    "details": {},
    "correlationId": "corr-123"
  }
}
```

## read_state
Request payload:
```json
{
  "node_ids": ["task-1"],
  "include_edges": true,
  "stale_only": false
}
```

Response data:
```json
{
  "nodes": [],
  "edges": [],
  "sessions": [],
  "stale_tasks": []
}
```

## write_node
Request payload:
```json
{
  "node": {},
  "expected_etag": "etag-1",
  "next_etag": "etag-2"
}
```

Behavior:
- Requires repo writer lock for actor.
- Enforces `expected_etag` match for existing resources.
- Uses `command_id` idempotency.

Response data:
```json
{
  "node": {}
}
```

## open_work_session
Request payload:
```json
{
  "task_id": "task-1",
  "session_id": "ws-1"
}
```

Response data:
```json
{
  "task_id": "task-1",
  "session_id": "ws-1",
  "state": "opened"
}
```

## close_work_session
Request payload:
```json
{
  "task_id": "task-1",
  "session_id": "ws-1"
}
```

Response data:
```json
{
  "task_id": "task-1",
  "session_id": "ws-1",
  "state": "closed"
}
```

## attach_evidence
Request payload:
```json
{
  "task_id": "task-1",
  "evidence": {
    "id": "evidence-1",
    "artifacts": ["npm run test"],
    "touched_files": ["server/mcp/src/mcp-service.mjs"],
    "command_results": [
      { "command": "npm run test", "passed": true }
    ],
    "validation_assertions": [
      {
        "clause_id": "acc.validation_gate",
        "passed": true,
        "note": "Acceptance satisfied"
      }
    ]
  }
}
```

Response data:
```json
{
  "task_id": "task-1",
  "evidence_id": "evidence-1"
}
```

Behavior:
- Evidence payload must satisfy the schema in `docs/EVIDENCE-SCHEMA.md`.
- Invalid evidence returns `VALIDATION_ERROR`.

## validate_task
Request payload:
```json
{
  "task_id": "task-1",
  "acc_clause_ids": ["acc.validation_gate"],
  "passed": true,
  "notes": "All checks pass"
}
```

Response data:
```json
{
  "task_id": "task-1",
  "validation_state": "validated"
}
```

Behavior:
- `acc_clause_ids` must resolve to existing clauses of kind `acc`.
- Validation is rejected if evidence does not exist for the task.

## upsert_clause
Request payload:
```json
{
  "clause": {
    "id": "acc.validation_gate",
    "kind": "acc",
    "text": "Task requires evidence-backed validation",
    "revision": 1
  }
}
```

Response data:
```json
{
  "clause": {
    "id": "acc.validation_gate",
    "kind": "acc",
    "text": "Task requires evidence-backed validation",
    "revision": 1,
    "hash": "sha256..."
  }
}
```

## link_task_clause
Request payload:
```json
{
  "task_id": "task-1",
  "clause_id": "acc.validation_gate"
}
```

Response data:
```json
{
  "link": {
    "task_id": "task-1",
    "clause_id": "acc.validation_gate",
    "clause_hash_at_link_time": "sha256..."
  }
}
```
