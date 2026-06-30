import type { DatabaseSync } from "node:sqlite";

export type SqlValue = string | number | bigint | null;

export type SqlDatabase = Pick<DatabaseSync, "exec" | "prepare">;

export type DbClient = {
  exec(sql: string): void;
  query<T extends Record<string, unknown>>(sql: string, params?: SqlValue[]): T[];
  queryOne<T extends Record<string, unknown>>(sql: string, params?: SqlValue[]): T | undefined;
  run(sql: string, params?: SqlValue[]): void;
  transaction<T>(work: () => T): T;
};

export type Migration = {
  id: string;
  up: string;
};
