# API Design Rules

> **Scope**: `apps/api` (Hono + tRPC). The `AppRouter` type exported from
> `apps/api/src/router.ts` is a contract consumed by `apps/web` and
> `apps/mobile`; treat it like a public API.

## Procedure Shape

- One procedure = one operation. Do not bundle unrelated work behind a
  flag or a `mode` field.
- Use `query` for reads and `mutation` for writes. Reserve
  `subscription` for genuinely streaming behavior; do not use it as a
  polling shortcut.
- Group related procedures under nested routers
  (`news.list`, `news.byId`). Keep nesting shallow — two levels is the
  ceiling; if a third feels necessary, split into a new router.
- Name procedures by the operation, not the implementation:
  - reads: `list`, `byId`, `search`, `count`
  - writes (CRUD): `create`, `update`, `delete`
  - writes (action): imperative verb (`publish`, `archive`, `retry`)
- Procedure names use `camelCase`. No verb prefix for reads
  (`news.list`, not `news.getList`).

## Inputs

- Every procedure that takes input validates with a Zod schema via
  `.input(...)`. The schema **is** the runtime validation; do not
  re-validate inside the handler.
- Required is the default. Use `.optional()` only when the field is
  genuinely optional, and use `.default(...)` when there is a sensible
  server-side fallback.
- Cap every unbounded field:
  - free-text: `.max(N)`
  - arrays: `.max(N)`
  - pagination: bounded page or cursor; never an unconstrained `limit`
- Prefer enums / literal unions over free strings for discrete option
  sets (`z.enum(["Local", "Science", "Business", "Culture"])`).
- Do not accept opaque objects the server has to trust. If a field's
  meaning depends on the caller, narrow it at the schema.
- Inputs are JSON-serializable. No `Date`, `Map`, `Set`, or `BigInt` at
  the boundary — use ISO strings, plain objects, arrays, and `number`.

## Outputs

- Return types must be precise. Do not return raw database rows; map
  to a documented response shape.
- Paginate or cap every list-shaped response. The reference is
  `news.list` (`page`, `hasMore`, `stories`).
- The response shape is part of the contract. Adding optional fields is
  safe; renaming, removing, or narrowing existing fields is a breaking
  change.
- Outputs are JSON-serializable for the same reasons as inputs.
- Do not include server-only data (internal IDs, debug fields, raw
  errors) in the response.

## Errors

- Throw `TRPCError` with a documented `code`. Never `throw new Error()`
  or return ad-hoc error shapes.
- Standard codes to reach for first:
  - `BAD_REQUEST` — caller input is malformed (Zod throws this for you
    on validation failure; rarely throw it manually).
  - `UNAUTHORIZED` — no credentials or invalid credentials.
  - `FORBIDDEN` — credentials are valid but not permitted.
  - `NOT_FOUND` — resource does not exist.
  - `CONFLICT` — state collision (duplicate key, concurrent edit).
  - `PRECONDITION_FAILED` — caller's precondition (`If-Match`, version)
    is no longer true.
  - `TOO_MANY_REQUESTS` — rate-limited.
  - `INTERNAL_SERVER_ERROR` — last resort for unexpected failures.
- Every `TRPCError` includes a human-readable `message`. The message
  must be safe to surface to end users — no stack traces, SQL, secrets,
  or internal paths.
- For "not found" lookups, throw `NOT_FOUND` with the looked-up
  identifier in the message (already the `news.byId` pattern).

## Context And Middleware

- Request-scoped data (auth user, IP, headers, request id) lives in the
  tRPC context, not in module-level globals.
- Cross-cutting concerns belong in middleware:
  - auth → `protectedProcedure` built from a middleware that checks
    context.
  - logging → Hono middleware (`logger()`); do not log inside every
    procedure.
  - rate limiting → middleware on the relevant procedure(s) or router.
- Do not read `process.env` inside a handler at request time. Read once
  at module load (or via a config layer) and pass through context if
  per-request.

## Hono / Transport Layer

- `/trpc/*` is the only tRPC mount. Do not add a second.
- Non-tRPC routes (health checks, webhooks, third-party callbacks)
  belong on Hono as plain routes — do not shoehorn them into tRPC.
- CORS, logging, and request-id middleware are configured once on the
  Hono app, before the tRPC mount.
- Health checks return a tiny JSON shape and never call out to a
  database or external service.

## Boundaries

- The `AppRouter` *type* is the only thing that crosses from `apps/api`
  into a client. No runtime imports.
- Helpers in `apps/api/src/*` (data fixtures, server utilities) are
  internal — do not re-export them from `router.ts` or expose them in
  the response shape.
- Server-only dependencies (Node built-ins, native modules) must not
  appear in any type referenced by `AppRouter`, or web/mobile builds
  will break.

## Versioning

- Additive changes are safe: new procedure, new optional input field,
  new optional output field.
- Breaking changes (renaming, removing, narrowing) require either a
  coordinated client update in the same PR or an explicit deprecation
  window. Do not version individual procedures with suffixes
  (`news.listV2`); migrate the contract cleanly.
- When breaking the contract intentionally, update both clients
  (`apps/web` and `apps/mobile`) in the same change.

## Testing

- Unit-test pure procedure logic with `appRouter.createCaller(ctx)` —
  no HTTP, no network. Vitest covers this.
- Reserve HTTP-level smoke tests for cross-cutting concerns (CORS,
  middleware ordering, error serialization).
- Always add a test for: at least one happy path, one validation
  failure, and one explicit `TRPCError` code per non-trivial procedure.
