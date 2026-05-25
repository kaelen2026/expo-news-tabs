export type NewsStory = {
  id: string;
  title: string;
  summary: string;
  body: string[];
  category: string;
  source: string;
  publishedAt: string;
  readTime: string;
  imageUrl: string;
};

export const MAX_PAGE_LIMIT = 50;
export const DEFAULT_PAGE_LIMIT = 10;

export type ListPage = {
  items: NewsStory[];
  nextCursor: string | null;
};

export type ListOptions = {
  cursor?: string;
  limit?: number;
};
