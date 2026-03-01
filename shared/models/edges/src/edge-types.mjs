export const edgeTypes = Object.freeze([
  "SPEC_DEFINES_TASK",
  "TASK_TOUCHES_CODE_UNIT",
  "TASK_PRODUCES_EVIDENCE",
  "TASK_HAS_WORK_SESSION",
  "TASK_TRACKED_BY_EPIC",
  "ADR_GOVERNS_POLICY",
  "POLICY_GOVERNS_CONTRACT",
  "DRAFT_PROMOTES_TO_IDEA"
]);

export const edgeTypeSet = new Set(edgeTypes);
