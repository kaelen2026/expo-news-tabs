import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { account, getDb, session, user, verification } from "db";

// Pieces of the better-auth config that MUST agree across every process
// that issues or validates sessions. Each app (apps/api, apps/web) builds
// its own betterAuth() instance, spreads these in, and adds the per-app
// pieces — baseURL, basePath, socialProviders, trustedOrigins.
//
//   Why a shared package: secret + drizzle adapter + plugins is exactly
//   the surface where divergence silently breaks cross-app sessions. A
//   mismatched schema slot or a missing bearer() plugin in one app would
//   not be caught by types; it would just look like "logged in on web,
//   logged out on mobile."
export type SharedAuthOptions = Required<
  Pick<BetterAuthOptions, "secret" | "database" | "emailAndPassword" | "plugins">
>;

export function getSharedAuthOptions(): SharedAuthOptions {
  return {
    secret: requireAuthSecret(),
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: { enabled: true },
    // bearer() lets mobile clients send `Authorization: Bearer <token>`
    // instead of relying on browser cookies. Both apps need it so a token
    // minted by one verifies on the other.
    plugins: [bearer()],
  };
}

export const DEV_AUTH_SECRET = "dev-secret-change-me";

function requireAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET ?? DEV_AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && secret === DEV_AUTH_SECRET) {
    throw new Error(
      "BETTER_AUTH_SECRET must be set in production — refusing to start with the dev fallback. " +
        "Generate one with `openssl rand -base64 32` and set the same value on apps/api and apps/web.",
    );
  }
  return secret;
}
