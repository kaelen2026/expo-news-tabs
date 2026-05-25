import { FONT_SIZE_VALUES, THEME_VALUES } from "db";

// Re-export the canonical lists from the db package so callers don't
// reach into `db` for enum values. The schema package remains the source
// of truth — this is just a stable surface for the preferences module.
export const PREFERENCE_THEMES = THEME_VALUES;
export const PREFERENCE_FONT_SIZES = FONT_SIZE_VALUES;

export type PreferenceTheme = (typeof PREFERENCE_THEMES)[number];
export type PreferenceFontSize = (typeof PREFERENCE_FONT_SIZES)[number];

export type Preferences = {
  theme: PreferenceTheme | null;
  defaultCategory: string | null;
  fontSize: PreferenceFontSize | null;
  updatedAt: Date | null;
};

export type PreferenceUpdate = {
  theme?: PreferenceTheme | null;
  defaultCategory?: string | null;
  fontSize?: PreferenceFontSize | null;
};
