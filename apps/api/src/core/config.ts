// Centralized env reads. Procedures and modules should consume this
// instead of touching `process.env` directly, so request-time code paths
// stay free of environment lookups.
//
// BETTER_AUTH_SECRET is read by the shared `auth-config` package, not
// here — the secret must agree between apps/api and apps/web, so the
// single source of truth lives next to the better-auth instance.
export type ApiConfig = {
  port: number;
  webOrigin: string;
  apiAuthUrl: string;
  trustedOrigins: string[];
};

let cached: ApiConfig | undefined;

export function getConfig(): ApiConfig {
  if (cached) return cached;
  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
  cached = {
    port: Number(process.env.PORT ?? 3001),
    webOrigin,
    apiAuthUrl: process.env.API_AUTH_URL ?? "http://localhost:3001",
    trustedOrigins: [webOrigin, "http://localhost:8081", "exp://"],
  };
  return cached;
}
