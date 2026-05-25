import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { account, getDb, session, user, verification } from "db";

// apps/api validates sessions and also acts as the auth backend for
// mobile (which can't use browser cookies). Same BETTER_AUTH_SECRET +
// DATABASE_URL as apps/web, so sessions issued by either side are
// interoperable.
export const auth = betterAuth({
  baseURL: process.env.API_AUTH_URL ?? "http://localhost:3001",
  // apps/web mounts at /api/auth/*; the API exposes a cleaner /auth/* for
  // mobile clients that talk to it directly.
  basePath: "/auth",
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-me",
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [bearer()],
  // Mobile sends its session token as `Authorization: Bearer <token>` and
  // can't rely on the browser to attach cookies. trustedOrigins covers the
  // expo dev server (Metro), web, and any LAN host the mobile app uses.
  trustedOrigins: [
    process.env.WEB_ORIGIN ?? "http://localhost:3000",
    "http://localhost:8081",
    "exp://",
  ],
});

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
