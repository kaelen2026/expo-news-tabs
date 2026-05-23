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
