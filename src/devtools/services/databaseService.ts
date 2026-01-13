/**
 * Database Service
 *
 * @remarks
 * Business logic layer for interacting with window.__web_sqlite.
 * This layer contains only domain logic - no Chrome API concerns.
 * Uses the bridge layer for execution in the inspected page.
 */

import { inspectedWindowBridge } from "../bridge/inspectedWindow";

/**
 * Standard response envelope for service operations
 */
export type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Database list entry
 */
export type DatabaseSummary = {
  name: string;
};

// ============================================================================
// TYPES FOR WINDOW.__WEB_SQLITE
// ============================================================================

type DatabaseStore = {
  keys?: () => IterableIterator<string>;
  get?: (name: string) => unknown;
} & Record<string, unknown>;

type DatabaseRecord = {
  db?: unknown;
} & Record<string, unknown>;

type DbQuery = {
  query: (sql: string) => Promise<Array<Record<string, unknown>>>;
};

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * 1. Read window.__web_sqlite.databases
 * 2. Return database names
 * 3. Return empty list when API missing
 *
 * @returns Databases response
 */
export const getDatabases = async (): Promise<
  ServiceResponse<DatabaseSummary[]>
> => {
  return inspectedWindowBridge.execute({
    func: () => {
      try {
        const ok = <T>(data: T) => ({ success: true as const, data });

        const api = window.__web_sqlite;
        const databases = api?.databases;

        if (!databases) {
          return ok([]);
        }

        const keys = Object.keys(databases);

        return ok(keys.map((name) => ({ name: String(name) })));
      } catch (error) {
        return { success: false as const, error: String(error) };
      }
    },
  });
};

/**
 * 1. Query tables for the selected database
 * 2. Normalize table names and remove sqlite_ internals
 * 3. Return alphabetically sorted table list
 *
 * @param dbname - Database name to inspect
 * @returns Table list response
 */
export const getTableList = async (
  dbname: string,
): Promise<ServiceResponse<string[]>> => {
  return inspectedWindowBridge.execute({
    func: async (databaseName: string) => {
      try {
        const ok = <T>(data: T) => ({ success: true as const, data });
        const fail = (message: string) => ({
          success: false as const,
          error: message,
        });

        const api = window.__web_sqlite;
        const databases = api?.databases;

        if (!databases) {
          return fail("web-sqlite-js API not available");
        }

        const dbRecord = databases[databaseName];

        if (!dbRecord) {
          return fail(`Database not found: ${databaseName}`);
        }

        const db = dbRecord.db;

        const normalize = (rows: Array<Record<string, unknown>>) => {
          const unique = new Set<string>();

          for (const row of rows) {
            const nameValue = row.name ?? row.tbl_name;
            if (!nameValue) continue;

            const typeValue = row.type;
            if (
              typeof typeValue === "string"
              && typeValue.toLowerCase() !== "table"
            ) {
              continue;
            }

            const name = String(nameValue);
            if (!name.startsWith("sqlite_")) {
              unique.add(name);
            }
          }

          return Array.from(unique).sort((a, b) => a.localeCompare(b));
        };

        const runQuery = (sql: string) => (db as DbQuery).query(sql);
        const pragmaSql = "PRAGMA table_list";
        const fallbackSql =
          "SELECT name, type FROM sqlite_master WHERE type='table'";

        let rows: Array<Record<string, unknown>>;
        try {
          rows = await runQuery(pragmaSql);
        } catch {
          rows = await runQuery(fallbackSql);
        }

        return ok(normalize(rows));
      } catch (error) {
        return { success: false as const, error: String(error) };
      }
    },
    args: [dbname],
  });
};

/**
 * Database service API
 */
export const databaseService = Object.freeze({
  getDatabases,
  getTableList,
});
