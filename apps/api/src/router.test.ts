import { TRPCError } from "@trpc/server";
import { closeDb, getDb, newsStory, runMigrations } from "db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { appRouter } from "./router";
import type { Context } from "./trpc";

const TEST_URL = process.env.TEST_DATABASE_URL;

function anonymousContext(): Context {
  return { user: null, session: null, headers: new Headers() };
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
  return { user, session, headers: new Headers() };
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
