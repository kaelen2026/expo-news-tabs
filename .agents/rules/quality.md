# Quality Rules

## Required Checks

Before finishing a task, run:

```sh
npm run typecheck
npm run lint
npm test
```

For dependency changes, also run:

```sh
npx expo install --check
```

## Tests

- Use Vitest for pure TypeScript/data behavior.
- Add Vitest coverage for pure data or utility behavior.
- Keep tests small and stable.
- Keep tests focused. Do not snapshot large UI trees unless there is a clear reason.
- Browser smoke tests are expected for meaningful UI behavior changes.

Important browser flows:

- Home list renders and navigates to detail.
- Pull-to-refresh and load-more states behave correctly.
- Detail image opens the photo wall.
- Share sheet opens, handles web fallback, and closes.
- Profile avatar picker opens and updates the avatar.
- Settings appearance modes switch between system/light/dark.

## Formatting And Linting

- Biome owns formatting and lint.
- Run `npm run lint` to check.
- Run `npm run format` to write formatting changes.

## TypeScript

- Use the project TypeScript version.
- Do not reintroduce `baseUrl` in `tsconfig.json`.
- Prefer explicit relative imports unless a future alias is added in a TypeScript 6-compatible way.
