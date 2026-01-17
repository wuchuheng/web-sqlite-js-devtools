---
type: feature-spec
id: F-017
title: Icon State Per Tab
status: Completed
release: v1.3.1
owner: S1-IterationLead
created_at: 2026-01-17
completed_at: 2026-01-17
---

# Feature F-017: Icon State Per Tab

## 1. Context & Goal

_Why are we building this? Who is it for?_

> As a user, I want the extension icon to correctly show active (colored) or inactive (grayscale) based on whether the CURRENT tab has opened databases, so that I can quickly see which tabs are using web-sqlite-js.

**Current Problem:**

- Extension icon state is global, not per-tab
- When switching between tabs, the icon doesn't update
- Icon might show active even when current tab has no databases

**Desired Behavior:**

- Icon shows active (colored) when current tab has databases opened
- Icon shows inactive (grayscale) when current tab has no databases
- Icon updates immediately when switching tabs

**User Story**: When I switch tabs, the extension icon should reflect the database status of the CURRENT tab, not the previous tab.

## 2. Requirements (The "What")

### User Stories

- [ ] As a user, I want the extension icon to show active when the current tab has databases, so I know web-sqlite-js is in use.
- [ ] As a user, I want the extension icon to show inactive when the current tab has no databases, so I know the tab doesn't use web-sqlite-js.
- [ ] As a user, I want the icon to update when I switch tabs, so it always reflects the current tab's status.

### Acceptance Criteria (DoD)

- [ ] **Content Script Behavior**:
  - Send `DATABASE_LIST_MESSAGE` to background on load with database list
  - If `window.__web_sqlite` exists, send list of database names from `databases` property
  - Listen for `window.__web_sqlite` to be set (if not available on load)
  - When database list changes, send updated list to background

- [ ] **Background Worker Behavior**:
  - Maintain a Map of `tabId -> string[]` (database names)
  - Update map when receiving `DATABASE_LIST_MESSAGE` from content script
  - Listen for tab activation (`chrome.tabs.onActivated`)
  - When tab switches, check map and update icon based on that tab's database list
  - If tab has databases → show active icon
  - If tab has no databases (or not in map) → show inactive icon

- [ ] **Edge Cases**:
  - Content script loads before `window.__web_sqlite` is available → use `Object.defineProperty` to watch for it
  - Tab with no content script loaded → show inactive icon
  - Content script unloaded (tab closed) → clean up map entry
  - Multiple rapid tab switches → each switch updates icon correctly

### Non-Functional Requirements

- **Performance**: Minimal overhead (simple Map lookup on tab switch)
- **Reliability**: Icon always reflects current tab state
- **Clean Code**: Elegant, readable implementation
- **Bundle Size**: Negligible increase

## 3. Proposed Solution

### Architecture

**Message Type**:

```typescript
DATABASE_LIST_MESSAGE = "database-list";

interface DatabaseListMessage {
  type: typeof DATABASE_LIST_MESSAGE;
  databases: string[]; // Array of database names (empty if none)
}
```

**Data Flow**:

```
┌─────────────────────────────────────────────────────────────┐
│  Content Script (per tab)                                    │
│                                                              │
│  1. On load: Check window.__web_sqlite                       │
│  2. If exists: Send DATABASE_LIST_MESSAGE with db names     │
│  3. If not exists: Watch for __web_sqlite to be set         │
│  4. Subscribe to onDatabaseChange → Send updated list       │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ chrome.runtime.sendMessage
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Background Worker (singleton)                               │
│                                                              │
│  1. Maintain: Map<tabId, string[]> databaseMap              │
│  2. On DATABASE_LIST_MESSAGE: Update map for sender tab     │
│  3. On tab switch: Look up tab in map, update icon          │
│  4. On tab close: Remove from map                           │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Details

#### 1. Shared Messages

```typescript
// src/shared/messages.ts
export const DATABASE_LIST_MESSAGE = "database-list";

export interface DatabaseListMessage {
  type: typeof DATABASE_LIST_MESSAGE;
  databases: string[];
}
```

#### 2. Content Script

```typescript
// src/contentScript/App.tsx

import { DATABASE_LIST_MESSAGE, ICON_STATE_MESSAGE } from "@/shared/messages";

export default function App() {
  useEffect(() => {
    /**
     * Send database list to background worker
     */
    const sendDatabaseList = () => {
      const webSqlite = window.__web_sqlite;
      const databases = webSqlite?.databases
        ? Object.keys(webSqlite.databases)
        : [];

      chrome.runtime.sendMessage({
        type: DATABASE_LIST_MESSAGE,
        databases,
      });

      // Also send icon state for backward compatibility
      chrome.runtime.sendMessage({
        type: ICON_STATE_MESSAGE,
        hasDatabase: databases.length > 0,
      });
    };

    // Initial send
    sendDatabaseList();

    // If __web_sqlite not available yet, watch for it
    if (!window.__web_sqlite) {
      Object.defineProperty(window, "__web_sqlite", {
        configurable: true,
        set(value) {
          // @ts-expect-error - setting the property
          this._web_sqlite = value;
          sendDatabaseList();
        },
        get() {
          // @ts-expect-error - getting the property
          return this._web_sqlite;
        },
      });
    }

    // Subscribe to database changes
    const webSqlite = window.__web_sqlite;
    if (webSqlite?.onDatabaseChange) {
      webSqlite.onDatabaseChange(sendDatabaseList);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return null;
}
```

#### 3. Background Worker

```typescript
// src/background/iconState/index.ts

import { DATABASE_LIST_MESSAGE } from "@/shared/messages";

/**
 * Map of tab ID to database list
 * Key: tabId (number)
 * Value: array of database names (string[])
 */
const databaseMap = new Map<number, string[]>();

/**
 * Update icon state based on tab's database list
 */
export const updateIconForTab = (tabId: number): void => {
  const databases = databaseMap.get(tabId);
  const hasDatabase = databases && databases.length > 0;
  setIconState(hasDatabase);
  console.log(
    `[Icon State] Tab ${tabId}: ${hasDatabase ? "active" : "inactive"} (${databases?.length || 0} databases)`,
  );
};

/**
 * Handle database list message from content script
 */
export const handleDatabaseListMessage = (
  tabId: number,
  databases: string[],
): void => {
  databaseMap.set(tabId, databases);
  console.log(
    `[Icon State] Updated tab ${tabId}: ${databases.length} databases`,
  );

  // Update icon if this is the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id === tabId) {
      updateIconForTab(tabId);
    }
  });
};

/**
 * Clean up when tab is closed
 */
export const cleanupTab = (tabId: number): void => {
  databaseMap.delete(tabId);
  console.log(`[Icon State] Cleaned up tab ${tabId}`);
};
```

```typescript
// src/background/index.ts

import {
  setIconState,
  updateIconForTab,
  handleDatabaseListMessage,
  cleanupTab,
} from "./iconState";
import { DATABASE_LIST_MESSAGE, ICON_STATE_MESSAGE } from "@/shared/messages";

// ... existing code ...

// Message listener
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type === ICON_STATE_MESSAGE) {
    setIconState(Boolean(message.hasDatabase));
  }

  if (message?.type === DATABASE_LIST_MESSAGE && sender.tab?.id) {
    handleDatabaseListMessage(sender.tab.id, message.databases);
  }

  if (message?.type === "request") {
    setupOffscreen();
  }
});

// Tab activation listener
chrome.tabs.onActivated.addListener(({ tabId }) => {
  console.log(`[Background] Tab switched to ${tabId}`);
  updateIconForTab(tabId);
});

// Tab removal listener
chrome.tabs.onRemoved.addListener((tabId) => {
  cleanupTab(tabId);
});
```

## 4. Implementation Notes

### Files Changed

| File                                | Change                                                                           | Complexity |
| ----------------------------------- | -------------------------------------------------------------------------------- | ---------- |
| `src/shared/messages.ts`            | Add `DATABASE_LIST_MESSAGE` constant and type                                    | Low        |
| `src/contentScript/App.tsx`         | Add database list sending, watch for `__web_sqlite`, subscribe to changes        | Low        |
| `src/background/iconState/index.ts` | Add `databaseMap`, `updateIconForTab`, `handleDatabaseListMessage`, `cleanupTab` | Low        |
| `src/background/index.ts`           | Add tab activation/removal listeners                                             | Low        |

### Effort Estimation

| Phase                    | Time       |
| ------------------------ | ---------- |
| Add message type         | 0.1 hours  |
| Update content script    | 0.3 hours  |
| Update background worker | 0.3 hours  |
| Testing                  | 0.3 hours  |
| **Total**                | **1 hour** |

### Risk Assessment

- **Risk Level**: LOW
- **Mitigation**: Simple implementation, minimal changes, well-defined message protocol

## 5. Open Questions

None - requirements are clear.
