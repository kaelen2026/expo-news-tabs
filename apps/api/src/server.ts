import "dotenv/config";
import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { appRouter } from "./app.router";
import { getConfig } from "./core/config";
import { createContextFactory } from "./core/context";
import { auth } from "./modules/auth";

const config = getConfig();

// Translate better-auth's session shape into the context the core layer
// expects. Keeps `core/` ignorant of better-auth.
const createContext = createContextFactory(async (headers) => {
  const result = await auth.api.getSession({ headers });
  if (!result) return null;
  return { user: result.user, session: result.session };
});

const app = new Hono();

app.use("*", logger());
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

// better-auth handler — used by mobile for sign-in/sign-up and by anyone
// hitting /auth/get-session etc. Web continues to use its own /api/auth/* on :3000.
app.all("/auth/*", (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    endpoint: "/trpc",
    createContext: (_opts, c) => createContext(c.req.raw.headers),
  }),
);

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`api listening on http://localhost:${info.port}`);
});
