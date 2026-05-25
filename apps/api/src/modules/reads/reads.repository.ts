export interface ReadStateRepository {
  idsForUser(userId: string): Promise<string[]>;
  // Idempotent: marking the same story twice refreshes the `readAt` timestamp.
  mark(userId: string, storyId: string): Promise<void>;
}
