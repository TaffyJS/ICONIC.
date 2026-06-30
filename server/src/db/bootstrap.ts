import type { DbClient } from "./types.js";
import { runMigrations } from "./migrations.js";
import { seedDatabase } from "./seed.js";

export function bootstrapDatabase(db: DbClient) {
  runMigrations(db);
  seedDatabase(db);
}
