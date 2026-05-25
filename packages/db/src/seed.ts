import { sql } from "drizzle-orm";
import { closeDb, getDb } from "./client";
import { newsStory } from "./schema/news";
import { seedNewsStories } from "./seed-data";

async function main() {
  const db = getDb();
  console.log(`seeding ${seedNewsStories.length} news stories…`);
  await db
    .insert(newsStory)
    .values(seedNewsStories)
    .onConflictDoUpdate({
      target: newsStory.id,
      set: {
        title: sql`excluded.title`,
        summary: sql`excluded.summary`,
        body: sql`excluded.body`,
        category: sql`excluded.category`,
        source: sql`excluded.source`,
        publishedAt: sql`excluded.published_at`,
        readTime: sql`excluded.read_time`,
        imageUrl: sql`excluded.image_url`,
        createdAt: sql`excluded.created_at`,
      },
    });
  console.log("seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
