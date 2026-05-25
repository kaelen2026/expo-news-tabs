import { router } from "./core/trpc";
import { authRouter } from "./modules/auth";
import { favoritesRouter } from "./modules/favorites";
import { newsRouter } from "./modules/news";
import { preferencesRouter } from "./modules/preferences";
import { readsRouter } from "./modules/reads";

// The app router is the sum of the module routers. Adding a new module
// means importing its router here and slotting it under a stable key —
// no further wiring required.
export const appRouter = router({
  auth: authRouter,
  favorites: favoritesRouter,
  reads: readsRouter,
  preferences: preferencesRouter,
  news: newsRouter,
});

export type AppRouter = typeof appRouter;
