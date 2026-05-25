import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = ReturnType<typeof drizzle<typeof schema>>;

let cached: { db: Database; client: postgres.Sql } | undefined;

export function getDb(): Database {
  if (cached) return cached.db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Start postgres with `pnpm docker:up` and export DATABASE_URL.",
    );
  }
  const client = postgres(url, { prepare: false });
  const db = drizzle(client, { schema });
  cached = { db, client };
  return db;
}

export async function closeDb(): Promise<void> {
  if (!cached) return;
  await cached.client.end({ timeout: 5 });
  cached = undefined;
}

export const MIGRATIONS_FOLDER = new URL("../migrations", import.meta.url).pathname;

export async function runMigrations(db: Database = getDb()): Promise<void> {
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
}
