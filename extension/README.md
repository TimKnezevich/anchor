# Extension

VS Code extension workflow layer for Axis.

## Commands
- `axis.initializeRepository`
- `axis.openGraphExplorer`
- `axis.checkConnection`

## Design
- Uses `AxisMcpClient` to send typed MCP command envelopes.
- Uses `WorkflowController` for command flow orchestration.
- Uses `GraphExplorerController` for graph model, filters, trace path, and refresh.
- Uses VS Code activation bridge in `src/vscode-extension.mjs`.
- Opens Graph Explorer in the external browser at `/graph-explorer`.
- Adds Axis sidebar view container in the VS Code activity bar.
- Attempts local runtime auto-start when an Axis-initialized workspace is opened.
- Conflict and retry messages are normalized for lock and ETag errors.

## Monitor-First Flow
1. `axis.initializeRepository`
2. `axis.checkConnection`
3. `axis.openGraphExplorer`
