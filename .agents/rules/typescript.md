# TypeScript Rules

These rules apply to **every** workspace. TypeScript should make app
behavior easier to change safely, not add ceremony for its own sake.

## Compiler Expectations

- Keep `strict` type checking enabled in every workspace.
- Per-app `tsconfig.json` extends `tsconfig.base.json` at the repo root.
- Use the workspace TypeScript version (declared at the repo root).
- Do not reintroduce `baseUrl` in any `tsconfig.json`.
- Prefer explicit relative imports for intra-workspace paths.
- Cross-workspace types must travel through a workspace package
  (e.g. `import type { AppRouter } from "api"`), not relative paths into
  another app.
- Fix type errors at the source. Do not hide them with broad casts.

## Types And Interfaces

- Prefer precise object types for exported data, route params, tRPC
  inputs/outputs, component props, and context values.
- Export types that are part of a module contract. `apps/api` exports
  `AppRouter` for consumers; treat that surface area as a public API.
- Keep route-local props and helper types close to the route file.
- Use discriminated unions for mutually exclusive UI states.
- Use literal unions for small option sets, such as theme modes or tabs.
- Avoid `any`. Use `unknown` at external boundaries (network responses,
  clipboard, image picker), then narrow it.
- Avoid overusing `React.FC`; type props directly on the function
  parameter.

## React And Expo Patterns

- Type component props with readable named types when the prop list
  grows beyond a few fields.
- Type callbacks by their behavior, for example `(value: ThemeMode) => void`.
- Keep React state as narrow as possible. Do not store derived state
  when it can be computed.
- Memoize only when there is a measured or obvious render benefit.
- Keep Expo Router paths explicit and type route data before passing it
  into screens.

## tRPC Patterns

- Define every procedure input with a Zod schema. The schema *is* the
  runtime validation; runtime checks on top of it are noise.
- Throw `TRPCError` with a documented `code` (e.g. `NOT_FOUND`,
  `BAD_REQUEST`) instead of returning ad-hoc error shapes.
- Do not return unbounded result sets; cap or paginate. The existing
  `news.list` page cap is the reference pattern.
- The `AppRouter` type is the source of truth for client-side types.
  Never re-declare procedure shapes in `apps/web` or `apps/mobile`.

## Data Modeling

- Keep mock data strongly typed at the source.
- Prefer immutable arrays and objects for static data.
- Use stable IDs for list keys and route params.
- Validate or narrow external data before it enters UI code.
- Keep pure data helpers separate from UI so Vitest can cover them.

## Errors And Async Code

- Use `try/catch` around user-triggered async flows that can fail, such
  as image picking, sharing, clipboard, or network calls.
- Keep caught errors typed as `unknown`; derive user-facing fallback
  messages safely.
- Avoid floating promises. Await them or intentionally handle them.
- Do not ignore platform differences. Branch explicitly when native and
  web behavior differ.

## Imports And Modules

- Use `import type` for type-only imports.
- Keep module boundaries clean inside `apps/mobile`:
  - routes in `apps/mobile/app/`
  - reusable UI in `apps/mobile/components/`
  - shared state in `apps/mobile/contexts/`
  - data and pure helpers in `apps/mobile/data/`
- Keep module boundaries clean inside `apps/web`:
  - routes and layouts in `apps/web/app/`
  - client providers in `apps/web/app/*-provider.tsx` (or a future
    `apps/web/lib/`)
- Keep module boundaries clean inside `apps/api`:
  - HTTP wiring in `apps/api/src/server.ts`
  - tRPC procedure definitions in `apps/api/src/router.ts`
  - pure data / helpers in their own files under `apps/api/src/`
- Avoid circular imports inside any workspace.
- Do not create barrel files unless they reduce real import noise
  without hiding ownership.

## Style And Maintainability

- Prefer small pure functions over deeply nested inline logic.
- Name booleans so conditions read naturally, for example `isSelected`,
  `hasMore`, or `darkMode`.
- Keep casts local and specific, and add a short comment only when the
  reason is not obvious.
- Avoid enum for small UI choices; literal unions usually compose better
  in React code.
- Do not use non-null assertions unless the surrounding code has already
  guaranteed the value.

## Testing Expectations

- Add Vitest tests for typed data helpers, pagination helpers,
  formatting helpers, state reducers, and pure tRPC procedure logic.
- Test behavior instead of implementation details.
- When fixing a type-driven bug, add a narrow regression test if the
  behavior can be exercised outside UI rendering.
