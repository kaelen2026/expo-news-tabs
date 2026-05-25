import { getDb, newsStory } from "db";
import { and, desc, eq, lt, or } from "drizzle-orm";

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

export const MAX_PAGE_LIMIT = 50;
export const DEFAULT_PAGE_LIMIT = 10;

export type ListPage = {
  items: NewsStory[];
  nextCursor: string | null;
};

export type ListOptions = {
  cursor?: string;
  limit?: number;
};

export async function listStories({ cursor, limit }: ListOptions = {}): Promise<ListPage> {
  const take = clampLimit(limit ?? DEFAULT_PAGE_LIMIT);
  const decoded = cursor ? decodeCursor(cursor) : null;

  const rows = await getDb()
    .select()
    .from(newsStory)
    .where(
      decoded
        ? or(
            lt(newsStory.createdAt, decoded.createdAt),
            and(eq(newsStory.createdAt, decoded.createdAt), lt(newsStory.id, decoded.id)),
          )
        : undefined,
    )
    .orderBy(desc(newsStory.createdAt), desc(newsStory.id))
    .limit(take + 1);

  const hasMore = rows.length > take;
  const page = hasMore ? rows.slice(0, take) : rows;
  const last = page.at(-1);

  return {
    items: page.map(toStory),
    nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
  };
}

export async function getStoryById(id: string): Promise<NewsStory | undefined> {
  const [row] = await getDb().select().from(newsStory).where(eq(newsStory.id, id)).limit(1);
  return row ? toStory(row) : undefined;
}

function clampLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit < 1) return DEFAULT_PAGE_LIMIT;
  return Math.min(Math.floor(limit), MAX_PAGE_LIMIT);
}

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.getTime()}:${id}`, "utf8").toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const sep = raw.indexOf(":");
    if (sep < 1) return null;
    const ms = Number(raw.slice(0, sep));
    const id = raw.slice(sep + 1);
    if (!Number.isFinite(ms) || id.length === 0) return null;
    return { createdAt: new Date(ms), id };
  } catch {
    return null;
  }
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
