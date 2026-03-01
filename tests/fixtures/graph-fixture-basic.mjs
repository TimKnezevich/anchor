export const basicGraphFixture = Object.freeze({
  nodes: [
    {
      id: "spec.axis.v0.core",
      type: "SPEC"
    },
    {
      id: "task.phase2.node-model",
      type: "TASK"
    },
    {
      id: "codeunit.shared.models.nodes",
      type: "CODE_UNIT"
    },
    {
      id: "evidence.task.phase2.node-model.1",
      type: "EVIDENCE"
    }
  ],
  edges: [
    {
      id: "edge.spec.task.1",
      type: "SPEC_DEFINES_TASK",
      source_id: "spec.axis.v0.core",
      source_type: "SPEC",
      target_id: "task.phase2.node-model",
      target_type: "TASK"
    },
    {
      id: "edge.task.code.1",
      type: "TASK_TOUCHES_CODE_UNIT",
      source_id: "task.phase2.node-model",
      source_type: "TASK",
      target_id: "codeunit.shared.models.nodes",
      target_type: "CODE_UNIT"
    },
    {
      id: "edge.task.evidence.1",
      type: "TASK_PRODUCES_EVIDENCE",
      source_id: "task.phase2.node-model",
      source_type: "TASK",
      target_id: "evidence.task.phase2.node-model.1",
      target_type: "EVIDENCE"
    }
  ]
});
