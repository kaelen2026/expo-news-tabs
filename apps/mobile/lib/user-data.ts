import { useMemo } from "react";

import { useAuth } from "./auth";
import { trpc } from "./trpc";

// Centralizes the favorite/read lookup so each screen doesn't have to
// re-derive the Set + the toggle handler.
export function useUserStoryData() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const favoriteIds = trpc.favorites.ids.useQuery(undefined, { enabled: isAuthenticated });
  const readIds = trpc.reads.ids.useQuery(undefined, { enabled: isAuthenticated });

  const favoriteSet = useMemo(() => new Set(favoriteIds.data ?? []), [favoriteIds.data]);
  const readSet = useMemo(() => new Set(readIds.data ?? []), [readIds.data]);

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

  return {
    isAuthenticated,
    favoriteSet,
    readSet,
    toggleFavorite: (storyId: string) =>
      isAuthenticated ? toggleFavorite.mutate({ storyId }) : undefined,
    markRead: (storyId: string) => (isAuthenticated ? markRead.mutate({ storyId }) : undefined),
  };
}
