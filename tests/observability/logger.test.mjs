import test from "node:test";
import assert from "node:assert/strict";
import { createLogger } from "../../shared/observability/src/index.mjs";

function createMemorySink() {
  const lines = [];
  return {
    lines,
    debug: (line) => lines.push(line),
    info: (line) => lines.push(line),
    warn: (line) => lines.push(line),
    error: (line) => lines.push(line),
    log: (line) => lines.push(line)
  };
}

test("logger writes structured JSON payload", () => {
  const sink = createMemorySink();
  const logger = createLogger({ service: "axis-server", sink, minLevel: "debug" });

  logger.info("session opened", { taskId: "task-1" });

  assert.equal(sink.lines.length, 1);
  const payload = JSON.parse(sink.lines[0]);
  assert.equal(payload.service, "axis-server");
  assert.equal(payload.level, "info");
  assert.equal(payload.message, "session opened");
  assert.deepEqual(payload.context, { taskId: "task-1" });
});

test("logger child inherits and merges context", () => {
  const sink = createMemorySink();
  const parent = createLogger({ service: "axis-server", sink, baseContext: { repo: "anchor" } });
  const child = parent.child({ taskId: "task-1" });

  child.info("update");

  const payload = JSON.parse(sink.lines[0]);
  assert.deepEqual(payload.context, { repo: "anchor", taskId: "task-1" });
});
