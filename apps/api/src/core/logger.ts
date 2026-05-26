// Workers-native structured logger. Mirrors the subset of pino's API
// that the codebase actually uses (info/warn/error/debug + child), so
// call sites in server.ts and request-logger.ts didn't change when we
// dropped the pino dependency.
//
// Each log line is a single JSON object on stdout/stderr — Cloudflare
// Workers Logs (and `wrangler tail`) ingest these as structured events
// without extra config. Errors are serialized via a replacer because
// JSON.stringify drops the `Error` prototype properties otherwise.

type LogBindings = Record<string, unknown>;

interface LogFn {
  (msg: string): void;
  (obj: LogBindings, msg?: string): void;
}

export interface Logger {
  info: LogFn;
  warn: LogFn;
  error: LogFn;
  debug: LogFn;
  child(bindings: LogBindings): Logger;
}

const LEVELS = { debug: 20, info: 30, warn: 40, error: 50 } as const;
type Level = keyof typeof LEVELS;

const minLevel: number = (() => {
  const configured = (process.env.LOG_LEVEL ?? "").toLowerCase();
  if (configured in LEVELS) return LEVELS[configured as Level];
  return process.env.NODE_ENV === "production" ? LEVELS.info : LEVELS.debug;
})();

function errorReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function emit(
  level: Level,
  bindings: LogBindings,
  obj: LogBindings,
  msg: string | undefined,
): void {
  if (LEVELS[level] < minLevel) return;
  const entry: Record<string, unknown> = {
    level,
    time: Date.now(),
    ...bindings,
    ...obj,
  };
  if (msg !== undefined) entry.msg = msg;
  const line = JSON.stringify(entry, errorReplacer);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function makeLogger(bindings: LogBindings): Logger {
  function fn(level: Level): LogFn {
    return ((objOrMsg: LogBindings | string, maybeMsg?: string) => {
      if (typeof objOrMsg === "string") {
        emit(level, bindings, {}, objOrMsg);
      } else {
        emit(level, bindings, objOrMsg, maybeMsg);
      }
    }) as LogFn;
  }
  return {
    info: fn("info"),
    warn: fn("warn"),
    error: fn("error"),
    debug: fn("debug"),
    child(extra) {
      return makeLogger({ ...bindings, ...extra });
    },
  };
}

export const logger: Logger = makeLogger({ service: "api" });

// Hono `Variables` shape produced by `requestLogger`. Apps that build
// the root `Hono` instance should parameterize it with this env so
// `c.var.logger` and `c.var.requestId` are typed.
export type AppEnv = {
  Variables: {
    requestId: string;
    logger: Logger;
  };
};
