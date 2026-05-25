import type { NewsService } from "../news";
import type { FavoriteRepository } from "./favorites.repository";
import type { FavoriteListItem } from "./favorites.types";

// Cross-module dependency declared as a narrow interface. The favorites
// service only needs to know whether a story exists and how to hydrate a
// summary view — not how news stores its data. Today the news module
// satisfies this; tomorrow it could be a remote service client.
export interface StoryGateway {
  exists(storyId: string): Promise<boolean>;
  byIds(ids: string[]): Promise<
    {
      id: string;
      title: string;
      summary: string;
      category: string;
      source: string;
      publishedAt: string;
      readTime: string;
      imageUrl: string;
    }[]
  >;
}

// Sentinel raised when a caller references a story id that does not exist.
// Routers translate it to TRPC `NOT_FOUND`. Other transports can do the
// same; this keeps the service framework-free.
export class StoryNotFoundError extends Error {
  constructor(public storyId: string) {
    super(`Story ${storyId} not found`);
    this.name = "StoryNotFoundError";
  }
}

export type FavoriteService = {
  list(userId: string): Promise<FavoriteListItem[]>;
  ids(userId: string): Promise<string[]>;
  add(userId: string, storyId: string): Promise<{ storyId: string; isFavorite: true }>;
  remove(userId: string, storyId: string): Promise<{ storyId: string; isFavorite: false }>;
  toggle(userId: string, storyId: string): Promise<{ storyId: string; isFavorite: boolean }>;
};

export function createFavoritesService(
  repo: FavoriteRepository,
  stories: StoryGateway,
): FavoriteService {
  async function ensureStoryExists(storyId: string) {
    if (!(await stories.exists(storyId))) throw new StoryNotFoundError(storyId);
  }

  return {
    async list(userId) {
      const edges = await repo.listForUser(userId);
      if (edges.length === 0) return [];

      const storyRows = await stories.byIds(edges.map((e) => e.storyId));
      const byId = new Map(storyRows.map((s) => [s.id, s]));

      // Preserve the favorite ordering (newest favorite first). Stories
      // that no longer exist are dropped silently — they'd just confuse
      // the client.
      return edges.flatMap<FavoriteListItem>((edge) => {
        const story = byId.get(edge.storyId);
        if (!story) return [];
        return [{ ...story, favoritedAt: edge.favoritedAt }];
      });
    },

    async ids(userId) {
      return repo.idsForUser(userId);
    },

    async add(userId, storyId) {
      await ensureStoryExists(storyId);
      await repo.add(userId, storyId);
      return { storyId, isFavorite: true };
    },

    async remove(userId, storyId) {
      await repo.remove(userId, storyId);
      return { storyId, isFavorite: false };
    },

    async toggle(userId, storyId) {
      await ensureStoryExists(storyId);
      if (await repo.exists(userId, storyId)) {
        await repo.remove(userId, storyId);
        return { storyId, isFavorite: false };
      }
      await repo.add(userId, storyId);
      return { storyId, isFavorite: true };
    },
  };
}

export function createStoryGatewayFromNews(news: NewsService): StoryGateway {
  return {
    async exists(storyId) {
      return (await news.byId(storyId)) != null;
    },
    async byIds(ids) {
      return news.byIds(ids);
    },
  };
}
