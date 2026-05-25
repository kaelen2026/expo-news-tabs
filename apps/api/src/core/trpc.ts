import { initTRPC, TRPCError } from "@trpc/server";

// Context shape is hand-rolled here (not derived from better-auth) so the
// core layer stays independent of any module. Modules and tests must
// produce values that satisfy this shape.
// Optional-with-null fields match better-auth's emitted shape. Anything
// that turns these into a presentation value should coalesce to `null`
// (the procedure body in `modules/auth/auth.router.ts` is the reference).
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionRecord = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type Context = {
  user: SessionUser | null;
  session: SessionRecord | null;
  headers: Headers;
  // Per-request identifier (uuid). Attached by the Hono request logger
  // and forwarded into the tRPC context so the `onError` hook and any
  // procedure that wants to emit logs can correlate them.
  requestId: string;
};

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
      user: ctx.user,
      session: ctx.session,
    },
  });
});
