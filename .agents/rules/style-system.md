# Style System Rules

> **Scope**: these rules apply to `apps/mobile` only. `apps/web` uses
> Tailwind CSS v4 with `@theme` tokens in `apps/web/app/globals.css`,
> which has its own conventions.

The mobile app should grow around shared style semantics, not repeated
inline constants.

## Theme Tokens

The source of truth is `apps/mobile/contexts/app-theme.tsx`.

- Put colors in `lightColors` and `darkColors`.
- Put spacing, radius, border, and size constants in `layoutTokens`.
- Use `useAppTheme()` from UI code.
- Appearance supports `system`, `light`, and `dark`.
- Components should consume `useAppTheme()` instead of reading
  `useColorScheme()` directly.
- New themed colors belong in `lightColors` and `darkColors` together.
- If a component needs spacing, radii, or shared sizes, consume `tokens`
  from `useAppTheme()`.

## UI Primitives

Shared primitives live in `apps/mobile/components/ui-primitives.tsx`.

Use existing primitives before creating new inline style blocks:

- `ScreenScroll` for full-page scroll containers.
- `PageIntro` for page title and subtitle blocks.
- `Surface` for bordered card-like sections.
- `IconFrame` for icon background squares.
- `Divider` for section separators.
- `SegmentedControl` for mutually exclusive options.

If a pattern appears twice, consider whether it should become a primitive.

## Page Components

Page components should read like product structure:

- Good: `ScreenScroll`, `PageIntro`, `Surface`, `SettingsRow`.
- Avoid: repeated blocks of `backgroundColor`, `borderRadius`,
  `borderWidth`, `height`, `width`, and `justifyContent` for the same
  visual element.

Small route-specific styles are fine when they are not repeated and do
not encode a shared design decision.

## Style Placement

- Prefer shared primitives for reusable product patterns.
- Prefer `StyleSheet.create` for route-local structural styles.
- Keep JSX style arrays limited to runtime theme values such as colors,
  pressed opacity, selected state, and dynamic measurements.
- Avoid large inline style objects in JSX, especially for repeated row,
  card, icon, text, and spacing patterns.

## Visual Consistency

- Default card radius is `tokens.radius.md`.
- Default inner image radius is `tokens.radius.sm`.
- Default card border is `tokens.borderWidth.hairline`.
- Icon frames use `tokens.size.iconFrame`.
- Use `lucide-react-native` for icons.
- Use `expo-image` for images.
- Do not introduce CSS, Tailwind, DOM elements, or browser-only
  components in React Native screens.
- Avoid one-off values unless the layout truly needs them.
