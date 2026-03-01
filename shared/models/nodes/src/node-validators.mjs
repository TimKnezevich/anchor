import { nodeStatusMap } from "./node-status.mjs";
import { nodeTypeSet } from "./node-types.mjs";

export const sharedRequiredFields = Object.freeze([
  "id",
  "type",
  "status",
  "revision",
  "etag",
  "meta",
  "created_at",
  "updated_at"
]);

export const typeRequiredFields = Object.freeze({
  SPEC: ["spec_key", "semantic_version", "clause_index"],
  TASK: ["title", "clause_links"],
  CODE_UNIT: ["module_key"],
  ADR: ["title", "decision"],
  POLICY: ["policy_key"],
  CONTRACT: ["contract_key"],
  EVIDENCE: ["task_id", "artifacts"],
  IDEA: ["summary"],
  DRAFT: ["draft_kind"],
  EPIC: ["title"]
});

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isIsoDateString(value) {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}

function requireField(node, field, errors) {
  if (!(field in node)) {
    errors.push(`Missing required field: ${field}`);
    return false;
  }

  return true;
}

function validateSharedFields(node, errors) {
  for (const field of sharedRequiredFields) {
    requireField(node, field, errors);
  }

  if (typeof node.id !== "string" || node.id.trim() === "") {
    errors.push("Field id must be a non-empty string.");
  }

  if (typeof node.etag !== "string" || node.etag.trim() === "") {
    errors.push("Field etag must be a non-empty string.");
  }

  if (!Number.isInteger(node.revision) || node.revision < 1) {
    errors.push("Field revision must be an integer >= 1.");
  }

  if (!nodeTypeSet.has(node.type)) {
    errors.push(`Field type must be one of: ${[...nodeTypeSet].join(", ")}`);
  }

  if (!isObject(node.meta)) {
    errors.push("Field meta must be an object.");
  }

  if (!isIsoDateString(node.created_at)) {
    errors.push("Field created_at must be an ISO date string.");
  }

  if (!isIsoDateString(node.updated_at)) {
    errors.push("Field updated_at must be an ISO date string.");
  }
}

function validateStatus(node, errors) {
  if (typeof node.status !== "string" || node.status.trim() === "") {
    errors.push("Field status must be a non-empty string.");
    return;
  }

  if (!(node.type in nodeStatusMap)) {
    return;
  }

  const allowed = nodeStatusMap[node.type];
  if (!allowed.includes(node.status)) {
    errors.push(
      `Invalid status '${node.status}' for type '${node.type}'. Allowed: ${allowed.join(", ")}`
    );
  }
}

function validateTypeSpecificFields(node, errors) {
  if (!(node.type in typeRequiredFields)) {
    return;
  }

  const required = typeRequiredFields[node.type];
  for (const field of required) {
    requireField(node, field, errors);
  }

  if (node.type === "TASK" && !Array.isArray(node.clause_links)) {
    errors.push("TASK field clause_links must be an array.");
  }

  if (node.type === "SPEC" && !Array.isArray(node.clause_index)) {
    errors.push("SPEC field clause_index must be an array.");
  }

  if (node.type === "EVIDENCE" && !Array.isArray(node.artifacts)) {
    errors.push("EVIDENCE field artifacts must be an array.");
  }
}

export function validateNode(node) {
  const errors = [];

  if (!isObject(node)) {
    return {
      ok: false,
      errors: ["Node must be an object."]
    };
  }

  validateSharedFields(node, errors);
  validateStatus(node, errors);
  validateTypeSpecificFields(node, errors);

  return {
    ok: errors.length === 0,
    errors
  };
}
