import { TRPCError } from "@trpc/server";
import { favorite, getDb, newsStory } from "db";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const favoritesRouter = router({
  // List all the user's favorited stories, newest favorite first.
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select({
        id: newsStory.id,
        title: newsStory.title,
        summary: newsStory.summary,
        category: newsStory.category,
        source: newsStory.source,
        publishedAt: newsStory.publishedAt,
        readTime: newsStory.readTime,
        imageUrl: newsStory.imageUrl,
        favoritedAt: favorite.createdAt,
      })
      .from(favorite)
      .innerJoin(newsStory, eq(favorite.storyId, newsStory.id))
      .where(eq(favorite.userId, ctx.user.id))
      .orderBy(desc(favorite.createdAt));
    return rows;
  }),

  // Return just the ids — small payload for cheap UI hydration on the news list.
  ids: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select({ storyId: favorite.storyId })
      .from(favorite)
      .where(eq(favorite.userId, ctx.user.id));
    return rows.map((r) => r.storyId);
  }),

  add: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await ensureStoryExists(input.storyId);
      await db
        .insert(favorite)
        .values({ userId: ctx.user.id, storyId: input.storyId })
        .onConflictDoNothing();
      return { storyId: input.storyId, isFavorite: true };
    }),

  remove: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(favorite)
        .where(and(eq(favorite.userId, ctx.user.id), eq(favorite.storyId, input.storyId)));
      return { storyId: input.storyId, isFavorite: false };
    }),

  toggle: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await ensureStoryExists(input.storyId);
      const [existing] = await db
        .select({ storyId: favorite.storyId })
        .from(favorite)
        .where(and(eq(favorite.userId, ctx.user.id), eq(favorite.storyId, input.storyId)))
        .limit(1);

      if (existing) {
        await db
          .delete(favorite)
          .where(and(eq(favorite.userId, ctx.user.id), eq(favorite.storyId, input.storyId)));
        return { storyId: input.storyId, isFavorite: false };
      }

      await db.insert(favorite).values({ userId: ctx.user.id, storyId: input.storyId });
      return { storyId: input.storyId, isFavorite: true };
    }),
});

async function ensureStoryExists(storyId: string) {
  const db = getDb();
  const [row] = await db
    .select({ id: newsStory.id })
    .from(newsStory)
    .where(eq(newsStory.id, storyId))
    .limit(1);
  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: `Story ${storyId} not found` });
  }
}
