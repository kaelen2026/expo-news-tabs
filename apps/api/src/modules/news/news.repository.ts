import type { NewsStory } from "./news.types";

// Opaque-ish ordering key used by cursor pagination. Modeled as a tuple of
// (createdAt, id) — the natural ordering key today. A future storage
// backend can map this to whatever it needs internally.
export type ListPosition = { createdAt: Date; id: string };

export type StoryWithPosition = NewsStory & { position: ListPosition };

// Repository is the only seam between the news domain and the actual
// storage engine. Swap the Drizzle impl out (Postgres direct, a CDC view,
// a downstream microservice client) without touching service or router.
export interface NewsRepository {
  // Return up to `limit` rows newest-first; if `after` is present, return
  // only rows strictly older than it. The caller controls whether to
  // request an extra row for has-more detection.
  list(opts: { after?: ListPosition; limit: number }): Promise<StoryWithPosition[]>;
  byId(id: string): Promise<NewsStory | undefined>;
  // Batch lookup used by other modules (e.g. favorites) to hydrate
  // story-shaped views without joining across domain tables.
  byIds(ids: string[]): Promise<NewsStory[]>;
}
