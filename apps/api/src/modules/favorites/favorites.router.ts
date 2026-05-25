import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../../core/trpc";
import { StoryNotFoundError } from "./favorites.service";
import { getFavoritesService } from "./index";

const storyInput = z.object({ storyId: z.string() });

async function translateDomainErrors<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof StoryNotFoundError) {
      throw new TRPCError({ code: "NOT_FOUND", message: err.message });
    }
    throw err;
  }
}

export const favoritesRouter = router({
  list: protectedProcedure.query(({ ctx }) => getFavoritesService().list(ctx.user.id)),

  ids: protectedProcedure.query(({ ctx }) => getFavoritesService().ids(ctx.user.id)),

  add: protectedProcedure
    .input(storyInput)
    .mutation(({ ctx, input }) =>
      translateDomainErrors(() => getFavoritesService().add(ctx.user.id, input.storyId)),
    ),

  remove: protectedProcedure
    .input(storyInput)
    .mutation(({ ctx, input }) => getFavoritesService().remove(ctx.user.id, input.storyId)),

  toggle: protectedProcedure
    .input(storyInput)
    .mutation(({ ctx, input }) =>
      translateDomainErrors(() => getFavoritesService().toggle(ctx.user.id, input.storyId)),
    ),
});
