import test from "node:test";
import assert from "node:assert/strict";
import { renderGraphExplorerPage } from "../../server/mcp/src/graph-explorer-page.mjs";

test("renderGraphExplorerPage includes title and mcp path", () => {
  const html = renderGraphExplorerPage({
    title: "Axis Graph Explorer",
    mcpPath: "/mcp"
  });

  assert.ok(html.includes("Axis Graph Explorer"));
  assert.ok(html.includes('fetch("/mcp"'));
  assert.ok(html.includes("Refresh Graph"));
});
