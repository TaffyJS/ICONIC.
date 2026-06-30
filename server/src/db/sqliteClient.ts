import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { DbClient, SqlValue } from "./types.js";

export function createSqliteClient(databaseUrl: string): DbClient {
  const filename = databaseUrl.replace(/^sqlite:/, "");
  if (filename !== ":memory:") {
    mkdirSync(dirname(filename), { recursive: true });
  }

  const database = new DatabaseSync(filename);
  database.exec("PRAGMA foreign_keys = ON");
  database.exec("PRAGMA journal_mode = WAL");

  return {
    exec(sql) {
      database.exec(sql);
    },
    query<T extends Record<string, unknown>>(sql: string, params: SqlValue[] = []) {
      return database.prepare(sql).all(...params) as T[];
    },
    queryOne<T extends Record<string, unknown>>(sql: string, params: SqlValue[] = []) {
      return database.prepare(sql).get(...params) as T | undefined;
    },
    run(sql: string, params: SqlValue[] = []) {
      database.prepare(sql).run(...params);
    },
    transaction<T>(work: () => T) {
      database.exec("BEGIN");
      try {
        const result = work();
        database.exec("COMMIT");
        return result;
      } catch (error) {
        database.exec("ROLLBACK");
        throw error;
      }
    },
  };
}
