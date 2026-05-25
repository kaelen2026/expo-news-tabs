import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "./auth";

export type Context = {
  user: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"] | null;
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["session"] | null;
  headers: Headers;
};

export async function createContextFromHeaders(headers: Headers): Promise<Context> {
  const result = await auth.api.getSession({ headers });
  return {
    user: result?.user ?? null,
    session: result?.session ?? null,
    headers,
  };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in required" });
  }
  return next({
    ctx: {
      ...ctx,
      // narrow user/session as non-null for downstream resolvers
      user: ctx.user,
      session: ctx.session,
    },
  });
});
