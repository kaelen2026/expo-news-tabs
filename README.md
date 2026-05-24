# News Tabs

A small Expo Router news-reading app for iOS, Android, and Web. The codebase is
intentionally compact — it's a reference for a themed, multi-tab, multi-screen
Expo app built with the React Native New Architecture.

## Feature Tour

- **Home (`Morning Brief`)** — a paginated feed of mock stories with
  pull-to-refresh and incremental load-more (capped at 3 mock pages).
- **Story detail** — full-bleed hero image (tap to open a full-screen
  photo wall), category/source/read-time meta, body paragraphs, and a share
  sheet with system share + copy-link fallback (web `navigator.share`,
  native `Share`, clipboard otherwise).
- **Profile** — avatar with picker modal (preset avatars + device library
  via `expo-image-picker`), reading stats, favorite topics, and a shortcut
  into Settings.
- **Settings** — appearance segmented control (System / Light / Dark) plus
  placeholder rows for notifications and reading layout.
- **Theme** — Light/Dark/System modes driven by `useColorScheme`, with
  shared color and layout tokens in `contexts/app-theme.tsx`.

## Stack

| Area            | Choice                                             |
| --------------- | -------------------------------------------------- |
| Runtime         | Expo SDK 56, React 19, React Native 0.85, New Arch |
| Navigation      | `expo-router` (Stack + Tabs, typed routes on)      |
| Images / Icons  | `expo-image`, `lucide-react-native`                |
| Platform extras | `expo-clipboard`, `expo-image-picker`, `expo-linking` |
| Lint / Format   | Biome 2 (`biome check`, `biome format`)            |
| Tests           | Vitest (Node environment, `*.test.ts`)             |
| Language        | TypeScript 6, `strict` enabled                     |

## Project Layout

```
app/                       Expo Router routes ONLY
  _layout.tsx              Root Stack + AppThemeProvider + StatusBar
  (tabs)/_layout.tsx       Tabs: Home + Profile (Settings button in header)
  (tabs)/index.tsx         Home feed (FlatList + pagination)
  (tabs)/profile.tsx       Profile + avatar picker
  news/[id].tsx            Story detail + photo wall + share sheet
  settings.tsx             Appearance + placeholder preferences
components/                Reusable UI
  news-card.tsx            Story card
  ui-primitives.tsx        ScreenScroll, PageIntro, Surface, IconFrame,
                           Divider, SegmentedControl
  avatar-picker-modal.tsx  Avatar picker (presets + device library)
  photo-wall-modal.tsx     Full-screen photo wall with thumbnails
  share-sheet.tsx          Share / copy-link bottom sheet
contexts/
  app-theme.tsx            Theme context, color + layoutTokens, ThemeMode
data/
  news.ts                  Mock NewsStory list + getStoryById
  news.test.ts             Vitest coverage for the data helpers
.agents/                   Project rules, skills, and review sub-agent
```

Module boundaries follow the rules in `.agents/rules/typescript.md`:
routes in `app/`, reusable UI in `components/`, shared state in
`contexts/`, pure data and helpers in `data/`. Reusable code does not
live inside `app/`.

## Quick Start

Prerequisites: Node 20+, npm, and either the Expo Go app or a local
iOS/Android simulator.

```sh
npm install
npm start            # Expo dev server (QR code for Expo Go)
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run web          # Browser (Metro web bundler)
```

App identity is configured in `app.json`:

- name: `News Tabs`
- slug: `expo-news-tabs`
- scheme: `newstabs://`
- android.package: `com.jialin2023.exponewstabs`

## Quality Checks

Run before declaring a change done (also enforced by `.agents/rules/quality.md`):

```sh
npm run typecheck    # tsc --noEmit
npm run lint         # biome check .
npm test             # vitest run
```

Optional formatting:

```sh
npm run format       # biome format --write .
```

After dependency changes also run:

```sh
npx expo install --check
```

## Theme System

The single source of truth for colors and spacing is
`contexts/app-theme.tsx`:

- `lightColors` / `darkColors` — semantic color roles
  (`background`, `card`, `accent`, `accentSoft`, `text`, `muted`,
  `mutedSoft`, `border`, `tagBorder`, `tagText`, `imagePlaceholder`).
- `layoutTokens` — `space.*`, `radius.*`, `size.iconFrame`,
  `borderWidth.hairline`.
- `ThemeMode = "system" | "light" | "dark"` — `system` follows
  `useColorScheme()`.

UI code reads everything through `useAppTheme()`; components do not
call `useColorScheme()` directly. New design decisions should add
tokens here rather than inline literals — see
`.agents/rules/style-system.md`.

## Data

The app is currently UI-only and runs on mocked data in `data/news.ts`.
`NewsStory` is the contract for cards, detail screens, the photo wall,
and the share sheet. The home feed simulates pagination by emitting
copies of the same list with prefixed `feedId`s (max 3 pages), and
mock latency is added to refresh/load-more for visible UI states.

Swapping in a real API means:

1. Keeping the `NewsStory` shape (or adapting it at the boundary).
2. Replacing `newsStories` / `getStoryById` with async fetchers and
   wiring loading/error states in `app/(tabs)/index.tsx` and
   `app/news/[id].tsx`.

## Agents and Contributor Rules

- `AGENTS.md` is the entry point for agents and contributors.
- Detailed rules live in `.agents/rules/`
  (`style-system`, `expo-router`, `typescript`, `quality`, `workflow`).
- A read-only review sub-agent lives in `.agents/agents/reviewer.md`.
- Project-local skills: `.agents/skills/deploy/SKILL.md` (local
  Gradle / xcodebuild builds) and
  `.agents/skills/code-review/SKILL.md`.

Read `AGENTS.md` first if you plan to make changes — the project rules
there govern code style, navigation, types, and required checks.
