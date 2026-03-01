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
   - `Axis: Start Task`
   - `Axis: Confirm Task`
   - `Axis: Show Task State`
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
5. Run `Axis: Check Connection` and verify success.
6. Run task commands and verify state responses from live MCP server.

## Notes
- Runtime now uses HTTP MCP transport in `extension/src/vscode-extension.mjs`.
- If the server is down or misconfigured, transport errors surface as conflict-style user messages.

## Graph Explorer UI Smoke Checklist
1. Run `Axis: Open Graph Explorer`.
2. Verify panel opens with summary cards for node/edge/stale/changed counts.
3. Click a node label and verify the details section updates for that node.
4. Apply filters (`node type`, `status`, `stale only`, `conflict only`) and verify node/edge list changes.
5. Enter a SPEC id in trace mode, click `Apply Trace`, and verify trace list updates.
6. Click `Refresh` after graph changes and verify changed nodes/edges are highlighted.
