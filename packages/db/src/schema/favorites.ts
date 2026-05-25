import { index, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { newsStory } from "./news";

export const favorite = pgTable(
  "favorite",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    storyId: text("story_id")
      .notNull()
      .references(() => newsStory.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.storyId] }),
    index("favorite_user_id_idx").on(table.userId),
  ],
);

export type FavoriteRow = typeof favorite.$inferSelect;
export type NewFavorite = typeof favorite.$inferInsert;
