"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AsyncState } from "./async-state";
import { isKnownCategory, KNOWN_CATEGORIES, type KnownCategory } from "./categories";
import { SessionIndicator } from "./session-indicator";
import { StoryActions } from "./story-actions";
import { trpc } from "./trpc-provider";

const PAGE_LIMIT_DEFAULT = 6;
// Mirrors the mobile home tab: filtering happens client-side, so a 6-row
// page often nets 0–1 items in the chosen category. A bigger page while
// filtered keeps the list from feeling empty without changing the API.
const PAGE_LIMIT_FILTERED = 24;

export default function HomePage() {
  const session = useSession();
  const isAuthenticated = Boolean(session.data?.user);

  const [selectedCategory, setSelectedCategory] = useState<KnownCategory | null>(null);

  // Hydrate the chip once from preferences.defaultCategory. Subsequent
  // chip clicks are local to this page; updating the saved default still
  // lives on /preferences.
  const prefsQuery = trpc.preferences.get.useQuery(undefined, { enabled: isAuthenticated });
  const [hydratedFromPrefs, setHydratedFromPrefs] = useState(false);
  useEffect(() => {
    if (hydratedFromPrefs) return;
    if (!isAuthenticated) {
      setHydratedFromPrefs(true);
      return;
    }
    if (prefsQuery.isSuccess) {
      const def = prefsQuery.data?.defaultCategory;
      if (isKnownCategory(def)) {
        setSelectedCategory(def);
      }
      setHydratedFromPrefs(true);
    }
  }, [hydratedFromPrefs, isAuthenticated, prefsQuery.isSuccess, prefsQuery.data]);

  const newsQuery = trpc.news.list.useInfiniteQuery(
    { limit: selectedCategory ? PAGE_LIMIT_FILTERED : PAGE_LIMIT_DEFAULT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined },
  );

  const favoritesQuery = trpc.favorites.ids.useQuery(undefined, { enabled: isAuthenticated });
  const readsQuery = trpc.reads.ids.useQuery(undefined, { enabled: isAuthenticated });

  const favoriteSet = useMemo(() => new Set(favoritesQuery.data ?? []), [favoritesQuery.data]);
  const readSet = useMemo(() => new Set(readsQuery.data ?? []), [readsQuery.data]);

  const allStories = useMemo(
    () => newsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [newsQuery.data],
  );
  const stories = useMemo(
    () =>
      selectedCategory ? allStories.filter((s) => s.category === selectedCategory) : allStories,
    [allStories, selectedCategory],
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-[var(--color-accent)]">
              Morning Brief
            </p>
            <h1 className="mt-2 text-4xl font-semibold">News Tabs — Web</h1>
          </div>
          <SessionIndicator />
        </div>
        <p className="mt-3 text-base opacity-70">
          Next.js 16 · App Router · Tailwind v4 · tRPC client talking to the Hono API.
        </p>
        <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />
      </header>

      <AsyncState
        isLoading={newsQuery.isLoading}
        isError={newsQuery.isError && stories.length === 0}
        errorMessage={newsQuery.error?.message}
        isEmpty={newsQuery.isSuccess && stories.length === 0}
        loadingLabel="Loading stories…"
        emptyLabel={
          selectedCategory
            ? `No ${selectedCategory.toLowerCase()} stories yet — try another topic.`
            : "No stories yet — check back soon."
        }
        onRetry={() => newsQuery.refetch()}
      >
        <ul className="space-y-6">
          {stories.map((story) => {
            const isFavorite = favoriteSet.has(story.id);
            const isRead = readSet.has(story.id);
            return (
              <li
                key={story.id}
                className={`rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 ${
                  isRead ? "opacity-70" : ""
                }`}
              >
                <p className="text-xs uppercase tracking-wider opacity-60">
                  {story.category} · {story.readTime}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{story.title}</h2>
                <p className="mt-2 text-sm opacity-80">{story.summary}</p>
                <StoryActions
                  storyId={story.id}
                  isAuthenticated={isAuthenticated}
                  isFavorite={isFavorite}
                  isRead={isRead}
                />
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-2">
          {newsQuery.hasNextPage && (
            <button
              type="button"
              onClick={() => newsQuery.fetchNextPage()}
              disabled={newsQuery.isFetchingNextPage}
              className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-white/15"
            >
              {newsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
            </button>
          )}
          {!newsQuery.hasNextPage && stories.length > 0 && (
            <p className="text-xs opacity-50">No more stories.</p>
          )}
          {newsQuery.isError && stories.length > 0 && (
            <p className="text-xs text-red-600">
              Couldn't load more: {newsQuery.error?.message ?? "Unknown error"}
            </p>
          )}
        </div>
      </AsyncState>
    </main>
  );
}

function CategoryChips({
  selected,
  onSelect,
}: {
  selected: KnownCategory | null;
  onSelect: (next: KnownCategory | null) => void;
}) {
  const items: { label: string; value: KnownCategory | null }[] = [
    { label: "All", value: null },
    ...KNOWN_CATEGORIES.map((c) => ({ label: c, value: c })),
  ];
  return (
    <div
      role="tablist"
      aria-label="Filter stories by category"
      className="mt-4 flex flex-wrap gap-2"
    >
      {items.map((item) => {
        const active = selected === item.value;
        return (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(item.value)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              active
                ? "border-black/40 bg-black/5 dark:border-white/40 dark:bg-white/10"
                : "border-black/15 hover:bg-black/[0.03] dark:border-white/15 dark:hover:bg-white/[0.05]"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
