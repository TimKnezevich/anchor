import { createHash } from "node:crypto";

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeClauseForHash(clause) {
  const normalized = {
    id: String(clause.id ?? "").trim(),
    kind: String(clause.kind ?? "").trim(),
    text: normalizeWhitespace(String(clause.text ?? "")),
    revision: Number.isInteger(clause.revision) ? clause.revision : 0
  };

  return JSON.stringify(normalized);
}

export function computeClauseHash(clause) {
  const payload = normalizeClauseForHash(clause);
  return createHash("sha256").update(payload).digest("hex");
}
