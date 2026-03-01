import test from "node:test";
import assert from "node:assert/strict";
import { computeClauseHash, normalizeClauseForHash } from "../../shared/spec/src/index.mjs";

test("clause hash normalization ignores whitespace differences", () => {
  const a = {
    id: "req.a",
    kind: "req",
    text: "A   deterministic   engine",
    revision: 1
  };

  const b = {
    id: "req.a",
    kind: "req",
    text: "A deterministic engine",
    revision: 1
  };

  assert.equal(normalizeClauseForHash(a), normalizeClauseForHash(b));
  assert.equal(computeClauseHash(a), computeClauseHash(b));
});

test("clause hash changes when revision changes", () => {
  const a = {
    id: "req.a",
    kind: "req",
    text: "A deterministic engine",
    revision: 1
  };

  const b = {
    ...a,
    revision: 2
  };

  assert.notEqual(computeClauseHash(a), computeClauseHash(b));
});
