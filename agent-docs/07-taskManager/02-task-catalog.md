<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/07-task-catalog.md

OUTPUT MAP (write to)
agent-docs/07-taskManager/02-task-catalog.md

NOTES
- This is the SOURCE OF TRUTH for the "Worker Agent".
- Release-grouped: tasks live under a release version header.
- Status is tracked via checkbox markers.
- Tasks consolidated to 12 broad, actionable items.
-->

# 02 Task Catalog (Release Grouped)

## Status Legend

- `[ ]` **Pending**: Ready to be picked up.
- `[-]` **In Progress**: Currently being executed by a Worker.
- `[x]` **Completed**: Tested, Verified, and Merged.

---

## Release v1.0.0 (MVP) - Target: 2026-01-27

- [x] **TASK-01**: Project Setup & Configuration
  - **Priority**: P0 (Blocker)
  - **Dependencies**: None
  - **Boundary**: `src/manifest.ts`, `src/messaging/`, `devtools.html`, `src/devtools/index.tsx`
  - **Maps to**: FR-001, FR-004, FR-005, FR-039
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-01.md)
  - **Bug Fix**: DevTools panel creation script with "Sqlite" label added to devtools.html (2026-01-13)
  - **DoD**:
    - Manifest with extension name "web-sqlite devtools", permissions (activeTab, tabs)
    - Message channels TypeScript definitions (10 channels, Response<T> type)
    - DevTools panel opens with "Sqlite" label
    - React Router HashRouter with routes `/`, `/openedDB/:dbname`, `/opfs`

- [x] **TASK-02**: Sidebar UI & Navigation
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-01
  - **Boundary**: `src/devtools/components/Sidebar/`, `src/devtools/components/EmptyState/`
  - **Maps to**: FR-006, FR-007, FR-012, FR-014, FR-042, FR-044
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-02.md)
  - **DoD**:
    - Sidebar with SiSqlite icon + "Web Sqlite" (20% width)
    - SidebarHeader with collapse toggle (20% ↔ icon-only)
    - EmptyState with helpful instructions
    - DatabaseList, OPFSLink navigation items

- [ ] **TASK-03**: Content Script Proxy & Background Messaging
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-01
  - **Boundary**: `src/contentScript/`, `src/background/`
  - **Maps to**: ADR-0001, ADR-0004, FR-039
  - **DoD**:
    - Content script message listener routing by channel
    - Background service message routing (panel ↔ content script)
    - Database proxy with getDatabases, Map→Array serialization
    - All proxy handlers stubbed for 10 channels

- [ ] **TASK-04**: Icon State & Auto-Reconnect
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-03
  - **Boundary**: `src/contentScript/index.tsx`, `src/background/iconState/`, `src/devtools/hooks/useConnection.ts`
  - **Maps to**: FR-002, FR-003, FR-041, ADR-0006
  - **DoD**:
    - Content script detects `window.__web_sqlite` availability
    - ICON_STATE channel with active/inactive states
    - Icon assets (active: colored, inactive: grayscale)
    - Heartbeat every 5s with exponential backoff (1s, 2s, 4s, 8s, 15s)

- [ ] **TASK-05**: Database List & Table Browser
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-03, TASK-02
  - **Boundary**: `src/contentScript/proxy/databaseProxy.ts`, `src/devtools/components/Sidebar/DatabaseList.tsx`
  - **Maps to**: FR-001, FR-008, FR-009, FR-016, FR-017
  - **DoD**:
    - GET_TABLE_LIST handler with PRAGMA queries, alphabetical sort
    - DatabaseList in sidebar, nested under "Opened DB"
    - Clicking database navigates to `/openedDB/:dbname`
    - TableList component with alphabetical tables, active state styling

- [ ] **TASK-06**: Table Data & Schema
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-05
  - **Boundary**: `src/contentScript/proxy/`, `src/devtools/components/TableTab/`
  - **Maps to**: FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-043
  - **DoD**:
    - GET_TABLE_SCHEMA handler (PRAGMA table_info + CREATE TABLE DDL)
    - QUERY_TABLE_DATA handler with LIMIT/OFFSET pagination
    - TableContent with fixed header (field + type)
    - DDL info panel showing complete CREATE TABLE SQL
    - PaginationBar with page controls, custom limit, refresh, close
    - Multi-table tab support, clear on database change

- [ ] **TASK-07**: Query Editor with CodeMirror
  - **Priority**: P0 (Blocker)
  - **Dependencies**: Spike S-003 validation
  - **Boundary**: `src/devtools/components/QueryTab/`, `src/contentScript/proxy/queryProxy.ts`
  - **Maps to**: FR-024, FR-025, ADR-0003, ADR-0004
  - **DoD**:
    - CodeMirror 6 installed with SQL syntax highlighting
    - Auto-theme matching Chrome DevTools (light/dark)
    - Execute button + Ctrl+Enter shortcut
    - EXEC_SQL handler for INSERT/UPDATE/DELETE
    - Inline error display

- [ ] **TASK-08**: Query Results & Export
  - **Priority**: P1
  - **Dependencies**: TASK-07
  - **Boundary**: `src/devtools/components/QueryTab/QueryResults.tsx`, `ExportButton.tsx`
  - **Maps to**: FR-025, FR-026, FR-027
  - **DoD**:
    - QueryResults table with sortable columns
    - CSV/JSON export button
    - Download with proper file naming

- [ ] **TASK-09**: Log Streaming & Ring Buffer
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-03
  - **Boundary**: `src/contentScript/proxy/logProxy.ts`, `src/contentScript/subscriptions/LogRingBuffer.ts`, `src/devtools/components/LogTab/`
  - **Maps to**: FR-026, FR-029, FR-030, ADR-0004, ADR-0005
  - **DoD**:
    - SUBSCRIBE_LOGS/UNSUBSCRIBE_LOGS handlers
    - LogRingBuffer (500 entry circular buffer, batch every 100ms or 50 entries)
    - LogList with color-coded levels (info/debug/error)
    - LogFilter by level and sql/action/event fields

- [ ] **TASK-10**: OPFS File Browser
  - **Priority**: P1
  - **Dependencies**: TASK-03, TASK-02
  - **Boundary**: `src/contentScript/proxy/opfsProxy.ts`, `src/devtools/components/OPFSBrowser/`, `src/devtools/components/Sidebar/OPFSLink.tsx`
  - **Maps to**: FR-010, FR-011, FR-027, FR-028
  - **DoD**:
    - GET_OPFS_FILES handler with lazy loading, human-readable sizes
    - FileTree recursive component with expand/collapse
    - DOWNLOAD_OPFS_FILE handler with blob URL
    - DownloadButton with browser download trigger
    - OPFSLink in sidebar (FaFile + "OPFS")

- [ ] **TASK-11**: About Tab & Tab Navigation
  - **Priority**: P1
  - **Dependencies**: TASK-03
  - **Boundary**: `src/contentScript/proxy/databaseProxy.ts`, `src/devtools/components/AboutTab/`, `src/devtools/components/TabNavigation.tsx`
  - **Maps to**: FR-015, FR-035
  - **DoD**:
    - GET_DB_VERSION handler
    - AboutTab with DB metadata (name, version, table count, row counts, OPFS info, web-sqlite-js version)
    - TabNavigation with 6 tabs (Table, Query, Log, Migration, Seed, About) with icons

- [ ] **TASK-12**: Testing & Release
  - **Priority**: P0 (Blocker)
  - **Dependencies**: All previous tasks
  - **Boundary**: Full extension, `public/icons/`, `package.json`
  - **Maps to**: All FR-001 to FR-044, NFR-005
  - **DoD**:
    - Manual testing of all 44 MVP requirements
    - Tailwind CSS styling polish
    - Critical bugs fixed
    - Extension icons (all sizes: 16, 32, 48, 128)
    - Production build (< 2MB, no errors)
    - Version bump to 1.0.0
    - Distributable ZIP created
    - Uploaded to Chrome Web Store

---

## Release v1.1.0 (Post-MVP) - Future Work

- [ ] **TASK-101**: Migration Playground
  - **Priority**: P1
  - **Dependencies**: v1.0.0 release
  - **Boundary**: `src/contentScript/proxy/`, `src/devtools/components/MigrationTab/`
  - **Maps to**: FR-031, FR-032, FR-033
  - **DoD**: DEV_RELEASE/DEV_ROLLBACK handlers, MigrationTab with CodeMirror, test controls

- [ ] **TASK-102**: Seed Playground
  - **Priority**: P1
  - **Dependencies**: TASK-101
  - **Boundary**: `src/devtools/components/SeedTab/`
  - **Maps to**: FR-033, FR-034
  - **DoD**: SeedTab with same editor, seed SQL testing, auto-rollback

---

## Release v1.2.0 (Future) - Nice-to-Have

- [ ] **TASK-201**: Query History
  - **Priority**: P2
  - **Dependencies**: v1.1.0 release
  - **Boundary**: `src/devtools/hooks/`
  - **Maps to**: FR-106
  - **DoD**: Queries saved to chrome.storage, quick re-execution

- [ ] **TASK-202**: Keyboard Shortcuts
  - **Priority**: P2
  - **Dependencies**: v1.1.0 release
  - **Boundary**: Global keyboard handler
  - **Maps to**: FR-107
  - **DoD**: Shortcuts for common actions (Ctrl+L clear, Ctrl+/ focus, etc.)

- [ ] **TASK-203**: Dark/Light Theme Toggle
  - **Priority**: P2
  - **Dependencies**: v1.1.0 release
  - **Boundary**: Theme provider, settings panel
  - **Maps to**: FR-108
  - **DoD**: Theme toggle, persists to chrome.storage
