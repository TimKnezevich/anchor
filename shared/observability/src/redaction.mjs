const defaultRedactKeys = new Set([
  "password",
  "passphrase",
  "secret",
  "token",
  "authorization",
  "apiKey",
  "api_key"
]);

function redactValue(value, redactKeys) {
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, redactKeys));
  }

  if (value !== null && typeof value === "object") {
    return redactContext(value, redactKeys);
  }

  return value;
}

export function redactContext(context, keys = defaultRedactKeys) {
  if (context === null || typeof context !== "object") {
    return context;
  }

  const clone = {};
  for (const [key, value] of Object.entries(context)) {
    if (keys.has(key)) {
      clone[key] = "[REDACTED]";
      continue;
    }

    clone[key] = redactValue(value, keys);
  }

  return clone;
}

export function createRedactKeySet(extraKeys = []) {
  const keySet = new Set(defaultRedactKeys);
  for (const key of extraKeys) {
    keySet.add(key);
  }
  return keySet;
}
