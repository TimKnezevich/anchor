# Evidence Schema

This document defines the finalized evidence payload shape for `attach_evidence`.

## Required Fields
- `id` (string): stable evidence record ID.
- `artifacts` (string[]): non-empty list of high-level artifacts (commands, outputs, files).
- `touched_files` (string[]): files changed in this work step.
- `command_results` (object[]): command execution summaries.
- `validation_assertions` (object[]): clause-level validation assertions.

## command_results Item
- `command` (string): command that was run.
- `passed` (boolean): whether command succeeded.

## validation_assertions Item
- `clause_id` (string): target clause ID, usually of kind `acc`.
- `passed` (boolean): assertion pass/fail.
- `note` (string): short explanation.

## Example
```json
{
  "id": "evidence.task.phase10.1",
  "artifacts": ["npm run test", "npm run typecheck", "npm run lint"],
  "touched_files": [
    "server/mcp/src/mcp-service.mjs",
    "shared/evidence/src/evidence-validator.mjs"
  ],
  "command_results": [
    { "command": "npm run test", "passed": true },
    { "command": "npm run typecheck", "passed": true },
    { "command": "npm run lint", "passed": true }
  ],
  "validation_assertions": [
    {
      "clause_id": "acc.validation_gate",
      "passed": true,
      "note": "Evidence present and acceptance mapping validated"
    }
  ]
}
```
