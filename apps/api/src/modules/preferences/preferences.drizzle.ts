import { type Database, preference } from "db";
import { eq } from "drizzle-orm";
import type { PreferenceRepository } from "./preferences.repository";
import type { PreferenceFontSize, Preferences, PreferenceTheme } from "./preferences.types";

type PreferenceRow = typeof preference.$inferSelect;

// `db` accessor (not value) so the repo survives `closeDb()` between
// test suites — see news.drizzle for the same reasoning.
export function createDrizzlePreferenceRepository(resolveDb: () => Database): PreferenceRepository {
  return {
    async find(userId) {
      const [row] = await resolveDb()
        .select()
        .from(preference)
        .where(eq(preference.userId, userId))
        .limit(1);
      return row ? toShape(row) : undefined;
    },

    async ensure(userId) {
      const [created] = await resolveDb()
        .insert(preference)
        .values({ userId })
        .onConflictDoNothing()
        .returning();
      if (created) return toShape(created);

      // Conflict means a concurrent insert already won — read whatever's there.
      const [now] = await resolveDb()
        .select()
        .from(preference)
        .where(eq(preference.userId, userId))
        .limit(1);
      return toShape(now);
    },

    async upsert(userId, update) {
      const set: Record<string, unknown> = {};
      if ("theme" in update) set.theme = update.theme ?? null;
      if ("defaultCategory" in update) set.defaultCategory = update.defaultCategory ?? null;
      if ("fontSize" in update) set.fontSize = update.fontSize ?? null;

      const [row] = await resolveDb()
        .insert(preference)
        .values({ userId, ...set })
        .onConflictDoUpdate({ target: preference.userId, set })
        .returning();
      return toShape(row);
    },
  };
}

function toShape(row: PreferenceRow | undefined): Preferences {
  return {
    theme: (row?.theme ?? null) as PreferenceTheme | null,
    defaultCategory: row?.defaultCategory ?? null,
    fontSize: (row?.fontSize ?? null) as PreferenceFontSize | null,
    updatedAt: row?.updatedAt ?? null,
  };
}
