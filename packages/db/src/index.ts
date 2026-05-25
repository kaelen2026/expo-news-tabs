export * from "./client";
export * as schema from "./schema";
export * from "./schema";
// `runMigrations` lives in `db/migrator`. It's not re-exported here so that
// Next.js (and other bundlers) don't have to resolve the migrations folder
// URL when the only thing imported is the runtime client.
