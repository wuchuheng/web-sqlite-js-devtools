<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/05-design/02-schema/01-database.md

OUTPUT MAP (write to)
agent-docs/05-design/02-schema/01-message-types.md

NOTES
- Keep headings unchanged.
- Group Tables by MODULE to allow parallel ownership.
-->

# 01 Message Types & Data Structures

> **Note**: Channel-based message types are deprecated. DevTools data access now uses
> service layer functions with `ServiceResponse<T>` envelope. See `01-contracts/01-api.md`
> for the complete service layer API (Feature F-001).

## 0) Document Map

```text
agent-docs/05-design/
  01-contracts/01-api.md
  01-contracts/02-events.md
  01-contracts/03-errors.md
  02-schema/01-message-types.md  (this file)
  03-modules/
    devtools-panel.md
    database-service.md  (NEW - Feature F-001)
    content-script-proxy.md
    background-service.md
    opfs-browser.md
```

## 1) Type Definitions

### Service Layer Types (Feature F-001)

> **Service Response Envelope**: All service functions return `ServiceResponse<T>`

```typescript
/**
 * Standard response envelope for all service operations
 * @template T - Type of success data payload
 *
 * @example
 * // Success case
 * { success: true, data: { name: "main" } }
 *
 * // Error case
 * { success: false, error: "Database not found" }
 */
export type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

### Primitive Types

```typescript
// SQL value types (from web-sqlite-js)
type SqlValue =
  | null
  | number
  | string
  | boolean
  | bigint
  | Uint8Array
  | ArrayBuffer;

// SQL parameters
type SQLParams = SqlValue[] | Record<string, SqlValue>;
```

### Database Types

```typescript
// Database summary (from getDatabases)
interface DatabaseSummary {
  name: string;
}

// Table schema (from getTableSchema)
interface TableSchema {
  columns: Array<{
    cid: number; // Column ID
    name: string; // Column name
    type: string; // Data type
    notnull: number; // NOT NULL constraint (0/1)
    dflt_value: any; // Default value
    pk: number; // Primary key position (0 if not PK)
  }>;
  ddl: string; // Complete CREATE TABLE SQL
}

// Table tab identifier (F-005: Opened Table Tabs Management)
interface TableTab {
  dbname: string; // Database name
  tableName: string; // Table name
}

// Equality check for TableTab
function isSameTab(a: TableTab | null, b: TableTab | null): boolean {
  if (!a || !b) return false;
  return a.dbname === b.dbname && a.tableName === b.tableName;
}

// Query result (from queryTableData)
interface QueryResult {
  rows: Array<Record<string, any>>;
  total: number; // Total row count (for pagination)
  columns: string[]; // Column names
}

// Execution result (from execSQL)
interface ExecResult {
  lastInsertRowid: number | bigint;
  changes: number | bigint;
}

// Version info (from getDbVersion, devRelease, devRollback)
interface VersionInfo {
  version: string; // Semantic version (e.g., "1.2.3")
}

// Log subscription (from subscribeLogs, unsubscribeLogs)
interface LogSubscription {
  subscriptionId: string; // Unique subscription identifier
}

// OPFS file entry (from getOpfsFiles)
interface OpfsFileEntry {
  name: string;
  kind: "file" | "directory";
  size?: string; // Human-readable size (e.g., "1.2 MB")
}

// OPFS download (from downloadOpfsFile)
interface OpfsDownload {
  blobUrl: string; // Object URL for download
  filename: string; // Extracted from path
}
```

### Message Types (Request/Response) - Deprecated

> **Deprecated**: These channel-based message types are deprecated. Use service layer functions instead.
> See `01-contracts/01-api.md` for the current service layer API.

```typescript
// Generic response (deprecated)
interface Response<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Database inspection requests (deprecated)
interface GetDatabasesRequest {}
interface GetDatabasesResponse extends Response<{
  databases: Array<{ name: string; tableCount?: number }>>;
};

interface GetTableListRequest {
  dbname: string;
}
interface GetTableListResponse extends Response<{
  tables: string[];
}> {};

interface GetTableSchemaRequest {
  dbname: string;
  tableName: string;
}
interface GetTableSchemaResponse extends Response<{
  columns: Array<{
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: any;
    pk: number;
  }>;
  ddl: string;
}> {};

interface QueryTableDataRequest {
  dbname: string;
  sql: string;
  limit: number;
  offset: number;
}
interface QueryTableDataResponse extends Response<{
  rows: Array<Record<string, any>>;
  total: number;
  columns: string[];
}> {};

// SQL execution (deprecated)
interface ExecSQLRequest {
  dbname: string;
  sql: string;
  params?: SQLParams;
}
interface ExecSQLResponse extends Response<{
  lastInsertRowid: number | bigint;
  changes: number | bigint;
}> {};

// Log streaming (deprecated)
interface SubscribeLogsRequest {
  dbname: string;
}
interface SubscribeLogsResponse extends Response<{
  subscriptionId: string;
}> {};

interface UnsubscribeLogsRequest {
  subscriptionId: string;
}
interface UnsubscribeLogsResponse extends Response<void> {};

interface LogEvent {
  type: "LOG_ENTRY";
  source: "content-script";
  timestamp: number;
  data: {
    database: string;  // Database name (F-018)
    logs: Array<{
      level: "info" | "debug" | "error";
      message: unknown;  // Renamed from 'data' (F-018)
      timestamp: number;
    }>;
  };
}

// DevTools Panel Real-time Messaging (F-018 NEW)
interface DatabaseListMessage {
  type: "DATABASE_LIST";
  data: {
    databases: string[];
    tabId: number;
    frameId?: number;
  };
}

interface LogEntryMessage {
  type: "LOG_ENTRY";
  data: {
    database: string;
    level: "info" | "debug" | "error";
    message: unknown;
    timestamp: number;
    tabId: number;
    frameId?: number;
  };
}

// Popup Status Query (F-019 NEW)
interface GetTabDatabaseStatusMessage {
  type: "GET_TAB_DATABASE_STATUS";
}

interface TabDatabaseStatusResponse {
  hasDatabase: boolean;      // True if current tab has databases opened
  databaseCount?: number;    // Number of databases (optional, for future use)
}

// Migration & Seed testing (deprecated)
interface DevReleaseRequest {
  dbname: string;
  version: string;
  migrationSQL?: string;
  seedSQL?: string;
}
interface DevReleaseResponse extends Response<{
  devVersion: string;
}> {};

interface DevRollbackRequest {
  dbname: string;
  toVersion: string;
}
interface DevRollbackResponse extends Response<{
  currentVersion: string;
}> {};

interface GetDbVersionRequest {
  dbname: string;
}
interface GetDbVersionResponse extends Response<{
  version: string;
}> {};

// OPFS file browser (deprecated)
interface GetOpfsFilesRequest {
  path?: string;
  dbname?: string;
}
interface GetOpfsFilesResponse extends Response<{
  entries: Array<{
    name: string;
    kind: "file" | "directory";
    size?: string;
  }>;
}> {};

interface DownloadOpfsFileRequest {
  path: string;
}
interface DownloadOpfsFileResponse extends Response<{
  blobUrl: string;
  filename: string;
}> {};

// Connection & health (deprecated)
interface HeartbeatRequest {
  timestamp: number;
}
interface HeartbeatResponse extends Response<{
  timestamp: number;
}> {};

interface IconStateRequest {
  hasDatabase: boolean;
}
interface IconStateResponse extends Response<void> {};
```

### Event Types

```typescript
// Database change event
interface DatabaseChangedEvent {
  action: "opened" | "closed";
  dbname: string;
  databases: string[];
}

// Connection state event
interface ConnectionStateEvent {
  state: "connected" | "connecting" | "reconnecting" | "disconnected";
  reason?: string;
}

// DevTools Panel Real-time Events (F-018 NEW)
interface DatabaseListUpdateEvent {
  type: "DATABASE_LIST";
  databases: string[];
  tabId: number;
  frameId?: number;
}

interface LogEntryUpdateEvent {
  type: "LOG_ENTRY";
  database: string;
  level: "info" | "debug" | "error";
  message: unknown;
  timestamp: number;
  tabId: number;
  frameId?: number;
}

// Migration test event
interface MigrationTestEvent {
  dbname: string;
  phase: "started" | "testing" | "completed" | "failed";
  devVersion?: string;
  success?: boolean;
  error?: string;
}
```

## 2) Component State Types

### DevTools Panel State

```typescript
interface PanelState {
  connectionState: "connected" | "connecting" | "reconnecting" | "disconnected";
  currentRoute: string; // HashRouter location
  sidebarCollapsed: boolean;
  selectedDatabase?: string;
  subscriptions: Map<string, string>; // dbname → subscriptionId
}

interface TableTabState {
  selectedTable?: string;
  openTables: Array<{
    name: string;
    dbname: string;
  }>;
  pagination: {
    limit: number;
    offset: number;
  };
}

interface QueryTabState {
  sql: string;
  results?: QueryResult;
  error?: string;
}

interface LogTabState {
  logs: Array<{
    database: string; // Database name (F-018)
    level: "info" | "debug" | "error";
    message: unknown; // Renamed from 'data' (F-018)
    timestamp: number;
  }>;
  filter?: {
    levels?: Array<"info" | "debug" | "error">;
    fields?: string[]; // sql, action, event
    database?: string; // Filter by database name (F-018)
  };
}
```

### Content Script State

```typescript
interface ContentScriptState {
  subscriptions: Map<
    string,
    {
      dbname: string;
      unsubscribe: () => void;
      buffer: LogEntry[];
    }
  >;
}

interface LogEntry {
  database: string; // Database name (F-018)
  level: "info" | "debug" | "error";
  message: unknown; // Renamed from 'data' (F-018)
  timestamp: number;
}
```

## 3) React Props/Contracts

### Component Props

```typescript
// Sidebar
interface SidebarProps {
  databases: string[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onDatabaseSelect: (dbname: string) => void;
}

// TableTab
interface TableTabProps {
  dbname: string;
  tables: string[];
  initialTable?: string;
}

// QueryTab
interface QueryTabProps {
  dbname: string;
  initialSQL?: string;
}

// LogTab
interface LogTabProps {
  dbname: string;
  subscriptionId: string;
}

// MigrationTab
interface MigrationTabProps {
  dbname: string;
  currentVersion: string;
}

// SeedTab
interface SeedTabProps {
  dbname: string;
  currentVersion: string;
}

// AboutTab
interface AboutTabProps {
  dbname: string;
}

// OPFSBrowser
interface OPFSBrowserProps {
  initialPath?: string;
}
```

## 4) Service Layer Function Signatures (Feature F-001)

> **Complete API Documentation**: See `01-contracts/01-api.md` for detailed function specs.

```typescript
// Database Discovery
export const getDatabases: () => Promise<ServiceResponse<DatabaseSummary[]>>;
export const getTableList: (
  dbname: string,
) => Promise<ServiceResponse<string[]>>;

// Schema & Data Inspection
export const getTableSchema: (
  dbname: string,
  tableName: string,
) => Promise<ServiceResponse<TableSchema>>;
export const queryTableData: (
  dbname: string,
  sql: string,
  limit: number,
  offset: number,
) => Promise<ServiceResponse<QueryResult>>;
export const execSQL: (
  dbname: string,
  sql: string,
  params?: SQLParams,
) => Promise<ServiceResponse<ExecResult>>;

// Log Streaming
export const subscribeLogs: (
  dbname: string,
) => Promise<ServiceResponse<LogSubscription>>;
export const unsubscribeLogs: (
  subscriptionId: string,
) => Promise<ServiceResponse<void>>;

// Migration & Versioning
export const devRelease: (
  dbname: string,
  version: string,
  migrationSQL?: string,
  seedSQL?: string,
) => Promise<ServiceResponse<VersionInfo>>;
export const devRollback: (
  dbname: string,
  toVersion: string,
) => Promise<ServiceResponse<VersionInfo>>;
export const getDbVersion: (
  dbname: string,
) => Promise<ServiceResponse<VersionInfo>>;

// OPFS File Browser
export const getOpfsFiles: (
  path?: string,
  dbname?: string,
) => Promise<ServiceResponse<OpfsFileEntry[]>>;
export const downloadOpfsFile: (
  path: string,
) => Promise<ServiceResponse<OpfsDownload>>;

// Service API Object
export const databaseService: {
  getDatabases: typeof getDatabases;
  getTableList: typeof getTableList;
  getTableSchema: typeof getTableSchema;
  queryTableData: typeof queryTableData;
  execSQL: typeof execSQL;
  subscribeLogs: typeof subscribeLogs;
  unsubscribeLogs: typeof unsubscribeLogs;
  devRelease: typeof devRelease;
  devRollback: typeof devRollback;
  getDbVersion: typeof getDbVersion;
  getOpfsFiles: typeof getOpfsFiles;
  downloadOpfsFile: typeof downloadOpfsFile;
};
```
