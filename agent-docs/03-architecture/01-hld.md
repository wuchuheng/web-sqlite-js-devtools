<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/03-architecture/01-hld.md

OUTPUT MAP (write to)
agent-docs/03-architecture/01-hld.md

NOTES
- Keep headings unchanged.
- Focus on STATIC STRUCTURE but include RATIONALE and STRATEGY.
-->

# 01 High-Level Design (HLD) — Structure

## 1) Architecture Style & Principles

- **Pattern**: **DevTools Inspected Window Access with Service Layer**
  - DevTools Panel → Service Layer (Business Logic) → Bridge Layer (Chrome API) → Page Context (`window.__web_sqlite`)
  - Content script retained only for icon state updates
- **Key Principles**:
  - **Separation of Concerns**: Three-layer architecture (Presentation → Service → Bridge)
  - **Context Isolation**: DevTools accesses the page via inspected window eval (chrome.scripting.executeScript)
  - **Minimal Messaging**: Runtime messaging only for icon state updates
  - **Hash-Based Routing**: Single-page application navigation via URL hash (react-router-dom)
  - **Real-Time Updates**: Polling/requests via eval (streaming TBD)
  - **Stateless Panel**: DevTools panel can be closed/reopened without losing page context

## 2) System Boundary (C4 Context)

- **Users**: Frontend developers, full-stack developers, QA engineers using Chrome DevTools
- **External Systems**: web-sqlite-js library (via `window.__web_sqlite` global namespace)

```mermaid
C4Context
  title System Context Diagram
  Person(dev, "Developer", "Debugs SQLite databases")
  System(ext, "Web SQLite DevTools", "Chrome DevTools Extension")
  System_Ext(page, "Web Application", "Uses web-sqlite-js")
  System_Ext(lib, "web-sqlite-js", "SQLite WASM Library")

  Rel(dev, ext, "Opens DevTools Panel")
  Rel(ext, page, "DevTools eval access + icon state content script")
  Rel(page, lib, "Uses DB API")
```

## 3) Containers & Tech Stack (C4 Container)

- **DevTools Panel**: React 18 + TypeScript + Tailwind CSS + react-router-dom
  - **Reason**: Leverages existing template, provides declarative UI and routing
- **Content Script**: TypeScript + Chrome Extension APIs
  - **Reason**: Monitors `window.__web_sqlite` for icon state updates
- **Background Service Worker**: TypeScript + Chrome Extension APIs
  - **Reason**: Manages extension lifecycle, icon state, and offscreen logging
- **Routing**: react-router-dom (HashRouter)
  - **Reason**: Hash-based routing required for DevTools panel URLs
- **SQL Editor**: CodeMirror 6
  - **Reason**: Full-featured code editor with SQL syntax highlighting
- **Icons**: react-icons
  - **Reason**: Comprehensive icon library, tree-shakeable

```mermaid
C4Container
  title Container Diagram
  Container(panel, "DevTools Panel", "React + TS", "UI: Tables, Queries, Logs, OPFS")
  Container(bg, "Background SW", "TypeScript", "Icon State, Extension Lifecycle")
  Container(cs, "Content Script", "TypeScript", "Icon State Monitor")
  System_Ext(page, "Web Page", "web-sqlite-js", "SQLite Databases")
  System_Ext(opfs, "OPFS", "Browser API", "File System Access")

  Rel(panel, page, "chrome.scripting.executeScript (MAIN world)")
  Rel(cs, page, "Detects window.__web_sqlite")
  Rel(cs, opfs, "navigator.storage.getDirectory")
```

## 4) Data Architecture Strategy

- **Ownership**: DevTools panel accesses `window.__web_sqlite` via service layer; content script only tracks icon state
- **Caching**:
  - Table list: Cached in DevTools panel until database changes
  - Query results: Not cached (always fresh from database)
  - Log entries: Ring buffer (500 entries) in content script, streamed to panel
- **Consistency**: Strong consistency for queries (synchronous request/response); eventual for logs (streaming)
- **State Management**:
  - React useState for local component state
  - React Router location state for route-based state
  - No global state management library (avoid bundle size)

## 5) Cross-cutting Concerns (Implementation View)

### 5.1 Message Protocol

- **DevTools Data Access**: Uses service layer → bridge layer → `chrome.scripting.executeScript`
- **Runtime Messaging**: Only icon state updates and offscreen log storage
- **Error Handling**: Standard `{ success: boolean, data?: T, error?: string }` response format (ServiceResponse)

### 5.2 Reconnection Strategy

- **Heartbeat**: DevTools panel evaluates `window.__web_sqlite` every 5 seconds
- **Timeout**: DevTools panel shows error after 15 seconds without successful eval
- **Auto-Reconnect**: Panel attempts to reconnect on route change or user action
- **Page Refresh**: Panel detects refresh via failed eval and retries

### 5.3 Observability

- **Logs**: Internal extension logs to console.debug (DevTools only)
- **Error Tracking**: Error boundaries in React, log to console.error
- **Performance**: Measure panel open time, query execution time

### 5.4 Security

- **Permissions**: Minimal Chrome permissions (sidePanel, storage, offscreen, scripting)
- **Content Security Policy**: Strict CSP for extension pages
- **Eval Usage**: Only `chrome.scripting.executeScript` within DevTools (MAIN world)

## 6) Code Structure Strategy (High-Level File Tree)

**Repo Structure**: Monorepo (single Chrome extension)

```text
/ (root)
  /src
    /devtools           # DevTools Panel (React)
      /bridge           # Bridge Layer (Chrome API wrapper)
        inspectedWindow.ts    # chrome.scripting.executeScript wrapper
      /services         # Service Layer (Business Logic)
        databaseService.ts    # All database operations (10 functions)
      /components       # React components
        /Sidebar        # Sidebar navigation
        /TableTab       # Table browser
        /QueryTab       # SQL editor
        /LogTab         # Log viewer
        /MigrationTab   # Migration playground
        /SeedTab        # Seed playground
        /AboutTab       # Database info
        /OPFSBrowser    # OPFS file tree
      /hooks            # Custom React hooks
      /utils            # Utilities
      inspectedWindow.ts # Public API re-exports
      DevTools.tsx      # Main DevTools component
      index.tsx         # Entry point
    /contentScript      # Content Script (Icon State)
      App.tsx           # Icon state updater
      index.tsx         # Entry point
    /background         # Background Service Worker
      /iconState        # Icon activation logic
      index.ts          # Entry point
    /messaging          # Offscreen log channels
      channels.ts       # Offscreen log channels
      core.ts           # Channel core
    /shared             # Shared constants
      messages.ts       # Runtime message IDs
    /components         # Shared React components
      /CodeMirrorEditor # Reusable SQL editor
      /DataTable        # Reusable table display
    /types              # TypeScript type definitions
    /utils              # Shared utilities
  /public
    /icons              # Extension icons (active/inactive states)
  agent-docs            # Architecture documentation
```

**Module Pattern**: Three-layer architecture (Presentation → Service → Bridge)

```text
/src/devtools
  /components          # Presentation Layer (React components)
  /hooks               # Custom hooks (useConnection, useInspectedWindowRequest)
  /services            # Service Layer (Business Logic)
    databaseService.ts # Domain logic for all DB operations
  /bridge              # Bridge Layer (Chrome API)
    inspectedWindow.ts # Low-level executeScript wrapper
  inspectedWindow.ts   # Public API layer (re-exports)
/src/contentScript
  App.tsx              # Icon state monitor
/src/background
  /iconState           # Icon State Management
/src/shared
  messages.ts          # Runtime message IDs
```

**Service Layer Functions** (all in `databaseService.ts`):

1. **Database Discovery**: `getDatabases()` - List all open databases
2. **Table Metadata**: `getTableList(dbname)` - List tables in a database
3. **Schema Inspection**: `getTableSchema(dbname, tableName)` - Get table structure (PRAGMA table_info)
4. **Query Execution**: `queryTableData(dbname, sql, limit, offset)` - Execute SELECT with pagination
5. **SQL Execution**: `execSQL(dbname, sql, params?)` - Execute any SQL with optional params
6. **Log Streaming**: `subscribeLogs(dbname)` / `unsubscribeLogs(subscriptionId)` - Real-time log monitoring
7. **Migration Testing**: `devRelease(dbname, version, migrationSQL?, seedSQL?)` - Test migrations
8. **Version Control**: `devRollback(dbname, toVersion)` - Rollback to previous version
9. **Version Query**: `getDbVersion(dbname)` - Get current database version
10. **OPFS Access**: `getOpfsFiles(path?, dbname?)` / `downloadOpfsFile(path)` - File system operations

## 7) Component Hierarchy (DevTools Panel)

```text
DevTools (Root)
├── HashRouter
│   ├── Sidebar (Navigation)
│   │   ├── SidebarHeader (App branding)
│   │   ├── DatabaseList (Opened DB menu)
│   │   ├── OPFSLink (OPFS browser link)
│   │   └── CollapseToggle (Sidebar collapse)
│   └── MainContent
│       ├── EmptyState (No route selected)
│       ├── DatabaseView (/openedDB/:dbname)
│       │   ├── TabNavigation (6 tabs)
│       │   └── TabContent
│       │       ├── TableTab
│       │       │   ├── TableList (Left column)
│       │       │   ├── MultiTableHeader (Tab bar)
│       │       │   ├── TableContent (Data + DDL)
│       │       │   └── PaginationBar
│       │       ├── QueryTab
│       │       │   ├── CodeMirrorEditor
│       │       │   ├── QueryResults
│       │       │   └── ExportButton
│       │       ├── LogTab
│       │       │   ├── LogFilter
│       │       │   └── LogList (500 entry ring buffer)
│       │       ├── MigrationTab
│       │       │   ├── HelperNotice
│       │       │   ├── CodeMirrorEditor
│       │       │   └── TestControls (Release/Rollback)
│       │       ├── SeedTab
│       │       │   ├── HelperNotice
│       │       │   ├── CodeMirrorEditor
│       │       │   └── TestControls (Release/Rollback)
│       │       └── AboutTab
│       │           └── DatabaseMetadata
│       └── OPFSView (/opfs)
│           └── FileTree
│               ├── FileNode (Lazy-loaded)
│               └── DownloadButton
```

## 8) Service Layer Architecture (Feature F-001)

**Purpose**: Centralize all database business logic in a single service layer, eliminating direct inspectedWindow access from components.

**Three-Layer Pattern**:

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation Layer (Components)                            │
│  - React UI components                                      │
│  - No Chrome API or business logic                          │
│  - Imports: databaseService                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Service Layer (Business Logic)                             │
│  - databaseService.ts                                       │
│  - Domain operations: queries, migrations, logs, OPFS       │
│  - Uses ServiceResponse<T> envelope                         │
│  - Imports: inspectedWindowBridge                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Bridge Layer (Chrome API)                                  │
│  - inspectedWindow.ts                                       │
│  - Low-level chrome.scripting.executeScript wrapper         │
│  - No business logic                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Page Context (window.__web_sqlite)                         │
│  - Main world execution context                             │
└─────────────────────────────────────────────────────────────┘
```

**Service Function Categories**:

1. **Discovery** (2 functions):
   - `getDatabases()` - List all databases
   - `getTableList(dbname)` - List all tables

2. **Schema & Data** (3 functions):
   - `getTableSchema(dbname, tableName)` - PRAGMA table_info
   - `queryTableData(dbname, sql, limit, offset)` - Paginated SELECT
   - `execSQL(dbname, sql, params?)` - Generic SQL executor

3. **Logging** (2 functions):
   - `subscribeLogs(dbname)` - Start log streaming
   - `unsubscribeLogs(subscriptionId)` - Stop log streaming

4. **Migration & Versioning** (3 functions):
   - `devRelease(dbname, version, migrationSQL?, seedSQL?)` - Test release
   - `devRollback(dbname, toVersion)` - Rollback version
   - `getDbVersion(dbname)` - Query current version

5. **OPFS** (2 functions):
   - `getOpfsFiles(path?, dbname?)` - List OPFS files
   - `downloadOpfsFile(path)` - Download file

**Benefits**:
- **Testability**: Service functions can be unit tested without Chrome APIs
- **Reusability**: Single source of truth for database operations
- **Maintainability**: Business logic isolated from Chrome API concerns
- **Type Safety**: Strong typing via ServiceResponse<T> envelope
