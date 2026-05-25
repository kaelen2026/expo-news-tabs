"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AsyncState } from "../async-state";
import { trpc } from "../trpc-provider";

export default function FavoritesPage() {
  const session = useSession();
  const isAuthenticated = Boolean(session.data?.user);

  const query = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const remove = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      utils.favorites.ids.invalidate();
    },
  });

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Favorites</h1>
        <p className="mt-4 opacity-70">
          You need to{" "}
          <Link href="/sign-in" className="underline">
            sign in
          </Link>{" "}
          to see your saved stories.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Favorites</h1>
      <p className="mt-2 text-sm opacity-60">
        Stories you've starred. Synced across web and mobile.
      </p>
      <div className="mt-6">
        <AsyncState
          isLoading={query.isLoading}
          isError={query.isError}
          errorMessage={query.error?.message}
          isEmpty={query.isSuccess && (query.data?.length ?? 0) === 0}
          loadingLabel="Loading favorites…"
          emptyLabel="No favorites yet — star a story from the home page."
          onRetry={() => query.refetch()}
        >
          <ul className="space-y-6">
            {query.data?.map((story) => (
              <li
                key={story.id}
                className="rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-xs uppercase tracking-wider opacity-60">
                  {story.category} · {story.readTime}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{story.title}</h2>
                <p className="mt-2 text-sm opacity-80">{story.summary}</p>
                <button
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate({ storyId: story.id })}
                  className="mt-3 rounded-full border border-black/15 px-3 py-1 text-xs disabled:opacity-50 dark:border-white/15"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </AsyncState>
      </div>
    </main>
  );
}
