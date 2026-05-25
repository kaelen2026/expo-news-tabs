"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { AsyncState } from "./async-state";
import { SessionIndicator } from "./session-indicator";
import { StoryActions } from "./story-actions";
import { trpc } from "./trpc-provider";

export default function HomePage() {
  const session = useSession();
  const isAuthenticated = Boolean(session.data?.user);

  const newsQuery = trpc.news.list.useInfiniteQuery(
    { limit: 6 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined },
  );

  const favoritesQuery = trpc.favorites.ids.useQuery(undefined, { enabled: isAuthenticated });
  const readsQuery = trpc.reads.ids.useQuery(undefined, { enabled: isAuthenticated });

  const favoriteSet = useMemo(() => new Set(favoritesQuery.data ?? []), [favoritesQuery.data]);
  const readSet = useMemo(() => new Set(readsQuery.data ?? []), [readsQuery.data]);

  const stories = useMemo(
    () => newsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [newsQuery.data],
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
      </header>

      <AsyncState
        isLoading={newsQuery.isLoading}
        isError={newsQuery.isError && stories.length === 0}
        errorMessage={newsQuery.error?.message}
        isEmpty={newsQuery.isSuccess && stories.length === 0}
        loadingLabel="Loading stories…"
        emptyLabel="No stories yet — check back soon."
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
