# Project Agent Guide

This file is the entry point for agents and contributors in this Expo app.
Read it before making changes, then follow the detailed rules in `.agents/rules/`.

## Project Shape

- This is an Expo Router React Native app.
- Routes live only in `app/`.
- Shared UI belongs in `components/`.
- Shared app state and theme logic belong in `contexts/`.
- Mock data and data tests belong in `data/`.
- Do not put reusable components, data, or helpers inside route files unless they are truly route-local.

## Commands

Run these before claiming work is complete:

```sh
npm run typecheck
npm run lint
npm test
```

## Reference Rules

See the detailed project rules in `.agents/rules/`:

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
