const taskTransitionMap = Object.freeze({
  draft: ["ready", "blocked"],
  ready: ["in_progress", "blocked", "stale"],
  in_progress: ["validated", "failed_validation", "blocked", "stale"],
  validated: ["done", "failed_validation", "stale"],
  done: ["stale"],
  failed_validation: ["in_progress", "blocked", "stale"],
  blocked: ["ready", "in_progress", "stale"],
  stale: ["ready", "blocked"]
});

export const taskStates = Object.freeze(Object.keys(taskTransitionMap));

export function isValidTaskTransition(from, to) {
  if (!(from in taskTransitionMap)) {
    return false;
  }

  return taskTransitionMap[from].includes(to);
}

export function assertTaskTransition(from, to) {
  if (isValidTaskTransition(from, to)) {
    return;
  }

  const allowed = from in taskTransitionMap ? taskTransitionMap[from] : [];
  throw new Error(
    `Invalid TASK transition '${from}' -> '${to}'. Allowed: ${allowed.join(", ") || "(none)"}`
  );
}

export function getAllowedTaskTransitions(from) {
  if (!(from in taskTransitionMap)) {
    return [];
  }

  return [...taskTransitionMap[from]];
}
