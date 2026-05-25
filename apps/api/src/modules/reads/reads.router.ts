import { z } from "zod";
import { protectedProcedure, router } from "../../core/trpc";
import { getReadStateService } from "./index";

export const readsRouter = router({
  ids: protectedProcedure.query(({ ctx }) => getReadStateService().ids(ctx.user.id)),

  mark: protectedProcedure
    .input(z.object({ storyId: z.string() }))
    .mutation(({ ctx, input }) => getReadStateService().mark(ctx.user.id, input.storyId)),
});
