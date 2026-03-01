import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  normalizeAxisAcknowledgmentRecord,
  normalizeAxisPolicy,
  validateAxisAcknowledgmentRecord,
  validateAxisPolicy
} from "../shared/policy/src/index.mjs";
import { appendEnforcementAuditEvent } from "../shared/observability/src/index.mjs";

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function toIsoNow() {
  return new Date().toISOString();
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function safeReadPolicy(cwd) {
  const policyPath = join(cwd, ".axis", "policy.json");
  if (!existsSync(policyPath)) {
    return null;
  }

  try {
    const policy = normalizeAxisPolicy(readJson(policyPath));
    const validation = validateAxisPolicy(policy);
    return validation.ok ? policy : null;
  } catch {
    return null;
  }
}

export function evaluateAcknowledgmentState(record, nowIso = toIsoNow()) {
  const now = Date.parse(nowIso);
  const expiresAt = Date.parse(record.expires_at ?? "");

  if (Number.isNaN(now) || Number.isNaN(expiresAt)) {
    return "invalid";
  }

  return expiresAt > now ? "active" : "expired";
}

export function loadAcknowledgments(cwd) {
  const ackDir = join(cwd, ".axis", "acknowledgments");
  if (!existsSync(ackDir)) {
    return [];
  }

  return readdirSync(ackDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => join(ackDir, name))
    .map((filePath) => {
      try {
        const record = readJson(filePath);
        const validation = validateAxisAcknowledgmentRecord(record);
        if (!validation.ok) {
          return {
            ok: false,
            file_path: filePath,
            errors: validation.errors
          };
        }

        return {
          ok: true,
          file_path: filePath,
          record
        };
      } catch {
        return {
          ok: false,
          file_path: filePath,
          errors: ["Invalid acknowledgment JSON."]
        };
      }
    });
}

export function collectActiveAcknowledgments(cwd, nowIso = toIsoNow()) {
  const loaded = loadAcknowledgments(cwd);
  const active = [];
  const expired = [];
  const invalid = [];

  for (const item of loaded) {
    if (!item.ok) {
      invalid.push(item);
      continue;
    }

    const state = evaluateAcknowledgmentState(item.record, nowIso);
    if (state === "active") {
      active.push(item.record);
    } else if (state === "expired") {
      expired.push(item.record);
    } else {
      invalid.push({
        ok: false,
        file_path: item.file_path,
        errors: ["Invalid acknowledgment timestamp values."]
      });
    }
  }

  return {
    active,
    expired,
    invalid
  };
}

export function createAcknowledgment(cwd, input = {}) {
  const policy = safeReadPolicy(cwd);
  const ttlMinutes = Number.isInteger(input.ttl_minutes) && input.ttl_minutes > 0
    ? input.ttl_minutes
    : (policy?.acknowledgment_ttl_minutes ?? 1440);

  const createdAt = input.created_at ?? toIsoNow();
  const expiresAt = new Date(Date.parse(createdAt) + (ttlMinutes * 60 * 1000)).toISOString();
  const ackId = input.ack_id ?? `ack-${Date.now()}`;

  const record = normalizeAxisAcknowledgmentRecord({
    ack_id: ackId,
    task_id: input.task_id,
    work_session_id: input.work_session_id,
    actor: input.actor,
    files: input.files,
    reason: input.reason,
    approved_by: input.approved_by,
    created_at: createdAt,
    expires_at: expiresAt
  });

  const validation = validateAxisAcknowledgmentRecord(record);
  if (!validation.ok) {
    const error = new Error("Acknowledgment validation failed.");
    error.details = validation.errors;
    throw error;
  }

  const ackDir = join(cwd, ".axis", "acknowledgments");
  ensureDir(ackDir);

  const filePath = join(ackDir, `${ackId}.json`);
  writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`);
  appendEnforcementAuditEvent(cwd, {
    event_type: "acknowledgment_created",
    task_id: record.task_id,
    work_session_id: record.work_session_id,
    actor: record.actor,
    status: "ok",
    details: {
      ack_id: record.ack_id,
      files: record.files,
      expires_at: record.expires_at,
      approved_by: record.approved_by
    }
  });

  return {
    file_path: filePath,
    record
  };
}

export function parseAckArgs(argv) {
  const options = {
    cwd: process.cwd(),
    task_id: null,
    work_session_id: null,
    actor: null,
    files: [],
    reason: null,
    approved_by: null,
    ttl_minutes: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--cwd") {
      options.cwd = resolve(argv[index + 1] ?? process.cwd());
      index += 1;
      continue;
    }

    if (arg === "--task-id") {
      options.task_id = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--work-session-id") {
      options.work_session_id = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--actor") {
      options.actor = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--files") {
      options.files = (argv[index + 1] ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      index += 1;
      continue;
    }

    if (arg === "--reason") {
      options.reason = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--approved-by") {
      options.approved_by = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--ttl-minutes") {
      const raw = Number.parseInt(argv[index + 1] ?? "", 10);
      options.ttl_minutes = Number.isFinite(raw) ? raw : null;
      index += 1;
    }
  }

  return options;
}
