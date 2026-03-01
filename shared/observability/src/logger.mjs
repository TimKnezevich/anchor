import { mapErrorToLog } from "./error-log-mapper.mjs";
import { createRedactKeySet, redactContext } from "./redaction.mjs";

const levelPriority = Object.freeze({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
});

function canLog(minLevel, level) {
  return levelPriority[level] >= levelPriority[minLevel];
}

function getSinkMethod(sink, level) {
  if (typeof sink[level] === "function") {
    return sink[level].bind(sink);
  }

  return sink.log.bind(sink);
}

export function createLogger(options = {}) {
  const service = options.service ?? "axis";
  const minLevel = options.minLevel ?? "debug";
  const baseContext = options.baseContext ?? {};
  const sink = options.sink ?? console;
  const redactKeys = createRedactKeySet(options.extraRedactKeys ?? []);

  function emit(level, message, context = {}, error = null) {
    if (!canLog(minLevel, level)) {
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      context: redactContext({ ...baseContext, ...context }, redactKeys)
    };

    if (error !== null) {
      payload.error = mapErrorToLog(error, { extraRedactKeys: [...redactKeys] }).error;
    }

    getSinkMethod(sink, level)(JSON.stringify(payload));
  }

  return {
    debug: (message, context = {}) => emit("debug", message, context),
    info: (message, context = {}) => emit("info", message, context),
    warn: (message, context = {}, error = null) => emit("warn", message, context, error),
    error: (message, context = {}, error = null) => emit("error", message, context, error),
    child: (context = {}) =>
      createLogger({
        service,
        minLevel,
        sink,
        baseContext: { ...baseContext, ...context },
        extraRedactKeys: [...redactKeys]
      })
  };
}
