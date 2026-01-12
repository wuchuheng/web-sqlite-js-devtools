# TASK-03: Content Script Proxy & Background Messaging

## 1. Task Metadata

- **Task ID**: TASK-03
- **Title**: Content Script Proxy & Background Messaging
- **Priority**: P0 (Blocker)
- **Dependencies**: TASK-01 (completed)
- **Status**: In Progress
- **Last Updated**: 2026-01-13

## 2. Requirements Mapping

| FR ID    | Requirement                             | Implementation                 |
| -------- | --------------------------------------- | ------------------------------ |
| FR-039   | Connection to `window.__web_sqlite` API | Content script proxy handlers  |
| ADR-0001 | Content Script Proxy Pattern            | Two-hop message routing        |
| ADR-0004 | Message Protocol                        | Channel-based request/response |

## 3. Functional Design

### 3.1 Architecture Note

**Design Philosophy**: This task implements the **Content Script Proxy Pattern** (ADR-0001). All communication flows: DevTools Panel → Background SW → Content Script → `window.__web_sqlite`. Functional components, no classes, message-based routing using existing `defineChannel` infrastructure.

### 3.2 Component Structure

```
src/contentScript/
├── messaging/
│   ├── handlers.ts           # Message handler registration
│   └── databaseProxy.ts      # window.__web_sqlite wrapper
├── subscriptions/
│   └── index.ts              # Subscription manager (stub for TASK-09)
└── index.tsx                 # Entry point (updated)

src/background/
├── messaging/
│   ├── panelRouter.ts        # Route panel messages to content script
│   └── index.ts              # Initialize router
```

### 3.3 Message Flow

```
DevTools Panel
    ↓ chrome.runtime.sendMessage(channel, payload)
Background SW (panelRouter)
    ↓ chrome.tabs.sendMessage(tabId, channel, payload)
Content Script (handler)
    ↓ window.__web_sqlite API
    ↓ Response
Content Script → Background → Panel
```

### 3.4 Channel Handlers

All handlers follow this pattern:

```typescript
// Handler signature
export const handleGetDatabases = async (): Promise<
  Response<GetDatabasesResponse>
> => {
  try {
    // 1. Access window.__web_sqlite
    // 2. Extract data
    // 3. Convert Map to Array (if needed)
    // 4. Return Response<T> format
  } catch (error) {
    return { success: false, error: String(error) };
  }
};
```

## 4. Component Specifications

### 4.1 Content Script Message Handlers

**File**: `src/contentScript/messaging/handlers.ts`

**Purpose**: Register all message channel handlers for content script proxy.

**Handlers to Implement**:

1. **GET_DATABASES** (Fully implemented)
   - Access `window.__web_sqlite.databases`
   - Convert `Map<string, Database>` to `{ name: string; tableCount?: number }[]`
   - Return database list with table counts (from `db.getTableList()`)

2. **GET_TABLE_LIST** (Stub)
   - Return `{ success: true, data: { tables: [] } }`
   - Full implementation in TASK-05

3. **GET_TABLE_SCHEMA** (Stub)
   - Return `{ success: true, data: { columns: [], ddl: "" } }`
   - Full implementation in TASK-06

4. **QUERY_TABLE_DATA** (Stub)
   - Return `{ success: true, data: { rows: [], total: 0, columns: [] } }`
   - Full implementation in TASK-06

5. **EXEC_SQL** (Stub)
   - Return `{ success: true, data: { lastInsertRowid: 0, changes: 0 } }`
   - Full implementation in TASK-07

6. **SUBSCRIBE_LOGS** (Stub)
   - Return `{ success: true, data: { subscriptionId: "temp-id" } }`
   - Full implementation in TASK-09

7. **UNSUBSCRIBE_LOGS** (Stub)
   - Return `{ success: true, data: undefined }`
   - Full implementation in TASK-09

8. **GET_OPFS_FILES** (Stub)
   - Return `{ success: true, data: { entries: [] } }`
   - Full implementation in TASK-10

9. **DOWNLOAD_OPFS_FILE** (Stub)
   - Return `{ success: false, error: "Not implemented yet" }`
   - Full implementation in TASK-10

10. **HEARTBEAT** (Fully implemented)
    - Return `{ success: true, data: { timestamp: Date.now() } }`

### 4.2 Database Proxy

**File**: `src/contentScript/messaging/databaseProxy.ts`

**Purpose**: Wrapper for `window.__web_sqlite` API with Map→Array conversion.

**Functions**:

```typescript
/**
 * 1. Check if window.__web_sqlite exists
 * 2. Access databases Map from global namespace
 * 3. Convert Map<string, Database> to Array for serialization
 * 4. Return array of database metadata
 */
export const getDatabases = (): Array<{
  name: string;
  tableCount?: number;
}> => {
  // Implementation
};

/**
 * 1. Convert Map to Array of [key, value] pairs
 * 2. Handle nested Maps recursively
 * 3. Return structured clone compatible format
 */
export const mapToArray = <K, V>(map: Map<K, V>): Array<[K, V]> => {
  return Array.from(map.entries());
};
```

### 4.3 Background Message Router

**File**: `src/background/messaging/panelRouter.ts`

**Purpose**: Route messages from DevTools panel to content script.

**Function**:

```typescript
/**
 * 1. Accept message from DevTools panel
 * 2. Get active tab from chrome.tabs.query
 * 3. Forward message to content script via chrome.tabs.sendMessage
 * 4. Return response to panel
 */
export const forwardToContentScript = async (
  message: WireMessage,
): Promise<WireMessage> => {
  // Implementation
};
```

### 4.4 Background Router Initialization

**File**: `src/background/messaging/index.ts`

**Purpose**: Initialize background message router and clean up legacy code.

**Changes**:

- Remove legacy `COUNT` message listener
- Remove duplicate `chrome.runtime.onMessage.addListener`
- Keep offscreen setup
- Register panel router

## 5. Implementation Steps

### Step 1: Create content script message handlers

1. Create `src/contentScript/messaging/databaseProxy.ts`
2. Create `src/contentScript/messaging/handlers.ts`
3. Update `src/contentScript/App.tsx` to register handlers

### Step 2: Create background message router

1. Create `src/background/messaging/panelRouter.ts`
2. Create `src/background/messaging/index.ts`
3. Update `src/background/index.ts` to use new router

### Step 3: Clean up legacy code

1. Remove legacy listeners from `src/background/index.ts`
2. Remove unused LogContext and LogConsole from content script

### Step 4: Test message flow

1. Build extension
2. Load in Chrome
3. Open DevTools panel
4. Verify GET_DATABASES returns empty array (no API detected)
5. Verify HEARTBEAT responds with timestamp

## 6. Code Quality Requirements (S8)

### 6.1 Functional Design Rules

- All handlers are pure functions (no side effects except API access)
- No classes or instances
- Error handling via try/catch with Response<T> format
- Map→Array conversion for all Map objects

### 6.2 Comment Requirements

**Functions > 5 lines**: Use numbered three-phase comment format:

```typescript
/**
 * 1. Extract tab ID from message sender or active tab
 * 2. Forward message to content script via chrome.tabs.sendMessage
 * 3. Return response or throw error if content script not ready
 */
export const forwardToContentScript = async (message: WireMessage) => {
  // Implementation
};
```

**Exported functions**: Add TSDoc comment:

```typescript
/**
 * Get list of databases from web-sqlite-js API
 *
 * @remarks
 * Converts window.__web_sqlite.databases Map to Array for message serialization.
 * Returns empty array if web-sqlite-js API is not available on the page.
 *
 * @returns Array of database metadata with name and table count
 */
export const getDatabases = (): Array<DatabaseMetadata> => {
  // Implementation
};
```

### 6.3 Function Limits

- Max handler function: 30 lines (extract proxy logic if exceeded)
- Max file: 200 lines (split into multiple files if exceeded)
- Max nesting: 4 levels

### 6.4 Extraction Thresholds

- Extract individual proxy functions at 20+ lines
- Extract channel registration logic at 30+ lines
- Create separate proxy module per feature (database, logs, opfs)

## 7. Testing Plan

### 7.1 Manual Testing Checklist

- [ ] Content script loads without errors
- [ ] GET_DATABASES channel registered successfully
- [ ] HEARTBEAT channel responds with timestamp
- [ ] Background router forwards messages to content script
- [ ] Missing web-sqlite-js API returns empty array (not error)
- [ ] All 10 stub handlers return correct Response<T> format
- [ ] Legacy background listeners removed
- [ ] No console errors on extension load

### 7.2 Edge Cases

- [ ] Content script not injected when panel opens
- [ ] Multiple tabs with different domains
- [ ] Page refresh while panel is open
- [ ] web-sqlite-js API not available on page

## 8. Definition of Done

- [ ] Content script handlers created with all 10 channels stubbed
- [ ] GET_DATABASES fully implemented with Map→Array conversion
- [ ] HEARTBEAT fully implemented
- [ ] Background message router created and functional
- [ ] Legacy background code removed
- [ ] No TypeScript errors
- [ ] No console errors on load
- [ ] Build succeeds
- [ ] Manual testing checklist passed

## 9. Output Artifacts

### New Files

- `src/contentScript/messaging/databaseProxy.ts`
- `src/contentScript/messaging/handlers.ts`
- `src/background/messaging/panelRouter.ts`
- `src/background/messaging/index.ts`

### Modified Files

- `src/contentScript/App.tsx`
- `src/background/index.ts`

### Files to Remove

- `src/contentScript/LogContext.tsx`
- `src/contentScript/LogConsole.tsx`

### Documentation Updates (Post-Implementation)

- `agent-docs/00-control/00-spec.md` (status update)
- `agent-docs/00-control/01-status.md` (move TASK-03 to Done)
- `agent-docs/07-taskManager/02-task-catalog.md` (mark TASK-03 complete)
- `agent-docs/08-task/active/TASK-03.md` (this file)
