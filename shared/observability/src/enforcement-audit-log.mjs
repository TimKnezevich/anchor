import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function ensureAuditDirectory(cwd) {
  const axisDir = join(cwd, ".axis");
  if (!existsSync(axisDir)) {
    mkdirSync(axisDir, { recursive: true });
  }
}

function normalizeEvent(event) {
  return {
    timestamp: event.timestamp ?? new Date().toISOString(),
    event_type: event.event_type,
    repo_id: event.repo_id ?? null,
    task_id: event.task_id ?? null,
    work_session_id: event.work_session_id ?? null,
    actor: event.actor ?? null,
    status: event.status ?? null,
    details: event.details ?? {}
  };
}

export function appendEnforcementAuditEvent(cwd, event) {
  ensureAuditDirectory(cwd);
  const auditPath = join(cwd, ".axis", "audit.log");
  const normalized = normalizeEvent(event);
  appendFileSync(auditPath, `${JSON.stringify(normalized)}\n`);
  return {
    path: auditPath,
    event: normalized
  };
}

export function readEnforcementAuditEvents(cwd) {
  const auditPath = join(cwd, ".axis", "audit.log");
  if (!existsSync(auditPath)) {
    return [];
  }

  const lines = readFileSync(auditPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line) => JSON.parse(line));
}
