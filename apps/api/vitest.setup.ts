// Runs before test files. Ensures DATABASE_URL is set so the module-level
// better-auth + drizzle initialization in src/auth.ts doesn't throw on import.
// Tests that actually hit the DB gate themselves on TEST_DATABASE_URL.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://placeholder@127.0.0.1:5432/placeholder";
}

if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET = "test-secret-not-used";
}
