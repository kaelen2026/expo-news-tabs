import { describe, expect, it } from "vitest";

import { getStoryById, newsStories } from "./news";

describe("news data", () => {
  it("finds a story by id", () => {
    expect(getStoryById("city-transit")?.title).toBe("City transit adds all-day express routes");
  });

  it("returns undefined for unknown ids", () => {
    expect(getStoryById("missing-story")).toBeUndefined();
  });

  it("has unique story ids", () => {
    const ids = newsStories.map((story) => story.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
