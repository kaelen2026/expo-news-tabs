# Project Agent Guide

This is a Turborepo monorepo with three apps. Read this file before making
changes, then follow the per-app conventions and the detailed rules in
`.agents/rules/`.

For a user-facing tour, see [`README.md`](./README.md).

## Workspace Layout

```
apps/
  mobile/   Expo Router app (iOS / Android / Web via Metro)
  web/      Next.js 16 (App Router + Tailwind v4 + TypeScript)
  api/      Hono + tRPC server (Node, served via @hono/node-server)
```

Workspaces are managed by **pnpm** (`pnpm-workspace.yaml`) and tasks are
orchestrated by **Turbo** (`turbo.json`). `apps/api` is the single source of
truth for the `AppRouter` type — `apps/web` and `apps/mobile` depend on it via
`"api": "workspace:*"` and import `AppRouter` for fully-typed tRPC clients.

## Commands

Always run these from the repo root before claiming work is complete:

```sh
pnpm install
pnpm typecheck   # turbo run typecheck across all workspaces
pnpm lint        # biome check . (root-level, covers everything)
pnpm test        # turbo run test
```

Per-app dev servers:

```sh
pnpm --filter api dev      # Hono on http://localhost:3001
pnpm --filter web dev      # Next.js on http://localhost:3000
pnpm --filter mobile dev   # Expo dev server
```

## Reference Rules

The detailed rules in `.agents/rules/` apply to the mobile workspace
(they predate the monorepo and reference Expo-specific patterns):

- `.agents/rules/style-system.md`
- `.agents/rules/expo-router.md`
- `.agents/rules/typescript.md`
- `.agents/rules/quality.md`
- `.agents/rules/workflow.md`

See project-local skills in `.agents/skills/`:

- `.agents/skills/deploy/SKILL.md`
- `.agents/skills/code-review/SKILL.md`

See project-local sub-agents in `.agents/agents/`:

- `.agents/agents/reviewer.md`

## Cross-Workspace Conventions

- **Type sharing**: API contract types live in `apps/api/src/router.ts`
  (`AppRouter`). Consumers import them as `import type { AppRouter } from "api"`.
- **No reaching into another app's source**: `apps/web` and `apps/mobile` must
  not import runtime code from `apps/api` — only the exported types.
- **Lint / format**: Biome is configured at the repo root and covers all
  workspaces. There is no per-app Biome config.
- **Tooling**: Each app has its own `tsconfig.json` extending
  `tsconfig.base.json` at the root.
