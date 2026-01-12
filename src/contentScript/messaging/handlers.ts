/**
 * Content Script Message Handlers
 *
 * @remarks
 * Registers all message channel handlers for content script proxy.
 * Implements Content Script Proxy Pattern (ADR-0001) for accessing window.__web_sqlite API.
 */

import { defineChannel } from "@/messaging/core";
import {
  GET_DATABASES,
  GET_TABLE_LIST,
  GET_TABLE_SCHEMA,
  QUERY_TABLE_DATA,
  EXEC_SQL,
  SUBSCRIBE_LOGS,
  UNSUBSCRIBE_LOGS,
  GET_OPFS_FILES,
  DOWNLOAD_OPFS_FILE,
  HEARTBEAT,
} from "@/messaging/channels";
import { getDatabases } from "./databaseProxy";

// ============================================================================
// RESPONSE TYPES (matching src/messaging/types.ts)
// ============================================================================

type Response<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ============================================================================
// CHANNEL REGISTRATION
// ============================================================================

/**
 * 1. Register GET_DATABASES channel handler
 * 2. Call getDatabases() proxy function
 * 3. Return Response<T> format with database list
 * 4. Handle errors gracefully with try/catch
 */
export const registerGetDatabases = () => {
  const channel = defineChannel<
    unknown,
    Response<{ databases: Array<{ name: string; tableCount?: number }> }>
  >(GET_DATABASES);

  channel.on(async () => {
    try {
      const databases = getDatabases();
      return { success: true, data: { databases } };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
};

/**
 * 1. Register GET_TABLE_LIST channel handler (stub)
 * 2. Return empty array for now (full implementation in TASK-05)
 * 3. Return Response<T> format with table list
 */
export const registerGetTableList = () => {
  const channel = defineChannel<
    { dbname: string },
    Response<{ tables: string[] }>
  >(GET_TABLE_LIST);

  channel.on(async () => {
    // Stub implementation - returns empty tables array
    // Full implementation in TASK-05 with PRAGMA queries
    return { success: true, data: { tables: [] } };
  });
};

/**
 * 1. Register GET_TABLE_SCHEMA channel handler (stub)
 * 2. Return empty schema for now (full implementation in TASK-06)
 * 3. Return Response<T> format with table schema
 */
export const registerGetTableSchema = () => {
  const channel = defineChannel<
    { dbname: string; tableName: string },
    Response<{
      columns: Array<{
        cid: number;
        name: string;
        type: string;
        notnull: number;
        dflt_value: unknown;
        pk: number;
      }>;
      ddl: string;
    }>
  >(GET_TABLE_SCHEMA);

  channel.on(async () => {
    // Stub implementation - returns empty schema
    // Full implementation in TASK-06 with PRAGMA table_info
    return { success: true, data: { columns: [], ddl: "" } };
  });
};

/**
 * 1. Register QUERY_TABLE_DATA channel handler (stub)
 * 2. Return empty result set for now (full implementation in TASK-06)
 * 3. Return Response<T> format with query results
 */
export const registerQueryTableData = () => {
  const channel = defineChannel<
    { dbname: string; sql: string; limit: number; offset: number },
    Response<{
      rows: Array<Record<string, unknown>>;
      total: number;
      columns: string[];
    }>
  >(QUERY_TABLE_DATA);

  channel.on(async () => {
    // Stub implementation - returns empty result set
    // Full implementation in TASK-06 with actual query execution
    return { success: true, data: { rows: [], total: 0, columns: [] } };
  });
};

/**
 * 1. Register EXEC_SQL channel handler (stub)
 * 2. Return zero changes for now (full implementation in TASK-07)
 * 3. Return Response<T> format with execution result
 */
export const registerExecSql = () => {
  const channel = defineChannel<
    { dbname: string; sql: string; params?: unknown },
    Response<{ lastInsertRowid: number | bigint; changes: number | bigint }>
  >(EXEC_SQL);

  channel.on(async () => {
    // Stub implementation - returns zero changes
    // Full implementation in TASK-07 with actual SQL execution
    return { success: true, data: { lastInsertRowid: 0, changes: 0 } };
  });
};

/**
 * 1. Register SUBSCRIBE_LOGS channel handler (stub)
 * 2. Return temporary subscription ID for now (full implementation in TASK-09)
 * 3. Return Response<T> format with subscription ID
 */
export const registerSubscribeLogs = () => {
  const channel = defineChannel<
    { dbname: string },
    Response<{ subscriptionId: string }>
  >(SUBSCRIBE_LOGS);

  channel.on(async () => {
    // Stub implementation - returns temporary ID
    // Full implementation in TASK-09 with log subscription manager
    return { success: true, data: { subscriptionId: "temp-subscription-id" } };
  });
};

/**
 * 1. Register UNSUBSCRIBE_LOGS channel handler (stub)
 * 2. Return success for now (full implementation in TASK-09)
 * 3. Return Response<T> format with void data
 */
export const registerUnsubscribeLogs = () => {
  const channel = defineChannel<{ subscriptionId: string }, Response<void>>(
    UNSUBSCRIBE_LOGS,
  );

  channel.on(async () => {
    // Stub implementation - returns success
    // Full implementation in TASK-09 with actual unsubscribe logic
    return { success: true, data: undefined };
  });
};

/**
 * 1. Register GET_OPFS_FILES channel handler (stub)
 * 2. Return empty file list for now (full implementation in TASK-10)
 * 3. Return Response<T> format with file entries
 */
export const registerGetOpfsFiles = () => {
  const channel = defineChannel<
    { path?: string; dbname?: string },
    Response<{
      entries: Array<{
        name: string;
        kind: "file" | "directory";
        size?: string;
      }>;
    }>
  >(GET_OPFS_FILES);

  channel.on(async () => {
    // Stub implementation - returns empty file list
    // Full implementation in TASK-10 with OPFS directory traversal
    return { success: true, data: { entries: [] } };
  });
};

/**
 * 1. Register DOWNLOAD_OPFS_FILE channel handler (stub)
 * 2. Return error for now (full implementation in TASK-10)
 * 3. Return Response<T> format with blob URL
 */
export const registerDownloadOpfsFile = () => {
  const channel = defineChannel<
    { path: string },
    Response<{ blobUrl: string; filename: string }>
  >(DOWNLOAD_OPFS_FILE);

  channel.on(async () => {
    // Stub implementation - returns not implemented error
    // Full implementation in TASK-10 with actual file download
    return { success: false, error: "OPFS file download not implemented yet" };
  });
};

/**
 * 1. Register HEARTBEAT channel handler
 * 2. Return current timestamp for connection health check
 * 3. Return Response<T> format with timestamp
 */
export const registerHeartbeat = () => {
  const channel = defineChannel<
    { timestamp: number },
    Response<{ timestamp: number }>
  >(HEARTBEAT);

  channel.on(async ({ timestamp }) => {
    // Echo timestamp back for connection verification
    return { success: true, data: { timestamp: timestamp || Date.now() } };
  });
};

/**
 * 1. Register all content script message handlers
 * 2. Called once on content script mount
 * 3. Enables message routing from DevTools panel
 *
 * @remarks
 * This function registers all 10 channel handlers for the content script proxy.
 * Must be called when content script initializes.
 */
export const registerAllHandlers = (): void => {
  registerGetDatabases();
  registerGetTableList();
  registerGetTableSchema();
  registerQueryTableData();
  registerExecSql();
  registerSubscribeLogs();
  registerUnsubscribeLogs();
  registerGetOpfsFiles();
  registerDownloadOpfsFile();
  registerHeartbeat();

  console.log(
    "[Web Sqlite DevTools Content Script] All message handlers registered",
  );
};
