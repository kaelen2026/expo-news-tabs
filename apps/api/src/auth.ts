import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account, getDb, session, user, verification } from "db";

// apps/api hosts no auth UI; this instance only validates sessions
// (and stamps cookies / bearer tokens) against the shared Postgres.
// Sign-in / sign-up flows are owned by apps/web. As long as both apps
// share BETTER_AUTH_SECRET and the same DATABASE_URL, sessions issued
// by either instance are valid here.
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-me",
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
});

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
