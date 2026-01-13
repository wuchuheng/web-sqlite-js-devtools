<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/05-design/01-contracts/01-api.md

OUTPUT MAP (write to)
agent-docs/05-design/01-contracts/01-api.md

NOTES
- Keep headings unchanged.
- Group Endpoints by MODULE to allow parallel ownership.
-->

# 01 API Contract (Service Layer & Chrome Extension Messaging)

## 0) Document Map

```text
agent-docs/05-design/
  01-contracts/01-api.md
  01-contracts/02-events.md
  01-contracts/03-errors.md
  02-schema/01-message-types.md
  03-modules/
    devtools-panel.md
    content-script-proxy.md
    background-service.md
    opfs-browser.md
    database-service.md  (NEW - Feature F-001)
```

### Module Index

| Module               | LLD file                                                  | API section                        | Message Types       |
| -------------------- | --------------------------------------------------------- | ---------------------------------- | ------------------- |
| DevTools Panel       | `agent-docs/05-design/03-modules/devtools-panel.md`       | `### Module: DevTools Panel`       | UI Components       |
| Database Service     | `agent-docs/05-design/03-modules/database-service.md`     | `## 1) Service Layer API`          | Service Functions   |
| Content Script Proxy | `agent-docs/05-design/03-modules/content-script-proxy.md` | `### Module: Content Script Proxy` | Proxy handlers      |
| Background Service   | `agent-docs/05-design/03-modules/background-service.md`   | `### Module: Background Service`   | Icon state, routing |
| OPFS Browser         | `agent-docs/05-design/03-modules/opfs-browser.md`         | `### Module: OPFS Browser`         | File operations     |

## 1) Standards

### Service Layer API (Primary - Feature F-001)

- **Protocol**: TypeScript service functions using `inspectedWindowBridge.execute()`
- **Execution Context**: Chrome DevTools → inspected page (MAIN world via `chrome.scripting.executeScript`)
- **Response Format**:
  ```typescript
  type ServiceResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
  };
  ```
- **Import Pattern**: `import { databaseService } from '@/devtools/services/databaseService'`
- **Error Handling**: All errors caught and returned in `ServiceResponse.error` field

### Runtime Messaging (Secondary - Icon State Only)

- **Protocol**: Chrome Extension Messaging (`chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`)
- **Message Direction**:
  - Content Script → Background → Panel (icon state updates)
  - Panel → Background → Content Script (rare, only for non-data operations)
- **Content-Type**: Structured clone (JSON-compatible)
- **Use Case**: Icon state updates only (all data access via service layer)

## 2) Service Layer API (Feature F-001)

> **Implementation Location**: `src/devtools/services/databaseService.ts`
>
> **Usage**: Components import `databaseService` and call functions directly.
> All functions use `inspectedWindowBridge.execute()` for page access.

### Module: Database Discovery

#### Function: `getDatabases()`

- **Summary**: List all opened databases from `window.__web_sqlite.databases`
- **Signature**:
  ```typescript
  getDatabases(): Promise<ServiceResponse<DatabaseSummary[]>>
  ```
- **Response (200)**:
  ```typescript
  {
    success: true,
    data: [
      { name: "main" },
      { name: "cache" }
    ]
  }
  ```
- **Error Cases**:
  - Returns empty array if `window.__web_sqlite` not available
  - Returns `{ success: false, error: string }` if execution fails

#### Function: `getTableList(dbname)`

- **Summary**: Get all tables for a specific database
- **Signature**:
  ```typescript
  getTableList(dbname: string): Promise<ServiceResponse<string[]>>
  ```
- **Response (200)**:
  ```typescript
  {
    success: true,
    data: ["users", "posts", "comments"]  // Alphabetically sorted
  }
  ```
- **Business Logic**:
  - Queries `PRAGMA table_list` with fallback to `sqlite_master`
  - Filters out `sqlite_*` system tables
  - Returns only tables (not views, indexes, etc.)
  - Sorts alphabetically for consistent UI

### Module: Schema & Data Inspection

#### Function: `getTableSchema(dbname, tableName)`

- **Summary**: Get table schema (columns, types, constraints, DDL)
- **Signature**:
  ```typescript
  getTableSchema(
    dbname: string,
    tableName: string
  ): Promise<ServiceResponse<TableSchema>>
  ```
- **Response (200)**:
  ```typescript
  {
    success: true,
    data: {
      columns: [
        {
          cid: 0,
          name: "id",
          type: "INTEGER",
          notnull: 1,
          dflt_value: null,
          pk: 1
        },
        // ... more columns
      ],
      ddl: "CREATE TABLE users (\n  id INTEGER PRIMARY KEY,\n  name TEXT\n)"
    }
  }
  ```
- **Business Logic**:
  - Queries `PRAGMA table_info(tableName)` for column details
  - Queries `sqlite_master` for complete CREATE TABLE DDL
  - Returns normalized column information with types and constraints
- **Error Cases**:
  - Database not found
  - Table not found
  - Permission denied

#### Function: `queryTableData(dbname, sql, limit, offset)`

- **Summary**: Execute SELECT query with pagination
- **Signature**:
  ```typescript
  queryTableData(
    dbname: string,
    sql: string,
    limit: number,
    offset: number
  ): Promise<ServiceResponse<QueryResult>>
  ```
- **Response (200)**:
  ```typescript
  {
    success: true,
    data: {
      rows: [
        { id: 1, name: "Alice", email: "alice@example.com" },
        { id: 2, name: "Bob", email: "bob@example.com" }
      ],
      total: 150,  // Total row count (for pagination)
      columns: ["id", "name", "email"]
    }
  }
  ```
- **Business Logic**:
  - Wraps user SQL with pagination: `SELECT * FROM (${sql}) LIMIT ? OFFSET ?`
  - Executes count query: `SELECT COUNT(*) FROM (${sql})`
  - Extracts column names from first row
  - Returns empty result set if no rows

#### Function: `execSQL(dbname, sql, params?)`

- **Summary**: Execute INSERT/UPDATE/DELETE/DDL with optional parameters
- **Signature**:
  ```typescript
  execSQL(
    dbname: string,
    sql: string,
    params?: SqlValue[] | Record<string, SqlValue>
  ): Promise<ServiceResponse<ExecResult>>
  ```
- **Response (200)**:
  ```typescript
  {
    success: true,
    data: {
      lastInsertRowid: 123,
      changes: 1
    }
  }
  ```
- **Business Logic**:
  - Executes write operation using `db.exec(sql, params)`
  - Returns last insert rowid and number of rows affected
  - Supports both positional (`[]`) and named (`{}`) parameters
- **Error Cases**:
  - SQL syntax errors
  - Constraint violations
  - Parameter count mismatch

### Module: Log Streaming

#### Function: `subscribeLogs(dbname)`

- **Summary**: Subscribe to log events for a database
- **Signature**:
  ```typescript
  subscribeLogs(dbname: string): Promise<ServiceResponse<{ subscriptionId: string }>>
  ```
- **Response (200)**:
  ```typescript
  {
    success: true,
    data: {
      subscriptionId: "sub_1234567890"
    }
  }
  ```
- **Business Logic**:
  - Calls `window.__web_sqlite.subscribeLogs(dbname)` in inspected page
  - Generates unique subscription ID
  - Stores subscription for later cleanup
  - Logs streamed via offscreen messaging channel (TBD)

#### Function: `unsubscribeLogs(subscriptionId)`

- **Summary**: Unsubscribe from log events
- **Signature**:
  ```typescript
  unsubscribeLogs(subscriptionId: string): Promise<ServiceResponse<void>>
  ```
- **Response (200)**:
  ```typescript
  {
    success: true;
  }
  ```
- **Business Logic**:
  - Calls `window.__web_sqlite.unsubscribeLogs(subscriptionId)` in inspected page
  - Cleans up log listeners
  - Clears subscription tracking

### Module: Migration & Versioning

#### Function: `devRelease(dbname, version, migrationSQL?, seedSQL?)`

- **Summary**: Create dev version with migration/seed SQL for testing
- **Signature**:
  ```typescript
  devRelease(
    dbname: string,
    version: string,
    migrationSQL?: string,
    seedSQL?: string
  ): Promise<ServiceResponse<{ devVersion: string }>>
  ```
- **Response (200)**:
  ```typescript
  {
    success: true,
    data: {
      devVersion: "1.2.3-dev.20250113"
    }
  }
  ```
- **Business Logic**:
  - Creates dev database copy from production
  - Applies migration SQL if provided
  - Applies seed SQL if provided
  - Returns unique dev version identifier
  - Enables automatic rollback on unmount

#### Function: `devRollback(dbname, toVersion)`

- **Summary**: Rollback dev version to original or specific version
- **Signature**:
  ```typescript
  devRollback(
    dbname: string,
    toVersion: string
  ): Promise<ServiceResponse<{ currentVersion: string }>>
  ```
- **Response (200)**:
  ```typescript
  {
    success: true,
    data: {
      currentVersion: "1.2.2"
    }
  }
  ```
- **Business Logic**:
  - Drops dev database
  - Restores from backup or specific version
  - Updates version tracking
  - Returns current active version

#### Function: `getDbVersion(dbname)`

- **Summary**: Get current database version
- **Signature**:
  ```typescript
  getDbVersion(dbname: string): Promise<ServiceResponse<{ version: string }>>
  ```
- **Response (200)**:
  ```typescript
  {
    success: true,
    data: {
      version: "1.2.3"
    }
  }
  ```
- **Business Logic**:
  - Queries `PRAGMA user_version` or web-sqlite-js version tracking
  - Returns semantic version string
  - Returns "0.0.0" if no version set

### Module: OPFS File Browser

#### Function: `getOpfsFiles(path?, dbname?)`

- **Summary**: List OPFS files with lazy loading
- **Signature**:
  ```typescript
  getOpfsFiles(
    path?: string,
    dbname?: string
  ): Promise<ServiceResponse<OpfsFileEntry[]>>
  ```
- **Response (200)**:
  ```typescript
  {
    success: true,
    data: {
      entries: [
        {
          name: "databases",
          kind: "directory",
          size: undefined
        },
        {
          name: "cache.sqlite",
          kind: "file",
          size: "1.2 MB"
        }
      ]
    }
  }
  ```
- **Business Logic**:
  - Calls `navigator.storage.getDirectory()` in inspected page
  - Lists directory contents at `path` (defaults to root)
  - Filters by `dbname` if provided (for database-specific files)
  - Converts file sizes to human-readable format
  - Returns flat list for lazy loading in UI

#### Function: `downloadOpfsFile(path)`

- **Summary**: Download OPFS file to user's machine
- **Signature**:
  ```typescript
  downloadOpfsFile(path: string): Promise<ServiceResponse<{ blobUrl: string; filename: string }>>
  ```
- **Response (200)**:
  ```typescript
  {
    success: true,
    data: {
      blobUrl: "blob:chrome-extension://...",
      filename: "cache.sqlite"
    }
  }
  ```
- **Business Logic**:
  - Retrieves file handle from OPFS at `path`
  - Creates blob from file contents
  - Creates object URL for download
  - Returns URL and filename for browser download trigger
  - Caller responsible for URL cleanup (`URL.revokeObjectURL`)

## 3) Runtime Messaging (Icon State Only)

> **Note**: Channel-based messaging is deprecated for data access. Use service layer functions above.
> Remaining channels are for icon state updates only.

### Module: Connection & Health

#### Channel: `HEARTBEAT`

- **Summary**: Connection health check (via `chrome.devtools.inspectedWindow.eval`)
- **Request**: `{ timestamp: number }`
- **Response**: `{ success: true, timestamp: number }`
- **Usage**: Direct `inspectedWindow.eval`, not messaging

#### Channel: `ICON_STATE`

- **Summary**: Update popup icon based on database availability
- **Direction**: Content Script → Background
- **Request**: `{ hasDatabase: boolean }`
- **Response**: `{ success: true }`
- **Usage**: Runtime messaging only (content script detects `window.__web_sqlite`)

## 4) Error Codes

| Code                     | Message                       | Meaning                                |
| ------------------------ | ----------------------------- | -------------------------------------- |
| `ERR_NO_API`             | web-sqlite-js not available   | `window.__web_sqlite` not found        |
| `ERR_DB_NOT_FOUND`       | Database not found            | Requested dbname not in databases Map  |
| `ERR_SQL_ERROR`          | SQL execution error           | Query/exec failed, check error details |
| `ERR_CONNECTION_TIMEOUT` | Content script not responding | Heartbeat timeout (15s)                |
| `ERR_INVALID_REQUEST`    | Invalid message format        | Request doesn't match schema           |
| `ERR_OPFS_ACCESS`        | OPFS access denied            | Browser doesn't support OPFS           |
| `ERR_VERSION_LOCKED`     | Cannot rollback below release | Dev version at or below latest release |

## 5) Type Definitions

```typescript
// Service Response Envelope
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Database Summary
type DatabaseSummary = {
  name: string;
};

// Table Schema
type TableSchema = {
  columns: Array<{
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: any;
    pk: number;
  }>;
  ddl: string;
};

// Query Result
type QueryResult = {
  rows: Array<Record<string, any>>;
  total: number;
  columns: string[];
};

// Execution Result
type ExecResult = {
  lastInsertRowid: number | bigint;
  changes: number | bigint;
};

// OPFS File Entry
type OpfsFileEntry = {
  name: string;
  kind: "file" | "directory";
  size?: string;
};

// SQL Value Types
type SqlValue =
  | null
  | number
  | string
  | boolean
  | bigint
  | Uint8Array
  | ArrayBuffer;

// SQL Parameters
type SQLParams = SqlValue[] | Record<string, SqlValue>;
```
