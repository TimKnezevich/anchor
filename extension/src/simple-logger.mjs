function noOp() {}

function getSinkMethod(sink, level) {
  if (sink && typeof sink[level] === "function") {
    return sink[level].bind(sink);
  }

  if (sink && typeof sink.log === "function") {
    return sink.log.bind(sink);
  }

  return noOp;
}

export function createSimpleLogger(options = {}) {
  const service = options.service ?? "axis-extension";
  const sink = options.sink ?? console;

  function emit(level, message, context = {}, error = null) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      context
    };

    if (error) {
      payload.error = {
        code: error.code ?? "UNKNOWN",
        message: error.message ?? String(error)
      };
    }

    getSinkMethod(sink, level)(JSON.stringify(payload));
  }

  return {
    debug: (message, context = {}) => emit("debug", message, context),
    info: (message, context = {}) => emit("info", message, context),
    warn: (message, context = {}, error = null) => emit("warn", message, context, error),
    error: (message, context = {}, error = null) => emit("error", message, context, error)
  };
}
