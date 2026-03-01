# Phase 17 TODO: AI Enforcement and Repo Initialization

## Backlog
- [x] P17-T01 Define `.axis/policy.json` schema for enforcement mode, actor scope, and acknowledgment TTL.
  - [x] P17-T01-S01 Define required fields and defaults.
  - [x] P17-T01-S02 Define schema validation errors and messages.
  - [x] P17-T01-S03 Add sample valid/invalid policy fixtures.
  - Associated test: `tests/policy/axis-policy-schema.test.mjs`

- [x] P17-T02 Define `.axis/evidence/` and `.axis/acknowledgments/` schema contracts and validation rules.
  - [x] P17-T02-S01 Define evidence linkage fields (`task_id`, `work_session_id`, `actor`, `files`).
  - [x] P17-T02-S02 Define acknowledgment fields (`reason`, `expires_at`, `approved_by`).
  - [x] P17-T02-S03 Add fixture set for valid/invalid evidence and acknowledgment records.
  - Associated test: `tests/policy/axis-evidence-ack-schema.test.mjs`

- [x] P17-T03 Add `axis.initialize_workspace` MCP command and handler for deterministic repo bootstrap.
  - [x] P17-T03-S01 Add command contract to request validator and API docs.
  - [x] P17-T03-S02 Implement idempotent initializer logic and error handling.
  - [x] P17-T03-S03 Return initialization status payload and generated artifact list.
  - Associated test: `tests/mcp/initialize-workspace-command.test.mjs`

- [x] P17-T04 Add extension command `Axis: Initialize Repository` wired to one-click sidebar action.
  - [x] P17-T04-S01 Register command in extension manifest and activation flow.
  - [x] P17-T04-S02 Add sidebar action entry and command handler bridge.
  - [x] P17-T04-S03 Show success/failure notifications with actionable next steps.
  - Associated test: `tests/extension/initialize-repository-command.test.mjs`

- [x] P17-T05 Implement initialization status detection and status messaging in plugin window.
  - [x] P17-T05-S01 Add status resolver for initialized/uninitialized/error states.
  - [x] P17-T05-S02 Render status in Axis sidebar tree with refresh behavior.
  - [x] P17-T05-S03 Add startup status check and logging.
  - Associated test: `tests/extension/initialization-status-provider.test.mjs`

- [x] P17-T06 Implement diff validator that maps changed files to active task/session evidence linkage.
  - [x] P17-T06-S01 Build staged/working diff file collector.
  - [x] P17-T06-S02 Implement evidence linkage matcher and violation report output.
  - [x] P17-T06-S03 Add deterministic exit codes for pass/warn/fail modes.
  - Associated test: `tests/scripts/axis-validate-diff.test.mjs`

- [x] P17-T07 Implement acknowledgment flow with explicit reason capture and expiry handling.
  - [x] P17-T07-S01 Add CLI/API to create acknowledgments.
  - [x] P17-T07-S02 Add acknowledgment expiry evaluator.
  - [x] P17-T07-S03 Add acknowledgment lookup into diff validator.
  - Associated test: `tests/scripts/axis-acknowledgment-flow.test.mjs`

- [x] P17-T08 Implement rollback flow for unlinked changes with preview and apply modes.
  - [x] P17-T08-S01 Add unlinked-diff preview command.
  - [x] P17-T08-S02 Add apply mode for rollback using non-destructive safeguards.
  - [x] P17-T08-S03 Add summary output with rolled-back file list.
  - Associated test: `tests/scripts/axis-rollback-unlinked.test.mjs`

- [x] P17-T09 Add local pre-commit and commit-msg enforcement wiring for unlinked diff detection.
  - [x] P17-T09-S01 Add `.githooks/pre-commit` integration with validator.
  - [x] P17-T09-S02 Add `.githooks/commit-msg` metadata checks for task/session linkage.
  - [x] P17-T09-S03 Add hook installer/update script.
  - Associated test: `tests/scripts/git-hooks-enforcement.test.mjs`

- [x] P17-T10 Add CI enforcement job that fails unlinked or expired-acknowledged drift.
  - [x] P17-T10-S01 Add workflow step invoking same validator as local hooks.
  - [x] P17-T10-S02 Add CI-specific report artifact on failure.
  - [x] P17-T10-S03 Add branch/PR gate documentation.
  - Associated test: `tests/scripts/ci-enforcement-workflow.test.mjs`

- [x] P17-T11 Add deterministic error codes and operator guidance for enforcement failures.
  - [x] P17-T11-S01 Define new error codes and status mapping.
  - [x] P17-T11-S02 Add user-facing guidance text for each failure class.
  - [x] P17-T11-S03 Ensure extension and CLI share same message mapper.
  - Associated test: `tests/observability/enforcement-error-mapper.test.mjs`

- [x] P17-T12 Add audit logging for warnings, acknowledgments, ignores, and rollbacks.
  - [x] P17-T12-S01 Define structured log event shapes.
  - [x] P17-T12-S02 Emit logs from validator, acknowledgment, and rollback flows.
  - [x] P17-T12-S03 Add correlation fields (`repo_id`, `task_id`, `work_session_id`, `actor`).
  - Associated test: `tests/observability/enforcement-audit-log.test.mjs`

- [x] P17-T13 Align extension install icon path and activity/sidebar icon references to generated Axis assets.
  - [x] P17-T13-S01 Verify extension manifest icon target and package inclusion.
  - [x] P17-T13-S02 Align activity bar/view icon references to generated assets.
  - [x] P17-T13-S03 Add fallback handling for missing icon assets.
  - Associated test: `tests/extension/icon-asset-wiring.test.mjs`

- [x] P17-T14 Add install/package tests that verify icon parity with source generated assets.
  - [x] P17-T14-S01 Add deterministic checksum/parity checks against generated icon set.
  - [x] P17-T14-S02 Add extension package content checks for required icon files.
  - [x] P17-T14-S03 Add release dry-run assertion for icon parity gate.
  - Associated test: `tests/scripts/icon-parity-release.test.mjs`

- [x] P17-T15 Update extension command surfaces for monitor-first UX (connection, initialization, graph explorer).
  - [x] P17-T15-S01 Reorder or scope command contributions for monitor-first defaults.
  - [x] P17-T15-S02 Reduce prominence of manual task-driving commands in sidebar.
  - [x] P17-T15-S03 Add initialization-first guidance in command UX.
  - Associated test: `tests/extension/monitor-first-command-surface.test.mjs`

- [x] P17-T16 Add integration tests for initialize -> edit -> warn -> acknowledge/rollback -> commit/CI flow.
  - [x] P17-T16-S01 Add local integration harness for init and diff validation.
  - [x] P17-T16-S02 Add acknowledge path integration coverage.
  - [x] P17-T16-S03 Add rollback path integration coverage.
  - Associated test: `tests/integration/axis-enforcement-lifecycle.test.mjs`

- [x] P17-T17 Update docs for setup, enforcement lifecycle, and failure remediation runbook.
  - [x] P17-T17-S01 Update `docs/EXTENSION-INSTALL.md` with one-click init and monitor-first flow.
  - [x] P17-T17-S02 Add enforcement runbook for warnings, acknowledgments, and rollbacks.
  - [x] P17-T17-S03 Update architecture/spec cross-references for enforcement and init behavior.
  - Associated test: `tests/scripts/phase-17-doc-links.test.mjs`

## Done
- [x] P17-T01 Define `.axis/policy.json` schema for enforcement mode, actor scope, and acknowledgment TTL.
  - [x] P17-T01-S01 Define required fields and defaults.
  - [x] P17-T01-S02 Define schema validation errors and messages.
  - [x] P17-T01-S03 Add sample valid/invalid policy fixtures.
  - Associated test: `tests/policy/axis-policy-schema.test.mjs`
- [x] P17-T02 Define `.axis/evidence/` and `.axis/acknowledgments/` schema contracts and validation rules.
  - [x] P17-T02-S01 Define evidence linkage fields (`task_id`, `work_session_id`, `actor`, `files`).
  - [x] P17-T02-S02 Define acknowledgment fields (`reason`, `expires_at`, `approved_by`).
  - [x] P17-T02-S03 Add fixture set for valid/invalid evidence and acknowledgment records.
  - Associated test: `tests/policy/axis-evidence-ack-schema.test.mjs`
- [x] P17-T03 Add `axis.initialize_workspace` MCP command and handler for deterministic repo bootstrap.
  - [x] P17-T03-S01 Add command contract to request validator and API docs.
  - [x] P17-T03-S02 Implement idempotent initializer logic and error handling.
  - [x] P17-T03-S03 Return initialization status payload and generated artifact list.
  - Associated test: `tests/mcp/initialize-workspace-command.test.mjs`
- [x] P17-T04 Add extension command `Axis: Initialize Repository` wired to one-click sidebar action.
  - [x] P17-T04-S01 Register command in extension manifest and activation flow.
  - [x] P17-T04-S02 Add sidebar action entry and command handler bridge.
  - [x] P17-T04-S03 Show success/failure notifications with actionable next steps.
  - Associated test: `tests/extension/initialize-repository-command.test.mjs`
- [x] P17-T05 Implement initialization status detection and status messaging in plugin window.
  - [x] P17-T05-S01 Add status resolver for initialized/uninitialized/error states.
  - [x] P17-T05-S02 Render status in Axis sidebar tree with refresh behavior.
  - [x] P17-T05-S03 Add startup status check and logging.
  - Associated test: `tests/extension/initialization-status-provider.test.mjs`
- [x] P17-T06 Implement diff validator that maps changed files to active task/session evidence linkage.
  - [x] P17-T06-S01 Build staged/working diff file collector.
  - [x] P17-T06-S02 Implement evidence linkage matcher and violation report output.
  - [x] P17-T06-S03 Add deterministic exit codes for pass/warn/fail modes.
  - Associated test: `tests/scripts/axis-validate-diff.test.mjs`
- [x] P17-T07 Implement acknowledgment flow with explicit reason capture and expiry handling.
  - [x] P17-T07-S01 Add CLI/API to create acknowledgments.
  - [x] P17-T07-S02 Add acknowledgment expiry evaluator.
  - [x] P17-T07-S03 Add acknowledgment lookup into diff validator.
  - Associated test: `tests/scripts/axis-acknowledgment-flow.test.mjs`
- [x] P17-T08 Implement rollback flow for unlinked changes with preview and apply modes.
  - [x] P17-T08-S01 Add unlinked-diff preview command.
  - [x] P17-T08-S02 Add apply mode for rollback using non-destructive safeguards.
  - [x] P17-T08-S03 Add summary output with rolled-back file list.
  - Associated test: `tests/scripts/axis-rollback-unlinked.test.mjs`
- [x] P17-T09 Add local pre-commit and commit-msg enforcement wiring for unlinked diff detection.
  - [x] P17-T09-S01 Add `.githooks/pre-commit` integration with validator.
  - [x] P17-T09-S02 Add `.githooks/commit-msg` metadata checks for task/session linkage.
  - [x] P17-T09-S03 Add hook installer/update script.
  - Associated test: `tests/scripts/git-hooks-enforcement.test.mjs`
- [x] P17-T10 Add CI enforcement job that fails unlinked or expired-acknowledged drift.
  - [x] P17-T10-S01 Add workflow step invoking same validator as local hooks.
  - [x] P17-T10-S02 Add CI-specific report artifact on failure.
  - [x] P17-T10-S03 Add branch/PR gate documentation.
  - Associated test: `tests/scripts/ci-enforcement-workflow.test.mjs`
- [x] P17-T11 Add deterministic error codes and operator guidance for enforcement failures.
  - [x] P17-T11-S01 Define new error codes and status mapping.
  - [x] P17-T11-S02 Add user-facing guidance text for each failure class.
  - [x] P17-T11-S03 Ensure extension and CLI share same message mapper.
  - Associated test: `tests/observability/enforcement-error-mapper.test.mjs`
- [x] P17-T12 Add audit logging for warnings, acknowledgments, ignores, and rollbacks.
  - [x] P17-T12-S01 Define structured log event shapes.
  - [x] P17-T12-S02 Emit logs from validator, acknowledgment, and rollback flows.
  - [x] P17-T12-S03 Add correlation fields (`repo_id`, `task_id`, `work_session_id`, `actor`).
  - Associated test: `tests/observability/enforcement-audit-log.test.mjs`
- [x] P17-T13 Align extension install icon path and activity/sidebar icon references to generated Axis assets.
  - [x] P17-T13-S01 Verify extension manifest icon target and package inclusion.
  - [x] P17-T13-S02 Align activity bar/view icon references to generated assets.
  - [x] P17-T13-S03 Add fallback handling for missing icon assets.
  - Associated test: `tests/extension/icon-asset-wiring.test.mjs`
- [x] P17-T14 Add install/package tests that verify icon parity with source generated assets.
  - [x] P17-T14-S01 Add deterministic checksum/parity checks against generated icon set.
  - [x] P17-T14-S02 Add extension package content checks for required icon files.
  - [x] P17-T14-S03 Add release dry-run assertion for icon parity gate.
  - Associated test: `tests/scripts/icon-parity-release.test.mjs`
- [x] P17-T15 Update extension command surfaces for monitor-first UX (connection, initialization, graph explorer).
  - [x] P17-T15-S01 Reorder or scope command contributions for monitor-first defaults.
  - [x] P17-T15-S02 Reduce prominence of manual task-driving commands in sidebar.
  - [x] P17-T15-S03 Add initialization-first guidance in command UX.
  - Associated test: `tests/extension/monitor-first-command-surface.test.mjs`
- [x] P17-T16 Add integration tests for initialize -> edit -> warn -> acknowledge/rollback -> commit/CI flow.
  - [x] P17-T16-S01 Add local integration harness for init and diff validation.
  - [x] P17-T16-S02 Add acknowledge path integration coverage.
  - [x] P17-T16-S03 Add rollback path integration coverage.
  - Associated test: `tests/integration/axis-enforcement-lifecycle.test.mjs`
- [x] P17-T17 Update docs for setup, enforcement lifecycle, and failure remediation runbook.
  - [x] P17-T17-S01 Update `docs/EXTENSION-INSTALL.md` with one-click init and monitor-first flow.
  - [x] P17-T17-S02 Add enforcement runbook for warnings, acknowledgments, and rollbacks.
  - [x] P17-T17-S03 Update architecture/spec cross-references for enforcement and init behavior.
  - Associated test: `tests/scripts/phase-17-doc-links.test.mjs`
