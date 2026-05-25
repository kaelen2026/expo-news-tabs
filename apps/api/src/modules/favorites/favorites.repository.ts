import type { FavoriteEdge } from "./favorites.types";

// Favorites owns only the relation between a user and a story. Story
// metadata comes from the news module via its service, so this interface
// would still hold if favorites were lifted into its own datastore.
export interface FavoriteRepository {
  listForUser(userId: string): Promise<FavoriteEdge[]>;
  idsForUser(userId: string): Promise<string[]>;
  add(userId: string, storyId: string): Promise<void>;
  remove(userId: string, storyId: string): Promise<void>;
  exists(userId: string, storyId: string): Promise<boolean>;
}
