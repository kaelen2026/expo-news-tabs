import "dotenv/config";
import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { appRouter } from "./router";
import { createContextFromHeaders } from "./trpc";

const app = new Hono();

const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: webOrigin,
    credentials: true,
    allowHeaders: ["Authorization", "Content-Type"],
  }),
);

app.get("/", (c) => c.json({ status: "ok", service: "expo-news-tabs api" }));

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
