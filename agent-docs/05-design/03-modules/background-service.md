<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/05-design/03-modules/01-module-template.md

OUTPUT MAP (write to)
agent-docs/05-design/03-modules/background-service.md

NOTES
- Keep headings unchanged.
- Low-Level Design for a specific module.
-->

# Module: Background Service Worker

## 0) File Tree (Design + Code)

```text
agent-docs/05-design/03-modules/background-service.md
src/background/
  index.ts                 # Entry point, service worker
  iconState/
    index.ts               # Icon state management
```

## 1) Assets (Traceability)

- **API**: Handles icon state updates, database list updates, and log forwarding (F-018 UPDATED)
- **Events**: Handles `ICON_STATE_MESSAGE`, `DATABASE_LIST_MESSAGE`, `LOG_ENTRY_MESSAGE` from content script
- **Types**: See `src/shared/messages.ts`

## 2) Responsibilities

- Update popup icon based on database availability
- Track databaseMap per tab for icon state (F-017)
- Forward DATABASE_LIST_MESSAGE to DevTools panel (F-018 NEW)
- Forward LOG_ENTRY_MESSAGE to DevTools panel (F-018 NEW)
- Initialize offscreen document for log storage (internal)
- Manage extension lifecycle on install/update

## 3) Internal Logic (Flow)

### Icon State Update Flow

```mermaid
flowchart TD
    CS[Content Script] -->|ICON_STATE_MESSAGE| BG[Background]
    BG -->|hasDatabase| UI[Update Icon]
    UI -->|true| Active[Active Icon]
    UI -->|false| Inactive[Inactive Icon]
```

### Offscreen Setup Flow

```mermaid
flowchart TD
    BG[Background startup] --> OS[Check offscreen document]
    OS -->|missing| Create[Create offscreen.html]
    OS -->|present| Done[No-op]
```

### DevTools Panel Message Forwarding (F-018 NEW)

```mermaid
flowchart TD
    CS[Content Script] -->|DATABASE_LIST_MESSAGE| BG[Background Worker]
    BG -->|Update databaseMap| Icon[Icon State]
    BG -->|Forward message| Panel[DevTools Panel]
    Panel -->|useDatabaseList hook| UI[OpenedDBList Update]

    CS -->|LOG_ENTRY_MESSAGE| BG
    BG -->|Forward enriched entry| Panel
    Panel -->|useLogStreaming hook| Log[LogTab Filter]
    Log -->|database filter| Display[Filtered Logs]
```

## 4) Classes / Functions

### Service Worker (src/background/index.ts)

- **setupOffscreen()**
  - Creates offscreen document for log storage
  - Retries in dev mode if load fails

- **onMessage** (F-018 UPDATED)
  - Handle `ICON_STATE_MESSAGE` → Update icon state via `setIconState`
  - Handle `DATABASE_LIST_MESSAGE` → Update databaseMap AND forward to DevTools panel
  - Handle `LOG_ENTRY_MESSAGE` → Forward enriched entry to DevTools panel

### Message Forwarding Functions (F-018 NEW)

- **forwardToDevToolsPanel(message, tabId)**
  - Forwards message to DevTools panel via chrome.runtime.sendMessage
  - Filters by tabId to ensure correct panel receives message
  - Returns: `void`

### Icon State Management (src/background/iconState/)

- **setIconState(hasDatabase)**
  - Sets `active` or `inactive` icon
  - Returns: `void`

## 5) Dependencies

- **External**: None (vanilla TypeScript)
- **Internal**: `src/shared/messages.ts`
- **Chrome APIs**: chrome.runtime, chrome.action, chrome.offscreen

### Icon Assets

- Active icon: `public/img/logo-48.png`
- Inactive icon: `public/img/logo-48-inactive.png`
