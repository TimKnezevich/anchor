const evidenceAllowedFields = new Set([
  "schema_version",
  "evidence_id",
  "task_id",
  "work_session_id",
  "actor",
  "files",
  "recorded_at"
]);

const acknowledgmentAllowedFields = new Set([
  "schema_version",
  "ack_id",
  "task_id",
  "work_session_id",
  "actor",
  "files",
  "reason",
  "approved_by",
  "created_at",
  "expires_at"
]);

const defaultSchemaVersion = "1";

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isIsoTimestamp(value) {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

function validateFilesArray(files, errors, fieldName = "files") {
  if (!Array.isArray(files) || files.length === 0) {
    errors.push(`Field '${fieldName}' must be a non-empty array of file paths.`);
    return;
  }

  const uniqueFiles = new Set();
  for (const [index, filePath] of files.entries()) {
    if (!isNonEmptyString(filePath)) {
      errors.push(`${fieldName}[${index}] must be a non-empty string.`);
      continue;
    }

    if (uniqueFiles.has(filePath)) {
      errors.push(`${fieldName}[${index}] duplicates file path '${filePath}'.`);
      continue;
    }

    uniqueFiles.add(filePath);
  }
}

function validateUnknownFields(input, allowedFields, errors, label) {
  for (const fieldName of Object.keys(input)) {
    if (!allowedFields.has(fieldName)) {
      errors.push(`Field '${fieldName}' is not allowed in ${label}.`);
    }
  }
}

export function normalizeAxisEvidenceLinkRecord(record = {}) {
  const base = isObject(record) ? record : {};
  return {
    schema_version: defaultSchemaVersion,
    ...base,
    files: Array.isArray(base.files) ? [...base.files] : []
  };
}

export function validateAxisEvidenceLinkRecord(record) {
  const errors = [];

  if (!isObject(record)) {
    return {
      ok: false,
      errors: ["Axis evidence link record must be an object."]
    };
  }

  validateUnknownFields(record, evidenceAllowedFields, errors, "axis evidence link record");

  if (!isNonEmptyString(record.schema_version)) {
    errors.push("Field 'schema_version' must be a non-empty string.");
  }

  if (!isNonEmptyString(record.evidence_id)) {
    errors.push("Field 'evidence_id' must be a non-empty string.");
  }

  if (!isNonEmptyString(record.task_id)) {
    errors.push("Field 'task_id' must be a non-empty string.");
  }

  if (!isNonEmptyString(record.work_session_id)) {
    errors.push("Field 'work_session_id' must be a non-empty string.");
  }

  if (!isNonEmptyString(record.actor)) {
    errors.push("Field 'actor' must be a non-empty string.");
  }

  validateFilesArray(record.files, errors);

  if (!isIsoTimestamp(record.recorded_at)) {
    errors.push("Field 'recorded_at' must be a valid ISO timestamp string.");
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

export function normalizeAxisAcknowledgmentRecord(record = {}) {
  const base = isObject(record) ? record : {};
  return {
    schema_version: defaultSchemaVersion,
    ...base,
    files: Array.isArray(base.files) ? [...base.files] : []
  };
}

export function validateAxisAcknowledgmentRecord(record) {
  const errors = [];

  if (!isObject(record)) {
    return {
      ok: false,
      errors: ["Axis acknowledgment record must be an object."]
    };
  }

  validateUnknownFields(record, acknowledgmentAllowedFields, errors, "axis acknowledgment record");

  if (!isNonEmptyString(record.schema_version)) {
    errors.push("Field 'schema_version' must be a non-empty string.");
  }

  if (!isNonEmptyString(record.ack_id)) {
    errors.push("Field 'ack_id' must be a non-empty string.");
  }

  if (!isNonEmptyString(record.task_id)) {
    errors.push("Field 'task_id' must be a non-empty string.");
  }

  if (!isNonEmptyString(record.work_session_id)) {
    errors.push("Field 'work_session_id' must be a non-empty string.");
  }

  if (!isNonEmptyString(record.actor)) {
    errors.push("Field 'actor' must be a non-empty string.");
  }

  validateFilesArray(record.files, errors);

  if (!isNonEmptyString(record.reason)) {
    errors.push("Field 'reason' must be a non-empty string.");
  }

  if (!isNonEmptyString(record.approved_by)) {
    errors.push("Field 'approved_by' must be a non-empty string.");
  }

  if (!isIsoTimestamp(record.created_at)) {
    errors.push("Field 'created_at' must be a valid ISO timestamp string.");
  }

  if (!isIsoTimestamp(record.expires_at)) {
    errors.push("Field 'expires_at' must be a valid ISO timestamp string.");
  }

  if (isIsoTimestamp(record.created_at) && isIsoTimestamp(record.expires_at)) {
    const createdAt = Date.parse(record.created_at);
    const expiresAt = Date.parse(record.expires_at);
    if (expiresAt <= createdAt) {
      errors.push("Field 'expires_at' must be after 'created_at'.");
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
