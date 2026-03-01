export const nodeStatusMap = Object.freeze({
  SPEC: ["draft", "active", "superseded", "archived"],
  TASK: [
    "draft",
    "ready",
    "in_progress",
    "validated",
    "done",
    "stale",
    "blocked",
    "failed_validation"
  ],
  CODE_UNIT: ["active", "deprecated"],
  ADR: ["proposed", "accepted", "superseded"],
  POLICY: ["draft", "active", "retired"],
  CONTRACT: ["draft", "active", "retired"],
  EVIDENCE: ["collected", "verified", "rejected"],
  IDEA: ["captured", "triaged", "rejected", "promoted"],
  DRAFT: ["open", "closed", "promoted"],
  EPIC: ["draft", "active", "done", "archived"]
});
