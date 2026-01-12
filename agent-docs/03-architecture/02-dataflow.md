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
    Panel->>Panel: Update hash to /openedDB/dbname/table
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
    participant CS as Content Script
    participant Sub as SubscriptionManager
    participant DB as web-sqlite-js

    Panel->>BG: SUBSCRIBE_LOGS({ dbname })
    BG->>CS: Forward subscribe request
    CS->>Sub: Create subscription for dbname
    Sub->>DB: db.onLog(callback)
    activate Sub

    loop Every log event
        DB->>Sub: LogEntry { level, data }
        Sub->>Sub: Add to ring buffer (max 500)
        Sub->>CS: Send buffered logs
        CS-->>BG: LOG_EVENT { logs: [...] }
        BG-->>Panel: LOG_EVENT { logs: [...] }
        Panel->>Panel: Append to LogList (filter by level/field)
    end

    Panel->>BG: UNSUBSCRIBE_LOGS({ dbname })
    BG->>CS: Forward unsubscribe
    CS->>Sub: Remove subscription
    Sub->>DB: unsubscribe()
    deactivate Sub
```

### Flow 5: Icon State Update (Database Change)

**Goal**: Update extension icon when database is opened/closed
**Concurrency**: Event-driven, no conflicts

```mermaid
sequenceDiagram
    participant Page as Web Page
    participant CS as Content Script
    participant BG as Background SW
    participant Icon as Popup Icon

    Page->>Page: App calls openDB("mydb.sqlite3")
    Page->>Page: window.__web_sqlite.onDatabaseChange callback fires
    Page->>CS: Global event detected
    CS->>CS: Check window.__web_sqlite.databases
    alt Databases exist
        CS->>BG: ICON_STATE_MESSAGE({ hasDatabase: true })
        BG->>Icon: Set active icon
    else No databases
        CS->>BG: ICON_STATE_MESSAGE({ hasDatabase: false })
        BG->>Icon: Set inactive icon
    end
```

### Flow 6: Migration Playground (Safe Testing)

**Goal**: Create dev version, test migration, auto-rollback
**Concurrency**: Single dev version per database (mutex lock)

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant Panel as MigrationTab
    participant BG as Background SW
    participant CS as Content Script
    participant DB as web-sqlite-js

    Dev->>Panel: Writes migration SQL in CodeMirror
    Dev->>Panel: Clicks "Test Migration" button
    Panel->>Panel: Show "Creating dev version..." loading state

    Panel->>BG: DEV_RELEASE({ dbname, version: "x.y.z.dev", migrationSQL })
    BG->>CS: Forward request
    CS->>DB: await db.devTool.release({ version, migrationSQL })

    alt Release successful
        DB-->>CS: Dev version created
        CS-->>BG: { success: true }
        BG-->>Panel: { success: true }
        Panel->>Panel: Show "Dev version created, testing..."
        Panel->>Panel: Execute validation queries
        Panel->>Panel: Show results to user

        Dev->>Panel: Clicks "Rollback" or closes tab
        Panel->>BG: DEV_ROLLBACK({ dbname, toVersion: "original" })
        BG->>CS: Forward rollback
        CS->>DB: await db.devTool.rollback("original")
        DB-->>CS: Rolled back
        Panel->>Panel: Show "Rollback complete"
    else Migration error
        DB-->>CS: throws error (SQLITE_ERROR, etc.)
        CS-->>BG: { success: false, error: "..." }
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
    BG->>CS: Forward heartbeat
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
    participant CS as Content Script
    participant OPFS as OPFS API

    Dev->>Panel: Expands folder, clicks download button
    Panel->>Panel: Show loading state on file row
    Panel->>BG: DOWNLOAD_OPFS_FILE({ path: "/dbname/file.sqlite3" })
    BG->>CS: Forward download request
    CS->>OPFS: navigator.storage.getDirectory()
    OPFS-->>CS: DirectoryHandle

    CS->>OPFS: getFileHandle("file.sqlite3")
    OPFS-->>CS: FileHandle
    CS->>OPFS: getFile()
    OPFS-->>CS: File object

    CS->>CS: Convert File to ArrayBuffer
    CS->>CS: Create Blob from ArrayBuffer
    CS-->>BG: { success: true, data: blobUrl }
    BG-->>Panel: { success: true, data: blobUrl }
    Panel->>Panel: Trigger browser download (hidden <a> tag)
    Panel->>Panel: Remove loading state
```

## 2) Asynchronous Event Flows

**Pattern**: Runtime messaging for icon state; other event flows TBD

### Event: Database Changed

- **Event**: `DATABASE_CHANGED`
- **Producer**: Content Script (listens to `window.__web_sqlite.onDatabaseChange`)
- **Consumers**: Background Service Worker (icon state), DevTools Panel (refresh DB list)

```mermaid
flowchart LR
    App[Web Application] -->|1. openDB/closeDB| API[window.__web_sqlite]
    API -->|2. onDatabaseChange| CS[Content Script]
    CS -->|3. ICON_STATE_MESSAGE| BG[Background SW]
    CS -->|4. DATABASES_UPDATED| Panel[DevTools Panel]
    BG -->|5. setActiveIcon| Icon[Popup Icon]
    Panel -->|6. Refresh Sidebar| UI[Sidebar Database List]
```

### Event: Log Entry

- **Event**: `LOG_ENTRY`
- **Producer**: Content Script (subscribes to `db.onLog()`)
- **Consumers**: DevTools Panel (LogTab), Multiple panels can subscribe

```mermaid
flowchart LR
    DB[web-sqlite-js] -->|1. onLog callback| Sub[Subscription Manager]
    Sub -->|2. Add to ring buffer| Buffer[(500 entry ring buffer)]
    Sub -->|3. Batch send| CS[Content Script]
    CS -->|4. LOG_EVENT| BG[Background SW]
    BG -->|5. Forward to subscribers| Panel1[DevTools Panel 1]
    BG -->|5. Forward to subscribers| Panel2[DevTools Panel 2]
    Panel1 -->|6. Filter & render| LogUI1[Log Tab 1]
    Panel2 -->|6. Filter & render| LogUI2[Log Tab 2]
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
