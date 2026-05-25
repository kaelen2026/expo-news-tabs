import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../../core/trpc";
import { getNewsService } from "./index";
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "./news.types";

export const newsRouter = router({
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
      return getNewsService().list({ cursor: input?.cursor, limit: input?.limit });
    }),

  byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const story = await getNewsService().byId(input.id);
    if (!story) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Story ${input.id} not found` });
    }
    return story;
  }),
});
