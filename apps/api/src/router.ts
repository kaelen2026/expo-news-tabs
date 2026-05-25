import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { DEFAULT_PAGE_LIMIT, getStoryById, listStories, MAX_PAGE_LIMIT } from "./news";
import { protectedProcedure, publicProcedure, router } from "./trpc";

export const appRouter = router({
  auth: router({
    me: protectedProcedure.query(({ ctx }) => {
      return {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        image: ctx.user.image ?? null,
        emailVerified: ctx.user.emailVerified,
      };
    }),
  }),

  news: router({
    list: publicProcedure
      .input(
        z
          .object({
            cursor: z.string().optional(),
            limit: z.number().int().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
          })
          .optional(),
      )
      .query(async ({ input }) => {
        return listStories({ cursor: input?.cursor, limit: input?.limit });
      }),

    byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      const story = await getStoryById(input.id);
      if (!story) {
        throw new TRPCError({ code: "NOT_FOUND", message: `Story ${input.id} not found` });
      }
      return story;
    }),
  }),
});

export type AppRouter = typeof appRouter;
