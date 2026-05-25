# News Tabs (Monorepo)

Turborepo workspace with three apps:

- **`apps/mobile`** — the original Expo Router app (iOS / Android / Web via
  Metro). React 19, React Native 0.85, New Architecture.
- **`apps/web`** — a Next.js 16 App Router landing page with Tailwind CSS v4,
  consuming the API via tRPC.
- **`apps/api`** — a Hono server exposing a tRPC router that serves the news
  data shared between web and mobile.

Type safety is end-to-end: `apps/api` exports the `AppRouter` type, and both
`apps/web` and `apps/mobile` depend on it as a workspace package (`"api":
"workspace:*"`) for fully-typed tRPC clients.

## Stack

| Workspace     | Tech                                                       |
| ------------- | ---------------------------------------------------------- |
| Monorepo      | pnpm workspaces + Turborepo                                |
| `apps/api`    | Hono 4, tRPC 11, Zod, `@hono/node-server`                  |
| `apps/web`    | Next.js 16, App Router, Tailwind CSS v4, React 19          |
| `apps/mobile` | Expo SDK 56, expo-router, React Native 0.85, New Arch      |
| Lint / Format | Biome 2 (single root config)                               |
| Tests         | Vitest                                                     |
| Language      | TypeScript 6, `strict` enabled, shared `tsconfig.base.json`|

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

Prerequisites: Node 24+, pnpm 9+ (`corepack enable pnpm` works).

```sh
pnpm install
```

Run an app:

```sh
pnpm --filter api dev      # http://localhost:3001
pnpm --filter web dev      # http://localhost:3000
pnpm --filter mobile dev   # Expo dev server (QR code)
```

To use the live API from the mobile app on a device, set
`EXPO_PUBLIC_API_URL=http://<your-lan-ip>:3001` before `expo start`, or let
`lib/trpc.tsx` derive it from Metro's `hostUri`. From a web browser pointed at
`apps/web`, set `NEXT_PUBLIC_API_URL` if the API isn't on `localhost:3001`.

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
