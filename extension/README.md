# Extension

VS Code extension workflow layer for Axis.

## Commands
- `axis.startTask`
- `axis.confirmTask`
- `axis.showTaskState`
- `axis.openGraphExplorer`
- `axis.checkConnection`

## Design
- Uses `AxisMcpClient` to send typed MCP command envelopes.
- Uses `WorkflowController` for command flow orchestration.
- Uses `GraphExplorerController` for graph model, filters, trace path, and refresh.
- Uses VS Code activation bridge in `src/vscode-extension.mjs`.
- `confirmTask` enforces the full 6-step orchestrator loop.
- Conflict and retry messages are normalized for lock and ETag errors.
