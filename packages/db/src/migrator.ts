// Migration helpers — kept in their own module so that runtime callers
// (apps/web's Next.js route, apps/api at request time) never end up bundling
// the migration filesystem URL. Only the migrate script and tests need this.
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { type Database, getDb } from "./client";

export const MIGRATIONS_FOLDER = new URL("../migrations", import.meta.url).pathname;

export async function runMigrations(db: Database = getDb()): Promise<void> {
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
}
