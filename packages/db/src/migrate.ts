import { migrate } from "drizzle-orm/postgres-js/migrator";
import { closeDb, getDb } from "./client";

async function main() {
  const db = getDb();
  console.log("running migrations…");
  await migrate(db, { migrationsFolder: new URL("../migrations", import.meta.url).pathname });
  console.log("migrations complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
