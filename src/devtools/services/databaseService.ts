/**
 * Database Service
 *
 * @remarks
 * Business logic layer for interacting with window.__web_sqlite.
 * This layer contains only domain logic - no Chrome API concerns.
 * Uses the bridge layer for execution in the inspected page.
 */

import { inspectedWindowBridge } from "../bridge/inspectedWindow";
import type {
  DBInterface,
  DatabaseRecord as DBRecord,
  LogEntry as DBLogEntry,
} from "../../types/DB";

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

/**
 * Column information from PRAGMA table_info
 */
export type ColumnInfo = {
  cid: number; // Column ID (0-indexed)
  name: string; // Column name
  type: string; // Declared type (INTEGER, TEXT, etc.)
  notnull: number; // 1 if NOT NULL, 0 otherwise
  dflt_value: any; // Default value (null if none)
  pk: number; // 1 if PRIMARY KEY, 0 otherwise
};

/**
 * Table schema with columns and DDL
 */
export type TableSchema = {
  columns: ColumnInfo[];
  ddl: string; // Complete CREATE TABLE SQL
};

/**
 * Query result with pagination metadata
 */
export type QueryResult = {
  rows: Array<Record<string, any>>; // Row data
  total: number; // Total row count (for pagination)
  columns: string[]; // Column names from first row
};

/**
 * SQL value types compatible with SQLite
 */
export type SqlValue =
  | null
  | number
  | string
  | boolean
  | bigint
  | Uint8Array
  | ArrayBuffer;

/**
 * SQL parameters - positional array or named object
 */
export type SQLParams = SqlValue[] | Record<string, SqlValue>;

/**
 * Execution result from write operations
 */
export type ExecResult = {
  lastInsertRowid: number | bigint;
  changes: number | bigint;
};

// ============================================================================
// TYPES FOR WINDOW.__WEB_SQLITE
// ============================================================================

type DatabaseStore = {
  keys?: () => IterableIterator<string>;
  get?: (name: string) => unknown;
} & Record<string, unknown>;

// ============================================================================
// LOG STREAMING TYPES
// ============================================================================

// Re-export LogEntry from DB types for convenience
export type { DBLogEntry as LogEntry };

/**
 * Log subscription with callback and cleanup
 */
export type LogSubscription = {
  subscriptionId: string;
  dbname: string;
  callback: (entry: DBLogEntry) => void;
  unsubscribe: () => void; // Unsubscribe function returned by db.onLog()
};

/**
 * Subscribe result with subscription ID
 */
export type SubscribeResult = {
  subscriptionId: string;
};

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Internal subscription map for cleanup
 * Maps subscriptionId to LogSubscription object
 */
const subscriptions = new Map<string, LogSubscription>();

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

        const runQuery = (sql: string) => (db as DBInterface).query(sql);
        const pragmaSql = "PRAGMA table_list";
        const fallbackSql =
          "SELECT name, type FROM sqlite_master WHERE type='table'";

        let rows: Array<Record<string, unknown>>;
        try {
          rows = (await runQuery(pragmaSql)) as Array<Record<string, unknown>>;
        } catch {
          rows = (await runQuery(fallbackSql)) as Array<
            Record<string, unknown>
          >;
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
 * Get table schema including columns and DDL
 *
 * @remarks
 * 1. Validate database and access window.__web_sqlite
 * 2. Query PRAGMA table_info for column details and sqlite_master for DDL
 * 3. Return normalized schema with columns array and DDL string
 *
 * @param dbname - Database name to inspect
 * @param tableName - Table name to get schema for
 * @returns Table schema with columns and DDL
 */
export const getTableSchema = async (
  dbname: string,
  tableName: string,
): Promise<ServiceResponse<TableSchema>> => {
  return inspectedWindowBridge.execute({
    func: async (databaseName: string, tblName: string) => {
      try {
        const ok = <T>(data: T) => ({ success: true as const, data });
        const fail = (message: string) => ({
          success: false as const,
          error: message,
        });

        // Phase 1: Validate database exists
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

        // Phase 2: Query schema information
        const queryFunc = (sql: string) =>
          (db as DBInterface).query(sql) as Promise<
            Array<Record<string, unknown>>
          >;

        // Get column details from PRAGMA table_info
        const pragmaSql = `PRAGMA table_info(${escapeIdentifier(tblName)})`;
        const columnRows = await queryFunc(pragmaSql);

        // Normalize to ColumnInfo format
        const columns: ColumnInfo[] = columnRows.map(
          (row: Record<string, unknown>) => ({
            cid: Number(row.cid) ?? 0,
            name: String(row.name ?? ""),
            type: String(row.type ?? ""),
            notnull: Number(row.notnull ?? 0),
            dflt_value: row.dflt_value,
            pk: Number(row.pk ?? 0),
          }),
        );

        // Get DDL from sqlite_master
        const ddlSql =
          "SELECT sql FROM sqlite_master WHERE type='table' AND name = ?";
        // Note: Using parameterized query for table name
        const ddlRows = await queryFunc(
          `SELECT sql FROM sqlite_master WHERE type='table' AND name = '${escapeIdentifier(
            tblName,
          )}'`,
        );

        let ddl = "";
        if (ddlRows.length > 0) {
          const firstRow = ddlRows[0] as Record<string, unknown> | undefined;
          if (firstRow?.sql) {
            ddl = String(firstRow.sql);
          }
        }

        // Phase 3: Return response
        return ok({ columns, ddl });
      } catch (error) {
        return { success: false as const, error: String(error) };
      }
    },
    args: [dbname, tableName],
  });
};

/**
 * Execute SELECT query with pagination
 *
 * @remarks
 * 1. Validate database and wrap user SQL for pagination
 * 2. Execute count query and data query with LIMIT/OFFSET
 * 3. Return rows, total count, and column names from first row
 *
 * @param dbname - Database name to query
 * @param sql - SELECT query to execute (will be wrapped for pagination)
 * @param limit - Maximum number of rows to return
 * @param offset - Number of rows to skip
 * @returns Query result with rows, total count, and column names
 */
export const queryTableData = async (
  dbname: string,
  sql: string,
  limit: number,
  offset: number,
): Promise<ServiceResponse<QueryResult>> => {
  return inspectedWindowBridge.execute({
    func: async (
      databaseName: string,
      userSql: string,
      limitVal: number,
      offsetVal: number,
    ) => {
      try {
        const ok = <T>(data: T) => ({ success: true as const, data });
        const fail = (message: string) => ({
          success: false as const,
          error: message,
        });

        // Phase 1: Validate database and wrap SQL
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
        const queryFunc = (sql: string) =>
          (db as DBInterface).query(sql) as Promise<
            Array<Record<string, unknown>>
          >;

        // Phase 2: Execute queries
        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM (${userSql})`;
        const countRows = await queryFunc(countSql);
        const firstCountRow = countRows[0] as
          | Record<string, unknown>
          | undefined;
        const total = Number(firstCountRow?.total ?? 0);

        // Get paginated data
        const dataSql = `SELECT * FROM (${userSql}) LIMIT ${limitVal} OFFSET ${offsetVal}`;
        const rows = await queryFunc(dataSql);

        // Extract column names from first row keys
        let columns: string[] = [];
        if (rows.length > 0) {
          const firstRow = rows[0] as Record<string, unknown> | undefined;
          columns = Object.keys(firstRow ?? {});
        }

        // Phase 3: Return response
        return ok({ rows, total, columns });
      } catch (error) {
        return { success: false as const, error: String(error) };
      }
    },
    args: [dbname, sql, limit, offset],
  });
};

/**
 * Execute INSERT/UPDATE/DELETE/DDL with optional parameters
 *
 * @remarks
 * 1. Validate database and access window.__web_sqlite
 * 2. Execute SQL with parameters using db.exec(sql, params)
 * 3. Return result with lastInsertRowid and changes count
 *
 * @param dbname - Database name to execute SQL on
 * @param sql - SQL statement to execute (INSERT/UPDATE/DELETE/DDL)
 * @param params - Optional parameters (positional array or named object)
 * @returns Execution result with lastInsertRowid and changes
 */
export const execSQL = async (
  dbname: string,
  sql: string,
  params?: SQLParams,
): Promise<ServiceResponse<ExecResult>> => {
  return inspectedWindowBridge.execute({
    func: async (
      databaseName: string,
      sqlStr: string,
      paramsVal?: SQLParams,
    ) => {
      try {
        const ok = <T>(data: T) => ({ success: true as const, data });
        const fail = (message: string) => ({
          success: false as const,
          error: message,
        });

        // Phase 1: Validate database exists
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

        // Phase 2: Execute SQL with parameters
        const execFunc = (
          sql: string,
          params?: SqlValue[] | Record<string, SqlValue>,
        ) => (db as DBInterface).exec(sql, params);

        const result = await execFunc(sqlStr, paramsVal);

        // Phase 3: Return response with proper type coercion
        // The DBInterface returns optional properties, but ExecResult requires them
        return ok({
          lastInsertRowid: result.lastInsertRowid ?? 0,
          changes: result.changes ?? 0,
        });
      } catch (error) {
        return { success: false as const, error: String(error) };
      }
    },
    args: [dbname, sql, params],
  });
};

/**
 * Subscribe to log events for a database
 *
 * @remarks
 * 1. Validate database and generate unique subscription ID
 * 2. Create subscription and register callback with db.onLog()
 * 3. Store subscription (with unsubscribe function) in internal Map
 *
 * @param dbname - Database name to subscribe to logs for
 * @param callback - Callback function to receive log entries
 * @returns Subscribe result with subscription ID
 */
export const subscribeLogs = async (
  dbname: string,
  callback: (entry: DBLogEntry) => void,
): Promise<ServiceResponse<SubscribeResult>> => {
  // Generate subscription ID upfront
  const subscriptionId = `sub_${Date.now()}_${Math.random()}`;

  return inspectedWindowBridge
    .execute({
      func: (databaseName: string, subId: string) => {
        try {
          const ok = <T>(data: T) => ({ success: true as const, data });
          const fail = (message: string) => ({
            success: false as const,
            error: message,
          });

          // Phase 1: Validate database exists
          const api = window.__web_sqlite;
          const databases = api?.databases;

          if (!databases) {
            return fail("web-sqlite-js API not available");
          }

          const dbRecord = databases[databaseName] as DBRecord | undefined;
          if (!dbRecord?.db) {
            return fail(`Database not found: ${databaseName}`);
          }

          const db = dbRecord.db as DBInterface;

          // Phase 2: Register log callback and get unsubscribe function
          // db.onLog returns an unsubscribe function
          const unsubscribe = db.onLog((entry: DBLogEntry) => {
            // Send log entry via chrome.runtime.sendMessage to DevTools panel
            // Include subscriptionId for routing
            chrome.runtime.sendMessage({
              type: "LOG_ENTRY",
              subscriptionId: subId,
              entry,
            });
          });

          // Store unsubscribe function in window for later cleanup
          // This is a workaround since we can't return functions from executeScript
          (window as unknown as Record<string, unknown>)[`__unsub_${subId}`] =
            unsubscribe;

          // Phase 3: Return response
          return ok({ subscriptionId: subId });
        } catch (error) {
          return { success: false as const, error: String(error) };
        }
      },
      args: [dbname, subscriptionId],
    })
    .then((response) => {
      // If subscription was successful, store it in the Map
      if (response.success && response.data) {
        // Note: We can't retrieve the unsubscribe function from the inspected page
        // So we'll store a placeholder that will call back to the inspected page
        const subscription: LogSubscription = {
          subscriptionId: response.data.subscriptionId,
          dbname,
          callback,
          unsubscribe: () => {
            // This will be replaced in unsubscribeLogs with actual cleanup
            void inspectedWindowBridge.execute({
              func: (subId: string) => {
                const unsub = (window as unknown as Record<string, unknown>)[
                  `__unsub_${subId}`
                ] as (() => void) | undefined;
                if (typeof unsub === "function") {
                  unsub();
                  delete (window as unknown as Record<string, unknown>)[
                    `__unsub_${subId}`
                  ];
                }
              },
              args: [response.data.subscriptionId],
            });
          },
        };
        subscriptions.set(response.data.subscriptionId, subscription);
      }
      return response;
    });
};

/**
 * Unsubscribe from log events
 *
 * @remarks
 * 1. Look up subscription from internal Map
 * 2. Call stored unsubscribe function (which calls back to inspected page)
 * 3. Remove subscription from internal Map
 *
 * @param subscriptionId - Subscription ID to unsubscribe
 * @returns Service response (void on success)
 */
export const unsubscribeLogs = async (
  subscriptionId: string,
): Promise<ServiceResponse<void>> => {
  // Phase 1: Look up subscription
  const subscription = subscriptions.get(subscriptionId);
  if (!subscription) {
    return {
      success: false,
      error: `Subscription not found: ${subscriptionId}`,
    };
  }

  try {
    // Phase 2: Call unsubscribe function
    subscription.unsubscribe();

    // Phase 3: Remove from Map and return success
    subscriptions.delete(subscriptionId);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

/**
 * Helper function to escape SQL identifiers
 *
 * @param identifier - SQL identifier to escape (table name, column name)
 * @returns Escaped identifier wrapped in double quotes
 */
const escapeIdentifier = (identifier: string): string => {
  // Escape double quotes by doubling them and wrap in double quotes
  return `"${identifier.replace(/"/g, '""')}"`;
};

/**
 * Database service API
 */
export const databaseService = Object.freeze({
  getDatabases,
  getTableList,
  getTableSchema,
  queryTableData,
  execSQL,
  subscribeLogs,
  unsubscribeLogs,
});
