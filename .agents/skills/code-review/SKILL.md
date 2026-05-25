---
name: code-review
description: Use this skill for a focused review of local code changes in this Turborepo monorepo (Expo Router mobile app, Next.js web app, Hono+tRPC api). It is intended for the reviewer sub-agent and should return only essential findings, risks, and verification gaps.
---

# Code Review Skill

Review changes as a separate pass from implementation. Keep the result short and evidence-based.

## Inputs

Use the caller's requested scope. If no explicit scope is provided, inspect:

```sh
git status --short
git diff --stat
git diff
```

For committed changes, inspect the requested commit range with `git show` or `git diff`.

If the diff spans multiple workspaces, identify the workspaces touched
(`apps/api`, `apps/web`, `apps/mobile`) and check that contract changes
are reflected on every side that consumes them.

## Standards

Apply these project rules:

- `.agents/rules/style-system.md` (mobile-only)
- `.agents/rules/expo-router.md` (mobile-only)
- `.agents/rules/typescript.md` (every workspace)
- `.agents/rules/quality.md` (every workspace)
- `.agents/rules/workflow.md` (every workspace)

## Checklist

- User-facing behavior still matches the requested change.
- Cross-workspace boundaries are respected: only `AppRouter` types
  cross from `apps/api` into clients; no relative paths reach into
  another workspace.
- tRPC procedures validate input with Zod, throw `TRPCError` with a
  documented `code`, and have a bounded return shape.
- `apps/web` navigation uses the App Router correctly; client-only
  hooks live in files marked `"use client"`.
- `apps/mobile` navigation uses Expo Router patterns correctly.
- React Native code avoids browser-only APIs in screens.
- Shared mobile UI patterns use theme tokens and primitives where
  appropriate.
- TypeScript types are precise and do not hide errors with broad casts.
- Async user actions handle failures safely.
- Tests or verification cover meaningful behavior changes.
- Generated native build artifacts (`apps/mobile/android/`,
  `apps/mobile/ios/`) and tool caches (`.next/`, `.turbo/`, `.expo/`)
  are not accidentally treated as source changes.

## Output Format

Return findings only.

When issues exist:

```text
Findings
- [severity] workspace path:line - Issue and why it matters.

Residual Risk
- Any important area not verified.
```

When no issues exist:

```text
No blocking findings.

Residual Risk
- Any important area not verified.
```

## Constraints

- Use only read-only tools and verification commands.
- Do not use `Edit`.
- Do not use `Write`.
- Do not use `apply_patch`.
- Do not run shell commands that create, modify, delete, format, stage, commit, install, or generate files.
- Do not make code changes.
- Do not include implementation plans.
- Do not praise the code.
- Do not list every file reviewed.
- Do not mention low-value style preferences.
