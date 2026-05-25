// Chip set shown on the home feed and on the Preferences page. Free-form
// `preferences.defaultCategory` strings that don't match an entry here
// fall back to "All" silently in the UI. apps/mobile mirrors this list
// in apps/mobile/app/(tabs)/index.tsx — keep them in sync.
export const KNOWN_CATEGORIES = [
  "Local",
  "Science",
  "Business",
  "Culture",
  "Sports",
  "Tech",
] as const;

export type KnownCategory = (typeof KNOWN_CATEGORIES)[number];

export function isKnownCategory(value: string | null | undefined): value is KnownCategory {
  return !!value && (KNOWN_CATEGORIES as readonly string[]).includes(value);
}
