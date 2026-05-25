import "server-only";
import { getSharedAuthOptions } from "auth-config";
import { betterAuth } from "better-auth";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

// Shared options (secret, drizzle adapter, plugins, email/password) come
// from `auth-config` so apps/api and apps/web stay in lockstep — only the
// web-only bits (own baseURL, OAuth providers) live here.
// On Vercel, every preview deployment gets a unique hostname
// (web-git-<branch>-<team>.vercel.app) injected via VERCEL_URL. better-auth
// needs the runtime origin to set cookies on the right domain and to build
// OAuth callback URLs, so fall back to VERCEL_URL when BETTER_AUTH_URL is
// not explicitly pinned (production should still pin it to the custom
// domain).
function resolveBaseURL(): string {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const auth = betterAuth({
  ...getSharedAuthOptions(),
  baseURL: resolveBaseURL(),
  socialProviders: {
    ...(googleClientId && googleClientSecret
      ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
      : {}),
    ...(githubClientId && githubClientSecret
      ? { github: { clientId: githubClientId, clientSecret: githubClientSecret } }
      : {}),
  },
});

export type Auth = typeof auth;
