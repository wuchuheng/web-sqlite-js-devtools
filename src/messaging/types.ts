/**
 * Message types for Chrome extension messaging between DevTools panel,
 * background service worker, and content script proxy.
 */

/**
 * Generic response wrapper for all message communications
 * @template T - The expected data type on success
 */
export interface Response<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Primitive types for SQL values
export type SqlValue =
  | null
  | number
  | string
  | boolean
  | bigint
  | Uint8Array
  | ArrayBuffer;

export type SQLParams = SqlValue[] | Record<string, SqlValue>;

// Database inspection types
export interface GetDatabasesRequest {}

export interface GetDatabasesResponse extends Response<{
  databases: Array<{ name: string; tableCount?: number }>;
}> {}

export interface GetTableListRequest {
  dbname: string;
}

export interface GetTableListResponse extends Response<{
  tables: string[];
}> {}

export interface GetTableSchemaRequest {
  dbname: string;
  tableName: string;
}

export interface GetTableSchemaResponse extends Response<{
  columns: Array<{
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: unknown;
    pk: number;
  }>;
  ddl: string;
}> {}

export interface QueryTableDataRequest {
  dbname: string;
  sql: string;
  limit: number;
  offset: number;
}

export interface QueryTableDataResponse extends Response<{
  rows: Array<Record<string, unknown>>;
  total: number;
  columns: string[];
}> {}

// SQL execution types
export interface ExecSQLRequest {
  dbname: string;
  sql: string;
  params?: SQLParams;
}

export interface ExecSQLResponse extends Response<{
  lastInsertRowid: number | bigint;
  changes: number | bigint;
}> {}

// Log streaming types
export interface SubscribeLogsRequest {
  dbname: string;
}

export interface SubscribeLogsResponse extends Response<{
  subscriptionId: string;
}> {}

export interface UnsubscribeLogsRequest {
  subscriptionId: string;
}

export interface UnsubscribeLogsResponse extends Response<void> {}

export interface LogEvent {
  type: "LOG_ENTRY";
  source: "content-script";
  timestamp: number;
  data: {
    dbname: string;
    logs: Array<{
      level: "info" | "debug" | "error";
      data: unknown;
      timestamp: number;
    }>;
  };
}

// Migration & Seed testing types
export interface DevReleaseRequest {
  dbname: string;
  version: string;
  migrationSQL?: string;
  seedSQL?: string;
}

export interface DevReleaseResponse extends Response<{
  devVersion: string;
}> {}

export interface DevRollbackRequest {
  dbname: string;
  toVersion: string;
}

export interface DevRollbackResponse extends Response<{
  currentVersion: string;
}> {}

export interface GetDbVersionRequest {
  dbname: string;
}

export interface GetDbVersionResponse extends Response<{
  version: string;
}> {}

// OPFS file browser types
export interface GetOpfsFilesRequest {
  path?: string;
  dbname?: string;
}

export interface GetOpfsFilesResponse extends Response<{
  entries: Array<{
    name: string;
    kind: "file" | "directory";
    size?: string;
  }>;
}> {}

export interface DownloadOpfsFileRequest {
  path: string;
}

export interface DownloadOpfsFileResponse extends Response<{
  blobUrl: string;
  filename: string;
}> {}

// Connection & health types
export interface HeartbeatRequest {
  timestamp: number;
}

export interface HeartbeatResponse extends Response<{
  timestamp: number;
}> {}

export interface IconStateRequest {
  hasDatabase: boolean;
}

export interface IconStateResponse extends Response<void> {}
