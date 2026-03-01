import test from "node:test";
import assert from "node:assert/strict";
import { SqliteStorageAdapter, createStorageAdapter } from "../../server/storage/src/index.mjs";

test("sqlite adapter fails clearly when driver is unavailable", () => {
  const adapter = new SqliteStorageAdapter({ dbPath: "/tmp/axis-test.sqlite" });

  assert.throws(() => adapter.initialize(), /SQLite driver is not available/);
});

test("storage adapter factory supports memory and sqlite", () => {
  const memory = createStorageAdapter({ adapter: "memory" });
  const sqlite = createStorageAdapter({ adapter: "sqlite", dbPath: "/tmp/axis-test.sqlite" });

  assert.equal(memory.name, "memory");
  assert.equal(sqlite.name, "sqlite");
});

test("storage adapter factory rejects unknown adapter", () => {
  assert.throws(() => createStorageAdapter({ adapter: "postgres" }), /Unsupported storage adapter/);
});
