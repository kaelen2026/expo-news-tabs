import type { PreferenceRepository } from "./preferences.repository";
import type { Preferences, PreferenceUpdate } from "./preferences.types";

export type PreferenceService = {
  get(userId: string): Promise<Preferences>;
  update(userId: string, update: PreferenceUpdate): Promise<Preferences>;
};

export function createPreferenceService(repo: PreferenceRepository): PreferenceService {
  return {
    async get(userId) {
      const found = await repo.find(userId);
      if (found) return found;
      // Create-on-read so a fresh user gets a stable row instead of a flicker
      // between "no prefs" and the eventual insert when they tweak a setting.
      return repo.ensure(userId);
    },

    async update(userId, update) {
      return repo.upsert(userId, update);
    },
  };
}
