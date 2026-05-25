import { type Database, newsStory } from "db";
import { and, desc, eq, inArray, lt, or } from "drizzle-orm";
import type { ListPosition, NewsRepository, StoryWithPosition } from "./news.repository";
import type { NewsStory } from "./news.types";

// `db` is passed as an accessor (not a value) so the repo always uses the
// current Drizzle client. `closeDb()` between test suites resets the
// cached client, and capturing by reference would leave the repo holding
// a dead connection.
export function createDrizzleNewsRepository(resolveDb: () => Database): NewsRepository {
  return {
    async list({ after, limit }) {
      const rows = await resolveDb()
        .select()
        .from(newsStory)
        .where(
          after
            ? or(
                lt(newsStory.createdAt, after.createdAt),
                and(eq(newsStory.createdAt, after.createdAt), lt(newsStory.id, after.id)),
              )
            : undefined,
        )
        .orderBy(desc(newsStory.createdAt), desc(newsStory.id))
        .limit(limit);
      return rows.map(toStoryWithPosition);
    },

    async byId(id) {
      const [row] = await resolveDb().select().from(newsStory).where(eq(newsStory.id, id)).limit(1);
      return row ? toStory(row) : undefined;
    },

    async byIds(ids) {
      if (ids.length === 0) return [];
      const rows = await resolveDb().select().from(newsStory).where(inArray(newsStory.id, ids));
      return rows.map(toStory);
    },
  };
}

function toStory(row: typeof newsStory.$inferSelect): NewsStory {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    body: row.body,
    category: row.category,
    source: row.source,
    publishedAt: row.publishedAt,
    readTime: row.readTime,
    imageUrl: row.imageUrl,
  };
}

function toStoryWithPosition(row: typeof newsStory.$inferSelect): StoryWithPosition {
  const position: ListPosition = { createdAt: row.createdAt, id: row.id };
  return { ...toStory(row), position };
}
