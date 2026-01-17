---
type: feature-spec
id: F-019
title: Popup DevTools Status Indicator
status: Discovery
release: v1.4.0
owner: S1-IterationLead
created_at: 2026-01-18
---

# Feature F-019: Popup DevTools Status Indicator

## 1. Context & Goal

_Why are we building this? Who is it for?_

> As a developer, I want the extension popup to show whether the DevTools is active (has opened databases) or inactive (no databases), similar to Vue DevTools, so that I can quickly check the status without opening the full DevTools panel.

**Current Problem:**

- The extension popup (`src/popup/Popup.tsx`) currently displays a generic template counter application
- No integration with the extension's core functionality (database detection)
- No visual indication of whether web-sqlite-js is active on the current page
- Wasted opportunity to provide at-a-glance status information

**Desired Behavior:**

- Popup shows a simple logo (app icon) centered in the popup
- Logo changes based on database state (active/inactive icons already exist from F-016)
- Hovering over the logo reveals a status text tooltip
- Status text says "DevTools Active" when databases are opened, "No databases detected" when inactive
- Minimal, clean interface similar to Vue DevTools popup behavior

**User Story**: When I click the extension icon, I want to immediately see if the current page has opened databases, so I know whether to open the full DevTools panel.

## 2. Requirements (The "What")

### User Stories

- [ ] As a developer, I want the popup to show the app logo, so I can identify the extension.
- [ ] As a developer, I want the logo to show active (colored) when databases are opened, so I know the DevTools is useful on this page.
- [ ] As a developer, I want the logo to show inactive (grayscale) when no databases exist, so I know the page doesn't use web-sqlite-js.
- [ ] As a developer, I want to hover over the logo to see status text, so I can get more context about the state.
- [ ] As a developer, I want the status text to change based on state, so I understand what the icon means.

### Acceptance Criteria (DoD)

- [ ] **Popup Component Behavior**:
  - Remove existing template counter application
  - Display app logo centered in popup (logo-48.png or logo-48-inactive.png)
  - Logo size: 48x48px (or responsive 64x64px for better visibility)
  - Popup dimensions: 200x200px (compact, like Vue DevTools)

- [ ] **Icon State Display**:
  - Show active icon (logo-48.png) when current tab has databases opened
  - Show inactive icon (logo-48-inactive.png) when current tab has no databases
  - Query current tab's database state from background worker on mount

- [ ] **Hover Status Text**:
  - Status text appears on hover (tooltip style, below or on top of logo)
  - Active state text: "DevTools Active"
  - Inactive state text: "No databases detected"
  - Text style: Sans-serif, 12-14px, centered, gray-600 for readability
  - Smooth fade-in animation (150ms)

- [ ] **State Query Communication**:
  - Popup sends message to background worker: `{ type: "GET_TAB_DATABASE_STATUS" }`
  - Background worker responds with: `{ hasDatabase: boolean, databaseCount?: number }`
  - Use `chrome.runtime.sendMessage` for one-time query on popup open

- [ ] **Edge Cases**:
  - Popup opens before background worker is ready → show loading state, then query
  - Multiple rapid popup open/close → clean up message listeners
  - Current tab has no content script → show inactive state
  - Background worker not responding → default to inactive after timeout

### Non-Functional Requirements

- **Performance**: Popup must render within 100ms (no complex initialization)
- **Reliability**: Icon state always reflects current tab's database status
- **Clean Code**: Minimal component complexity (<100 lines), no external dependencies
- **Bundle Size**: Negligible increase (popup is separate entry point)
- **Accessibility**: ARIA labels for icon, keyboard focusable, screen reader support

## 3. Proposed Solution

### Architecture

**New Message Type**:

```typescript
// src/shared/messages.ts
export const GET_TAB_DATABASE_STATUS = "get-tab-database-status";

interface GetTabDatabaseStatusMessage {
  type: typeof GET_TAB_DATABASE_STATUS;
}
```

**Data Flow**:

```
┌─────────────────────────────────────────────────────────────┐
│  Extension Popup (on click)                                  │
│                                                              │
│  1. On mount: Send GET_TAB_DATABASE_STATUS to background    │
│  2. Receive response: { hasDatabase: boolean }              │
│  3. Set local state: hasDatabase                            │
│  4. Render appropriate icon + status text                   │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ chrome.runtime.sendMessage
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  Background Worker (receives message)                        │
│                                                              │
│  1. Query current active tab ID                             │
│  2. Look up in databaseMap (from F-017)                     │
│  3. Return { hasDatabase: (databases.length > 0) }          │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Details

#### 1. Shared Messages (Update)

```typescript
// src/shared/messages.ts
export const GET_TAB_DATABASE_STATUS = "get-tab-database-status";

export interface GetTabDatabaseStatusMessage {
  type: typeof GET_TAB_DATABASE_STATUS;
}

export interface TabDatabaseStatusResponse {
  hasDatabase: boolean;
  databaseCount?: number;
}
```

#### 2. Background Worker (Update)

```typescript
// src/background/iconState/index.ts

/**
 * Get database status for current tab
 * Used by popup to determine icon state
 */
export const getCurrentTabDatabaseStatus = async (): Promise<{
  hasDatabase: boolean;
  databaseCount?: number;
}> => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab?.id) {
        resolve({ hasDatabase: false });
        return;
      }

      const databases = databaseMap.get(activeTab.id) || [];
      resolve({
        hasDatabase: databases.length > 0,
        databaseCount: databases.length,
      });
    });
  });
};
```

#### 3. Background Worker Message Handler (Update)

```typescript
// src/background/index.ts

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ... existing handlers ...

  // Popup database status query
  if (message?.type === GET_TAB_DATABASE_STATUS) {
    getCurrentTabDatabaseStatus().then((status) => {
      sendResponse(status);
    });
    return true; // Async response
  }
});
```

#### 4. Popup Component (New Implementation)

```typescript
// src/popup/Popup.tsx

import { useState, useEffect } from "react";
import "./Popup.css";

const ACTIVE_ICON = "img/logo-48.png";
const INACTIVE_ICON = "img/logo-48-inactive.png";

export const Popup = () => {
  const [hasDatabase, setHasDatabase] = useState<boolean | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Query background for current tab's database status
    chrome.runtime.sendMessage(
      { type: "GET_TAB_DATABASE_STATUS" },
      (response) => {
        if (response) {
          setHasDatabase(response.hasDatabase);
        }
      }
    );
  }, []);

  const handleMouseEnter = () => setShowStatus(true);
  const handleMouseLeave = () => setShowStatus(false);

  // Loading state
  if (hasDatabase === null) {
    return (
      <main className="popup-container">
        <div className="loading-spinner" />
      </main>
    );
  }

  const iconSrc = hasDatabase ? ACTIVE_ICON : INACTIVE_ICON;
  const statusText = hasDatabase
    ? "DevTools Active"
    : "No databases detected";

  return (
    <main
      className="popup-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={iconSrc}
        alt="Web SQLite DevTools"
        className="popup-logo"
        title={statusText}
      />
      {showStatus && (
        <div className="popup-status" role="status" aria-live="polite">
          {statusText}
        </div>
      )}
    </main>
  );
};

export default Popup;
```

#### 5. Popup Styles (Update)

```css
/* src/popup/Popup.css */

.popup-container {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.popup-logo {
  width: 64px;
  height: 64px;
  cursor: pointer;
  transition: transform 150ms ease-in-out;
}

.popup-logo:hover {
  transform: scale(1.1);
}

.popup-status {
  font-size: 13px;
  color: #4b5563; /* gray-600 */
  text-align: center;
  padding: 4px 8px;
  border-radius: 4px;
  animation: fadeIn 150ms ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top-color: #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

#### 6. Manifest (Update)

```json
{
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "img/logo-16.png",
      "32": "img/logo-32.png",
      "48": "img/logo-48.png",
      "128": "img/logo-128.png"
    }
  }
}
```

## 4. Implementation Notes

### Files Changed

| File                                | Change Description                                      | Complexity |
| ----------------------------------- | ------------------------------------------------------- | ---------- |
| `src/shared/messages.ts`            | Add GET_TAB_DATABASE_STATUS message type                | Low        |
| `src/background/iconState/index.ts` | Add getCurrentTabDatabaseStatus() function              | Low        |
| `src/background/index.ts`           | Add message handler for GET_TAB_DATABASE_STATUS         | Low        |
| `src/popup/Popup.tsx`               | Complete rewrite (remove counter, add logo + status)    | Low        |
| `src/popup/Popup.css`               | Update styles for new layout                            | Low        |
| `public/manifest.json`              | Verify default_popup configuration (likely already set) | Low        |

### Effort Estimation

| Phase                    | Time          |
| ------------------------ | ------------- |
| Add message type         | 0.2 hours     |
| Update background worker | 0.3 hours     |
| Rewrite popup component  | 0.5 hours     |
| Update popup styles      | 0.3 hours     |
| Testing                  | 0.3 hours     |
| Documentation            | 0.2 hours     |
| **Total**                | **1.8 hours** |

### Risk Assessment

- **Risk Level**: LOW
- **Mitigation**:
  - Simple implementation, reuses existing databaseMap from F-017
  - No breaking changes to existing functionality
  - Popup is isolated component (no impact on DevTools panel)
  - Fallback to inactive state if query fails

## 5. Open Questions

None - requirements are clear and architecture is straightforward.

## 6. References

- **F-016**: SVG to PNG Logo Generator (provides active/inactive icons)
- **F-017**: Icon State Per Tab (provides databaseMap infrastructure)
- **Vue DevTools**: Reference implementation for minimal popup status indicator
