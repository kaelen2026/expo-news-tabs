import "dotenv/config";
import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { appRouter } from "./router";
import { createContextFromHeaders } from "./trpc";

const app = new Hono();

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

app.use("*", logger());
app.use(
  "*",
  cors({
    // Allow any origin for /auth and /trpc; credentials require a specific
    // origin so the function form is used. Mobile sends Authorization, so it
    // doesn't need credentialed cookies — but the origin echo keeps both
    // browser (web) and native (mobile) clients happy.
    origin: (origin) => origin ?? webOrigin,
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
    createContext: (_opts, c) => createContextFromHeaders(c.req.raw.headers),
  }),
);

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`api listening on http://localhost:${info.port}`);
});
