const workSessionTransitionMap = Object.freeze({
  opened: ["active", "closed"],
  active: ["closed"],
  closed: []
});

export const workSessionStates = Object.freeze(Object.keys(workSessionTransitionMap));

export function isValidWorkSessionTransition(from, to) {
  if (!(from in workSessionTransitionMap)) {
    return false;
  }

  return workSessionTransitionMap[from].includes(to);
}

export function assertWorkSessionTransition(from, to) {
  if (isValidWorkSessionTransition(from, to)) {
    return;
  }

  const allowed = from in workSessionTransitionMap ? workSessionTransitionMap[from] : [];
  throw new Error(
    `Invalid work_session transition '${from}' -> '${to}'. Allowed: ${
      allowed.join(", ") || "(none)"
    }`
  );
}

export function getAllowedWorkSessionTransitions(from) {
  if (!(from in workSessionTransitionMap)) {
    return [];
  }

  return [...workSessionTransitionMap[from]];
}
