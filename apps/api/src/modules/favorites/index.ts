import { getDb } from "db";
import { getNewsService } from "../news";
import { createDrizzleFavoriteRepository } from "./favorites.drizzle";
import {
  createFavoritesService,
  createStoryGatewayFromNews,
  type FavoriteService,
} from "./favorites.service";

export type { FavoriteRepository } from "./favorites.repository";
export { favoritesRouter } from "./favorites.router";
export {
  type FavoriteService,
  type StoryGateway,
  StoryNotFoundError,
} from "./favorites.service";
export type { FavoriteEdge, FavoriteListItem } from "./favorites.types";

let cached: FavoriteService | undefined;

export function getFavoritesService(): FavoriteService {
  if (!cached) {
    cached = createFavoritesService(
      createDrizzleFavoriteRepository(getDb),
      createStoryGatewayFromNews(getNewsService()),
    );
  }
  return cached;
}
