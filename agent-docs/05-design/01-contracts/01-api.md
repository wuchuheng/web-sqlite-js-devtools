<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/05-design/01-contracts/01-api.md

OUTPUT MAP (write to)
agent-docs/05-design/01-contracts/01-api.md

NOTES
- Keep headings unchanged.
- Group Endpoints by MODULE to allow parallel ownership.
-->

# 01 API Contract (Chrome Extension Messaging)

> **Note**: Channel-based API contracts are deprecated. DevTools data access now uses
> `chrome.devtools.inspectedWindow.eval` directly.

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
```

### Module Index

| Module               | LLD file                                                  | API section                        | Message Types       |
| -------------------- | --------------------------------------------------------- | ---------------------------------- | ------------------- |
| DevTools Panel       | `agent-docs/05-design/03-modules/devtools-panel.md`       | `### Module: DevTools Panel`       | Requests, Responses |
| Content Script Proxy | `agent-docs/05-design/03-modules/content-script-proxy.md` | `### Module: Content Script Proxy` | Proxy handlers      |
| Background Service   | `agent-docs/05-design/03-modules/background-service.md`   | `### Module: Background Service`   | Icon state, routing |
| OPFS Browser         | `agent-docs/05-design/03-modules/opfs-browser.md`         | `### Module: OPFS Browser`         | File operations     |

## 1) Standards

- **Protocol**: Chrome Extension Messaging (`chrome.runtime.sendMessage`, `chrome.tabs.sendMessage`)
- **Message Direction**:
  - Panel → Background → Content Script (requests)
  - Content Script → Background → Panel (responses)
  - Content Script → Background → Panel (streaming events)
- **Content-Type**: Structured clone (JSON-compatible)
- **Response Format**:
  ```typescript
  type Response<T> = {
    success: boolean;
    data?: T;
    error?: string;
  };
  ```

## 2) Channels (by Module)

### Module: Database Inspection

#### Channel: `GET_DATABASES`

- **Summary**: List all opened databases from `window.__web_sqlite.databases`
- **Request**: `{}`
- **Response (200)**:
  ```typescript
  {
    success: true,
    data: {
      databases: Array<{
        name: string;
        tableCount: number;
      }>
    }
  }
  ```

#### Channel: `GET_TABLE_LIST`

- **Summary**: Get all tables for a specific database
- **Request**: `{ dbname: string }`
- **Response**:
  ```typescript
  {
    success: true,
    data: {
      tables: string[]  // Alphabetically sorted
    }
  }
  ```

#### Channel: `GET_TABLE_SCHEMA`

- **Summary**: Get table schema (columns, types, constraints)
- **Request**: `{ dbname: string, tableName: string }`
- **Response**:
  ```typescript
  {
    success: true,
    data: {
      columns: Array<{
        cid: number;
        name: string;
        type: string;
        notnull: number;
        dflt_value: any;
        pk: number;
      }>,
      ddl: string  // Complete CREATE TABLE SQL
    }
  }
  ```

#### Channel: `QUERY_TABLE_DATA`

- **Summary**: Execute SELECT query with pagination
- **Request**: `{ dbname: string, sql: string, limit: number, offset: number }`
- **Response**:
  ```typescript
  {
    success: true,
    data: {
      rows: Array<Record<string, any>>,
      total: number,  // Total count for pagination
      columns: string[]  // Column names
    }
  }
  ```

### Module: Query Execution

#### Channel: `EXEC_SQL`

- **Summary**: Execute INSERT/UPDATE/DELETE/DDL
- **Request**: `{ dbname: string, sql: string, params?: SqlValue[] | Record<string, SqlValue> }`
- **Response**:
  ```typescript
  {
    success: true,
    data: {
      lastInsertRowid: number | bigint,
      changes: number | bigint
    }
  }
  ```

### Module: Log Streaming

#### Channel: `SUBSCRIBE_LOGS`

- **Summary**: Subscribe to log events for a database
- **Request**: `{ dbname: string }`
- **Response**:
  ```typescript
  {
    success: true,
    data: {
      subscriptionId: string
    }
  }
  ```

#### Channel: `UNSUBSCRIBE_LOGS`

- **Summary**: Unsubscribe from log events
- **Request**: `{ subscriptionId: string }`
- **Response**: `{ success: true }`

#### Channel: `LOG_EVENT` (streaming)

- **Summary**: Stream log entries from content script to panel
- **Payload**:
  ```typescript
  {
    dbname: string,
    logs: Array<{
      level: "info" | "debug" | "error",
      data: unknown,
      timestamp: number
    }>
  }
  ```

### Module: Migration & Seed Testing

#### Channel: `DEV_RELEASE`

- **Summary**: Create dev version with migration/seed SQL
- **Request**: `{ dbname: string, version: string, migrationSQL?: string, seedSQL?: string }`
- **Response**: `{ success: true, data: { devVersion: string } }`

#### Channel: `DEV_ROLLBACK`

- **Summary**: Rollback dev version to original
- **Request**: `{ dbname: string, toVersion: string }`
- **Response**: `{ success: true, data: { currentVersion: string } }`

#### Channel: `GET_DB_VERSION`

- **Summary**: Get current database version
- **Request**: `{ dbname: string }`
- **Response**: `{ success: true, data: { version: string } }`

### Module: OPFS File Browser

#### Channel: `GET_OPFS_FILES`

- **Summary**: List OPFS files with lazy loading
- **Request**: `{ path?: string, dbname?: string }`
- **Response**:
  ```typescript
  {
    success: true,
    data: {
      entries: Array<{
        name: string,
        kind: "file" | "directory",
        size?: string,  // Human-readable
      }>
    }
  }
  ```

#### Channel: `DOWNLOAD_OPFS_FILE`

- **Summary**: Download OPFS file to user's machine
- **Request**: `{ path: string }`
- **Response**:
  ```typescript
  {
    success: true,
    data: {
      blobUrl: string,  // chrome.runtime.URL.createObjectURL
      filename: string
    }
  }
  ```

### Module: Connection & Health

#### Channel: `HEARTBEAT`

- **Summary**: Connection health check
- **Request**: `{ timestamp: number }`
- **Response**: `{ success: true, timestamp: number }`

#### Channel: `ICON_STATE`

- **Summary**: Update popup icon based on database availability
- **Request**: `{ hasDatabase: boolean }`
- **Response**: `{ success: true }`

## 3) Error Codes

| Code                     | Message                       | Meaning                                |
| ------------------------ | ----------------------------- | -------------------------------------- |
| `ERR_NO_API`             | web-sqlite-js not available   | `window.__web_sqlite` not found        |
| `ERR_DB_NOT_FOUND`       | Database not found            | Requested dbname not in databases Map  |
| `ERR_SQL_ERROR`          | SQL execution error           | Query/exec failed, check error details |
| `ERR_CONNECTION_TIMEOUT` | Content script not responding | Heartbeat timeout (15s)                |
| `ERR_INVALID_REQUEST`    | Invalid message format        | Request doesn't match schema           |
| `ERR_OPFS_ACCESS`        | OPFS access denied            | Browser doesn't support OPFS           |
| `ERR_VERSION_LOCKED`     | Cannot rollback below release | Dev version at or below latest release |
