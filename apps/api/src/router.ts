import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getStoryById, newsStories } from "./news";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  news: router({
    list: publicProcedure
      .input(
        z
          .object({
            page: z.number().int().min(1).max(3).default(1),
          })
          .optional(),
      )
      .query(({ input }) => {
        const page = input?.page ?? 1;
        return {
          page,
          hasMore: page < 3,
          stories: newsStories.map((story) => ({
            ...story,
            feedId: `${page}-${story.id}`,
          })),
        };
      }),

    byId: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
      const story = getStoryById(input.id);
      if (!story) {
        throw new TRPCError({ code: "NOT_FOUND", message: `Story ${input.id} not found` });
      }
      return story;
    }),
  }),
});

export type AppRouter = typeof appRouter;
