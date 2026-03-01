const clauseKinds = new Set(["def", "req", "con", "acc", "nongoal"]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateClause(clause) {
  const errors = [];

  if (!isObject(clause)) {
    return {
      ok: false,
      errors: ["Clause must be an object."]
    };
  }

  if (typeof clause.id !== "string" || clause.id.trim() === "") {
    errors.push("Field id must be a non-empty string.");
  }

  if (typeof clause.kind !== "string" || !clauseKinds.has(clause.kind)) {
    errors.push("Field kind must be one of: def, req, con, acc, nongoal.");
  }

  if (typeof clause.text !== "string" || clause.text.trim() === "") {
    errors.push("Field text must be a non-empty string.");
  }

  if (!Number.isInteger(clause.revision) || clause.revision < 1) {
    errors.push("Field revision must be an integer >= 1.");
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
