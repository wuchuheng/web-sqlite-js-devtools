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

## 0) Document Map
```text
agent-docs/05-design/
  01-contracts/01-api.md
  01-contracts/02-events.md
  01-contracts/03-errors.md
  02-schema/01-message-types.md  (this file)
  03-modules/
    devtools-panel.md
    content-script-proxy.md
    background-service.md
    opfs-browser.md
```

## 1) Type Definitions

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
// Database record (serialized form of window.__web_sqlite.databases[key])
interface DatabaseRecord {
  name: string;
  migrationSQL: Array<[string, string]>;  // [version, SQL] pairs (Map→Array)
  seedSQL: Array<[string, string]>;       // [version, SQL] pairs
}

// Table information
interface TableInfo {
  name: string;
  columns: Array<{
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: any;
    pk: number;
  }>;
  ddl: string;  // Complete CREATE TABLE SQL
}

// Query result
interface QueryResult {
  rows: Array<Record<string, any>>;
  total: number;
  columns: string[];
}
```

### Message Types (Request/Response)
```typescript
// Generic response
interface Response<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Database inspection requests
interface GetDatabasesRequest {}
interface GetDatabasesResponse extends Response<{
  databases: Array<{ name: string; tableCount?: number }>;
}>;

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

// SQL execution
interface ExecSQLRequest {
  dbname: string;
  sql: string;
  params?: SQLParams;
}
interface ExecSQLResponse extends Response<{
  lastInsertRowid: number | bigint;
  changes: number | bigint;
}> {};

// Log streaming
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
    dbname: string;
    logs: Array<{
      level: "info" | "debug" | "error";
      data: unknown;
      timestamp: number;
    }>;
  };
}

// Migration & Seed testing
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

// OPFS file browser
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

// Connection & health
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
  currentRoute: string;  // HashRouter location
  sidebarCollapsed: boolean;
  selectedDatabase?: string;
  subscriptions: Map<string, string>;  // dbname → subscriptionId
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
    level: "info" | "debug" | "error";
    data: unknown;
    timestamp: number;
  }>;
  filter?: {
    levels?: Array<"info" | "debug" | "error">;
    fields?: string[];  // sql, action, event
  };
}
```

### Content Script State
```typescript
interface ContentScriptState {
  subscriptions: Map<string, {
    dbname: string;
    unsubscribe: () => void;
    buffer: LogEntry[];
  }>;
}

interface LogEntry {
  level: "info" | "debug" | "error";
  data: unknown;
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
