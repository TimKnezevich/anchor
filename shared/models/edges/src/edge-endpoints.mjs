export const edgeEndpoints = Object.freeze({
  SPEC_DEFINES_TASK: { source: ["SPEC"], target: ["TASK"] },
  TASK_TOUCHES_CODE_UNIT: { source: ["TASK"], target: ["CODE_UNIT"] },
  TASK_PRODUCES_EVIDENCE: { source: ["TASK"], target: ["EVIDENCE"] },
  TASK_HAS_WORK_SESSION: { source: ["TASK"], target: ["TASK"] },
  TASK_TRACKED_BY_EPIC: { source: ["EPIC"], target: ["TASK"] },
  ADR_GOVERNS_POLICY: { source: ["ADR"], target: ["POLICY"] },
  POLICY_GOVERNS_CONTRACT: { source: ["POLICY"], target: ["CONTRACT"] },
  DRAFT_PROMOTES_TO_IDEA: { source: ["DRAFT"], target: ["IDEA"] }
});
