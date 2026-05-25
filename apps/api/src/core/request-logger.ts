import { randomUUID } from "node:crypto";
import { createMiddleware } from "hono/factory";
import { type AppEnv, logger } from "./logger";

const REQUEST_ID_HEADER = "x-request-id";

// Hono middleware that stamps each request with a UUID (honoring an
// inbound `X-Request-Id` if present), attaches a child logger that
// includes that id, and emits one structured line per request with
// method / path / status / duration.
export const requestLogger = createMiddleware<AppEnv>(async (c, next) => {
  const incoming = c.req.header(REQUEST_ID_HEADER);
  const requestId = incoming ?? randomUUID();
  const child = logger.child({ requestId });

  c.set("requestId", requestId);
  c.set("logger", child);
  c.header(REQUEST_ID_HEADER, requestId);

  const started = performance.now();
  try {
    await next();
  } finally {
    const durationMs = Math.round(performance.now() - started);
    child.info(
      {
        method: c.req.method,
        path: new URL(c.req.url).pathname,
        status: c.res.status,
        durationMs,
      },
      "request",
    );
  }
});
