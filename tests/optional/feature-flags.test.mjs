import test from "node:test";
import assert from "node:assert/strict";
import { getDefaultFeatureFlags, resolveFeatureFlags } from "../../server/optional/src/index.mjs";

test("default feature flags are disabled", () => {
  const flags = getDefaultFeatureFlags();
  assert.equal(flags.vectorSidecarEnabled, false);
  assert.equal(flags.eventSidecarEnabled, false);
});

test("feature flags resolve from direct input", () => {
  const flags = resolveFeatureFlags({
    vectorSidecarEnabled: true,
    eventSidecarEnabled: true
  });

  assert.equal(flags.vectorSidecarEnabled, true);
  assert.equal(flags.eventSidecarEnabled, true);
});

test("feature flags resolve from environment values", () => {
  const flags = resolveFeatureFlags({}, {
    AXIS_ENABLE_VECTOR_SIDECAR: "true",
    AXIS_ENABLE_EVENT_SIDECAR: "false"
  });

  assert.equal(flags.vectorSidecarEnabled, true);
  assert.equal(flags.eventSidecarEnabled, false);
});
