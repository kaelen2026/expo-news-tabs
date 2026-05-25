"use client";

import { trpc } from "./trpc-provider";

export default function HomePage() {
  const { data, isLoading, error } = trpc.news.list.useQuery({ page: 1 });

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-10">
        <p className="text-sm uppercase tracking-widest text-[var(--color-accent)]">
          Morning Brief
        </p>
        <h1 className="mt-2 text-4xl font-semibold">News Tabs — Web</h1>
        <p className="mt-3 text-base opacity-70">
          Next.js 16 · App Router · Tailwind v4 · tRPC client talking to the Hono API.
        </p>
      </header>

      {isLoading && <p className="opacity-60">Loading stories…</p>}
      {error && <p className="text-red-600">Failed to load: {error.message}</p>}

      <ul className="space-y-6">
        {data?.stories.map((story) => (
          <li
            key={story.feedId}
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
    </main>
  );
}
