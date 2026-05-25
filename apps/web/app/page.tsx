"use client";

import { useMemo } from "react";
import { AsyncState } from "./async-state";
import { SessionIndicator } from "./session-indicator";
import { trpc } from "./trpc-provider";

export default function HomePage() {
  const query = trpc.news.list.useInfiniteQuery(
    { limit: 6 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined },
  );

  const stories = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
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
        isLoading={query.isLoading}
        isError={query.isError && stories.length === 0}
        errorMessage={query.error?.message}
        isEmpty={query.isSuccess && stories.length === 0}
        loadingLabel="Loading stories…"
        emptyLabel="No stories yet — check back soon."
        onRetry={() => query.refetch()}
      >
        <ul className="space-y-6">
          {stories.map((story) => (
            <li
              key={story.id}
              className="rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <p className="text-xs uppercase tracking-wider opacity-60">
                {story.category} · {story.readTime}
              </p>
              <h2 className="mt-1 text-xl font-semibold">{story.title}</h2>
              <p className="mt-2 text-sm opacity-80">{story.summary}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-2">
          {query.hasNextPage && (
            <button
              type="button"
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-white/15"
            >
              {query.isFetchingNextPage ? "Loading…" : "Load more"}
            </button>
          )}
          {!query.hasNextPage && stories.length > 0 && (
            <p className="text-xs opacity-50">No more stories.</p>
          )}
          {query.isError && stories.length > 0 && (
            <p className="text-xs text-red-600">
              Couldn't load more: {query.error?.message ?? "Unknown error"}
            </p>
          )}
        </div>
      </AsyncState>
    </main>
  );
}
