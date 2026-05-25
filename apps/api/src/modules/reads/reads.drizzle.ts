import { type Database, readState } from "db";
import { eq, sql } from "drizzle-orm";
import type { ReadStateRepository } from "./reads.repository";

// `db` accessor (not value) so the repo survives `closeDb()` between
// test suites — see news.drizzle for the same reasoning.
export function createDrizzleReadStateRepository(resolveDb: () => Database): ReadStateRepository {
  return {
    async idsForUser(userId) {
      const rows = await resolveDb()
        .select({ storyId: readState.storyId })
        .from(readState)
        .where(eq(readState.userId, userId));
      return rows.map((r) => r.storyId);
    },

    async mark(userId, storyId) {
      await resolveDb()
        .insert(readState)
        .values({ userId, storyId })
        .onConflictDoUpdate({
          target: [readState.userId, readState.storyId],
          set: { readAt: sql`now()` },
        });
    },
  };
}
