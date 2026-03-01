import test from "node:test";
import assert from "node:assert/strict";
import { InvariantEngine, toErrorResponse } from "../../server/invariants/src/index.mjs";

test("invariant engine enforces single writer lock per repo", () => {
  const engine = new InvariantEngine();

  engine.acquireRepoWriterLock("repo-1", "owner-a");

  assert.throws(
    () => engine.acquireRepoWriterLock("repo-1", "owner-b"),
    /currently locked/
  );
});

test("invariant engine enforces one active session per task", () => {
  const engine = new InvariantEngine();

  engine.openTaskSession("task-1", "session-1");

  assert.throws(
    () => engine.openTaskSession("task-1", "session-2"),
    /already has an active session/
  );
});

test("invariant engine enforces ETag checks", () => {
  const engine = new InvariantEngine();

  engine.seedEtag("task-1", "etag-1");
  assert.doesNotThrow(() => engine.assertEtag("task-1", "etag-1"));
  assert.throws(() => engine.assertEtag("task-1", "etag-2"), /ETag mismatch/);
});

test("invariant engine supports idempotent command replay", () => {
  const engine = new InvariantEngine();
  let calls = 0;

  const first = engine.runIdempotent("cmd-1", () => {
    calls += 1;
    return { changed: true };
  });

  const second = engine.runIdempotent("cmd-1", () => {
    calls += 1;
    return { changed: false };
  });

  assert.equal(first.replayed, false);
  assert.equal(second.replayed, true);
  assert.equal(calls, 1);
  assert.deepEqual(second.result, { changed: true });
});

test("error response mapping returns deterministic status codes", () => {
  const engine = new InvariantEngine();

  engine.acquireRepoWriterLock("repo-1", "owner-a");

  let response;
  try {
    engine.acquireRepoWriterLock("repo-1", "owner-b");
  } catch (error) {
    response = toErrorResponse(error, "corr-1");
  }

  assert.equal(response.ok, false);
  assert.equal(response.error.status, 423);
  assert.equal(response.error.code, "REPO_LOCKED");
  assert.equal(response.error.correlationId, "corr-1");
});
