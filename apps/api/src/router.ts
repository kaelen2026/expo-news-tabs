// Public entry for clients (`apps/web`, `apps/mobile`). They import
// `type { AppRouter } from "api"` to type their tRPC clients; the
// concrete `appRouter` runs in `server.ts`. Keep this file thin so
// internal restructuring never reaches the client surface.
export { type AppRouter, appRouter } from "./app.router";
