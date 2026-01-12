<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/05-design/01-contracts/03-errors.md

OUTPUT MAP (write to)
agent-docs/05-design/01-contracts/03-errors.md

NOTES
- Keep headings unchanged.
- Define global error codes and handling strategy.
-->

# 03 Error Standards

## 1) Error Format

- **Structure**: Custom (compatible with Chrome messaging)
- **Example**:
  ```typescript
  {
    success: false,
    error: "ERR_SQL_ERROR: SQLITE_CONSTRAINT: UNIQUE constraint failed"
  }
  ```

### Error Object (internal)

```typescript
interface ExtensionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  originalError?: Error; // For logging, not sent over messages
}
```

## 2) Error Handling Strategy

### Request/Response Errors

- All responses include `success: boolean`
- On failure, `error` string contains error code and message
- Panel displays inline errors below the relevant UI component
- No alerts/toasts for expected errors (SQL syntax, constraints)

### Streaming Errors (Log Events)

- Errors in streaming are logged internally
- Subscription is not terminated on error
- Panel shows warning if no logs received for 10 seconds

### Connection Errors

- Heartbeat timeout triggers reconnection flow
- After 3 failed retries, show error state with manual retry
- Connection state visible in panel header

## 3) Global Error Codes

| Code                     | Category   | Description                         | Action                   | UI Display            |
| ------------------------ | ---------- | ----------------------------------- | ------------------------ | --------------------- |
| `ERR_NO_API`             | Connection | `window.__web_sqlite` not found     | Check page compatibility | Empty state with help |
| `ERR_CONNECTION_TIMEOUT` | Connection | Content script not responding (15s) | Auto-reconnect           | Loading → Error       |
| `ERR_DB_NOT_FOUND`       | Database   | Requested database not in Map       | Refresh database list    | Inline error          |
| `ERR_TABLE_NOT_FOUND`    | Database   | Table doesn't exist                 | Refresh table list       | Inline error          |
| `ERR_SQL_ERROR`          | SQL        | Query/exec failed (see details)     | Fix SQL                  | Inline below editor   |
| `ERR_VERSION_LOCKED`     | Migration  | Cannot rollback below release       | Stay on current version  | Inline warning        |
| `ERR_INVALID_REQUEST`    | Protocol   | Message format invalid              | Check message protocol   | Console error         |
| `ERR_OPFS_ACCESS`        | OPFS       | OPFS not supported or denied        | Check browser support    | Empty state           |
| `ERR_QUOTA_EXCEEDED`     | OPFS       | OPFS storage full                   | Clear unused files       | Toast notification    |
| `ERR_SCRIPT_INJECTION`   | Lifecycle  | Content script injection failed     | Retry or reload page     | Error state           |

## 4) SQL Error Subcodes (parsed from SQLite errors)

| Pattern             | Category   | Example                       | UX Handling                                    |
| ------------------- | ---------- | ----------------------------- | ---------------------------------------------- |
| `SQLITE_CONSTRAINT` | Constraint | `UNIQUE constraint failed`    | Inline: "Duplicate value in UNIQUE column"     |
| `SQLITE_SCHEMA`     | Schema     | `no such table: users`        | Inline: "Table doesn't exist - run migrations" |
| `SQLITE_ERROR`      | Syntax     | `near "SELECT": syntax error` | Inline: Show syntax error location             |
| `SQLITE_MISUSE`     | API        | Database is closed            | Reconnect flow                                 |
| `SQLITE_FULL`       | Storage    | Database or disk full         | Toast: "Storage full"                          |

## 5) Error Handling by Component

### QueryTab

- Inline error below CodeMirror editor
- Error message includes SQL line number if available
- Syntax errors highlighted in editor (future enhancement)

### TableTab

- Inline error if table no longer exists
- Retry button for transient errors

### LogTab

- Warning if no logs received in 10 seconds
- Filter controls remain functional

### MigrationTab

- Inline error for migration failures
- Auto-rollback triggered on error
- Helper notice explains rollback behavior

### OPFSView

- Empty state if OPFS not supported
- Inline error for file access failures
- Download button disabled on error

### Sidebar

- Database list refreshes on error
- Icon state reflects database availability
