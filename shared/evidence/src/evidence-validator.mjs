function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function allStrings(values) {
  return Array.isArray(values) && values.every((value) => isNonEmptyString(value));
}

function isBoolean(value) {
  return typeof value === "boolean";
}

export function validateEvidence(evidence) {
  const errors = [];

  if (!isObject(evidence)) {
    return {
      ok: false,
      errors: ["Evidence must be an object."]
    };
  }

  if (!isNonEmptyString(evidence.id)) {
    errors.push("Field id must be a non-empty string.");
  }

  if (!Array.isArray(evidence.artifacts) || evidence.artifacts.length === 0 || !allStrings(evidence.artifacts)) {
    errors.push("Field artifacts must be a non-empty array of strings.");
  }

  if (!Array.isArray(evidence.touched_files) || !allStrings(evidence.touched_files)) {
    errors.push("Field touched_files must be an array of strings.");
  }

  if (!Array.isArray(evidence.command_results)) {
    errors.push("Field command_results must be an array.");
  } else {
    for (const [index, commandResult] of evidence.command_results.entries()) {
      if (!isObject(commandResult)) {
        errors.push(`command_results[${index}] must be an object.`);
        continue;
      }

      if (!isNonEmptyString(commandResult.command)) {
        errors.push(`command_results[${index}].command must be a non-empty string.`);
      }

      if (!isBoolean(commandResult.passed)) {
        errors.push(`command_results[${index}].passed must be a boolean.`);
      }
    }
  }

  if (!Array.isArray(evidence.validation_assertions)) {
    errors.push("Field validation_assertions must be an array.");
  } else {
    for (const [index, assertion] of evidence.validation_assertions.entries()) {
      if (!isObject(assertion)) {
        errors.push(`validation_assertions[${index}] must be an object.`);
        continue;
      }

      if (!isNonEmptyString(assertion.clause_id)) {
        errors.push(`validation_assertions[${index}].clause_id must be a non-empty string.`);
      }

      if (!isBoolean(assertion.passed)) {
        errors.push(`validation_assertions[${index}].passed must be a boolean.`);
      }

      if (!isNonEmptyString(assertion.note)) {
        errors.push(`validation_assertions[${index}].note must be a non-empty string.`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
