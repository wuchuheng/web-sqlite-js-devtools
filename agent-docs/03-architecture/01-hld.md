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
- **Syntax Highlighting**: react-syntax-highlighter (Prism.js)
  - **Reason**: Lightweight SQL syntax highlighting for DDL display

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
│       ├── DatabaseTabs (/openedDB/:dbname) → redirects to /openedDB/:dbname/tables
│       │   ├── DatabaseTabHeader (5 tabs: Tables, Query, Migration, Seed, About)
│       │   └── Outlet (Nested Routes)
│       │       ├── TablesTab (/openedDB/:dbname/tables)
│       │       │   ├── TableListSidebar (25% width)
│       │       │   ├── OpenedTableTabs (Tab bar for opened tables)
│       │       │   └── TableContentArea (75% width)
│       │       │       ├── TableDetail (/openedDB/:dbname/tables/:tableName)
│       │       │       │   ├── TableDataPanel (Left: data + pagination) - Full width when schema hidden
│       │       │       │   └── SchemaPanel (Right: toggleable, tabbed view)
│       │       │       │       ├── SchemaPanelHeader (Toggle button + Table/DDL tabs)
│       │       │       │       ├── SchemaTableView (Column info table)
│       │       │       │       └── SchemaDDLView (SQL with syntax highlight + copy button)
│       │       │       └── EmptyState (No table selected)
│       │       ├── QueryTab (/openedDB/:dbname/query)
│       │       │   ├── CodeMirrorEditor
│       │       │   ├── QueryResults
│       │       │   └── ExportButton
│       │       ├── MigrationTab (/openedDB/:dbname/migration)
│       │       │   ├── HelperNotice
│       │       │   ├── CodeMirrorEditor
│       │       │   └── TestControls (Release/Rollback)
│       │       ├── SeedTab (/openedDB/:dbname/seed)
│       │       │   ├── HelperNotice
│       │       │   ├── CodeMirrorEditor
│       │       │   └── TestControls (Release/Rollback)
│       │       └── AboutTab (/openedDB/:dbname/about)
│       │           └── DatabaseMetadata
│       ├── LogView (/logs/:dbname) - Separate route (not under database tabs)
│       │   ├── LogFilter
│       │   └── LogList (500 entry ring buffer)
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

## 9) Schema Panel Architecture (Feature F-003)

**Purpose**: Enhance the schema panel with toggle visibility and tabbed view for better UX.

**State Management**:

```
┌─────────────────────────────────────────────────────────────┐
│  TableDetail Component (State Owner)                        │
│  ├── schemaPanelVisible: boolean (default: false)          │
│  ├── schemaTab: 'table' | 'ddl' (default: 'table')         │
│  └── Handler Functions:                                     │
│      ├── handleToggleSchema()                               │
│      └── handleSchemaTabChange('table' | 'ddl')            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  SchemaPanel Component (Controlled Props)                   │
│  ├── visible: boolean (from parent)                         │
│  ├── activeTab: 'table' | 'ddl' (from parent)              │
│  ├── onToggle(): () => void                                 │
│  └── onTabChange(tab): () => void                           │
└─────────────────────────────────────────────────────────────┘
```

**Responsive Layout Behavior**:

```
Visible State (schemaPanelVisible = true):
┌────────────────────────┬──────────────────┐
│ TableDataPanel         │ SchemaPanel      │
│ width: flex-1          │ width: w-80      │
│ (320px)                │                  │
└────────────────────────┴──────────────────┘

Hidden State (schemaPanelVisible = false):
┌───────────────────────────────────────────┐
│ TableDataPanel                             │
│ width: 100% (full width)                  │
└───────────────────────────────────────────┘
```

**Tab Switching Architecture**:

```
SchemaPanel Header:
┌────────────────────────────────────────────┐
│ [Toggle Icon]  [Table Icon] [DDL Text]   │
│                  ↓           ↓            │
│           Active Tab   Inactive Tab       │
│           (emerald-50)  (gray-500)        │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│ Content Area (Conditional Render)          │
│                                            │
│ if (activeTab === 'table'):               │
│   <SchemaTableView />                      │
│     - Column info table                    │
│     - Type, constraints badges             │
│                                            │
│ if (activeTab === 'ddl'):                 │
│   <SchemaDDLView />                        │
│     - Dark code block (bg-gray-900)        │
│     - Green text (text-green-400)          │
│     - CREATE TABLE statement               │
└────────────────────────────────────────────┘
```

**CSS Transition Strategy**:

- **Panel Width**: `transition-all duration-200 ease-in-out`
- **Visible**: `w-80 opacity-100`
- **Hidden**: `w-0 opacity-0 overflow-hidden`
- **Table Panel**: `transition-all duration-200` (flex-1 ↔ w-full)

**Icon Integration**:

- **Toggle**: `BsReverseLayoutSidebarInsetReverse` (react-icons/bs)
- **Table Tab**: `ImTable2` (react-icons/im)
- **DDL Tab**: Pure text "DDL"

**Theme Colors** (from `src/devtools/index.css`):

- **Primary**: `#059669` (emerald-600)
- **Primary Light**: `#ecfdf5` (emerald-50)
- **Active Tab**: `bg-emerald-50 text-emerald-600 border-emerald-200`
- **Inactive Tab**: `text-gray-500 hover:text-gray-700 border-gray-200`

## 10) DDL Syntax Highlight & Copy Architecture (Feature F-004)

**Purpose**: Enhance DDL view with SQL syntax highlighting and one-click copy functionality.

**Technology Stack**:

- **Syntax Highlighting**: `react-syntax-highlighter` with Prism.js engine
  - Package: `react-syntax-highlighter` (~18.8KB minified)
  - Language: SQL
  - Theme: `prism` (light theme)
  - Bundle impact: < 50KB total increase
- **Icons**: React Icons
  - Copy: `react-icons/md` → `MdOutlineContentCopy`
  - Success: `react-icons/fa` → `FaCheck`
- **Clipboard API**: `navigator.clipboard.writeText()`
  - Browser support: Chrome 66+, Edge 79+, Firefox 63+
  - Graceful degradation: Inline error if unavailable

**Component State Management**:

```
┌─────────────────────────────────────────────────────────────┐
│  SchemaDDLView Component (State Owner)                      │
│  ├── copied: boolean (default: false)                       │
│  ├── error: string | null (default: null)                  │
│  └── Handler Functions:                                     │
│      ├── handleCopy() - Async clipboard write               │
│      └── handleClick() - Reset copied state on next click   │
└─────────────────────────────────────────────────────────────┘
```

**Copy Button State Machine**:

```
┌─────────────┐     Click (not copied)     ┌─────────────┐
│   Initial   │ ──────────────────────────> │  Copying    │
│  (Copy Icon)│                            │  (API Call)  │
└─────────────┘                            └─────────────┘
       │                                          │
       │                                          │ Success
       │                                          ↓
       │                                   ┌─────────────┐
       │                                   │   Copied    │
       │                                   │ (Checkmark) │
       │                                   └─────────────┘
       │                                          │
       │                                  Click again (reset)
       │                                          │
       └──────────────────────────────────────────┘
                    (back to Initial)

Error Path: Copying → Error State (Inline error, copy icon)
```

**DDL View Layout** (Enhanced):

```
┌──────────────────────────────────────────────────────┐
│ SchemaDDLView Component                              │
│ ┌────────────────────────────────────────────────┐  │
│ │ Header Row (flex justify-between)              │  │
│ │ ┌────────────┐  ┌──────────────────────────┐  │  │
│ │ │ Spacer (   │  │ Copy Button (right top)  │  │  │
│ │ │ flex-1)    │  │ [MdOutlineContentCopy]   │  │  │
│ │ └────────────┘  └──────────────────────────┘  │  │
│ ├────────────────────────────────────────────────┤  │
│ │ Error Container (if error exists)               │  │
│ │ "Failed to copy" (text-red-600 text-right)      │  │
│ ├────────────────────────────────────────────────┤  │
│ │ Syntax Highlighter (Prism.js)                   │  │
│ │ CREATE TABLE users (                            │  │
│ │   id INTEGER PRIMARY KEY,   ← keywords (blue)  │  │
│ │   name TEXT NOT NULL       ← types (purple)   │  │
│ │ );                        ← formatted output  │  │
│ └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**State Persistence & Reset Behavior**:

- **Success**: Icon changes to green `FaCheck`, persists indefinitely
- **Reset**: Next click resets to copy icon and triggers copy again
- **Error**: Shows inline error, icon remains as copy icon
- **User Intent**: Checkmark confirms action completed, reset on next interaction allows re-copy

**Clipboard API Error Handling**:

```typescript
try {
  await navigator.clipboard.writeText(ddl);
  setCopied(true);
  setError(null);
} catch (err) {
  setError("Failed to copy");
  setCopied(false);
}
```

**CSS Styling Strategy**:

```css
/* Copy Button */
.p-1.text-gray-600.hover\:text-gray-800.transition-colors

/* Success State */
.text-green-600 (FaCheck icon)

/* Error State */
.text-red-600.text-xs.mb-2.text-right (inline error)

/* Syntax Highlighter */
.customStyle: {
  background: '#f9fafb',    /* gray-50 (light theme) */
  padding: '12px',
  borderRadius: '6px',
  fontSize: '12px',         /* text-xs (12px) */
}
```

**Accessibility Considerations**:

- **ARIA Labels**: Copy button has `title` attribute for screen readers
- **Keyboard Navigation**: Button is focusable (Tab key), activates on Enter/Space
- **Color Contrast**: Green checkmark (`#16a34a`) meets WCAG AA standards
- **Error Visibility**: Inline error positioned near action, not in alert

**Performance Optimizations**:

- **Lazy Import**: Syntax highlighter only loads when DDL tab is active
- **Code Splitting**: `react-syntax-highlighter` can be tree-shaken to SQL language only
- **Debounce**: None needed (click event is user-triggered, not continuous)
- **Bundle Impact**: ~18.8KB for Prism.js variant, < 50KB total increase

**Updated Component Hierarchy** (DDL View):

```
SchemaPanel
├── SchemaPanelHeader
│   ├── Table Tab Button (ImTable2)
│   └── DDL Tab Button (Text "DDL")
└── Content Area
    ├── SchemaTableView (Column info)
    └── SchemaDDLView (Enhanced)
        ├── Header Row
        │   ├── Spacer (flex-1)
        │   └── Copy Button
        │       ├── MdOutlineContentCopy (default)
        │       └── FaCheck (success, green)
        ├── Error Container (conditional)
        │   └── Error Message (text-red-600)
        └── SyntaxHighlighter
            ├── Language: SQL
            ├── Style: prism (light theme)
            └── Custom Style (gray-50 bg, 12px font)
```
