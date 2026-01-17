---
type: feature-spec
id: F-017
title: Real-time Database Status Updates
status: Draft
release: v1.3.1
owner: S1-IterationLead
created_at: 2026-01-17
---

# Feature F-017: Real-time Database Status Updates

## 1. Context & Goal

_Why are we building this? Who is it for?_

> As a developer using the Web SQLite DevTools Extension, I want the database list in the DevTools panel to automatically update when databases are opened or closed in the inspected page, so that I can see the current database status in real-time without manually refreshing.

**Current Problem:**

- The database list (sidebar and `/openedDB` route) only updates when manually refreshed
- The content script already listens to `onDatabaseChange` but only uses it for icon state
- Database open/close events are detected but not communicated to the DevTools panel

**Desired Behavior:**

- Content script listens to `window.__web_sqlite.onDatabaseChange()` for database events
- When a database is opened/closed, send message to DevTools panel with updated status
- DevTools panel automatically refreshes the database list upon receiving status change
- Icon state continues to work as before (active when databases exist, inactive when none)

**User Story**: As a developer, I want the DevTools panel to show real-time database status, so that when I open/close a database in my app, the DevTools panel immediately reflects the change.

## 2. Requirements (The "What")

### User Stories

- [ ] As a developer, I want the database list to auto-refresh when databases are opened/closed, so that I don't have to manually click refresh.
- [ ] As a developer, I want the extension icon to reflect whether ANY databases are open, so that I can quickly check if the page uses web-sqlite-js.

### Acceptance Criteria (DoD)

- [ ] **Happy Path**:
  - Content script subscribes to `window.__web_sqlite.onDatabaseChange()` on page load
  - When a database is opened, content script sends `DATABASE_STATUS_MESSAGE` to DevTools
  - When a database is closed, content script sends `DATABASE_STATUS_MESSAGE` to DevTools
  - DevTools panel receives message and triggers `DatabaseRefreshContext` refresh
  - Database list (sidebar and `/openedDB`) auto-updates with new database list
  - Extension icon updates to active (colored) when databases exist, inactive when none
- [ ] **Event Details**:
  - Message includes: `action` ("opened" | "closed"), `dbName` (string), `databases` (string[] - all current DB names)
  - DevTools panel can access the full list of current database names from the event
- [ ] **Edge Cases**:
  - If `window.__web_sqlite` is not available, no subscription is attempted
  - If `onDatabaseChange` is not available, icon state still works on initial load
  - Multiple rapid database changes are debounced (max 1 refresh per second)
  - DevTools panel handles message when not on database-related routes (no-op)
- [ ] **Backward Compatibility**:
  - Icon state behavior unchanged (active when databases exist, inactive when none)
  - Manual refresh button still works
  - Existing database list fetching via `databaseService.getDatabases()` still works

### Non-Functional Requirements

- **Performance**: Debounce rapid database changes to avoid excessive re-renders (max 1 refresh/sec)
- **Reliability**: Message delivery guaranteed via Chrome runtime messaging
- **Maintainability**: Reuse existing `DatabaseRefreshContext` for triggering updates
- **Bundle Size**: Minimal increase (new message type, small listener setup)

## 3. Proposed Solution

### Architecture Approach

**Option A: Runtime Message + Context Refresh (Recommended)**

1. **Content Script Enhancement**:
   - Subscribe to `window.__web_sqlite.onDatabaseChange()` (already exists)
   - Send new `DATABASE_STATUS_MESSAGE` to DevTools panel on each event
   - Include event details: `{ action, dbName, databases }`

2. **DevTools Panel Enhancement**:
   - Add runtime message listener for `DATABASE_STATUS_MESSAGE`
   - Trigger `DatabaseRefreshContext.triggerRefresh()` on message received
   - Existing components (Sidebar, OpenedDBList) auto-update via `refreshVersion` dependency

3. **Icon State (Unchanged)**:
   - Continue using existing `ICON_STATE_MESSAGE` for icon updates
   - Background service worker handles icon state as before

**Why This Approach:**

- Minimal code changes (content script already has `onDatabaseChange` listener)
- Reuses existing `DatabaseRefreshContext` (no new state management)
- Clean separation: content script detects changes, DevTools panel updates UI
- Debouncing built into `DatabaseRefreshContext` (100ms delay between triggers)

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Inspected Page (window.__web_sqlite)                            │
│                                                                  │
│  1. App calls openDB("mydb.sqlite3")                            │
│  2. web-sqlite-js emits DatabaseChangeEvent                     │
│     { action: "opened", dbName: "mydb.sqlite3", databases: [...] │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Content Script (src/contentScript/App.tsx)                      │
│                                                                  │
│  1. onDatabaseChange callback invoked                           │
│  2. Extract event: { action, dbName, databases }                │
│  3. Send DATABASE_STATUS_MESSAGE to DevTools panel              │
│     chrome.runtime.sendMessage({                                 │
│       type: DATABASE_STATUS_MESSAGE,                            │
│       action: "opened",                                         │
│       dbName: "mydb.sqlite3",                                   │
│       databases: ["mydb.sqlite3", ...]                          │
│     })                                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  DevTools Panel (src/devtools/DevTools.tsx)                     │
│                                                                  │
│  1. Listen for DATABASE_STATUS_MESSAGE                          │
│  2. Call triggerRefresh() from DatabaseRefreshContext           │
│  3. Increment refreshVersion                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Components (Auto-update via refreshVersion dependency)          │
│                                                                  │
│  • Sidebar/DatabaseList → Re-fetches database list               │
│  • OpenedDBList → Re-fetches database list                      │
│  • All consumers of databaseService.getDatabases() → Update    │
└─────────────────────────────────────────────────────────────────┘
```

### Technical Implementation Details

#### 1. New Message Type

```typescript
// src/shared/messages.ts
export const DATABASE_STATUS_MESSAGE = "DATABASE_STATUS";

export interface DatabaseStatusMessage {
  type: typeof DATABASE_STATUS_MESSAGE;
  action: "opened" | "closed";
  dbName: string;
  databases: string[]; // All currently opened database names
}
```

#### 2. Content Script Changes

**File**: `src/contentScript/App.tsx`

```typescript
// Add new message type
import { DATABASE_STATUS_MESSAGE } from "@/shared/messages";

// In useEffect, modify the updateIconState function:
const updateIconState = () => {
  const webSqlite = window.__web_sqlite;
  const hasDatabase =
    webSqlite?.databases && Object.keys(webSqlite.databases).length > 0;

  // Icon state (existing)
  chrome.runtime.sendMessage({
    type: ICON_STATE_MESSAGE,
    hasDatabase,
  });
};

// NEW: Send detailed status to DevTools panel
const notifyDatabaseStatus = (event: DatabaseChangeEvent) => {
  chrome.runtime.sendMessage({
    type: DATABASE_STATUS_MESSAGE,
    action: event.action,
    dbName: event.dbName,
    databases: event.databases,
  });
};

// Subscribe to onDatabaseChange with detailed event handling
if (webSqlite?.onDatabaseChange) {
  webSqlite.onDatabaseChange((event) => {
    // Update icon state (existing behavior)
    updateIconState();
    // Notify DevTools panel of detailed status (NEW)
    notifyDatabaseStatus(event);
  });
}
```

#### 3. DevTools Panel Changes

**File**: `src/devtools/DevTools.tsx`

```typescript
import { DATABASE_STATUS_MESSAGE } from "@/shared/messages";
import { useDatabaseRefresh } from "./contexts/DatabaseRefreshContext";

export default function DevTools() {
  const { triggerRefresh } = useDatabaseRefresh();

  useEffect(() => {
    // Listen for database status changes from content script
    const onMessage = (message: unknown) => {
      if (
        typeof message === "object"
        && message !== null
        && "type" in message
        && message.type === DATABASE_STATUS_MESSAGE
      ) {
        console.log("[DevTools] Database status changed:", message);
        // Trigger refresh - all database lists will auto-update
        triggerRefresh();
      }
    };

    chrome.runtime.onMessage.addListener(onMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, [triggerRefresh]);

  // ... rest of DevTools component
}
```

## 4. Implementation Notes

### Dependencies

- **Existing Features**: None (builds on F-001 Service Layer, F-008 Opened DB List)
- **API Requirements**: `window.__web_sqlite.onDatabaseChange` (already available in web-sqlite-js v2.1.0+)
- **Chrome APIs**: `chrome.runtime.sendMessage`, `chrome.runtime.onMessage` (already in use)

### File Changes

| File                        | Change                                                                 | Complexity |
| --------------------------- | ---------------------------------------------------------------------- | ---------- |
| `src/shared/messages.ts`    | Add `DATABASE_STATUS_MESSAGE` constant                                 | Low        |
| `src/contentScript/App.tsx` | Add `notifyDatabaseStatus` function, modify `onDatabaseChange` handler | Low        |
| `src/devtools/DevTools.tsx` | Add `chrome.runtime.onMessage` listener for `DATABASE_STATUS_MESSAGE`  | Low        |
| `src/types/global.ts`       | No changes (already has `DatabaseChangeEvent` type)                    | None       |

### Effort Estimation

| Phase                                         | Time       |
| --------------------------------------------- | ---------- |
| Add message type constant                     | 0.1 hours  |
| Update content script to send detailed status | 0.3 hours  |
| Add DevTools panel message listener           | 0.3 hours  |
| Testing & verification                        | 0.3 hours  |
| **Total**                                     | **1 hour** |

### Risk Assessment

- **Risk Level**: LOW
- **Mitigation**:
  - Reuses existing `onDatabaseChange` subscription
  - Reuses existing `DatabaseRefreshContext` for updates
  - Minimal code changes (3 files, ~20 lines of code)
  - Backward compatible (manual refresh still works)
  - Graceful degradation if `onDatabaseChange` not available

## 5. Open Questions

None - requirements are clear based on user input.

## 6. References

- **Existing Feature**: F-001 (Service Layer), F-008 (Opened Database List Route)
- **API Documentation**: `src/types/global.ts` (WebSqliteNamespace, DatabaseChangeEvent)
- **Current Implementation**: `src/contentScript/App.tsx` (icon state detection)
