# Quality Rules

## Required Checks

Before finishing a task, run these from the repo root:

```sh
pnpm typecheck   # turbo run typecheck across all workspaces
pnpm lint        # biome check . (single root config)
pnpm test        # turbo run test
```

For dependency changes in `apps/mobile`, also run:

```sh
pnpm --filter mobile exec npx expo install --check
```

For dependency changes anywhere else, run:

```sh
pnpm install
pnpm typecheck
```

## Tests

- Use Vitest for pure TypeScript/data behavior across every workspace.
- Add Vitest coverage for pure data, helpers, or tRPC procedure logic.
- Keep tests small and stable.
- Keep tests focused. Do not snapshot large UI trees unless there is a clear reason.
- Browser smoke tests are expected for meaningful UI behavior changes.

Important mobile (`apps/mobile`) flows:

- Home list renders and navigates to detail.
- Pull-to-refresh and load-more states behave correctly.
- Detail image opens the photo wall.
- Share sheet opens, handles web fallback, and closes.
- Profile avatar picker opens and updates the avatar.
- Settings appearance modes switch between system/light/dark.

Important web (`apps/web`) flows:

- Landing page renders the news list from the tRPC `news.list` query.
- Failure path (API unreachable) shows the error message, not a crash.

Important api (`apps/api`) flows:

- `GET /` returns 200 with the health payload.
- `GET /trpc/news.list` returns the expected story shape.
- `news.byId` returns a `TRPCError` with code `NOT_FOUND` for unknown ids.

## Formatting And Linting

- Biome owns formatting and lint for every workspace (single root `biome.json`).
- Run `pnpm lint` to check.
- Run `pnpm format` to write formatting changes.

## TypeScript

- Use the workspace TypeScript version (declared at the repo root).
- Per-app `tsconfig.json` extends `tsconfig.base.json` at the root.
- Do not reintroduce `baseUrl` in any `tsconfig.json`.
- Prefer explicit relative imports for intra-workspace paths.
- Cross-workspace type sharing must go through a workspace package (e.g.
  `import type { AppRouter } from "api"`), not through deep relative paths.
