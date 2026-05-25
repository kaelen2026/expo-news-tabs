import { getSharedAuthOptions } from "auth-config";
import { betterAuth } from "better-auth";
import { getConfig } from "../../core/config";

// apps/api validates sessions and also acts as the auth backend for
// mobile (which can't use browser cookies). Shared options (secret,
// drizzle adapter, plugins, email/password) live in `auth-config` so a
// session minted by apps/web verifies here and vice versa.
const config = getConfig();

export const auth = betterAuth({
  ...getSharedAuthOptions(),
  baseURL: config.apiAuthUrl,
  // apps/web mounts at /api/auth/*; the API exposes a cleaner /auth/* for
  // mobile clients that talk to it directly.
  basePath: "/auth",
  // Mobile sends its session token as `Authorization: Bearer <token>` and
  // can't rely on the browser to attach cookies. trustedOrigins covers the
  // expo dev server (Metro), web, and any LAN host the mobile app uses.
  trustedOrigins: config.trustedOrigins,
});

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
