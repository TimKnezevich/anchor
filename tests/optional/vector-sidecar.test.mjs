import test from "node:test";
import assert from "node:assert/strict";
import { VectorSidecar } from "../../server/optional/src/index.mjs";

test("vector sidecar returns deterministic ranked suggestions", () => {
  const sidecar = new VectorSidecar({ maxResults: 3 });

  const suggestions = sidecar.rankNodes("task", [
    { id: "task.1", type: "TASK", title: "Main task", status: "ready" },
    { id: "task.2", type: "TASK", title: "Other", status: "done" },
    { id: "spec.1", type: "SPEC", title: "spec", status: "active" }
  ]);

  assert.equal(suggestions.length, 2);
  assert.equal(suggestions[0].node_id, "task.1");
  assert.ok(suggestions[0].score >= suggestions[1].score);
});
