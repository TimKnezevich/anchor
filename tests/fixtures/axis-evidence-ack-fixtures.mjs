import {
  normalizeAxisAcknowledgmentRecord,
  normalizeAxisEvidenceLinkRecord
} from "../../shared/policy/src/index.mjs";

export function createValidAxisEvidenceLinkFixture(overrides = {}) {
  return normalizeAxisEvidenceLinkRecord({
    evidence_id: "axis-evidence-1",
    task_id: "task.phase17.enforcement",
    work_session_id: "ws-phase17-1",
    actor: "codex",
    files: ["docs/ARCHITECTURE.md", "server/mcp/src/mcp-service.mjs"],
    recorded_at: "2026-03-01T18:00:00Z",
    ...overrides
  });
}

export function createValidAxisAcknowledgmentFixture(overrides = {}) {
  return normalizeAxisAcknowledgmentRecord({
    ack_id: "axis-ack-1",
    task_id: "task.phase17.enforcement",
    work_session_id: "ws-phase17-1",
    actor: "codex",
    files: ["docs/ARCHITECTURE.md"],
    reason: "Documentation sync in progress",
    approved_by: "lead-dev",
    created_at: "2026-03-01T18:10:00Z",
    expires_at: "2026-03-01T19:10:00Z",
    ...overrides
  });
}

export function createInvalidAxisEvidenceAckFixtures() {
  return [
    {
      name: "evidence missing session",
      evidence: createValidAxisEvidenceLinkFixture({ work_session_id: "" })
    },
    {
      name: "evidence duplicate file",
      evidence: createValidAxisEvidenceLinkFixture({
        files: ["server/mcp/src/mcp-service.mjs", "server/mcp/src/mcp-service.mjs"]
      })
    },
    {
      name: "ack missing reason",
      acknowledgment: createValidAxisAcknowledgmentFixture({ reason: "" })
    },
    {
      name: "ack expiry before creation",
      acknowledgment: createValidAxisAcknowledgmentFixture({
        created_at: "2026-03-01T19:10:00Z",
        expires_at: "2026-03-01T18:10:00Z"
      })
    }
  ];
}
