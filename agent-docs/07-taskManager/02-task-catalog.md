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

- [x] **TASK-03**: Content Script Proxy & Background Messaging
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-01
  - **Boundary**: `src/contentScript/`, `src/background/`
  - **Maps to**: ADR-0001, ADR-0004, FR-039
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-03.md)
  - **DoD**:
    - Content script message listener routing by channel
    - Background service message routing (panel ↔ content script)
    - Database proxy with getDatabases, Map→Array serialization
    - All proxy handlers stubbed for 10 channels

- [x] **TASK-04**: Icon State & Auto-Reconnect
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-03
  - **Boundary**: `src/contentScript/App.tsx`, `src/background/iconState/`, `src/devtools/hooks/useConnection.ts`
  - **Maps to**: FR-002, FR-003, FR-041, ADR-0006
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-04.md)
  - **DoD**:
    - Content script detects `window.__web_sqlite` availability
    - ICON_STATE message with active/inactive states
    - Icon assets (active: colored, inactive: grayscale)
    - Heartbeat every 5s with exponential backoff (1s, 2s, 4s, 8s, 15s)

- [x] **TASK-05**: Database List & Table Browser
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-03, TASK-02
  - **Boundary**: `src/devtools/inspectedWindow.ts`, `src/devtools/components/Sidebar/DatabaseList.tsx`, `src/devtools/components/TableTab/`
  - **Maps to**: FR-001, FR-008, FR-009, FR-016, FR-017
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-05.md)
  - **DoD**:
    - inspectedWindow eval with PRAGMA queries, alphabetical sort
    - DatabaseList in sidebar, nested under "Opened DB"
    - Clicking database navigates to `/openedDB/:dbname`
    - TableList component with alphabetical tables, active state styling

### Feature F-001: Service Layer Expansion Tasks

- [x] **TASK-05.1**: Service Layer - Table Schema Functions
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-05
  - **Boundary**: `src/devtools/services/databaseService.ts`, `src/devtools/bridge/inspectedWindow.ts`
  - **Maps to**: F-001, FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-043
  - **Feature**: F-001 Service Layer Expansion - Schema Inspection Group
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-05.1.md)
  - **DoD**:
    - Implement `getTableSchema(dbname, tableName)` service function
      - Query `PRAGMA table_info(tableName)` for column details
      - Query `SELECT sql FROM sqlite_master WHERE type='table' AND name=?` for DDL
      - Return `ServiceResponse<{ columns: ColumnInfo[], ddl: string }>`
      - Validate database and table exist
      - Handle errors: table not found, SQL errors
    - Implement `queryTableData(dbname, sql, limit, offset)` service function
      - Validate SQL is SELECT (optional safety check)
      - Wrap user SQL: `SELECT * FROM (${sql}) LIMIT ? OFFSET ?`
      - Execute count query: `SELECT COUNT(*) FROM (${sql})`
      - Extract column names from first row keys
      - Return `ServiceResponse<{ rows: Row[], total: number, columns: string[] }>`
    - Add TypeScript types for `ColumnInfo`, `QueryResult`, `TableSchema`
    - Export functions via `databaseService` object
    - Unit tests with mocked bridge layer
    - Update `databaseService.ts` with JSDoc comments

- [x] **TASK-05.2**: Service Layer - SQL Execution Functions
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-05.1
  - **Boundary**: `src/devtools/services/databaseService.ts`, `src/devtools/bridge/inspectedWindow.ts`
  - **Maps to**: F-001, FR-024, FR-025, FR-026, FR-027
  - **Feature**: F-001 Service Layer Expansion - Query Execution Group
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-05.2.md)
  - **DoD**:
    - Implement `execSQL(dbname, sql, params?)` service function
      - Execute SQL with parameters using `db.exec(sql, params)`
      - Support both positional (`[]`) and named (`{}`) parameters
      - Return `ServiceResponse<{ lastInsertRowid: number | bigint, changes: number | bigint }>`
      - Handle constraint violation errors
      - Validate parameter count matches placeholders
    - Add TypeScript types for `ExecResult`, `SqlValue`
    - Export function via `databaseService` object
    - Unit tests with mocked bridge layer
    - Update `databaseService.ts` with JSDoc comments

- [x] **TASK-05.3**: Service Layer - Log Streaming Functions
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-05.2
  - **Boundary**: `src/devtools/services/databaseService.ts`, `src/devtools/bridge/inspectedWindow.ts`, `src/contentScript/subscriptions/LogRingBuffer.ts`
  - **Maps to**: F-001, FR-026, FR-029, FR-030, ADR-0004, ADR-0005
  - **Feature**: F-001 Service Layer Expansion - Log Streaming Group
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-05.3.md)
  - **DoD**:
    - Implement `subscribeLogs(dbname)` service function
      - Generate unique subscription ID (e.g., `sub_${Date.now()}_${Math.random()}`)
      - Call `window.__web_sqlite.subscribeLogs(dbname, callback)`
      - Store subscription in internal Map for cleanup
      - Return `ServiceResponse<{ subscriptionId: string }>`
      - Validate database exists
      - Handle subscription limit errors
    - Implement `unsubscribeLogs(subscriptionId)` service function
      - Look up subscription from internal Map
      - Call `window.__web_sqlite.unsubscribeLogs(subscriptionId)`
      - Remove from internal Map
      - Return `ServiceResponse<void>`
      - Handle subscription not found errors
    - Add TypeScript types for `LogSubscription`, `LogEntry`
    - Export functions via `databaseService` object
    - Unit tests with mocked bridge layer
    - Integration tests with LogRingBuffer
    - Update `databaseService.ts` with JSDoc comments

- [x] **TASK-05.4**: Service Layer - Migration & Versioning Functions
  - **Priority**: P1
  - **Dependencies**: TASK-05.2
  - **Boundary**: `src/devtools/services/databaseService.ts`, `src/devtools/bridge/inspectedWindow.ts`
  - **Maps to**: F-001, FR-031, FR-032, FR-033, FR-034
  - **Feature**: F-001 Service Layer Expansion - Migration Group
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-05.4.md)
  - **DoD**:
    - Implement `devRelease(dbname, version, migrationSQL?, seedSQL?)` service function
      - Create dev database copy: `${dbname}-dev-${version}`
      - Apply migration SQL if provided
      - Apply seed SQL if provided
      - Store original version for rollback
      - Return `ServiceResponse<{ devVersion: string }>`
      - Handle SQL errors from migration/seed
      - Validate dev version doesn't already exist
    - Implement `devRollback(dbname, toVersion)` service function
      - Drop dev database
      - Restore from backup or switch to specific version
      - Update version tracking in web-sqlite-js
      - Return `ServiceResponse<{ currentVersion: string }>`
      - Handle version locked errors
    - Implement `getDbVersion(dbname)` service function
      - Query `PRAGMA user_version` for SQLite version
      - Fallback to web-sqlite-js version tracking
      - Return `ServiceResponse<{ version: string }>`
      - Return "0.0.0" if no version set
    - Add TypeScript types for `DevRelease`, `DbVersion`
    - Export functions via `databaseService` object
    - Unit tests with mocked bridge layer
    - Update `databaseService.ts` with JSDoc comments

- [x] **TASK-05.5**: Service Layer - OPFS File Browser Functions
  - **Priority**: P1
  - **Dependencies**: TASK-05.2
  - **Boundary**: `src/devtools/services/databaseService.ts`, `src/devtools/bridge/inspectedWindow.ts`
  - **Maps to**: F-001, FR-010, FR-011, FR-027, FR-028, FR-036, FR-037, FR-038
  - **Feature**: F-001 Service Layer Expansion - OPFS Group
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-05.5.md)
  - **DoD**:
    - Implement `getOpfsFiles(path?, dbname?)` service function
      - Call `navigator.storage.getDirectory()` in inspected page
      - Navigate to `path` (defaults to root)
      - List directory contents with `for await of`
      - Filter by `dbname` if provided
      - Convert file sizes to human-readable format (KB, MB, GB)
      - Return `ServiceResponse<OpfsFileEntry[]>`
      - Handle OPFS not supported errors
      - Return empty array if directory is empty
    - Implement `downloadOpfsFile(path)` service function
      - Resolve file handle from `path`
      - Read file contents into ArrayBuffer
      - Create Blob from ArrayBuffer
      - Create object URL: `URL.createObjectURL(blob)`
      - Extract filename from path
      - Return `ServiceResponse<{ blobUrl: string; filename: string }>`
      - Handle file not found errors
      - Document caller responsibility for URL cleanup
    - Add TypeScript types for `OpfsFileEntry`, `DownloadResult`
    - Export functions via `databaseService` object
    - Unit tests with mocked bridge layer
    - Update `databaseService.ts` with JSDoc comments

### Component Migration Tasks

- [x] **TASK-05.6**: Component Migration - Table Browser Components
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-05.1
  - **Boundary**: `src/devtools/components/TableTab/`, `src/devtools/components/Sidebar/DatabaseList.tsx`
  - **Maps to**: F-001, FR-007
  - **Feature**: F-001 Service Layer Expansion - Component Migration
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-05.6.md)
  - **DoD**:
    - Update `Sidebar/DatabaseList.tsx` to use `databaseService.getDatabases()`
      - Remove direct `inspectedWindow` import
      - Import from `@/devtools/services/databaseService`
      - Handle `ServiceResponse` envelope
      - Test database list loading
    - Update `TableTab/TableList.tsx` to use `databaseService.getTableList()`
      - Remove direct `inspectedWindow` import
      - Import from `@/devtools/services/databaseService`
      - Handle `ServiceResponse` envelope
      - Test table list loading
    - Update `TableTab/TableContent.tsx` to use `databaseService.getTableSchema()`
      - Remove direct `inspectedWindow` import
      - Import from `@/devtools/services/databaseService`
      - Handle `ServiceResponse` envelope
      - Test schema display
    - Mark old `inspectedWindow` exports as `@deprecated`
    - Update component tests

- [x] **TASK-06**: Table Data & Schema UI
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-05.1, TASK-05.6
  - **Boundary**: `src/devtools/components/TableTab/`
  - **Maps to**: FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-043
  - **Note**: TASK-05.1 and TASK-05.6 now handle service layer implementation. This task focuses on UI components only.
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-06.md)
  - **DoD**:
    - TableContent with fixed header (field + type)
    - DDL info panel showing complete CREATE TABLE SQL
    - PaginationBar with page controls, custom limit, refresh, close
    - Multi-table tab support, clear on database change
    - UI styling with Tailwind CSS

- [x] **TASK-05.7**: Component Migration - Query Editor Components (SKIPPED - components don't exist yet)
- [x] **TASK-05.8**: Component Migration - Log & OPFS Components (SKIPPED - components don't exist yet)

### Original Tasks (Continued)

- [x] **TASK-09**: Log Streaming & Ring Buffer (Updated - Now depends on TASK-05.3, TASK-05.8)
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-03, TASK-05.3, TASK-05.8
  - **Boundary**: `src/contentScript/proxy/logProxy.ts`, `src/contentScript/subscriptions/LogRingBuffer.ts`, `src/devtools/components/LogTab/`
  - **Maps to**: FR-026, FR-029, FR-030, ADR-0004, ADR-0005
  - **Note**: TASK-05.3 and TASK-05.8 now handle service layer implementation. This task focuses on ring buffer and UI.
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-09.md)
  - **DoD**:
    - LogRingBuffer (500 entry circular buffer, batch every 100ms or 50 entries)
    - LogList with color-coded levels (info/debug/error)
    - LogFilter by level and sql/action/event fields
    - UI styling with Tailwind CSS

- [x] **TASK-10**: OPFS File Browser (Updated - Now depends on TASK-05.5, TASK-05.8)
  - **Priority**: P1
  - **Dependencies**: TASK-03, TASK-02, TASK-05.5, TASK-05.8
  - **Boundary**: `src/devtools/components/OPFSBrowser/`, `src/devtools/components/Sidebar/OPFSLink.tsx`
  - **Maps to**: FR-010, FR-011, FR-027, FR-028
  - **Note**: TASK-05.5 and TASK-05.8 now handle service layer implementation. This task focuses on UI components.
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-10.md)
  - **DoD**:
    - FileTree recursive component with expand/collapse
    - DownloadButton with browser download trigger
    - OPFSLink in sidebar (FaFile + "OPFS")
    - UI styling with Tailwind CSS

- [x] **F-002**: Database Tab Navigation Restructuring (NEW - Replaces TASK-07, TASK-08, TASK-11, TASK-101, TASK-102)
  - **Priority**: P0 (Blocker)
  - **Dependencies**: TASK-05.1, TASK-05.2, TASK-05.4, TASK-06
  - **Boundary**: `src/devtools/components/DatabaseTabs/`, `src/devtools/components/TablesTab/`, `src/devtools/components/QueryTab/`, `src/devtools/components/MigrationTab/`, `src/devtools/components/SeedTab/`, `src/devtools/components/AboutTab/`, `src/devtools/DevTools.tsx`
  - **Maps to**: F-002, FR-009, FR-009.1, FR-009.2, FR-015, FR-016, FR-017, FR-019, FR-022, FR-024, FR-025, FR-026, FR-027, FR-031, FR-032, FR-033, FR-034, FR-035
  - **Feature**: [F-002: Database Tab Navigation Restructuring](agent-docs/01-discovery/features/F-002-database-tab-navigation.md)
  - **Micro-Spec**: [completed](agent-docs/08-task/active/F-002.md)
  - **DoD**:
    - Create DatabaseTabs component with tab header (5 tabs: Tables, Query, Migration, Seed, About)
    - Implement nested routing structure: `/openedDB/:dbname` → `/openedDB/:dbname/tables` (default)
    - Create TablesTab (refactor from DatabaseView): 25% table list sidebar + 75% content area
    - Create TableDetail component for `:tableName` route with split view (data + DDL)
    - Create QueryTab with CodeMirror SQL editor + results + export
    - Create MigrationTab with test controls (release/rollback)
    - Create SeedTab with test controls (release/rollback)
    - Create AboutTab with database metadata
    - Update DevTools.tsx routing to use nested routes
    - Update Sidebar links to navigate to `/openedDB/:dbname/tables`
    - UI styling with Tailwind CSS

- [x] **TASK-12**: Testing & Release
  - **Priority**: P0 (Blocker)
  - **Dependencies**: All previous tasks (including TASK-05.1 through TASK-05.8, F-002)
  - **Boundary**: Full extension, `public/icons/`, `package.json`
  - **Maps to**: All FR-001 to FR-044, NFR-005, F-001, F-002
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-12.md)
  - **DoD**:
    - Manual testing of all 44 MVP requirements
    - Service layer unit tests (all 10 functions)
    - Component integration tests (all migrated components)
    - Tailwind CSS styling polish
    - Critical bugs fixed
    - Extension icons (all sizes: 16, 32, 48, 128)
    - Production build (< 2MB, no errors)
    - Version bump to 1.0.0
    - Distributable ZIP created
    - Uploaded to Chrome Web Store

---

## Release v1.1.0 (Post-MVP) - Future Work

- [x] **TASK-201**: Query History
  - **Priority**: P2
  - **Dependencies**: v1.1.0 release
  - **Boundary**: `src/devtools/hooks/`
  - **Maps to**: FR-106
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-201.md)
  - **DoD**:
    - Hook `useQueryHistory.ts` created with TSDoc comments
    - History sidebar integrated into QueryTab
    - History persists across DevTools sessions (chrome.storage.local)
    - Maximum 50 entries per database enforced
    - Consecutive duplicate detection working
    - Clear history button functional
    - Click-to-load query working
    - Relative time formatting correct
    - Build passed with no errors

- [x] **TASK-202**: Keyboard Shortcuts
  - **Priority**: P2
  - **Dependencies**: v1.1.0 release
  - **Boundary**: Global keyboard handler
  - **Maps to**: FR-107
  - **Micro-Spec**: [completed](agent-docs/08-task/active/TASK-202.md)
  - **DoD**:
    - Hook `useKeyboardShortcuts.ts` created with TSDoc comments
    - Help modal component created with categorized shortcuts
    - Global shortcuts registered (Ctrl+B, Ctrl+/, Escape)
    - Navigation shortcuts registered (Ctrl+1-5)
    - Query tab shortcuts registered (Ctrl+Enter, Ctrl+L, Ctrl+H)
    - Shortcuts respect route context
    - Shortcuts don't trigger in editable inputs
    - Help modal displays all shortcuts grouped by category
    - Sidebar collapse state lifted to DevTools
    - QueryTab exposes functions via refs for global handler
    - Build passed with no errors

- [ ] **TASK-203**: Dark/Light Theme Toggle
  - **Priority**: P2
  - **Dependencies**: v1.1.0 release
  - **Boundary**: Theme provider, settings panel
  - **Maps to**: FR-108
  - **DoD**: Theme toggle, persists to chrome.storage
  - **Note**: SKIPPED - Not required for current release

---

## Release v1.2.0 (Enhancements) - Future Work

- [x] **F-003**: Schema Panel Enhancement (NEW)
  - **Priority**: P1 (High)
  - **Dependencies**: F-002 (Database Tab Navigation)
  - **Boundary**: `src/devtools/components/TablesTab/TableDetail.tsx`, `src/devtools/components/TablesTab/SchemaPanel.tsx`
  - **Maps to**: F-003
  - **Feature**: [F-003: Schema Panel Enhancement](agent-docs/01-discovery/features/F-003-schema-panel-enhancement.md)
  - **Evidence**: 6 new components created, TableDetail updated with state + handlers + responsive width
  - **DoD**:
    - [x] Toggle button with BsReverseLayoutSidebarInsetReverse icon to show/hide panel
    - [x] Panel hidden by default (state: false)
    - [x] Remove "SCHEMA" title from schema panel
    - [x] Add header with two tab buttons: Table icon (ImTable2) + DDL text
    - [x] Active tab shows emerald-50 background, emerald-600 text
    - [x] Inactive tab shows gray-500 text
    - [x] Table view displays column info table
    - [x] DDL view displays SQL CREATE TABLE statement
    - [x] Table data expands to full width when panel hidden
    - [x] Smooth CSS transition (150-200ms) for collapse/expand
    - [x] Small button size (text-xs) matching pagination style
    - [x] Import icons from react-icons (bs, im)
    - [x] Build passed with no errors
