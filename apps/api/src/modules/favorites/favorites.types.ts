// Lean row shape that the favorites repository works with — favorites only
// owns the (userId, storyId) edge; story metadata is hydrated separately.
export type FavoriteEdge = {
  storyId: string;
  favoritedAt: Date;
};

// Shape returned to clients from favorites.list. Excludes `body` on
// purpose: the list view is a summary, not the full story.
export type FavoriteListItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  publishedAt: string;
  readTime: string;
  imageUrl: string;
  favoritedAt: Date;
};
