export const devSeed = Object.freeze({
  clauses: [
    {
      id: "acc.validation_gate",
      kind: "acc",
      text: "Task requires evidence-backed validation",
      revision: 1,
      hash: "seed-hash-acc-validation-gate"
    }
  ],
  nodes: [
    {
      id: "task.dev.seed",
      type: "TASK",
      status: "ready",
      revision: 1,
      etag: "seed-etag-1",
      meta: { source: "dev-seed" },
      created_at: "2026-03-01T00:00:00Z",
      updated_at: "2026-03-01T00:00:00Z",
      title: "Seeded task",
      clause_links: ["acc.validation_gate"]
    }
  ],
  sessions: [],
  evidence: []
});
