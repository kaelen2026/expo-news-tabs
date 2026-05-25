# Expo Router Rules

> **Scope**: these rules apply to `apps/mobile` only. They do not govern
> `apps/web` (which uses the Next.js App Router) or `apps/api`.

## Routes

- Route files live in `apps/mobile/app/`.
- Use route groups such as `apps/mobile/app/(tabs)/` for navigation
  organization.
- Keep reusable components out of `apps/mobile/app/`.
- Configure stacks and tabs in `_layout.tsx`.

## Navigation

- Use Expo Router APIs.
- Use `router.push(...)` from `useRouter()` for `Pressable` rows and
  cards when `Link asChild` causes unstable React Native Web layout.
- Keep route paths explicit, for example `/settings` and `/news/${id}`.

## Images And Icons

- Use `expo-image` for image rendering.
- Use `lucide-react-native` for icons.
- If an image needs rounded corners on web, wrap it in a `View` with
  `borderRadius` and `overflow: "hidden"`.

## Expo Compatibility

- Try Expo Go before custom native builds.
- Install Expo native modules with `pnpm --filter mobile exec npx expo install`.
- Run `pnpm --filter mobile exec npx expo install --check` after
  dependency changes in `apps/mobile`.
