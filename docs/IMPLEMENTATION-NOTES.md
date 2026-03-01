# Implementation Notes

## Architecture Guardrails
1. Axis state is authoritative.
2. All Axis mutations go through MCP.
3. No manual state mutation path outside MCP.
4. Keep vector and event layers non-authoritative.
5. Enforce repo/task/session concurrency invariants in server logic.

## Error and Logging Guardrails
1. Use `AxisError` for known operational errors.
2. Include structured logs at all layers:
   - API handler
   - domain logic
   - storage adapter
   - extension command flow
3. Never log secrets directly; use redaction.
4. Include correlation IDs in error/log contexts where available.

## Naming and Structure
1. Follow language-specific naming conventions.
2. Follow framework/project structure conventions when available.
3. Keep files under 400 lines where practical.
4. Evaluate and flag files 400-1000 lines for split/refactor.
