# Project Agent Guide

This is a Turborepo monorepo with three apps and one shared package.
Read this file before making changes, then follow the per-app conventions
and the detailed rules in `.agents/rules/`.

For a user-facing tour, see [`README.md`](./README.md).

## Workspace Layout

```
apps/
  mobile/   Expo Router app (iOS / Android / Web via Metro)
  web/      Next.js 16 (App Router + Tailwind v4 + better-auth)
  api/      Hono + tRPC server (Node, served via @hono/node-server)
packages/
  db/       Drizzle ORM schema + postgres-js client (news + auth tables)
```

Workspaces are managed by **pnpm** (`pnpm-workspace.yaml`) and tasks are
orchestrated by **Turbo** (`turbo.json`). `apps/api` is the single source of
truth for the `AppRouter` type — `apps/web` and `apps/mobile` depend on it via
`"api": "workspace:*"` and import `AppRouter` for fully-typed tRPC clients.

`packages/db` is the single source of truth for the schema. `apps/api`
queries the news tables; `apps/web` configures better-auth against the
same Postgres database via the Drizzle adapter.

## Commands

Always run these from the repo root before claiming work is complete:

```sh
pnpm install
pnpm typecheck   # turbo run typecheck across all workspaces
pnpm lint        # biome check . (root-level, covers everything)
pnpm test        # turbo run test
```

Database / Docker:

```sh
pnpm docker:up      # start Postgres (and the API container) via docker compose
pnpm db:generate    # generate SQL migrations from packages/db schema changes
pnpm db:migrate     # apply migrations to the Postgres in DATABASE_URL
pnpm db:seed        # seed news_story rows from packages/db/src/seed-data.ts
pnpm db:studio      # open Drizzle Studio against DATABASE_URL
```

Per-app dev servers:

```sh
pnpm --filter api dev      # Hono on http://localhost:3001
pnpm --filter web dev      # Next.js on http://localhost:3000
pnpm --filter mobile dev   # Expo dev server
```

## Reference Rules

The rules in `.agents/rules/` apply across the monorepo. The ones marked
*mobile-only* predate the monorepo and only govern `apps/mobile`:

- `.agents/rules/style-system.md` (mobile-only)
- `.agents/rules/expo-router.md` (mobile-only)
- `.agents/rules/api-design.md` (api workspace + the AppRouter contract)
- `.agents/rules/typescript.md` (all workspaces)
- `.agents/rules/quality.md` (all workspaces)
- `.agents/rules/workflow.md` (all workspaces)

See project-local skills in `.agents/skills/`:

- `.agents/skills/api-design/SKILL.md`
- `.agents/skills/code-review/SKILL.md`
- `.agents/skills/deploy/SKILL.md`

See project-local sub-agents in `.agents/agents/`:

- `.agents/agents/reviewer.md`

## Cross-Workspace Conventions

- **Type sharing**: API contract types live in `apps/api/src/router.ts`
  (`AppRouter`). Consumers import them as `import type { AppRouter } from "api"`.
- **No reaching into another app's source**: `apps/web` and `apps/mobile` must
  not import runtime code from `apps/api` — only the exported types.
- **Shared DB schema**: All Drizzle tables live in `packages/db/src/schema/`.
  Both `apps/api` and `apps/web` import from `"db"`. Schema changes go through
  `pnpm db:generate` (migrations) + `pnpm db:migrate`.
- **Lint / format**: Biome is configured at the repo root and covers all
  workspaces. There is no per-app Biome config.
- **Tooling**: Each app has its own `tsconfig.json` extending
  `tsconfig.base.json` at the root.
