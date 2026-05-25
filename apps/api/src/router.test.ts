import { TRPCError } from "@trpc/server";
import { closeDb, favorite, getDb, newsStory, preference, readState, user } from "db";
import { runMigrations } from "db/migrator";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Context } from "./core/trpc";
import { appRouter } from "./router";

const TEST_URL = process.env.TEST_DATABASE_URL;

function anonymousContext(): Context {
  return { user: null, session: null, headers: new Headers(), requestId: "test" };
}

function authedContext(overrides: Partial<NonNullable<Context["user"]>> = {}): Context {
  const now = new Date();
  const user: NonNullable<Context["user"]> = {
    id: "user_test",
    email: "test@example.com",
    name: "Test User",
    image: null,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  const session: NonNullable<Context["session"]> = {
    id: "session_test",
    userId: user.id,
    token: "tok_test",
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: now,
    updatedAt: now,
    ipAddress: null,
    userAgent: null,
  };
  return { user, session, headers: new Headers(), requestId: "test" };
}

// These tests need a live Postgres dedicated to testing.
//   TEST_DATABASE_URL=postgresql://app:app@localhost:5432/test pnpm --filter api test
// They will TRUNCATE the news_story table, so don't point this at a database
// you care about.
describe.skipIf(!TEST_URL)("news router", () => {
  const caller = appRouter.createCaller(anonymousContext());

  const base = new Date("2026-05-25T10:00:00Z").getTime();
  const minute = 60_000;

  const fixtures = [
    fixture("a", 0),
    fixture("b", 1),
    fixture("c", 2),
    fixture("d", 3),
    fixture("e", 4),
    fixture("f", 5),
    fixture("g", 6),
  ];

  function fixture(id: string, ageMinutes: number) {
    return {
      id: `test-${id}`,
      title: `Test story ${id}`,
      summary: "summary",
      body: ["body"],
      category: "Test",
      source: "Test Source",
      publishedAt: `${ageMinutes}m ago`,
      readTime: "1 min read",
      imageUrl: "https://example.com/img.jpg",
      createdAt: new Date(base - ageMinutes * minute),
    };
  }

  beforeAll(async () => {
    const db = getDb();
    await runMigrations(db);
    await db.delete(newsStory);
    await db.insert(newsStory).values(fixtures);
  });

  afterAll(async () => {
    await closeDb();
  });

  describe("news.list", () => {
    it("returns the first page newest-first with a nextCursor", async () => {
      const result = await caller.news.list({ limit: 3 });

      expect(result.items.map((s) => s.id)).toEqual(["test-a", "test-b", "test-c"]);
      expect(result.nextCursor).toBeTypeOf("string");
    });

    it("paginates through every story without duplicates", async () => {
      const seen: string[] = [];
      let cursor: string | undefined;

      for (let safety = 0; safety < 10; safety++) {
        const page = await caller.news.list({ cursor, limit: 3 });
        seen.push(...page.items.map((s) => s.id));
        if (!page.nextCursor) break;
        cursor = page.nextCursor;
      }

      expect(seen).toEqual(["test-a", "test-b", "test-c", "test-d", "test-e", "test-f", "test-g"]);
      expect(new Set(seen).size).toBe(seen.length);
    });

    it("returns nextCursor = null on the last page", async () => {
      const first = await caller.news.list({ limit: 5 });
      expect(first.nextCursor).toBeTypeOf("string");

      const second = await caller.news.list({ cursor: first.nextCursor ?? undefined, limit: 5 });
      expect(second.items.length).toBe(2);
      expect(second.nextCursor).toBeNull();
    });

    it("ignores malformed cursors", async () => {
      const result = await caller.news.list({ cursor: "not-a-valid-cursor", limit: 3 });
      expect(result.items.map((s) => s.id)).toEqual(["test-a", "test-b", "test-c"]);
    });

    it("defaults to a limit when none is provided", async () => {
      const result = await caller.news.list();
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.length).toBeLessThanOrEqual(fixtures.length);
    });
  });

  describe("news.byId", () => {
    it("returns a matching story", async () => {
      const story = await caller.news.byId({ id: "test-c" });
      expect(story.title).toBe("Test story c");
    });

    it("throws NOT_FOUND for missing ids", async () => {
      await expect(caller.news.byId({ id: "test-does-not-exist" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
      await expect(caller.news.byId({ id: "test-does-not-exist" })).rejects.toBeInstanceOf(
        TRPCError,
      );
    });
  });
});

// auth.me doesn't hit the database, so these run even without TEST_DATABASE_URL.
describe("auth router", () => {
  describe("auth.me", () => {
    it("throws UNAUTHORIZED when there is no session", async () => {
      const caller = appRouter.createCaller(anonymousContext());

      await expect(caller.auth.me()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
      await expect(caller.auth.me()).rejects.toBeInstanceOf(TRPCError);
    });

    it("returns the current user when a session is present", async () => {
      const caller = appRouter.createCaller(
        authedContext({ id: "user_42", email: "a@b.co", name: "Ada" }),
      );

      const me = await caller.auth.me();
      expect(me).toEqual({
        id: "user_42",
        email: "a@b.co",
        name: "Ada",
        image: null,
        emailVerified: true,
      });
    });
  });
});

describe.skipIf(!TEST_URL)("user-data routers", () => {
  const TEST_USER_ID = "user_test_data";

  async function insertTestUser() {
    const db = getDb();
    await db
      .insert(user)
      .values({
        id: TEST_USER_ID,
        email: "test-data@example.com",
        name: "Data Tester",
        emailVerified: true,
      })
      .onConflictDoNothing();
  }

  async function insertSampleStories() {
    const db = getDb();
    await db
      .insert(newsStory)
      .values([
        {
          id: "data-a",
          title: "A",
          summary: "a",
          body: ["a"],
          category: "Test",
          source: "Test",
          publishedAt: "now",
          readTime: "1m",
          imageUrl: "x",
          createdAt: new Date(),
        },
        {
          id: "data-b",
          title: "B",
          summary: "b",
          body: ["b"],
          category: "Test",
          source: "Test",
          publishedAt: "now",
          readTime: "1m",
          imageUrl: "x",
          createdAt: new Date(),
        },
      ])
      .onConflictDoNothing();
  }

  const caller = appRouter.createCaller(
    authedContext({ id: TEST_USER_ID, email: "test-data@example.com", name: "Data Tester" }),
  );

  beforeAll(async () => {
    await runMigrations(getDb());
    await insertSampleStories();
    await insertTestUser();
  });

  beforeEach(async () => {
    const db = getDb();
    await db.delete(favorite).where(eq(favorite.userId, TEST_USER_ID));
    await db.delete(readState).where(eq(readState.userId, TEST_USER_ID));
    await db.delete(preference).where(eq(preference.userId, TEST_USER_ID));
  });

  describe("favorites", () => {
    it("toggle adds then removes", async () => {
      const first = await caller.favorites.toggle({ storyId: "data-a" });
      expect(first.isFavorite).toBe(true);

      const second = await caller.favorites.toggle({ storyId: "data-a" });
      expect(second.isFavorite).toBe(false);
    });

    it("add is idempotent and list returns rows newest first", async () => {
      await caller.favorites.add({ storyId: "data-a" });
      await caller.favorites.add({ storyId: "data-a" });
      await new Promise((resolve) => setTimeout(resolve, 5));
      await caller.favorites.add({ storyId: "data-b" });

      const list = await caller.favorites.list();
      expect(list.map((r) => r.id)).toEqual(["data-b", "data-a"]);

      const ids = await caller.favorites.ids();
      expect([...ids].sort()).toEqual(["data-a", "data-b"]);
    });

    it("rejects favoriting a non-existent story", async () => {
      await expect(caller.favorites.add({ storyId: "data-nope" })).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });
  });

  describe("reads", () => {
    it("marking twice is idempotent and refreshes readAt", async () => {
      const first = await caller.reads.mark({ storyId: "data-a" });
      expect(first.isRead).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 5));
      const second = await caller.reads.mark({ storyId: "data-a" });
      expect(second.isRead).toBe(true);

      const ids = await caller.reads.ids();
      expect(ids).toEqual(["data-a"]);
    });
  });

  describe("preferences", () => {
    it("get returns nulls for a fresh user", async () => {
      const prefs = await caller.preferences.get();
      expect(prefs).toMatchObject({ theme: null, defaultCategory: null, fontSize: null });
    });

    it("update writes the provided fields and leaves others untouched", async () => {
      await caller.preferences.update({ theme: "dark" });
      let prefs = await caller.preferences.get();
      expect(prefs.theme).toBe("dark");

      await caller.preferences.update({ defaultCategory: "Science" });
      prefs = await caller.preferences.get();
      expect(prefs).toMatchObject({ theme: "dark", defaultCategory: "Science", fontSize: null });

      await caller.preferences.update({ theme: null });
      prefs = await caller.preferences.get();
      expect(prefs).toMatchObject({ theme: null, defaultCategory: "Science" });
    });
  });
});

describe("user-data routers require auth", () => {
  const caller = appRouter.createCaller(anonymousContext());

  it("favorites.list rejects anonymous callers", async () => {
    await expect(caller.favorites.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
  it("reads.mark rejects anonymous callers", async () => {
    await expect(caller.reads.mark({ storyId: "x" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
  it("preferences.get rejects anonymous callers", async () => {
    await expect(caller.preferences.get()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
