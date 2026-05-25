import { getDb } from "db";
import { createDrizzleNewsRepository } from "./news.drizzle";
import { createNewsService, type NewsService } from "./news.service";

export type { ListPosition, NewsRepository, StoryWithPosition } from "./news.repository";
export { newsRouter } from "./news.router";
export type { NewsService } from "./news.service";
export {
  DEFAULT_PAGE_LIMIT,
  type ListOptions,
  type ListPage,
  MAX_PAGE_LIMIT,
  type NewsStory,
} from "./news.types";

let cached: NewsService | undefined;

// Lazy singleton: the Drizzle client is only constructed on first use, so
// this module is import-safe (no DB connection at module load time).
// Swap the factory below to migrate the news domain to a different store.
export function getNewsService(): NewsService {
  if (!cached) cached = createNewsService(createDrizzleNewsRepository(getDb));
  return cached;
}
