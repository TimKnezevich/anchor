# Axis SPEC v0 Draft

- `spec_key`: `axis.v0.core`
- `semantic_version`: `0.1.0`
- `revision`: `1`
- `clause_index`: ordered by clause ID

## Clauses

### def
- `def.axis.authority`
  Axis state is the authoritative development path for orchestration.
- `def.mcp.only`
  All Axis reads and writes occur via MCP interfaces.
- `def.session`
  A work session is the lock-scoped execution context for one task.

### req
- `req.orchestrator.loop`
  Orchestrator executes read->intent-write->re-read->code-modify->confirm->re-read/report for each work cycle.
- `req.graph.core_types`
  Axis supports core node types: SPEC, TASK, CODE_UNIT, ADR, POLICY, CONTRACT, EVIDENCE, IDEA, DRAFT, optional EPIC.
- `req.meta.namespace`
  All nodes support namespaced metadata via `meta.*`.
- `req.codeunit.lazy`
  CODE_UNIT nodes are created lazily on first touch.
- `req.codeunit.module_first`
  CODE_UNIT linkage defaults to module-level granularity.
- `req.vscode.graph_explorer`
  VS Code extension provides a visual graph explorer to inspect node status and relations.
- `req.workspace.initialize`
  Axis supports explicit workspace initialization that records bootstrap status and required artifact paths.
- `req.drift.enforcement`
  Axis supports deterministic diff enforcement with warning, acknowledgment, rollback, and CI gate integration.

### con
- `con.single_writer.repo`
  Axis enforces one active writer per repository.
- `con.single_session.task`
  Axis enforces exactly one active work_session per task.
- `con.etag.write`
  Mutating writes require valid ETag preconditions.
- `con.command_id.idempotent`
  Mutating writes require idempotent command_id.
- `con.vector.non_authoritative`
  Vector layer cannot mutate authoritative graph state.
- `con.events.derived`
  Event layer is derived from authoritative state and delivered at least once in monotonic repo_seq order.
- `con.enforcement.error_codes`
  Drift enforcement uses deterministic error codes and shared guidance mappings across CLI and extension surfaces.

### acc
- `acc.stale_detection`
  If `current_clause_hash != clause_hash_at_link_time`, linked task state becomes stale and is queryable.
- `acc.validation_gate`
  A task cannot complete without evidence-backed validation mapped to acceptance clauses.
- `acc.graph_visibility`
  Graph Explorer displays stale/conflict status and trace path from SPEC to evidence.
- `acc.lock_conflict_handling`
  Extension surfaces TASK_LOCKED, ETAG_MISMATCH, and REPO_LOCKED with actionable retry guidance.

### nongoal
- `nongoal.manual_axis_edits`
  Manual edits to Axis-managed state are unsupported.
- `nongoal.exactly_once_events`
  Exactly-once event delivery is not required in v0.
- `nongoal.multi_writer_unlocked`
  Unconstrained concurrent writes are not supported in v0.

## Revision Rules
- Clause text change: increment clause revision and recompute hash.
- Structural boundary change: increment `semantic_version`.
- Any clause hash drift invalidates link-time assumptions for dependent tasks.
