import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Theme / default category filter / font size — one row per user.
// All columns are nullable so a brand-new user can have an "unset" pref.
export const preference = pgTable("preference", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  theme: text("theme"), // "light" | "dark" | "system" | null
  defaultCategory: text("default_category"), // category name or null = no filter
  fontSize: text("font_size"), // "sm" | "md" | "lg" | null
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type PreferenceRow = typeof preference.$inferSelect;
export type NewPreference = typeof preference.$inferInsert;

export const THEME_VALUES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEME_VALUES)[number];

export const FONT_SIZE_VALUES = ["sm", "md", "lg"] as const;
export type FontSize = (typeof FONT_SIZE_VALUES)[number];
