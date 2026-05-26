import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { appRouter } from "./app.router";
import { getConfig } from "./core/config";
import { createContextFactory } from "./core/context";
import { type AppEnv, logger } from "./core/logger";
import { requestLogger } from "./core/request-logger";
import { auth } from "./modules/auth";

const config = getConfig();

// Translate better-auth's session shape into the context the core layer
// expects. Keeps `core/` ignorant of better-auth.
const createContext = createContextFactory(async (headers) => {
  const result = await auth.api.getSession({ headers });
  if (!result) return null;
  return { user: result.user, session: result.session };
});

const app = new Hono<AppEnv>();

app.use("*", requestLogger);
app.use(
  "*",
  cors({
    // Allow any origin for /auth and /trpc; credentials require a specific
    // origin so the function form is used. Mobile sends Authorization, so it
    // doesn't need credentialed cookies — but the origin echo keeps both
    // browser (web) and native (mobile) clients happy.
    origin: (origin) => origin ?? config.webOrigin,
    credentials: true,
    allowHeaders: ["Authorization", "Content-Type"],
  }),
);

app.get("/", (c) => c.json({ status: "ok", service: "expo-news-tabs api" }));

// Liveness probe — process is up and the event loop is responsive. Kept
// dependency-free on purpose: a DB hiccup should not cause the orchestrator
// to recycle the pod. Reserve a future /readyz for deep dependency checks.
app.get("/healthz", (c) => c.json({ status: "ok" }));

// better-auth handler — used by mobile for sign-in/sign-up and by anyone
// hitting /auth/get-session etc. Web continues to use its own /api/auth/* on :3000.
app.all("/auth/*", (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    endpoint: "/trpc",
    createContext: (_opts, c) => createContext(c.req.raw.headers, c.var.requestId),
    onError({ error, path, type, ctx }) {
      // Expected client-facing errors (bad input, unauthorized, etc.)
      // still bubble back to the caller; only surface the unexpected
      // ones at error level so log review can stay focused.
      const child = ctx?.requestId ? logger.child({ requestId: ctx.requestId }) : logger;
      const meta = { path, type, code: error.code };
      if (error.code === "INTERNAL_SERVER_ERROR") {
        child.error({ ...meta, err: error }, "trpc internal error");
      } else {
        child.warn(meta, "trpc error");
      }
    },
  }),
);

// Cloudflare Workers entrypoint. `wrangler dev` and the deployed Worker
// both call this default export's fetch. There's no long-running listen
// step — each request is a function invocation.
export default {
  fetch: app.fetch,
};
