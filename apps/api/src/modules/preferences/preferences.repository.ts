import type { Preferences, PreferenceUpdate } from "./preferences.types";

export interface PreferenceRepository {
  // Return the user's preference row if it exists, otherwise `undefined`.
  // The service decides whether to create-on-read.
  find(userId: string): Promise<Preferences | undefined>;
  // Insert a default row if and only if one doesn't already exist. Returns
  // whatever row is now visible (just-inserted or the conflicting one).
  ensure(userId: string): Promise<Preferences>;
  // Upsert: writes only the keys present in `update`, leaving others
  // untouched. Returns the post-write row.
  upsert(userId: string, update: PreferenceUpdate): Promise<Preferences>;
}
