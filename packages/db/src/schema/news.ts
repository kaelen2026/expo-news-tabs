import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const newsStory = pgTable("news_story", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  body: text("body").array().notNull(),
  category: text("category").notNull(),
  source: text("source").notNull(),
  publishedAt: text("published_at").notNull(),
  readTime: text("read_time").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NewsStoryRow = typeof newsStory.$inferSelect;
export type NewNewsStory = typeof newsStory.$inferInsert;
