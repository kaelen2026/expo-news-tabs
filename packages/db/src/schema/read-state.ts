import { index, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { newsStory } from "./news";

export const readState = pgTable(
  "read_state",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    storyId: text("story_id")
      .notNull()
      .references(() => newsStory.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.storyId] }),
    index("read_state_user_id_idx").on(table.userId),
  ],
);

export type ReadStateRow = typeof readState.$inferSelect;
export type NewReadState = typeof readState.$inferInsert;
