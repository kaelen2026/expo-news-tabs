---
name: code-review
description: Use this skill for a focused review of local code changes in this Expo Router React Native project. It is intended for the reviewer sub-agent and should return only essential findings, risks, and verification gaps.
allowed-tools: Bash(git:*), Bash(rg:*), Bash(sed:*), Bash(cat:*), Bash(ls:*), Bash(find:*), Bash(wc:*), Bash(file:*), Bash(npm run lint), Bash(npm run typecheck), Bash(npm test), Bash(npx expo install --check)
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

## Standards

Apply these project rules:

- `.agents/rules/style-system.md`
- `.agents/rules/expo-router.md`
- `.agents/rules/typescript.md`
- `.agents/rules/quality.md`
- `.agents/rules/workflow.md`

## Checklist

- User-facing behavior still matches the requested change.
- Navigation uses Expo Router patterns correctly.
- React Native code avoids browser-only APIs in screens.
- Shared UI patterns use theme tokens and primitives where appropriate.
- TypeScript types are precise and do not hide errors with broad casts.
- Async user actions handle failures safely.
- Tests or verification cover meaningful behavior changes.
- Generated native build artifacts are not accidentally treated as source changes.

## Output Format

Return findings only.

When issues exist:

```text
Findings
- [severity] path:line - Issue and why it matters.

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
