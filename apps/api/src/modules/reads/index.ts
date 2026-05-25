import { getDb } from "db";
import { createDrizzleReadStateRepository } from "./reads.drizzle";
import { createReadStateService, type ReadStateService } from "./reads.service";

export type { ReadStateRepository } from "./reads.repository";
export { readsRouter } from "./reads.router";
export type { ReadStateService } from "./reads.service";

let cached: ReadStateService | undefined;

export function getReadStateService(): ReadStateService {
  if (!cached) cached = createReadStateService(createDrizzleReadStateRepository(getDb));
  return cached;
}
