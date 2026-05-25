---
name: api-design
description: Use this skill when designing, adding, or modifying tRPC procedures in apps/api, or when reviewing how a change affects the AppRouter contract consumed by apps/web and apps/mobile. Covers procedure shape, Zod input schemas, TRPCError codes, response shape stability, and where to place non-tRPC routes on the Hono server.
---

# API Design Skill

Designing or changing a tRPC procedure changes the public contract that
`apps/web` and `apps/mobile` depend on. Treat every change as a small
API design exercise, even when it looks like a one-line tweak.

## When to use

- Adding a new procedure to `apps/api/src/router.ts`.
- Changing the input schema or response shape of an existing procedure.
- Introducing a new error code or changing how an existing one is
  thrown.
- Adding a non-tRPC route to the Hono server.
- Reviewing a diff that touches `apps/api/src/router.ts` or anything it
  re-exports.

## Standards

Apply these rules:

- `.agents/rules/api-design.md` (the primary source of truth for this
  skill — read it before designing anything new).
- `.agents/rules/typescript.md` (general TS rules, especially the tRPC
  section).
- `.agents/rules/quality.md` (required checks before claiming done).

## Workflow

### 1. Frame the operation

Before writing the procedure, answer these out loud:

- **What single operation is this?** If you cannot name it in one verb
  + one noun (`news.list`, `comment.create`, `story.publish`), it is
  probably two procedures.
- **Read or write?** Reads are `query`, writes are `mutation`.
- **Who calls it?** `apps/web`, `apps/mobile`, both, or a server-to-
  server caller. Different callers have different tolerance for
  payload size and latency.
- **Auth?** Public, authenticated, or role-gated. This selects the
  procedure builder (`publicProcedure`, `protectedProcedure`, etc.).

### 2. Design the input schema

Write the Zod schema first, before the handler body.

- Required by default. `.optional()` only when truly optional.
- Cap every unbounded field (`.max(N)` on strings and arrays; bounded
  pagination).
- Use `z.enum([...])` or literal unions for discrete option sets, not
  free strings.
- Use `.default(...)` for ergonomics where a server-side default makes
  sense.
- Keep inputs JSON-serializable: no `Date`, `Map`, `Set`, `BigInt` —
  use ISO strings and plain objects.

The schema is the runtime validation. Do not re-validate inside the
handler.

### 3. Design the response shape

- Decide the shape *before* writing the handler. Sketch the TS type or
  the Zod schema.
- Lists are paginated or capped. Pattern: `{ page, hasMore, items }`.
- Map internal data to a documented shape. Do not leak DB rows.
- Adding optional fields later is safe; renaming or removing is a
  breaking change.

### 4. Plan errors

For each failure mode, pick the right `TRPCError` code:

| Situation                              | Code                       |
| -------------------------------------- | -------------------------- |
| Caller input is malformed              | `BAD_REQUEST` (Zod auto)   |
| No credentials / bad token             | `UNAUTHORIZED`             |
| Valid credentials, not permitted       | `FORBIDDEN`                |
| Resource does not exist                | `NOT_FOUND`                |
| Duplicate / concurrent edit collision  | `CONFLICT`                 |
| Stale `If-Match` / version mismatch    | `PRECONDITION_FAILED`      |
| Rate-limited                           | `TOO_MANY_REQUESTS`        |
| Unexpected server failure              | `INTERNAL_SERVER_ERROR`    |

Every `TRPCError` carries a human-readable `message` that is safe to
show end users (no stack traces, SQL, secrets, or internal paths).

### 5. Implement and test

- Implementation lives in `apps/api/src/router.ts` (or a sibling file
  imported into it). Helpers stay internal; only types cross into
  clients.
- Add Vitest coverage that calls the procedure via
  `appRouter.createCaller(ctx)`:
  - At least one happy path.
  - At least one validation failure path (asserts on the thrown
    `TRPCError.code`).
  - One test per explicit non-validation `TRPCError` you throw.
- Run from the repo root:

```sh
pnpm typecheck
pnpm lint
pnpm test
```

### 6. Wire the clients

If the change is additive (new optional field, new procedure), no
client change is required immediately. If the change is breaking
(renamed field, narrowed type, removed procedure), update both
`apps/web` and `apps/mobile` in the same PR.

Verify end-to-end with one consumer:

```sh
pnpm --filter api dev      # in one terminal
pnpm --filter web dev      # in another
# OR
pnpm --filter mobile dev
```

## Anti-patterns

Reject changes that exhibit any of these:

- A procedure with a `mode` or `action` discriminator in the input that
  switches between unrelated operations. Split it.
- A `query` that takes an unbounded `limit` or returns the full table.
- A handler that re-validates input the schema already covers.
- An error path that throws `new Error("not found")` instead of a
  typed `TRPCError`.
- A response that includes internal fields (raw DB row, debug data,
  internal IDs) "in case the client needs them".
- A new procedure named `getListOfThings` or `doNewsStuff`. Use the
  noun.namespace + verb pattern.
- Reaching into `apps/api/src/*` from a client beyond the `AppRouter`
  type.
- A non-tRPC concern (webhook handler, health probe) defined as a
  tRPC procedure instead of a Hono route.

## Output (when reviewing)

When this skill is invoked for review, return findings in the format
defined by `.agents/skills/code-review/SKILL.md`, with one extra rule:

- Tag findings that change `AppRouter` typing or response shape as
  **contract** so reviewers focus on cross-workspace impact.
