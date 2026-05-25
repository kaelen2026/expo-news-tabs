import { type Database, favorite } from "db";
import { and, desc, eq } from "drizzle-orm";
import type { FavoriteRepository } from "./favorites.repository";

// `db` accessor (not value) so the repo survives `closeDb()` between
// test suites — see news.drizzle for the same reasoning.
export function createDrizzleFavoriteRepository(resolveDb: () => Database): FavoriteRepository {
  return {
    async listForUser(userId) {
      const rows = await resolveDb()
        .select({ storyId: favorite.storyId, favoritedAt: favorite.createdAt })
        .from(favorite)
        .where(eq(favorite.userId, userId))
        .orderBy(desc(favorite.createdAt));
      return rows;
    },

    async idsForUser(userId) {
      const rows = await resolveDb()
        .select({ storyId: favorite.storyId })
        .from(favorite)
        .where(eq(favorite.userId, userId));
      return rows.map((r) => r.storyId);
    },

    async add(userId, storyId) {
      await resolveDb().insert(favorite).values({ userId, storyId }).onConflictDoNothing();
    },

    async remove(userId, storyId) {
      await resolveDb()
        .delete(favorite)
        .where(and(eq(favorite.userId, userId), eq(favorite.storyId, storyId)));
    },

    async exists(userId, storyId) {
      const [row] = await resolveDb()
        .select({ storyId: favorite.storyId })
        .from(favorite)
        .where(and(eq(favorite.userId, userId), eq(favorite.storyId, storyId)))
        .limit(1);
      return Boolean(row);
    },
  };
}
