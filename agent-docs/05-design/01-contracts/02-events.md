<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/05-design/01-contracts/02-events.md

OUTPUT MAP (write to)
agent-docs/05-design/01-contracts/02-events.md

NOTES
- Keep headings unchanged.
- Use CloudEvents format or custom JSON structure.
-->

# 02 Events Contract

## 1) Message Format

- **Protocol**: Chrome Extension Messaging (`chrome.runtime.sendMessage`)
- **Standard**: Custom JSON (Chrome structured clone compatible)

### Envelope Structure (for streaming events)

```typescript
interface StreamEvent {
  type: string; // Event type identifier
  source: string; // Source context (content-script, background)
  timestamp: number; // Unix timestamp in milliseconds
  data: unknown; // Event payload
}
```

## 2) Event Channels

### Channel: `LOG_EVENT`

- **Description**: Stream log entries from content script to DevTools panel
- **Direction**: Content Script → Background → DevTools Panel
- **Batching**: Sent every 100ms or when buffer reaches 50 entries

### Channel: `DATABASE_CHANGED`

- **Description**: Notify when databases are opened/closed
- **Direction**: Content Script → Background (for icon state)
- **Trigger**: `window.__web_sqlite.onDatabaseChange` callback

### Channel: `CONNECTION_STATE`

- **Description**: Notify connection state changes
- **Direction**: Background → DevTools Panel
- **States**: `connected`, `connecting`, `reconnecting`, `disconnected`

## 3) Event Definitions

### Event: `LOG_ENTRY`

- **Trigger**: Log callback from `db.onLog()` fires
- **Payload (`data`)**:
  ```typescript
  {
    level: "info" | "debug" | "error",
    data: unknown,
    timestamp: number,
    dbname: string
  }
  ```
- **Batch Format** (as sent over `LOG_EVENT` channel):
  ```typescript
  {
    type: "LOG_ENTRY",
    source: "content-script",
    timestamp: number,
    data: {
      dbname: string,
      logs: Array<{
        level: "info" | "debug" | "error",
        data: unknown,
        timestamp: number
      }>
    }
  }
  ```

### Event: `DATABASE_OPENED`

- **Trigger**: App calls `openDB()` successfully
- **Payload (`data`)**:
  ```typescript
  {
    action: "opened",
    dbname: string,
    databases: string[]  // All opened database names
  }
  ```

### Event: `DATABASE_CLOSED`

- **Trigger**: App calls `db.close()`
- **Payload (`data`)**:
  ```typescript
  {
    action: "closed",
    dbname: string,
    databases: string[]  // Remaining database names
  }
  ```

### Event: `CONNECTION_LOST`

- **Trigger**: Heartbeat timeout (3 missed, 15s)
- **Payload (`data`)**:
  ```typescript
  {
    reason: "timeout" | "page_refresh" | "script_error",
    lastSeen: number
  }
  ```

### Event: `CONNECTION_RESTORED`

- **Trigger**: Successful reconnection after loss
- **Payload (`data`)**:
  ```typescript
  {
    attempts: number,  // Number of retry attempts
    duration: number   // Milliseconds since loss
  }
  ```

### Event: `MERSION_TEST_STARTED`

- **Trigger**: User starts migration test in Migration tab
- **Payload (`data`)**:
  ```typescript
  {
    dbname: string,
    devVersion: string,
    originalVersion: string
  }
  ```

### Event: `MERSION_TEST_COMPLETED`

- **Trigger**: Migration test finishes (success or failure)
- **Payload (`data`)**:
  ```typescript
  {
    dbname: string,
    success: boolean,
    rolledBack: boolean,
    error?: string
  }
  ```
