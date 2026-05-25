# News Tabs (Monorepo)

Turborepo workspace with three apps and two shared packages:

- **`apps/mobile`** — Expo Router app (iOS / Android / Web via Metro).
  React 19, React Native 0.85, New Architecture. Bearer-token auth so
  the native app can talk to the API directly.
- **`apps/web`** — Next.js 16 App Router app with Tailwind CSS v4. Hosts
  its own better-auth route at `/api/auth/*` and consumes the API via
  tRPC.
- **`apps/api`** — Hono server. Exposes a tRPC router backed by
  **PostgreSQL + Drizzle ORM** and a second better-auth instance at
  `/auth/*` for mobile. Multi-stage Dockerfile builds to `dist/` and
  runs the compiled output.
- **`packages/db`** — shared Drizzle schema (news + better-auth tables)
  and postgres-js client used by `apps/api`, `apps/web`, and
  `packages/auth-config`.
- **`packages/auth-config`** — shared better-auth ingredients (secret,
  Drizzle adapter, plugins, email/password) that MUST agree across
  `apps/api` and `apps/web` for cross-app sessions to interoperate.
  Refuses to start in production with the dev fallback secret.

Type safety is end-to-end: `apps/api` exports the `AppRouter` type, and both
`apps/web` and `apps/mobile` depend on it as a workspace package (`"api":
"workspace:*"`) for fully-typed tRPC clients.

## Stack

| Workspace             | Tech                                                       |
| --------------------- | ---------------------------------------------------------- |
| Monorepo              | pnpm workspaces + Turborepo                                |
| `apps/api`            | Hono 4, tRPC 11, Zod, `@hono/node-server`, Drizzle, Docker |
| `apps/web`            | Next.js 16, App Router, Tailwind CSS v4, React 19, better-auth |
| `apps/mobile`         | Expo SDK 56, expo-router, React Native 0.85, New Arch      |
| `packages/db`         | Drizzle ORM + postgres-js, drizzle-kit migrations          |
| `packages/auth-config`| Shared better-auth options (secret, adapter, plugins)      |
| Database              | PostgreSQL 17 (via `docker-compose.yml`)                   |
| Lint / Format         | Biome 2 (single root config)                               |
| Tests                 | Vitest                                                     |
| Language              | TypeScript 6, `strict` enabled, shared `tsconfig.base.json`|

## Layout

```
apps/
  api/
    src/
      server.ts          Hono entry: CORS + logger + mounted tRPC at /trpc and better-auth at /auth/*
      app.router.ts      Composes per-module tRPC routers; exports AppRouter
      core/              trpc init, request context, env config
      modules/
        auth/            better-auth handler + tRPC auth router (auth.me)
        news/            Cursor-paginated news.list + news.byId (reads from Postgres)
        favorites/       favorites.list / ids / toggle (authed)
        reads/           reads.list / ids / markRead (authed)
        preferences/     preferences.get / update (authed; theme/fontSize/defaultCategory)
  web/
    app/
      layout.tsx          Root layout, wraps in TrpcProvider
      page.tsx            Home feed; category chip row driven by preferences.defaultCategory
      categories.ts       Shared chip set + isKnownCategory guard
      preferences/        Theme / fontSize / default-category editor
      favorites/          Favorited stories
      sign-in/, sign-up/  better-auth email+password forms
      api/auth/[...all]/  better-auth route handler
      trpc-provider.tsx   Client-side tRPC + React Query provider
      globals.css         Tailwind v4 (@import "tailwindcss") + @theme tokens
    lib/
      auth.ts             Server-side betterAuth() (spreads shared options)
      auth-client.ts      Client-side createAuthClient
    next.config.ts
    postcss.config.mjs
  mobile/
    app/
      (tabs)/             Home (chip-filtered feed), Favorites, Profile
      news/[id].tsx       Story detail
      settings.tsx        Theme picker (synced via preferences.update)
      sign-in.tsx, sign-up.tsx
      _layout.tsx         Stack + AuthProvider + TrpcProvider
    components/           Reusable UI primitives + NewsCard
    contexts/             Theme context
    lib/
      auth.tsx            AuthProvider; bearer token in SecureStore (native) / localStorage (web)
      trpc.tsx            tRPC + React Query provider; attaches Authorization header
    metro.config.js       Monorepo-aware Metro config (watchFolders + nodeModulesPaths)
    app.config.js         Re-exports app.json; picks a non-VPN LAN host for Metro
    app.json              Expo config source (name, scheme, native identifiers)
packages/
  db/                     Drizzle schema + postgres-js client (lazy getDb)
  auth-config/            getSharedAuthOptions() + production secret check
.agents/                  Project rules, skills, and review sub-agent (mobile-focused)
biome.json                Single Biome config for all workspaces
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
pnpm --filter mobile dev   # Metro dev server (loads in the custom dev client)
```

To use the live API from the mobile app on a device, set
`EXPO_PUBLIC_API_URL=http://<your-lan-ip>:3001` before `expo start`, or let
`lib/trpc.tsx` derive it from Metro's `hostUri`. From a web browser pointed at
`apps/web`, set `NEXT_PUBLIC_API_URL` if the API isn't on `localhost:3001`.

### Mobile dev client

`apps/mobile` runs in a custom Expo dev client, not the Expo Go app from the
App Store — Expo Go lags SDK 56 and refuses to load this project. Build the
dev client once per device, then `pnpm --filter mobile dev` for daily work.

```sh
# iOS — needs Xcode and an Apple ID added in Xcode → Settings → Accounts.
# Enable Developer Mode on the iPhone (Settings → Privacy & Security).
pnpm --filter mobile ios -- --device "<iPhone name>"

# Android — needs Android Studio and a connected device or running emulator.
pnpm --filter mobile android
```

After install, `pnpm --filter mobile dev` starts Metro and the dev client on
the device picks it up automatically. `apps/mobile/app.config.js` chooses a
LAN IP the phone can actually reach, skipping VPN-injected interfaces
(OpenVPN / Cisco AnyConnect's `198.18.x.x`, link-local, CGNAT) before Expo CLI
builds the manifest URL. Override with `REACT_NATIVE_PACKAGER_HOSTNAME=...`
if you need to pin a specific host.

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

### Auth

`apps/api` and `apps/web` each run their own better-auth instance against
the same Postgres database, so a session minted by either side verifies
on the other:

- **`apps/web`** mounts better-auth at `/api/auth/[...all]`. Cookie-based
  sessions for the browser; Google / GitHub OAuth turn on automatically
  when their client ID + secret env vars are set (see
  `apps/web/.env.example`). Sign-in / sign-up live at `/sign-in` and
  `/sign-up`; the landing page shows a `<SessionIndicator />` that
  swaps between sign in/out links.
- **`apps/api`** mounts better-auth at `/auth/*` for mobile. Native
  clients can't share browser cookies, so the [bearer
  plugin](https://www.better-auth.com/docs/plugins/bearer) lets the
  Expo app send `Authorization: Bearer <token>` after sign-in. The
  token is stored in `expo-secure-store` on native and `localStorage`
  on web (see `apps/mobile/lib/auth.tsx`).

The shared parts of the config — secret, Drizzle adapter, plugins,
email/password — live in `packages/auth-config` so the two instances
can't drift. **`BETTER_AUTH_SECRET` MUST be byte-identical on both
apps**; the shared package refuses to start in production with the dev
fallback. `DATABASE_URL` must also point at the same database since
sessions live there.

The mobile Profile tab shows the signed-in user, a Read / Saved / Topics
stat row computed from `reads.ids` + `favorites.list`, and a sign-out
button.

## Quality Checks

```sh
pnpm typecheck   # turbo run typecheck across all workspaces
pnpm lint        # biome check . (root)
pnpm test        # turbo run test
pnpm format      # biome format --write .
```

Tests in `apps/api/src/router.test.ts` that touch Postgres are gated on
`TEST_DATABASE_URL` and skipped without it — point it at a throwaway
database (the test suite TRUNCATEs tables it owns):

```sh
TEST_DATABASE_URL=postgresql://app:app@localhost:5432/test pnpm --filter api test
```

CI sets this automatically against a Postgres service container (see
`.github/workflows/ci.yml`); locally, start the compose stack first.

After dependency changes in `apps/mobile` also run:

```sh
pnpm --filter mobile exec npx expo install --check
```

## Deploying `apps/web` to Vercel

`apps/web` is set up for Vercel's native PR preview workflow — every push
to a PR branch produces a unique preview URL; merging the PR makes that
preview inactive (the URL is preserved for audit, not deleted, which is
Vercel's default and not configurable per project).

`apps/web/vercel.json` pins the build:
- `installCommand` filters to `web...` so `apps/mobile`'s Expo deps don't
  install on every Vercel build.
- `buildCommand` runs `turbo build --filter=web` from the repo root.
- `ignoreCommand` short-circuits the build for PRs that don't touch
  `apps/web` or its workspace deps.

### One-time Vercel project setup

1. Create a new Vercel project, import this repo.
2. Set **Root Directory** to `apps/web`. Framework auto-detects as
   Next.js.
3. Add the following environment variables for **Production**,
   **Preview**, and **Development** scopes:

   | Variable                       | Value                                                |
   | ------------------------------ | ---------------------------------------------------- |
   | `DATABASE_URL`                 | Supabase Pooler URL (transaction mode, port 6543)   |
   | `BETTER_AUTH_SECRET`           | `openssl rand -base64 32` — MUST match `apps/api`   |
   | `NEXT_PUBLIC_API_URL`          | Cloudflare Worker URL for `apps/api`                |
   | `BETTER_AUTH_URL`              | Production scope only — pin to your custom domain   |
   | `NEXT_PUBLIC_BETTER_AUTH_URL`  | Production scope only — same as above               |
   | `GOOGLE_CLIENT_ID/SECRET`      | Optional, OAuth provider                            |
   | `GITHUB_CLIENT_ID/SECRET`      | Optional, OAuth provider                            |

   Leave the two `BETTER_AUTH_URL` vars **unset on Preview** — `lib/auth.ts`
   and `lib/auth-client.ts` fall back to `VERCEL_URL` (server) and
   `window.location.origin` (client) so per-PR previews auth against their
   own hostname.

4. First push to `main` after connecting triggers the production
   deployment; future PRs get preview URLs commented on the PR.

## tRPC Contract

`apps/api/src/app.router.ts` composes the per-module routers. Key procedures:

```ts
// news (public)
news.list   ({ cursor?: string; limit?: number })  →  { items: NewsStory[]; nextCursor: string | null }
news.byId   ({ id: string })                       →  NewsStory   (404 → TRPCError NOT_FOUND)

// auth (public; reads session from headers)
auth.me     ()                                     →  { user, session } | null

// favorites / reads (authed)
favorites.list  / favorites.ids  / favorites.toggle({ storyId })
reads.list      / reads.ids      / reads.markRead({ storyId })

// preferences (authed)
preferences.get  / preferences.update({ theme?, fontSize?, defaultCategory? })
```

`news.list` uses opaque cursor pagination — pass the previous response's
`nextCursor` to load the next page. `limit` is clamped to `[1, 50]` and
defaults to `10`.

Both clients consume it the same way:

```ts
import type { AppRouter } from "api";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();

// One-shot
trpc.news.list.useQuery({ limit: 10 });

// Infinite scroll
trpc.news.list.useInfiniteQuery(
  { limit: 10 },
  { getNextPageParam: (last) => last.nextCursor ?? undefined },
);
```

## Reading preferences

`preferences.get` / `preferences.update` persist `theme`, `fontSize`,
and `defaultCategory` per user.

- **`theme`** — `system` / `light` / `dark`. The mobile Settings screen
  hydrates from this on sign-in (`apps/mobile/app/settings.tsx`); the
  web Preferences page edits it directly
  (`apps/web/app/preferences/page.tsx`).
- **`defaultCategory`** — drives the initial selection of the category
  chip row on both home feeds (`apps/web/app/page.tsx`,
  `apps/mobile/app/(tabs)/index.tsx`). The chip set is `All` plus
  `Local / Science / Business / Culture / Sports / Tech`. Stored values
  that don't match a known chip silently fall back to `All`. Subsequent
  chip taps are local to the session — to change the saved default,
  edit it on the web Preferences page.
- **`fontSize`** — stored but not yet consumed in the UI.

Filtering is client-side. `news.list` is unaware of `defaultCategory`;
each client just asks for a bigger page (`limit: 24` vs the unfiltered
`limit: 6`) while a filter is active.

## Agents and Contributor Rules

- [`AGENTS.md`](./AGENTS.md) is the entry point for agents and contributors.
- Detailed rules live in `.agents/rules/` (currently mobile-focused).
- A read-only review sub-agent lives in `.agents/agents/reviewer.md`.
- Project-local skills: `.agents/skills/deploy/SKILL.md` (local
  Gradle / xcodebuild builds) and `.agents/skills/code-review/SKILL.md`.

Read `AGENTS.md` first if you plan to make changes.
