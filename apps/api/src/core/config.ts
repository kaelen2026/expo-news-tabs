// Centralized env reads. Procedures and modules should consume this
// instead of touching `process.env` directly, so request-time code paths
// stay free of environment lookups.
export type ApiConfig = {
  port: number;
  webOrigin: string;
  apiAuthUrl: string;
  betterAuthSecret: string;
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
    betterAuthSecret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-me",
    trustedOrigins: [webOrigin, "http://localhost:8081", "exp://"],
  };
  return cached;
}
