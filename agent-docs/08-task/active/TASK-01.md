# TASK-01: Project Setup & Configuration

## Task Metadata

- **Task ID**: TASK-01
- **Priority**: P0 (Blocker)
- **Status**: In Progress
- **Dependencies**: None
- **Maps to**: FR-001, FR-004, FR-005, FR-039

## Upstream Design References

- **API Contract**: `agent-docs/05-design/01-contracts/01-api.md` (10 channels, Response<T> type)
- **Message Types**: `agent-docs/05-design/02-schema/01-message-types.md` (TypeScript definitions)
- **React Router Decision**: `agent-docs/04-adr/0002-react-router-hash.md` (HashRouter choice)
- **DevTools Panel LLD**: `agent-docs/05-design/03-modules/devtools-panel.md`

## Definition of Done

1. Manifest with extension name "web-sqlite devtools", permissions (activeTab, tabs)
2. Message channels TypeScript definitions (10 channels, Response<T> type)
3. DevTools panel opens with "Sqlite" label
4. React Router HashRouter with routes `/`, `/openedDB/:dbname`, `/opfs`

---

## Implementation Plan

### 1. Update Manifest (src/manifest.ts)

**Changes Required**:

- Update extension name to "web-sqlite devtools"
- Add `activeTab` and `tabs` to permissions
- Ensure devtools_page points to "devtools.html" (already set)

**Before** (current state):

```typescript
name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ""}`,
// ...
permissions: ["sidePanel", "storage", "offscreen"],
```

**After**:

```typescript
name: "web-sqlite devtools",
// ...
permissions: ["sidePanel", "storage", "offscreen", "activeTab", "tabs"],
```

**Functional Considerations**:

- Keep the functional manifest definition style (using `defineManifest`)
- No classes or OOP patterns needed

---

### 2. Create Message Channels (src/messaging/channels.ts)

**New File**: `src/messaging/types.ts` - Create this for shared types
**Modify**: `src/messaging/channels.ts` - Add all 10 channels

**Channels to Define** (from API contract):

```typescript
// src/messaging/channels.ts

// 1. Database Inspection
export const GET_DATABASES = "GET_DATABASES";
export const GET_TABLE_LIST = "GET_TABLE_LIST";
export const GET_TABLE_SCHEMA = "GET_TABLE_SCHEMA";
export const QUERY_TABLE_DATA = "QUERY_TABLE_DATA";

// 2. Query Execution
export const EXEC_SQL = "EXEC_SQL";

// 3. Log Streaming
export const SUBSCRIBE_LOGS = "SUBSCRIBE_LOGS";
export const UNSUBSCRIBE_LOGS = "UNSUBSCRIBE_LOGS";
export const LOG_EVENT = "LOG_EVENT";

// 4. Migration & Seed Testing
export const DEV_RELEASE = "DEV_RELEASE";
export const DEV_ROLLBACK = "DEV_ROLLBACK";
export const GET_DB_VERSION = "GET_DB_VERSION";

// 5. OPFS File Browser
export const GET_OPFS_FILES = "GET_OPFS_FILES";
export const DOWNLOAD_OPFS_FILE = "DOWNLOAD_OPFS_FILE";

// 6. Connection & Health
export const HEARTBEAT = "HEARTBEAT";
export const ICON_STATE = "ICON_STATE";
```

**New File**: `src/messaging/types.ts`

```typescript
/**
 * Generic response wrapper for all message communications
 * @template T - The expected data type on success
 */
export interface Response<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Primitive types
export type SqlValue =
  | null
  | number
  | string
  | boolean
  | bigint
  | Uint8Array
  | ArrayBuffer;

export type SQLParams = SqlValue[] | Record<string, SqlValue>;

// Request/Response types for each channel
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

// ... (other types from message-types.md)
```

**Functional Considerations**:

- Use plain TypeScript interfaces and type aliases (no classes)
- Export const string literals for channel names (type-safe)
- Keep types in separate file for importability

---

### 3. Update DevTools Panel Entry (src/devtools/index.tsx)

**Changes Required**:

- Change panel creation label from "ReactCrx" to "Sqlite"
- Keep existing React root mounting

**Before** (current state):

```typescript
chrome.devtools.panels.create(
  "ReactCrx",
  "",
  "../../devtools.html",
  function () {
    console.log("devtools panel create");
  },
);
```

**After**:

```typescript
chrome.devtools.panels.create("Sqlite", "", "devtools.html", function () {
  console.log("Sqlite DevTools panel created");
});
```

---

### 4. Set Up React Router (src/devtools/DevTools.tsx)

**Changes Required**:

- Install react-router-dom
- Set up HashRouter with route structure
- Create basic route components

**First**, install react-router-dom (outside of code):

```bash
npm install react-router-dom
```

**New File**: `src/devtools/DevTools.tsx`

```typescript
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import "./DevTools.css";

/**
 * Root DevTools component with routing
 */
export const DevTools = () => {
  return (
    <HashRouter>
      <div className="h-screen w-screen flex">
        <Routes>
          {/* Default route - redirect to root */}
          <Route path="/" element={<div>Web Sqlite DevTools</div>} />

          {/* Database view routes (to be implemented in later tasks) */}
          <Route path="/openedDB/:dbname" element={<div>Database View</div>} />
          <Route path="/opfs" element={<div>OPFS Browser</div>} />

          {/* Catch-all - redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default DevTools;
```

**Functional Considerations**:

- Use functional components with hooks (no class components)
- Declarative route configuration with JSX
- HashRouter for Chrome extension context (per ADR-0002)

---

## Functional Design Notes

### Rationale for Functional Approach

All components use functional patterns:

- **State**: Use React hooks (useState, useEffect) - no class state
- **Routing**: Declarative JSX routes - no imperative navigation
- **Types**: TypeScript interfaces and type aliases - no classes
- **Messaging**: Pure functions for send/receive - no message class instances

### Exceptions (None)

No OOP patterns required for this task.

---

## Testing Checklist

- [ ] Manifest shows "web-sqlite devtools" in Chrome extensions page
- [ ] Permissions include "activeTab" and "tabs"
- [ ] DevTools panel appears with "Sqlite" label in Chrome DevTools drawer
- [ ] HashRouter routes work: navigate to `#/`, `#/openedDB/test`, `#/opfs`
- [ ] TypeScript compiles without errors
- [ ] All channel constants are accessible for import

---

## File Changes Summary

| File                        | Action | Description                       |
| --------------------------- | ------ | --------------------------------- |
| `src/manifest.ts`           | Modify | Update name and permissions       |
| `src/messaging/channels.ts` | Modify | Add 10 channel constants          |
| `src/messaging/types.ts`    | Create | Add Response<T> and message types |
| `src/devtools/index.tsx`    | Modify | Change panel label to "Sqlite"    |
| `src/devtools/DevTools.tsx` | Modify | Add HashRouter with routes        |
| `package.json`              | Modify | Add react-router-dom dependency   |
