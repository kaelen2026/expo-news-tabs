# News Tabs (Monorepo)

Turborepo workspace with three apps and a shared `db` package:

- **`apps/mobile`** — the original Expo Router app (iOS / Android / Web via
  Metro). React 19, React Native 0.85, New Architecture.
- **`apps/web`** — a Next.js 16 App Router landing page with Tailwind CSS v4,
  consuming the API via tRPC and handling auth with **better-auth**.
- **`apps/api`** — a Hono server exposing a tRPC router that queries
  **PostgreSQL via Drizzle ORM**. Ships with a `Dockerfile`.
- **`packages/db`** — shared Drizzle schema (news + better-auth tables) and
  postgres-js client used by both `apps/api` and `apps/web`.

Type safety is end-to-end: `apps/api` exports the `AppRouter` type, and both
`apps/web` and `apps/mobile` depend on it as a workspace package (`"api":
"workspace:*"`) for fully-typed tRPC clients.

## Stack

| Workspace      | Tech                                                       |
| -------------- | ---------------------------------------------------------- |
| Monorepo       | pnpm workspaces + Turborepo                                |
| `apps/api`     | Hono 4, tRPC 11, Zod, `@hono/node-server`, Drizzle, Docker |
| `apps/web`     | Next.js 16, App Router, Tailwind CSS v4, React 19, better-auth |
| `apps/mobile`  | Expo SDK 56, expo-router, React Native 0.85, New Arch      |
| `packages/db`  | Drizzle ORM + postgres-js, drizzle-kit migrations          |
| Database       | PostgreSQL 17 (via `docker-compose.yml`)                   |
| Lint / Format  | Biome 2 (single root config)                               |
| Tests          | Vitest                                                     |
| Language       | TypeScript 6, `strict` enabled, shared `tsconfig.base.json`|

## Layout

```
apps/
  api/
    src/
      server.ts      Hono entry: CORS + logger + mounted tRPC at /trpc
      router.ts      tRPC router with news.list / news.byId; exports AppRouter
      trpc.ts        initTRPC factory
      news.ts        Mock news data + getStoryById
  web/
    app/
      layout.tsx        Root layout, wraps in TrpcProvider
      page.tsx          Landing page; renders trpc.news.list result
      trpc-provider.tsx Client-side tRPC + React Query provider
      globals.css       Tailwind v4 (@import "tailwindcss") + @theme tokens
    next.config.ts
    postcss.config.mjs
  mobile/
    app/                Expo Router routes (Stack + Tabs)
    components/         Reusable UI primitives
    contexts/           Theme context
    data/               Local mock data + tests
    lib/trpc.tsx        tRPC + React Query provider (resolves API URL via Expo hostUri)
    metro.config.js     Monorepo-aware Metro config (watchFolders + nodeModulesPaths)
.agents/              Project rules, skills, and review sub-agent (mobile-focused)
biome.json            Single Biome config for all workspaces
turbo.json
pnpm-workspace.yaml
tsconfig.base.json
```

## Quick Start

Prerequisites: Node 24+, pnpm 9+ (`corepack enable pnpm` works), Docker.

```sh
pnpm install

# Copy env templates; set BETTER_AUTH_SECRET (openssl rand -base64 32) etc.
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Start Postgres (and the API container if you want it Dockerized)
pnpm docker:up

# Apply schema + seed news rows
pnpm db:migrate
pnpm db:seed
```

Run an app locally:

```sh
pnpm --filter api dev      # http://localhost:3001  (reads DATABASE_URL from apps/api/.env)
pnpm --filter web dev      # http://localhost:3000
pnpm --filter mobile dev   # Expo dev server (QR code)
```

To use the live API from the mobile app on a device, set
`EXPO_PUBLIC_API_URL=http://<your-lan-ip>:3001` before `expo start`, or let
`lib/trpc.tsx` derive it from Metro's `hostUri`. From a web browser pointed at
`apps/web`, set `NEXT_PUBLIC_API_URL` if the API isn't on `localhost:3001`.

### Docker

```sh
pnpm docker:up        # postgres + api (api on :3001, postgres on :5432)
pnpm docker:logs      # follow logs
pnpm docker:down      # stop everything
```

The compose file mounts a `postgres-data` volume so data persists between
restarts. Drop it with `docker compose down -v` for a clean slate.

### Database

`packages/db` owns the Drizzle schema and the postgres-js client. Both
`apps/api` (news queries) and `apps/web` (better-auth's Drizzle adapter)
import from it.

```sh
pnpm db:generate   # diff schema → new SQL migration in packages/db/migrations
pnpm db:migrate    # apply migrations to DATABASE_URL
pnpm db:seed       # upsert news rows from src/seed-data.ts
pnpm db:studio     # open Drizzle Studio
```

### Auth (apps/web)

`apps/web` hosts better-auth at `/api/auth/[...all]`. Email + password is
on by default; Google / GitHub OAuth turn on automatically when their
client ID + secret env vars are set (see `apps/web/.env.example`).

Sign-in / sign-up pages live at `/sign-in` and `/sign-up`. The landing
page shows a `<SessionIndicator />` that swaps between sign in/out links.

## Quality Checks

```sh
pnpm typecheck   # turbo run typecheck across all workspaces
pnpm lint        # biome check . (root)
pnpm test        # turbo run test (mobile data tests; web/api pass with no tests)
pnpm format      # biome format --write .
```

After dependency changes in `apps/mobile` also run:

```sh
pnpm --filter mobile exec npx expo install --check
```

## tRPC Contract

`apps/api/src/router.ts` defines the contract:

```ts
news.list   ({ page?: 1 | 2 | 3 })  →  { page, hasMore, stories: NewsStory[] }
news.byId   ({ id: string })        →  NewsStory   (404 → TRPCError NOT_FOUND)
```

Both clients consume it the same way:

```ts
import type { AppRouter } from "api";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();
// ...
trpc.news.list.useQuery({ page: 1 });
```

## Agents and Contributor Rules

- [`AGENTS.md`](./AGENTS.md) is the entry point for agents and contributors.
- Detailed rules live in `.agents/rules/` (currently mobile-focused).
- A read-only review sub-agent lives in `.agents/agents/reviewer.md`.
- Project-local skills: `.agents/skills/deploy/SKILL.md` (local
  Gradle / xcodebuild builds) and `.agents/skills/code-review/SKILL.md`.

Read `AGENTS.md` first if you plan to make changes.
