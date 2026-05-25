import type { ReadStateRepository } from "./reads.repository";

export type ReadStateService = {
  ids(userId: string): Promise<string[]>;
  mark(userId: string, storyId: string): Promise<{ storyId: string; isRead: true }>;
};

export function createReadStateService(repo: ReadStateRepository): ReadStateService {
  return {
    async ids(userId) {
      return repo.idsForUser(userId);
    },

    async mark(userId, storyId) {
      await repo.mark(userId, storyId);
      return { storyId, isRead: true };
    },
  };
}
