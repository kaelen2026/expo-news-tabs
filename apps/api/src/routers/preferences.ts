import { FONT_SIZE_VALUES, getDb, preference, THEME_VALUES } from "db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

const themeSchema = z.enum(THEME_VALUES);
const fontSizeSchema = z.enum(FONT_SIZE_VALUES);

const updateInput = z
  .object({
    theme: themeSchema.nullable().optional(),
    defaultCategory: z.string().min(1).nullable().optional(),
    fontSize: fontSizeSchema.nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });

export const preferencesRouter = router({
  // Return the user's preference row, creating it on the fly if missing.
  get: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const [existing] = await db
      .select()
      .from(preference)
      .where(eq(preference.userId, ctx.user.id))
      .limit(1);
    if (existing) return toShape(existing);

    const [created] = await db
      .insert(preference)
      .values({ userId: ctx.user.id })
      .onConflictDoNothing()
      .returning();
    if (created) return toShape(created);

    // Conflict means another concurrent insert won — re-read.
    const [now] = await db
      .select()
      .from(preference)
      .where(eq(preference.userId, ctx.user.id))
      .limit(1);
    return toShape(now);
  }),

  update: protectedProcedure.input(updateInput).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const set: Record<string, unknown> = {};
    if ("theme" in input) set.theme = input.theme ?? null;
    if ("defaultCategory" in input) set.defaultCategory = input.defaultCategory ?? null;
    if ("fontSize" in input) set.fontSize = input.fontSize ?? null;

    const [row] = await db
      .insert(preference)
      .values({ userId: ctx.user.id, ...set })
      .onConflictDoUpdate({ target: preference.userId, set })
      .returning();
    return toShape(row);
  }),
});

function toShape(row: typeof preference.$inferSelect | undefined) {
  return {
    theme: (row?.theme ?? null) as z.infer<typeof themeSchema> | null,
    defaultCategory: row?.defaultCategory ?? null,
    fontSize: (row?.fontSize ?? null) as z.infer<typeof fontSizeSchema> | null,
    updatedAt: row?.updatedAt ?? null,
  };
}
