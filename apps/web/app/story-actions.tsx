"use client";

import { trpc } from "./trpc-provider";

type StoryActionsProps = {
  storyId: string;
  isAuthenticated: boolean;
  isFavorite: boolean;
  isRead: boolean;
};

export function StoryActions({ storyId, isAuthenticated, isFavorite, isRead }: StoryActionsProps) {
  const utils = trpc.useUtils();
  const toggleFavorite = trpc.favorites.toggle.useMutation({
    onSuccess: () => {
      utils.favorites.ids.invalidate();
      utils.favorites.list.invalidate();
    },
  });
  const markRead = trpc.reads.mark.useMutation({
    onSuccess: () => {
      utils.reads.ids.invalidate();
    },
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        disabled={toggleFavorite.isPending}
        onClick={() => toggleFavorite.mutate({ storyId })}
        aria-pressed={isFavorite}
        className={`rounded-full border px-3 py-1 transition ${
          isFavorite
            ? "border-amber-400/60 bg-amber-100/40 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200"
            : "border-black/15 dark:border-white/15"
        } disabled:opacity-50`}
      >
        {isFavorite ? "★ Favorited" : "☆ Favorite"}
      </button>
      <button
        type="button"
        disabled={markRead.isPending || isRead}
        onClick={() => markRead.mutate({ storyId })}
        className="rounded-full border border-black/15 px-3 py-1 disabled:opacity-50 dark:border-white/15"
      >
        {isRead ? "✓ Read" : "Mark read"}
      </button>
    </div>
  );
}
