# Workflow Rules

## Runtime Checks

Use Expo Go first for runtime checks:

```sh
npm start
```

For web verification:

```sh
npm run web
```

## Dependency Rules

- Prefer Expo-compatible packages and install native modules with:

```sh
npx expo install <package>
```

- Use `npm install` or `npm install -D` for ordinary JS tooling.
- After adding dependencies, run `npx expo install --check`.

## Git Rules

- Keep commits focused and descriptive.
- Do not commit `node_modules/`, `.expo/`, generated local state, or editor caches.
- Commit `package-lock.json` whenever dependencies change.
- Do not commit generated native projects (`android/`, `ios/`) unless the
  project explicitly checks them in.

## Branches

- Work on a feature branch, not on `main`. `main` should stay
  releasable at any moment.
- Name branches by intent:
  - `feat/<topic>` for new behavior
  - `fix/<topic>` for bug fixes
  - `docs/<topic>` for documentation-only changes
  - `refactor/<topic>` for code restructuring with no behavior change
  - `chore/<topic>` for tooling, deps, or build config
- Keep branches short-lived. Rebase or merge from `main` often enough
  that conflicts stay small.

## Commits

- One intent per commit. Do not mix a bug fix with an unrelated
  refactor or a dependency bump.
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

- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] `npx expo install --check` passes (only when dependencies changed).
- [ ] UI changes were exercised in `npm run web` against the relevant
      browser flows listed in `quality.md`.
- [ ] New colors, spacing, radii, or sizes were added to
      `contexts/app-theme.tsx` rather than inlined.
- [ ] Reusable UI was placed in `components/`, not inside `app/`.
- [ ] Vitest coverage was added or updated for any new pure data or
      helper behavior.
- [ ] Commit history is focused (no drive-by refactors mixed with the
      change).

## Anti-Patterns

Avoid these. They show up repeatedly and they all degrade the codebase
in ways the rules above are designed to prevent.

- **Reusable code inside `app/`.** Components, helpers, or data
  defined in a route file when more than one route could use them.
  Move them to `components/`, `contexts/`, or `data/`.
- **Inline theme literals.** Hard-coded colors, spacing, radii, or
  sizes in JSX instead of `useAppTheme()` tokens. Add tokens at the
  source instead.
- **Direct `useColorScheme()` calls in UI.** Consume the theme through
  `useAppTheme()` so light/dark/system mode stays coherent.
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
