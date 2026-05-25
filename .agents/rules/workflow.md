# Workflow Rules

## Runtime Checks

Run each app's dev server with a pnpm filter:

```sh
pnpm --filter api dev      # Hono + tRPC on http://localhost:3001
pnpm --filter web dev      # Next.js on http://localhost:3000
pnpm --filter mobile dev   # Expo dev server (QR code for Expo Go)
```

For mobile platform-specific checks:

```sh
pnpm --filter mobile ios       # iOS simulator
pnpm --filter mobile android   # Android emulator
pnpm --filter mobile web       # Mobile UI in browser via Metro
```

## Dependency Rules

- Always install from the repo root: `pnpm install`. Never run `npm install`
  or `pnpm install` from inside a workspace directory.
- Add a dependency to a specific workspace with a filter:

```sh
pnpm --filter mobile add <package>
pnpm --filter web add <package>
pnpm --filter api add <package>
```

- Mobile native modules must be installed via Expo so SDK versions stay
  aligned:

```sh
pnpm --filter mobile exec npx expo install <package>
```

- After adding mobile dependencies, run:

```sh
pnpm --filter mobile exec npx expo install --check
```

- To share types between workspaces, declare the producer as a workspace
  dependency (`"api": "workspace:*"`) and import types from it. Do not
  reach into another workspace via relative paths.

## Git Rules

- Keep commits focused and descriptive.
- Do not commit `node_modules/`, `.turbo/`, `.next/`, `.expo/`, generated
  native projects, or editor caches.
- Commit `pnpm-lock.yaml` (at the repo root) whenever dependencies change.
- Do not commit generated native projects (`apps/mobile/android/`,
  `apps/mobile/ios/`) unless the project explicitly checks them in.

## Branches

- Work on a feature branch, not on `main`. `main` should stay
  releasable at any moment.
- Name branches by intent:
  - `feat/<topic>` for new behavior
  - `fix/<topic>` for bug fixes
  - `docs/<topic>` for documentation-only changes
  - `refactor/<topic>` for code restructuring with no behavior change
  - `chore/<topic>` for tooling, deps, or build config
- When the change is workspace-scoped, prefix the topic with the
  workspace name (e.g. `feat/mobile-share-sheet`, `fix/api-news-byId`).
- Keep branches short-lived. Rebase or merge from `main` often enough
  that conflicts stay small.

## Worktrees

Use `git worktree` when you need to work on more than one branch at once
(parallel features, a hot-fix landed alongside in-progress work, an
agent exploring an alternate approach) without thrashing your editor,
dev servers, or pnpm install state.

Create one alongside the main checkout:

```sh
# from the repo root
git worktree add ../expo-example.feat-share-sheet -b feat/mobile-share-sheet
cd ../expo-example.feat-share-sheet
pnpm install
git worktree list   # see active worktrees and their branches
```

Remove it when the branch lands or is abandoned:

```sh
git worktree remove ../expo-example.feat-share-sheet
```

Project-specific gotchas:

- **`pnpm install` per worktree.** pnpm's content-addressed store is
  shared on disk, but each worktree needs its own `node_modules`.
- **Single Postgres.** `pnpm docker:up` binds host port `5432` and uses a
  fixed container name (`expo-example-postgres`). Run it from one
  worktree only; other worktrees point at the same `DATABASE_URL`.
- **Dev server ports collide.** `apps/web` uses `3000`, `apps/api` uses
  `3001`, Expo uses `8081`. Run a given app from one worktree at a time,
  or override the port for the others
  (e.g. `PORT=3100 pnpm --filter web dev`).
- **`.env` files are gitignored and live per-app.** Copy them into each
  new worktree — they do not follow the branch:

  ```sh
  cp ../expo-example/apps/api/.env       apps/api/.env
  cp ../expo-example/apps/web/.env.local apps/web/.env.local
  ```
- **`.turbo` cache is per-worktree.** Remote cache (when configured)
  bridges the gap; otherwise the first build in a new worktree is cold.

Anti-patterns:

- Running `pnpm docker:up` in two worktrees at once (container-name or
  port collision — the second one fails).
- Committing a `.env` to share it across worktrees. Copy or symlink
  instead; `.env` stays gitignored.

## Commits

- One intent per commit. Do not mix a bug fix with an unrelated
  refactor or a dependency bump.
- One workspace per commit when practical. A cross-workspace API +
  client change is fine in a single commit; a drive-by mobile refactor
  bundled into a web change is not.
- Subject line: imperative mood, no trailing period, ≤ 70 characters
  (e.g. "Add share sheet web fallback", not "added share sheet" or
  "share sheet stuff").
- Body (when needed): explain **why**, not what. The diff already shows
  what changed; the body should capture the motivation, the constraint,
  or the decision behind the change.
- Prefer creating a new commit over `--amend`. Never amend a commit that
  has already been pushed.
- Never bypass hooks (`--no-verify`) or signing. If a pre-commit hook
  fails, fix the underlying issue and create a new commit.

## Pre-PR Checklist

Before opening a pull request, confirm all of the following:

- [ ] `pnpm typecheck` passes (covers every workspace via Turbo).
- [ ] `pnpm lint` passes (single root Biome).
- [ ] `pnpm test` passes.
- [ ] `pnpm --filter mobile exec npx expo install --check` passes (only
      when mobile dependencies changed).
- [ ] UI changes to `apps/mobile` were exercised in
      `pnpm --filter mobile web` against the relevant browser flows
      listed in `quality.md`.
- [ ] UI changes to `apps/web` were exercised in `pnpm --filter web dev`
      against the relevant browser flows listed in `quality.md`.
- [ ] tRPC procedure changes in `apps/api` were verified end-to-end with
      at least one consumer (web or mobile).
- [ ] New colors, spacing, radii, or sizes for mobile were added to
      `apps/mobile/contexts/app-theme.tsx` rather than inlined.
- [ ] Reusable mobile UI was placed in `apps/mobile/components/`, not
      inside `apps/mobile/app/`.
- [ ] Vitest coverage was added or updated for any new pure data or
      helper behavior.
- [ ] Commit history is focused (no drive-by refactors mixed with the
      change).

## Anti-Patterns

Avoid these. They show up repeatedly and they all degrade the codebase
in ways the rules above are designed to prevent.

- **Reusable code inside `apps/mobile/app/`.** Components, helpers, or
  data defined in a route file when more than one route could use them.
  Move them to `apps/mobile/components/`, `apps/mobile/contexts/`, or
  `apps/mobile/data/`.
- **Inline theme literals in mobile screens.** Hard-coded colors,
  spacing, radii, or sizes in JSX instead of `useAppTheme()` tokens.
  Add tokens at the source instead.
- **Direct `useColorScheme()` calls in mobile UI.** Consume the theme
  through `useAppTheme()` so light/dark/system mode stays coherent.
- **Reaching into another workspace via relative paths** (e.g.
  `../../api/src/router`). Add the workspace as a dependency and import
  via its package name.
- **Importing runtime code from `apps/api` into a client.** Only the
  `AppRouter` *type* should cross that boundary.
- **Drive-by refactors in a bug-fix commit.** Bundle them into a
  separate `refactor/...` commit so review and revert stay clean.
- **Speculative abstraction.** Building extension points for
  hypothetical future requirements. Three similar lines are better
  than a premature abstraction.
- **`any`, non-null assertions, or broad casts to silence errors.**
  Narrow at the boundary with `unknown`, or fix the type at its
  source.
- **Unhandled async user actions.** Image picking, sharing, clipboard,
  and network calls must handle failure paths explicitly.
- **`--no-verify`, `--no-gpg-sign`, or amending pushed commits to make
  a hook go away.** Investigate and fix the root cause; create a new
  commit if a hook fails after committing.
- **Committing generated native projects, lockfiles for tools the
  project does not use, or editor caches.** Use `.gitignore` and keep
  the working tree intentional.
