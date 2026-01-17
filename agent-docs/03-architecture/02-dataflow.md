<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/03-architecture/02-dataflow.md

OUTPUT MAP (write to)
agent-docs/03-architecture/02-dataflow.md

NOTES
- Keep headings unchanged.
- Include UNHAPPY PATHS (errors) and CONCURRENCY controls.
-->

# 02 Data Flow & Sequences

## 1) Critical Business Flows

**Note**: DevTools now accesses `window.__web_sqlite` via `chrome.devtools.inspectedWindow.eval`.
Flows that still reference background/content script hops will be updated as the features are implemented.

### Flow 1: Open DevTools Panel and List Databases

**Goal**: Display list of opened databases when user opens DevTools panel
**Concurrency**: Single request, no conflicts

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant Panel as DevTools Panel
    participant Page as Web Page
    participant DB as web-sqlite-js

    Dev->>Panel: Opens "Sqlite" panel
    Panel->>Panel: HashRouter mounts (/)
    Panel->>Page: inspectedWindow.eval(GET_DATABASES)
    alt web-sqlite-js available
        Page->>DB: Read window.__web_sqlite.databases
        Page-->>Panel: { success: true, data: dbList }
        Panel->>Panel: Render Sidebar with DB list
    else web-sqlite-js not available
        Page-->>Panel: { success: false, error: "API not found" }
        Panel->>Panel: Render EmptyState with error
    end
```

### Flow 2: Query Table Data

**Goal**: Execute SELECT query and display paginated results
**Concurrency**: Multiple queries can be executed concurrently (no shared state)

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant Panel as DevTools Panel
    participant DB as web-sqlite-js

    Dev->>Panel: Clicks table in TableList
    Panel->>Panel: Update hash to /openedDB/dbname/tables/tableName
    Panel->>DB: inspectedWindow.eval(db.query(sql))
    alt Query successful
        DB-->>Panel: { success: true, data: result }
        Panel->>Panel: Render DataTable with pagination
    else Query error
        DB-->>Panel: { success: false, error: "SQLITE_ERROR: ..." }
        Panel->>Panel: Render inline error below table
    end
```

### Flow 3: Execute SQL (INSERT/UPDATE/DELETE)

**Goal**: Execute non-SELECT SQL and show results
**Concurrency**: Auto-rollback on error (handled by web-sqlite-js transaction)

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant Panel as QueryTab
    participant DB as web-sqlite-js

    Dev->>Panel: Types SQL + clicks Execute (or Ctrl+Enter)
    Panel->>DB: inspectedWindow.eval(db.exec(sql, params))

    alt Execution successful
        DB-->>Panel: { success: true, data: {...} }
        Panel->>Panel: Show "X rows affected" toast
    else Constraint error
        DB-->>Panel: { success: false, error: "UNIQUE constraint failed" }
        Panel->>Panel: Render inline error
    else Syntax error
        DB-->>Panel: { success: false, error: "near SELECT: syntax error" }
        Panel->>Panel: Render inline error
    end
```

### Flow 4: Subscribe to Log Events

**Goal**: Stream real-time logs from database to DevTools panel
**Concurrency**: Multiple subscribers per database (ring buffer manages overflow)

```mermaid
sequenceDiagram
    participant Panel as LogTab
    participant BG as Background SW
    participant Relay as Relay Script
    participant CS as Content Script
    participant Sub as SubscriptionManager
    participant DB as web-sqlite-js

    Panel->>BG: SUBSCRIBE_LOGS({ dbname })
    BG->>Relay: Forward via CrossWorldChannel
    Relay->>CS: window.postMessage
    CS->>Sub: Create subscription for dbname
    Sub->>DB: db.onLog(callback)
    activate Sub

    loop Every log event
        DB->>Sub: LogEntry { level, data }
        Sub->>Sub: Add to ring buffer (max 500)
        Sub->>CS: Send buffered logs
        CS->>Relay: window.postMessage
        Relay->>BG: chrome.runtime.sendMessage
        BG-->>Panel: LOG_EVENT { logs: [...] }
        Panel->>Panel: Append to LogList (filter by level/field)
    end

    Panel->>BG: UNSUBSCRIBE_LOGS({ dbname })
    BG->>Relay: Forward via CrossWorldChannel
    Relay->>CS: window.postMessage
    CS->>Sub: Remove subscription
    Sub->>DB: unsubscribe()
    deactivate Sub
```

### Flow 5: Icon State Update (Database Change)

**Goal**: Update extension icon when database is opened/closed
**Concurrency**: Event-driven, no conflicts

**Architecture**:

- MAIN world content script monitors `window.__web_sqlite` (can access page JavaScript)
- ISOLATED world relay script forwards to chrome.runtime (has chrome.\* API access)
- Uses `CrossWorldChannel` abstraction for MAIN ↔ ISOLATED communication
- Uses `WebSqliteMonitor` utility for database change detection

```mermaid
sequenceDiagram
    participant Page as Web Page
    participant Monitor as WebSqliteMonitor
    participant Channel as CrossWorldChannel
    participant Relay as Relay Script (ISOLATED)
    participant BG as Background SW
    participant Icon as Extension Icon

    Note over Page,Icon: Initial Page Load
    Page->>Monitor: monitorAndNotifyBackground()
    Monitor->>Page: Check window.__web_sqlite
    alt API available
        Monitor->>Channel: channel.send(DATABASE_LIST, { databases: [...] })
        Channel->>Page: window.postMessage({ type, data })
        Page->>Relay: Message event
        Relay->>BG: chrome.runtime.sendMessage(DATABASE_LIST_MESSAGE)
        BG->>Icon: Set active icon
    else API not available
        Monitor->>Page: Set up property interceptor
        Note over Page: Waiting for __web_sqlite to be set
    end

    Note over Page,Icon: Database Opened
    Page->>Page: App calls openDB("mydb.sqlite3")
    Page->>Page: window.__web_sqlite.onDatabaseChange fires
    Page->>Monitor: notify() callback
    Monitor->>Channel: channel.send(DATABASE_LIST, { databases: [...] })
    Channel->>Page: window.postMessage({ type, data })
    Page->>Relay: Message event
    Relay->>BG: chrome.runtime.sendMessage(DATABASE_LIST_MESSAGE)
    BG->>BG: Update databaseMap for current tab
    BG->>Icon: Set active icon
```

### Flow 6: Migration Playground (Safe Testing)

**Goal**: Create dev version, test migration, auto-rollback
**Concurrency**: Single dev version per database (mutex lock)

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant Panel as MigrationTab
    participant BG as Background SW
    participant Relay as Relay Script
    participant CS as Content Script
    participant DB as web-sqlite-js

    Dev->>Panel: Writes migration SQL in CodeMirror
    Dev->>Panel: Clicks "Test Migration" button
    Panel->>Panel: Show "Creating dev version..." loading state

    Panel->>BG: DEV_RELEASE({ dbname, version: "x.y.z.dev", migrationSQL })
    BG->>Relay: Forward via CrossWorldChannel
    Relay->>CS: window.postMessage
    CS->>DB: await db.devTool.release({ version, migrationSQL })

    alt Release successful
        DB-->>CS: Dev version created
        CS->>Relay: window.postMessage response
        Relay->>BG: chrome.runtime.sendMessage response
        BG-->>Panel: { success: true }
        Panel->>Panel: Show "Dev version created, testing..."
        Panel->>Panel: Execute validation queries
        Panel->>Panel: Show results to user

        Dev->>Panel: Clicks "Rollback" or closes tab
        Panel->>BG: DEV_ROLLBACK({ dbname, toVersion: "original" })
        BG->>Relay: Forward via CrossWorldChannel
        Relay->>CS: window.postMessage
        CS->>DB: await db.devTool.rollback("original")
        DB-->>CS: Rolled back
        Panel->>Panel: Show "Rollback complete"
    else Migration error
        DB-->>CS: throws error (SQLITE_ERROR, etc.)
        CS->>Relay: window.postMessage error
        Relay->>BG: chrome.runtime.sendMessage error
        BG-->>Panel: { success: false, error: "..." }
        Panel->>Panel: Show inline error, no rollback needed
    end
```

### Flow 7: Page Refresh (Auto-Reconnect)

**Goal**: Detect page refresh and reconnect to window.\_\_web_sqlite
**Concurrency**: Timeout-based retry with exponential backoff

```mermaid
sequenceDiagram
    participant Panel as DevTools Panel
    participant BG as Background SW
    participant CS as Content Script
    participant Page as Web Page

    Page->>Page: Page refreshes
    CS->>CS: Content script reloads
    Panel->>Panel: Panel remains open (DevTools)

    Panel->>BG: HEARTBEAT
    BG->>CS: chrome.tabs.sendMessage
    CS-->>BG: No response (script reloaded)
    BG-->>Panel: Timeout after 15s

    Panel->>Panel: Show "Reconnecting..." loading state
    Panel->>Panel: Start reconnection timer (1s, 2s, 4s, 8s exponential backoff)

    loop Reconnection attempts
        Panel->>BG: GET_DATABASES
        BG->>CS: chrome.tabs.sendMessage
        alt Content script ready
            CS-->>BG: { success: true, data: [...] }
            Panel->>Panel: Hide loading, render data
        else Content script not ready
            CS-->>BG: No response / Error
            Panel->>Panel: Wait for next retry
        end
    end

    alt Max retries exceeded
        Panel->>Panel: Show "Connection lost" error
        Panel->>Panel: Show "Retry" button
    end
```

### Flow 8: OPFS File Download

**Goal**: Download file from OPFS to user's machine
**Concurrency**: Multiple files can be downloaded concurrently

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant Panel as OPFSView
    participant BG as Background SW
    participant Relay as Relay Script
    participant CS as Content Script
    participant OPFS as OPFS API

    Dev->>Panel: Expands folder, clicks download button
    Panel->>Panel: Show loading state on file row
    Panel->>BG: DOWNLOAD_OPFS_FILE({ path: "/dbname/file.sqlite3" })
    BG->>Relay: Forward via CrossWorldChannel
    Relay->>CS: window.postMessage
    CS->>OPFS: navigator.storage.getDirectory()
    OPFS-->>CS: DirectoryHandle

    CS->>OPFS: getFileHandle("file.sqlite3")
    OPFS-->>CS: FileHandle
    CS->>OPFS: getFile()
    OPFS-->>CS: File object

    CS->>CS: Convert File to ArrayBuffer
    CS->>CS: Create Blob from ArrayBuffer
    CS->>Relay: window.postMessage response
    Relay->>BG: chrome.runtime.sendMessage response
    BG-->>Panel: { success: true, data: blobUrl }
    Panel->>Panel: Trigger browser download (hidden <a> tag)
    Panel->>Panel: Remove loading state
```

### Flow 9: Database List Update to DevTools Panel (F-018 NEW)

**Goal**: Auto-refresh database list in DevTools panel when databases are opened/closed
**Concurrency**: Event-driven, no conflicts (fire-and-forget)

```mermaid
sequenceDiagram
    participant Page as Web Page
    participant Monitor as WebSqliteMonitor
    participant Channel as CrossWorldChannel
    participant Relay as Relay Script
    participant BG as Background SW
    participant Panel as DevTools Panel
    participant UI as OpenedDBList

    Note over Page:UI: Initial State
    Panel->>Panel: useDatabaseList hook mounted
    Panel->>BG: chrome.runtime.onMessage listener active

    Note over Page,UI: Database Opened
    Page->>Page: App calls openDB("mydb.sqlite3")
    Page->>Page: window.__web_sqlite.onDatabaseChange fires
    Page->>Monitor: notify() callback
    Monitor->>Channel: channel.send(DATABASE_LIST, { databases: ["mydb.sqlite3"] })
    Channel->>Relay: window.postMessage
    Relay->>BG: chrome.runtime.sendMessage(DATABASE_LIST_MESSAGE)
    BG->>BG: Update databaseMap for current tab
    BG->>Icon: Set active icon

    BG->>Panel: chrome.runtime.sendMessage(DATABASE_LIST_MESSAGE, { databases: ["mydb.sqlite3"] })
    Panel->>Panel: useDatabaseList receives update
    Panel->>Panel: Update React state
    Panel->>UI: Re-render with new database list
    UI->>UI: Show "mydb.sqlite3" card

    Note over Page,UI: Database Closed
    Page->>Page: App calls db.close()
    Page->>Page: window.__web_sqlite.onDatabaseChange fires
    Page->>Monitor: notify() callback
    Monitor->>Channel: channel.send(DATABASE_LIST, { databases: [] })
    Channel->>Relay: window.postMessage
    Relay->>BG: chrome.runtime.sendMessage(DATABASE_LIST_MESSAGE)
    BG->>BG: Update databaseMap for current tab
    BG->>Icon: Set inactive icon

    BG->>Panel: chrome.runtime.sendMessage(DATABASE_LIST_MESSAGE, { databases: [] })
    Panel->>Panel: useDatabaseList receives update
    Panel->>Panel: Update React state
    Panel->>UI: Re-render with empty list
    UI->>UI: Show EmptyDatabaseList component
```

### Flow 10: Log Streaming to DevTools Panel (F-018 NEW)

**Goal**: Stream real-time logs from database to DevTools panel with database identification
**Concurrency**: Multiple databases streaming concurrently

```mermaid
sequenceDiagram
    participant Page as Web Page
    participant CS as Content Script (MAIN)
    participant Channel as CrossWorldChannel
    participant Relay as Relay Script (ISOLATED)
    participant BG as Background SW
    participant Panel as DevTools Panel
    participant LogUI as LogTab (/openedDB/:dbname/logs)

    Note over Page,LogUI: Initial Subscription
    Panel->>Panel: useLogStreaming("mydb.sqlite3") mounted
    Panel->>BG: chrome.runtime.onMessage listener active (for LOG_ENTRY_MESSAGE)

    Page->>CS: window.__web_sqlite.databases["mydb.sqlite3"]
    CS->>CS: Subscribe to db.onLog(callback)

    Note over Page,LogUI: Log Event Fired
    Page->>CS: db.onLog fires: { level: "info", data: {...} }
    CS->>CS: Wrap entry: { database: "mydb.sqlite3", level: "info", message: {...} }
    CS->>Channel: channel.send(LOG_ENTRY_MESSAGE, enrichedEntry)
    Channel->>Relay: window.postMessage
    Relay->>BG: chrome.runtime.sendMessage(LOG_ENTRY_MESSAGE, enrichedEntry)

    BG->>Panel: chrome.runtime.sendMessage(LOG_ENTRY_MESSAGE, enrichedEntry)
    Panel->>Panel: useLogStreaming receives entry
    Panel->>Panel: Filter: entry.database === "mydb.sqlite3"
    Panel->>LogUI: Append to log list (if matches)
    LogUI->>LogUI: Render new log entry

    Note over Page,LogUI: Multiple Databases
    Page->>CS: db2.onLog fires: { level: "error", data: {...} }
    CS->>CS: Wrap entry: { database: "other.sqlite3", level: "error", message: {...} }
    CS->>BG: Send via message chain
    BG->>Panel: chrome.runtime.sendMessage(LOG_ENTRY_MESSAGE, enrichedEntry)
    Panel->>Panel: Filter: entry.database === "mydb.sqlite3"
    Panel->>Panel: Entry filtered out (doesn't match)
    LogUI->>LogUI: No update (log not for this database)
```

## 2) Asynchronous Event Flows

**Pattern**: CrossWorldChannel for MAIN ↔ ISOLATED communication; chrome.runtime for ISOLATED ↔ Background.

### Event: Database Changed (F-018 UPDATED)

- **Event**: `DATABASE_CHANGED` (via `DATABASE_LIST_MESSAGE`)
- **Producer**: WebSqliteMonitor (MAIN world content script)
- **Consumers**: Background Service Worker (icon state), DevTools Panel (database list updates)

```mermaid
flowchart LR
    App[Web Application] -->|1. openDB/closeDB| API[window.__web_sqlite]
    API -->|2. onDatabaseChange| Monitor[WebSqliteMonitor]
    Monitor -->|3. channel.send| Channel[CrossWorldChannel]
    Channel -->|4. postMessage| Relay[Relay Script]
    Relay -->|5. chrome.runtime.sendMessage| BG[Background SW]
    BG -->|6. updateIconForTab| Icon[Extension Icon]
    BG -->|7. setActiveIcon| State[Per-Tab Icon State]
    BG -->|8. Forward to DevTools| Panel[DevTools Panel]
    Panel -->|9. Update database list| UI[OpenedDBList UI]
```

### Event: Log Entry (F-018 UPDATED)

- **Event**: `LOG_ENTRY_MESSAGE`
- **Producer**: Content Script (subscribes to `db.onLog()`)
- **Consumers**: DevTools Panel (LogTab with database filtering)
- **Entry Format**: `{ database: string, level: string, message: any }` (F-018)

```mermaid
flowchart LR
    DB[web-sqlite-js] -->|1. onLog callback| Sub[Subscription Manager]
    Sub -->|2. Wrap with dbname| Wrap[Enriched Entry]
    Wrap -->|3. Add to ring buffer| Buffer[(500 entry ring buffer)]
    Sub -->|4. Send enriched entry| CS[Content Script MAIN]
    CS -->|5. CrossWorldChannel| Channel[CrossWorldChannel]
    Channel -->|6. postMessage| Relay[Relay Script ISOLATED]
    Relay -->|7. chrome.runtime.sendMessage| BG[Background SW]
    BG -->|8. Forward to DevTools| Panel[DevTools Panel]
    Panel -->|9. Filter by database| Filter[useLogStreaming Hook]
    Filter -->|10. Render filtered logs| UI[LogView UI]
```

## 3) Entity State Machines

### Entity: DevTools Panel Connection

```mermaid
stateDiagram-v2
    [*] --> Connecting: Panel opens
    Connecting --> Connected: HEARTBEAT success
    Connecting --> Reconnecting: HEARTBEAT timeout
    Connected --> Reconnecting: Page refresh detected
    Connected --> Disconnected: Panel closes
    Reconnecting --> Connected: Reconnect success
    Reconnecting --> Disconnected: Max retries exceeded
    Disconnected --> [*]
```

### Entity: Icon State

```mermaid
stateDiagram-v2
    [*] --> Inactive: Extension loaded
    Inactive --> Active: window.__web_sqlite detected
    Active --> Inactive: All databases closed
    Active --> Active: Database opened/closed
    Inactive --> [*]: Extension unloaded
    Active --> [*]: Extension unloaded
```

### Entity: Migration Test

```mermaid
stateDiagram-v2
    [*] --> Idle: User opens MigrationTab
    Idle --> CreatingDev: User clicks "Test Migration"
    CreatingDev --> Testing: dev.release() success
    CreatingDev --> Error: dev.release() fails
    Testing --> Reviewing: Queries executed
    Reviewing --> RollingBack: User clicks "Rollback" or closes tab
    Reviewing --> Error: Validation queries fail
    RollingBack --> Idle: Rollback complete
    Error --> Idle: User dismisses error
```

## 4) Consistency & Recovery

- **Distributed Transactions**: None (single content script per page)
- **Idempotency**:
  - Query requests are idempotent (SELECT statements)
  - EXEC requests may not be idempotent (INSERT/UPDATE/DELETE) - user responsibility
  - Reconnection attempts are idempotent (GET_DATABASES can be called multiple times)
- **Compensation**:
  - Migration testing: Automatic rollback via `devTool.rollback()` on error or tab close
  - Seed testing: Automatic rollback via `devTool.rollback()` on error or tab close
  - OPFS download: No compensation (download can be retried by user)
- **Error Recovery**:
  - Message timeout: Retry with exponential backoff (1s, 2s, 4s, 8s)
  - Database closed: Show "Database closed" message, redirect to database list
  - Page navigation: Auto-reconnect with loading state

## 5) Cross-World Communication Architecture

**Problem**: Content scripts need both access to page JavaScript (`window.__web_sqlite`) AND chrome APIs (`chrome.runtime`), but these are available in different execution worlds.

**Solution**: Dual-world content script architecture with CrossWorldChannel abstraction.

### Execution Worlds

| World    | JavaScript Context | chrome.\* APIs   | Page JS Access   |
| -------- | ------------------ | ---------------- | ---------------- |
| MAIN     | Page context       | ❌ Not available | ✅ Full access   |
| ISOLATED | Extension context  | ✅ Available     | ❌ Not available |

### Communication Flow

```mermaid
flowchart LR
    subgraph MAIN_World["MAIN World"]
        Page[Page JS] --> Monitor[WebSqliteMonitor]
        Monitor --> Channel["CrossWorldChannel.send()"]
    end

    subgraph ISOLATED_World["ISOLATED World"]
        Relay[Relay Script] --> ChannelListen["CrossWorldChannel.listen()"]
        ChannelListen --> Runtime["chrome.runtime.sendMessage()"]
    end

    subgraph Background["Background Worker"]
        Runtime --> Handler["Message Handler"]
    end

    Channel -->|window.postMessage| ChannelListen
```

### Abstractions

1. **CrossWorldChannel** (`src/shared/messaging/channel.ts`)
   - Pub/Sub pattern for MAIN → ISOLATED messaging
   - Type-safe send/listen API
   - Automatic handler management

2. **WebSqliteMonitor** (`src/shared/web-sqlite/monitor.ts`)
   - Monitors `window.__web_sqlite` availability
   - Watches for API to be set (property interceptor)
   - Subscribes to `onDatabaseChange` events
   - Notifies listeners on changes
   - Sends updates via CrossWorldChannel
