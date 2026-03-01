import test from "node:test";
import assert from "node:assert/strict";
import { EventSidecar } from "../../server/optional/src/index.mjs";

test("event sidecar assigns monotonic repo_seq per repo", () => {
  const sidecar = new EventSidecar();

  const first = sidecar.publishSnapshot("repo-1", "mcp.read_state", { ok: true });
  const second = sidecar.publishSnapshot("repo-1", "mcp.write_node", { ok: true });
  const third = sidecar.publishSnapshot("repo-2", "mcp.read_state", { ok: true });

  assert.equal(first.repo_seq, 1);
  assert.equal(second.repo_seq, 2);
  assert.equal(third.repo_seq, 1);
});

test("event sidecar can mark outbox event as delivered", () => {
  const sidecar = new EventSidecar();
  const event = sidecar.publishSnapshot("repo-1", "mcp.read_state", { ok: true });

  sidecar.markDelivered("repo-1", event.repo_seq);

  const outbox = sidecar.listOutbox("repo-1");
  assert.equal(outbox[0].delivered, true);
});
