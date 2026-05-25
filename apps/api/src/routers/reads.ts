import { getDb, readState } from "db";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const readsRouter = router({
  // Set of story ids the user has read. Tiny payload, cheap for client-side join.
  ids: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select({ storyId: readState.storyId })
      .from(readState)
      .where(eq(readState.userId, ctx.user.id));
    return rows.map((r) => r.storyId);
  }),

  // Idempotent — marking the same story twice refreshes readAt.
  mark: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .insert(readState)
        .values({ userId: ctx.user.id, storyId: input.storyId })
        .onConflictDoUpdate({
          target: [readState.userId, readState.storyId],
          set: { readAt: sql`now()` },
        });
      return { storyId: input.storyId, isRead: true };
    }),
});
