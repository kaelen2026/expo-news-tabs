import { protectedProcedure, router } from "../../core/trpc";

export const authRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      image: ctx.user.image ?? null,
      emailVerified: ctx.user.emailVerified,
    };
  }),
});
