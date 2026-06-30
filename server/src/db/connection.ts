import { resolve } from "node:path";
import type { AppConfig } from "../config/env.js";
import { createSqliteClient } from "./sqliteClient.js";
import type { DbClient } from "./types.js";

export function createDbClient(config: AppConfig): DbClient {
  if (config.database.provider === "postgres") {
    throw new Error("PostgreSQL adapter is not installed yet. Set DB_PROVIDER=sqlite for local development.");
  }

  const databaseUrl = config.database.url.startsWith("sqlite:")
    ? `sqlite:${resolve(config.projectRoot, config.database.url.replace(/^sqlite:/, ""))}`
    : config.database.url;

  return createSqliteClient(databaseUrl);
}
