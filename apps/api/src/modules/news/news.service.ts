import type { ListPosition, NewsRepository } from "./news.repository";
import {
  DEFAULT_PAGE_LIMIT,
  type ListOptions,
  type ListPage,
  MAX_PAGE_LIMIT,
  type NewsStory,
} from "./news.types";

export type NewsService = {
  list(opts?: ListOptions): Promise<ListPage>;
  byId(id: string): Promise<NewsStory | undefined>;
  byIds(ids: string[]): Promise<NewsStory[]>;
};

export function createNewsService(repo: NewsRepository): NewsService {
  return {
    async list({ cursor, limit } = {}) {
      const take = clampLimit(limit ?? DEFAULT_PAGE_LIMIT);
      const after = cursor ? (decodeCursor(cursor) ?? undefined) : undefined;

      // Fetch take + 1 so we can tell whether another page exists without a
      // separate count query.
      const rows = await repo.list({ after, limit: take + 1 });

      const hasMore = rows.length > take;
      const page = hasMore ? rows.slice(0, take) : rows;
      const last = page.at(-1);

      return {
        items: page.map(({ position: _position, ...story }) => story),
        nextCursor: hasMore && last ? encodeCursor(last.position) : null,
      };
    },

    async byId(id) {
      return repo.byId(id);
    },

    async byIds(ids) {
      return repo.byIds(ids);
    },
  };
}

function clampLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit < 1) return DEFAULT_PAGE_LIMIT;
  return Math.min(Math.floor(limit), MAX_PAGE_LIMIT);
}

function encodeCursor(pos: ListPosition): string {
  return Buffer.from(`${pos.createdAt.getTime()}:${pos.id}`, "utf8").toString("base64url");
}

function decodeCursor(cursor: string): ListPosition | null {
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
