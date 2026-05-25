import { getDb, newsStory } from "db";
import { asc, eq } from "drizzle-orm";

export type NewsStory = {
  id: string;
  title: string;
  summary: string;
  body: string[];
  category: string;
  source: string;
  publishedAt: string;
  readTime: string;
  imageUrl: string;
};

export async function listStories(): Promise<NewsStory[]> {
  const rows = await getDb().select().from(newsStory).orderBy(asc(newsStory.createdAt));
  return rows.map(toStory);
}

export async function getStoryById(id: string): Promise<NewsStory | undefined> {
  const [row] = await getDb().select().from(newsStory).where(eq(newsStory.id, id)).limit(1);
  return row ? toStory(row) : undefined;
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
