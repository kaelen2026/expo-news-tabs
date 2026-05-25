import { closeDb, runMigrations } from "./client";

async function main() {
  console.log("running migrations…");
  await runMigrations();
  console.log("migrations complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
