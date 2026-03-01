import { edgeEndpoints } from "./edge-endpoints.mjs";
import { edgeTypeSet } from "./edge-types.mjs";

export const sharedEdgeRequiredFields = Object.freeze([
  "id",
  "type",
  "source_id",
  "source_type",
  "target_id",
  "target_type",
  "revision",
  "etag",
  "meta",
  "created_at",
  "updated_at"
]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isIsoDateString(value) {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }
  return Number.isFinite(Date.parse(value));
}

function requireField(edge, field, errors) {
  if (!(field in edge)) {
    errors.push(`Missing required field: ${field}`);
    return false;
  }
  return true;
}

function validateSharedFields(edge, errors) {
  for (const field of sharedEdgeRequiredFields) {
    requireField(edge, field, errors);
  }

  if (typeof edge.id !== "string" || edge.id.trim() === "") {
    errors.push("Field id must be a non-empty string.");
  }

  if (!edgeTypeSet.has(edge.type)) {
    errors.push(`Field type must be one of: ${[...edgeTypeSet].join(", ")}`);
  }

  if (typeof edge.source_id !== "string" || edge.source_id.trim() === "") {
    errors.push("Field source_id must be a non-empty string.");
  }

  if (typeof edge.target_id !== "string" || edge.target_id.trim() === "") {
    errors.push("Field target_id must be a non-empty string.");
  }

  if (typeof edge.source_type !== "string" || edge.source_type.trim() === "") {
    errors.push("Field source_type must be a non-empty string.");
  }

  if (typeof edge.target_type !== "string" || edge.target_type.trim() === "") {
    errors.push("Field target_type must be a non-empty string.");
  }

  if (!Number.isInteger(edge.revision) || edge.revision < 1) {
    errors.push("Field revision must be an integer >= 1.");
  }

  if (typeof edge.etag !== "string" || edge.etag.trim() === "") {
    errors.push("Field etag must be a non-empty string.");
  }

  if (!isObject(edge.meta)) {
    errors.push("Field meta must be an object.");
  }

  if (!isIsoDateString(edge.created_at)) {
    errors.push("Field created_at must be an ISO date string.");
  }

  if (!isIsoDateString(edge.updated_at)) {
    errors.push("Field updated_at must be an ISO date string.");
  }
}

function validateEndpoints(edge, errors) {
  if (!(edge.type in edgeEndpoints)) {
    return;
  }

  const rule = edgeEndpoints[edge.type];

  if (!rule.source.includes(edge.source_type)) {
    errors.push(
      `Invalid source_type '${edge.source_type}' for edge type '${edge.type}'. Allowed: ${rule.source.join(
        ", "
      )}`
    );
  }

  if (!rule.target.includes(edge.target_type)) {
    errors.push(
      `Invalid target_type '${edge.target_type}' for edge type '${edge.type}'. Allowed: ${rule.target.join(
        ", "
      )}`
    );
  }
}

export function validateEdge(edge) {
  const errors = [];

  if (!isObject(edge)) {
    return {
      ok: false,
      errors: ["Edge must be an object."]
    };
  }

  validateSharedFields(edge, errors);
  validateEndpoints(edge, errors);

  return {
    ok: errors.length === 0,
    errors
  };
}
