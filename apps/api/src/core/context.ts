import type { Context, SessionRecord, SessionUser } from "./trpc";

// A session resolver is the only piece of the context that varies by
// deployment. Keeping it as DI lets core stay free of better-auth (or
// any concrete auth backend) so modules can be lifted into their own
// services later without dragging core with them.
export type SessionResolver = (
  headers: Headers,
) => Promise<{ user: SessionUser; session: SessionRecord } | null>;

export function createContextFactory(resolveSession: SessionResolver) {
  return async function createContext(headers: Headers): Promise<Context> {
    const resolved = await resolveSession(headers);
    return {
      user: resolved?.user ?? null,
      session: resolved?.session ?? null,
      headers,
    };
  };
}
