import { getDb } from "db";
import { createDrizzlePreferenceRepository } from "./preferences.drizzle";
import { createPreferenceService, type PreferenceService } from "./preferences.service";

export type { PreferenceRepository } from "./preferences.repository";
export { preferencesRouter } from "./preferences.router";
export type { PreferenceService } from "./preferences.service";
export {
  PREFERENCE_FONT_SIZES,
  PREFERENCE_THEMES,
  type PreferenceFontSize,
  type Preferences,
  type PreferenceTheme,
  type PreferenceUpdate,
} from "./preferences.types";

let cached: PreferenceService | undefined;

export function getPreferenceService(): PreferenceService {
  if (!cached) cached = createPreferenceService(createDrizzlePreferenceRepository(getDb));
  return cached;
}
