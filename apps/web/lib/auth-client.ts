"use client";

import { createAuthClient } from "better-auth/react";

// On Vercel preview deployments the hostname is not known at build time,
// so `NEXT_PUBLIC_BETTER_AUTH_URL` can only be pinned for production. In
// the browser the current origin is always the right answer; on the server
// (SSR) better-auth re-resolves via the request, so the localhost fallback
// only matters for local SSR before NEXT_PUBLIC_BETTER_AUTH_URL is set.
function resolveClientBaseURL(): string {
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: resolveClientBaseURL(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
