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
export const auth = betterAuth({
  ...getSharedAuthOptions(),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
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
