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
  ReleaseConfig,
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
// MIGRATION & VERSIONING TYPES
// ============================================================================

// Re-export ReleaseConfig from DB types for convenience
export type { ReleaseConfig };

/**
 * Dev release result with dev version identifier
 */
export type DevReleaseResult = {
  devVersion: string;
};

/**
 * Rollback result with current version
 */
export type RollbackResult = {
  currentVersion: string;
};

/**
 * Database version result
 */
export type DbVersionResult = {
  version: string;
};

// ============================================================================
// OPFS FILE BROWSER TYPES
// ============================================================================

/**
 * OPFS file entry with metadata
 */
export type OpfsFileEntry = {
  name: string; // File or directory name
  path: string; // Full path from root
  type: "file" | "directory"; // Entry type
  size: number; // File size in bytes (0 for directories)
  sizeFormatted: string; // Human-readable size (e.g., "1.5 KB")
  lastModified?: number; // Timestamp (optional, browser support varies)
};

/**
 * OPFS download result with blob URL
 */
export type OpfsDownloadResult = {
  blobUrl: string; // Object URL for download
  filename: string; // Extracted filename
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
  db_name: string,
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
            if (!nameValue) {
              continue;
            }

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
  db_name: string,
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

        // Helper function to escape SQL identifiers (defined inside callback)
        const escapeIdentifier = (identifier: string): string => {
          return `"${identifier.replace(/"/g, '""')}"`;
        };

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

        // Get DDL from sqlite_master (table names are stored without quotes)
        const ddlRows = await queryFunc(
          `SELECT sql FROM sqlite_master WHERE type='table' AND name = '${tblName}'`,
        );

        let ddl = "";
        if (ddlRows.length > 0) {
          const firstRow = ddlRows[0] as Record<string, unknown> | undefined;
          if (firstRow?.sql) {
            ddl = String(firstRow.sql);
          }
        }

        // If DDL is empty, generate it from column schema
        if (!ddl) {
          const columnDefs = columns.map((col) => {
            let def = `    ${escapeIdentifier(col.name)} ${col.type || "TEXT"}`;
            if (col.pk > 0) {
              def += " PRIMARY KEY";
            }
            if (col.notnull > 0) {
              def += " NOT NULL";
            }
            if (col.dflt_value !== null) {
              def += ` DEFAULT ${String(col.dflt_value)}`;
            }
            return def;
          });
          ddl = `CREATE TABLE ${escapeIdentifier(tblName)} (\n${columnDefs.join(",\n")}\n);`;
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
  db_name: string,
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
  db_name: string,
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
  db_name: string,
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
 * Create dev release with migration and seed SQL
 *
 * @remarks
 * 1. Validate database exists
 * 2. Create dev release using db.devTool.release()
 * 3. Return response with dev version identifier
 *
 * @param dbname - Database name to create dev release for
 * @param version - Semantic version for the dev release (e.g., "1.2.3-dev")
 * @param migrationSQL - Optional migration SQL to apply
 * @param seedSQL - Optional seed SQL to apply after migration
 * @returns Dev release result with dev version identifier
 */
export const devRelease = async (
  db_name: string,
  version: string,
  migrationSQL?: string,
  seedSQL?: string,
): Promise<ServiceResponse<DevReleaseResult>> => {
  return inspectedWindowBridge.execute({
    func: async (
      databaseName: string,
      versionStr: string,
      migrationSql?: string,
      seedSql?: string,
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

        const dbRecord = databases[databaseName] as DBRecord | undefined;
        if (!dbRecord?.db) {
          return fail(`Database not found: ${databaseName}`);
        }

        const db = dbRecord.db as DBInterface;

        // Phase 2: Create dev release using db.devTool.release()
        if (!db.devTool) {
          return fail("DevTool API not available on this database");
        }

        // Build ReleaseConfig object
        const config: ReleaseConfig = {
          version: versionStr,
          migrationSQL: migrationSql ?? "",
          seedSQL: seedSql,
        };

        await db.devTool.release(config);

        // Generate dev version identifier
        const devVersion = `${databaseName}-dev-${versionStr}`;

        // Phase 3: Return response
        return ok({ devVersion });
      } catch (error) {
        return { success: false as const, error: String(error) };
      }
    },
    args: [dbname, version, migrationSQL, seedSQL],
  });
};

/**
 * Rollback dev version to specific version
 *
 * @remarks
 * 1. Validate database exists
 * 2. Rollback using db.devTool.rollback()
 * 3. Return response with current version
 *
 * @param dbname - Database name to rollback
 * @param toVersion - Target version to rollback to
 * @returns Rollback result with current version
 */
export const devRollback = async (
  db_name: string,
  toVersion: string,
): Promise<ServiceResponse<RollbackResult>> => {
  return inspectedWindowBridge.execute({
    func: async (databaseName: string, targetVersion: string) => {
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

        // Phase 2: Rollback using db.devTool.rollback()
        if (!db.devTool) {
          return fail("DevTool API not available on this database");
        }

        await db.devTool.rollback(targetVersion);

        // Phase 3: Return response with current version
        return ok({ currentVersion: targetVersion });
      } catch (error) {
        return { success: false as const, error: String(error) };
      }
    },
    args: [dbname, toVersion],
  });
};

/**
 * Get current database version
 *
 * @remarks
 * 1. Validate database exists
 * 2. Query version (PRAGMA user_version or DatabaseRecord maps)
 * 3. Return response with version (or "0.0.0" if not set)
 *
 * @param dbname - Database name to get version for
 * @returns Database version result
 */
export const getDbVersion = async (
  db_name: string,
): Promise<ServiceResponse<DbVersionResult>> => {
  return inspectedWindowBridge.execute({
    func: async (databaseName: string) => {
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

        // Phase 2: Query version
        // Try PRAGMA user_version first (SQLite built-in)
        const queryFunc = (sql: string) =>
          (db as DBInterface).query(sql) as Promise<
            Array<Record<string, unknown>>
          >;

        try {
          const pragmaRows = await queryFunc("PRAGMA user_version");
          const firstRow = pragmaRows[0] as Record<string, unknown> | undefined;
          const userVersion = Number(firstRow?.user_version ?? 0);

          // If user_version is set, convert to semantic version format
          if (userVersion > 0) {
            // Convert integer to semantic version (e.g., 100 -> "1.0.0")
            const major = Math.floor(userVersion / 1000000);
            const minor = Math.floor((userVersion % 1000000) / 1000);
            const patch = userVersion % 1000;
            return ok({ version: `${major}.${minor}.${patch}` });
          }
        } catch {
          // PRAGMA user_version failed, continue to fallback
        }

        // Fallback: Check DatabaseRecord for version info via migrationSQL Map keys
        if (dbRecord.migrationSQL && dbRecord.migrationSQL.size > 0) {
          // Get the highest version from migrationSQL Map
          const versions = Array.from(dbRecord.migrationSQL.keys());
          versions.sort((a, b) =>
            b.localeCompare(a, undefined, { numeric: true }),
          );
          if (versions.length > 0) {
            return ok({ version: versions[0] });
          }
        }

        // No version found, return default
        return ok({ version: "0.0.0" });
      } catch (error) {
        return { success: false as const, error: String(error) };
      }
    },
    args: [dbname],
  });
};

/**
 * List OPFS files with lazy loading
 *
 * @remarks
 * 1. Access OPFS root and navigate to path
 * 2. List directory contents and filter
 * 3. Format and return entries
 *
 * @param path - Optional path to navigate to (defaults to root)
 * @param dbname - Optional database name to filter entries
 * @returns OPFS file entries with metadata
 *
 * @example
 * ```typescript
 * const result = await databaseService.getOpfsFiles();
 * if (result.success) {
 *   console.log(result.data); // [{ name: "file.sqlite", type: "file", ... }]
 * }
 * ```
 */
export const getOpfsFiles = async (
  path?: string,
  dbname?: string,
): Promise<ServiceResponse<OpfsFileEntry[]>> => {
  return inspectedWindowBridge.execute({
    func: async (pathArg?: string, dbnameArg?: string) => {
      try {
        const ok = <T>(data: T) => ({ success: true as const, data });
        const fail = (message: string) => ({
          success: false as const,
          error: message,
        });

        // Helper function to format file sizes
        const formatFileSize = (bytes: number): string => {
          if (bytes < 1024) {
            return `${bytes} B`;
          }
          if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
          }
          if (bytes < 1024 * 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
          }
          return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
        };

        // Phase 1: Access OPFS root and navigate to path
        if (typeof navigator === "undefined" || !navigator.storage) {
          return fail("OPFS not supported in this browser");
        }

        const root = await navigator.storage.getDirectory();

        // Navigate to path if provided
        let currentDir = root;
        if (pathArg && pathArg.trim() !== "") {
          const segments = pathArg.split("/").filter(Boolean);
          for (const segment of segments) {
            try {
              currentDir = await currentDir.getDirectoryHandle(segment, {
                create: false,
              });
            } catch {
              return fail(`Path not found: ${pathArg}`);
            }
          }
        }

        // Phase 2: List directory contents and filter
        const entries: OpfsFileEntry[] = [];
        const basePath = pathArg ? pathArg.replace(/^\/+|\/+$/g, "") : "";

        for await (const entry of (currentDir as any).values()) {
          const entryName = entry.name;
          const entryPath = basePath ? `${basePath}/${entryName}` : entryName;

          // Filter by dbname if provided
          if (dbnameArg && !entryName.includes(dbnameArg)) {
            continue;
          }

          // Get entry metadata
          const kind = entry.kind;
          let size = 0;
          let lastModified: number | undefined = undefined;

          if (kind === "file") {
            try {
              const file = await entry.getFile();
              size = file.size;
              lastModified = file.lastModified;
            } catch {
              // File might be inaccessible, skip
              continue;
            }
          }

          entries.push({
            name: entryName,
            path: entryPath,
            type: kind === "file" ? ("file" as const) : ("directory" as const),
            size,
            sizeFormatted: formatFileSize(size),
            lastModified,
          });
        }

        // Phase 3: Return formatted entries
        return ok(entries);
      } catch (error) {
        return { success: false as const, error: String(error) };
      }
    },
    args: [path, dbname],
  });
};

/**
 * Download OPFS file to user's machine
 *
 * @remarks
 * 1. Resolve file handle from path
 * 2. Read file and create blob URL
 * 3. Return response with cleanup responsibility
 *
 * @param path - Path to the file to download
 * @returns Download result with blob URL and filename
 *
 * **IMPORTANT**: The caller is responsible for cleanup:
 * ```typescript
 * const result = await databaseService.downloadOpfsFile(path);
 * if (result.success) {
 *   // Use blobUrl for download
 *   // Later: URL.revokeObjectURL(result.data.blobUrl);
 * }
 * ```
 */
export const downloadOpfsFile = async (
  path: string,
): Promise<ServiceResponse<OpfsDownloadResult>> => {
  return inspectedWindowBridge.execute({
    func: async (filePath: string) => {
      try {
        const ok = <T>(data: T) => ({ success: true as const, data });
        const fail = (message: string) => ({
          success: false as const,
          error: message,
        });

        // Phase 1: Resolve file handle from path
        if (typeof navigator === "undefined" || !navigator.storage) {
          return fail("OPFS not supported in this browser");
        }

        const root = await navigator.storage.getDirectory();

        // Split path into segments and navigate
        const segments = filePath.split("/").filter(Boolean);
        if (segments.length === 0) {
          return fail("Invalid path: empty path");
        }

        // Navigate to parent directory
        let currentDir = root;
        for (let i = 0; i < segments.length - 1; i++) {
          try {
            currentDir = await currentDir.getDirectoryHandle(segments[i], {
              create: false,
            });
          } catch {
            return fail(`Path not found: ${filePath}`);
          }
        }

        // Get file handle
        const filename = segments[segments.length - 1];
        let fileHandle: FileSystemFileHandle;
        try {
          fileHandle = await currentDir.getFileHandle(filename, {
            create: false,
          });
        } catch {
          return fail(`File not found: ${filePath}`);
        }

        // Phase 2: Read file and create blob URL
        const file = await fileHandle.getFile();
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: file.type });
        const blobUrl = URL.createObjectURL(blob);

        // Phase 3: Return response with cleanup responsibility
        return ok({ blobUrl, filename });
      } catch (error) {
        return { success: false as const, error: String(error) };
      }
    },
    args: [path],
  });
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
  devRelease,
  devRollback,
  getDbVersion,
  getOpfsFiles,
  downloadOpfsFile,
});
