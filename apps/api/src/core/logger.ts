import { type Logger, pino } from "pino";

// Single pino instance for the API. Procedures and middleware should
// import this directly, or use a per-request child logger that adds
// `requestId` (see `request-logger.ts`).
//
// In dev we route through `pino-pretty` for human-readable output; in
// production we emit one JSON object per line so log shippers (Loki,
// Datadog, etc.) can parse it without configuration.
const isProd = process.env.NODE_ENV === "production";

export const logger: Logger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  base: { service: "api" },
  ...(isProd
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss.l",
            ignore: "pid,hostname,service",
          },
        },
      }),
});

// Hono `Variables` shape produced by `requestLogger`. Apps that build
// the root `Hono` instance should parameterize it with this env so
// `c.var.logger` and `c.var.requestId` are typed.
export type AppEnv = {
  Variables: {
    requestId: string;
    logger: Logger;
  };
};
