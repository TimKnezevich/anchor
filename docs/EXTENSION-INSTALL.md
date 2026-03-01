# Extension Install and Smoke Test

## Build VSIX
From repo root:

```bash
npm --prefix extension install
npm run extension:package
```

Expected output:
- `dist/axis-vscode-extension.vsix`

## Install Locally
```bash
code --install-extension dist/axis-vscode-extension.vsix
```

To reinstall after changes:
```bash
code --uninstall-extension axis.axis-vscode-extension
code --install-extension dist/axis-vscode-extension.vsix
```

## Smoke Test Checklist
1. Open VS Code Command Palette.
2. Confirm commands exist:
   - `Axis: Initialize Repository`
   - `Axis: Check Connection`
   - `Axis: Open Graph Explorer`
3. Start local MCP server before command testing:
   - `node ./scripts/run-mcp-server.mjs`
4. Configure extension transport if needed:
   - `AXIS_MCP_BASE_URL` (default `http://127.0.0.1:4317`)
   - `AXIS_MCP_PATH` (default `/mcp`)
   - `AXIS_MCP_HEALTH_PATH` (default `/health`)
   - `AXIS_MCP_TIMEOUT_MS` (default `5000`)
   - `AXIS_MCP_RETRIES` (default `2`)
   - `AXIS_MCP_RETRY_DELAY_MS` (default `250`)
5. Run `Axis: Initialize Repository` and verify success notification.
6. Run `Axis: Check Connection` and verify success.
7. Run `Axis: Open Graph Explorer` and verify browser load.

## Notes
- Runtime now uses HTTP MCP transport in `extension/src/vscode-extension.mjs`.
- If the server is down or misconfigured, transport errors surface as conflict-style user messages.
- Recommended default operator flow is monitor-first:
  1. Initialize repository
  2. Check connection
  3. Open Graph Explorer
  4. Use advanced task commands only when needed
- Enforcement setup:
  - install hooks: `node ./scripts/install-git-hooks.mjs`
  - validate drift: `node ./scripts/axis-validate-diff.mjs --staged-only`
  - acknowledge drift: `node ./scripts/axis-acknowledge.mjs ...`
  - rollback drift: `node ./scripts/axis-rollback-unlinked.mjs --apply`
  - runbook: `docs/ENFORCEMENT-RUNBOOK.md`

## Graph Explorer UI Smoke Checklist
1. Verify Axis icon appears in VS Code activity bar and open the Axis sidebar.
2. Run `Axis: Open Graph Explorer`.
3. Verify browser opens at `http://127.0.0.1:4317/graph-explorer`.
4. Apply filters (`node type`, `status`, `stale only`, `conflict only`) and verify list changes.
5. Click a node name and verify selected node details update.
6. Enter a SPEC id in trace mode and verify trace list updates.
