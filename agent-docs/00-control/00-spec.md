<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/00-control/00-spec.md

OUTPUT MAP (write to)
agent-docs/00-control/00-spec.md

NOTES
- Keep headings unchanged.
- Keep this file concise and link to stage docs for detail.
-->

# 00 Project Spec

## 1) Project summary

- **One-sentence description**: A Chrome DevTools extension providing comprehensive SQLite database inspection, query execution, and safe migration/seed testing for web-sqlite-js directly within the browser DevTools panel.
- **Primary users**: Frontend developers, full-stack developers, and QA engineers working on offline-first PWAs and browser-based applications using web-sqlite-js.

## 2) Goals and success criteria

- **Goals**:
  - Enable real-time inspection and debugging of SQLite databases through `window.__web_sqlite` API
  - Provide safe testing environment for migration and seed SQL before production deployment
  - Visualize OPFS (Origin Private File System) file structure with download capabilities
  - Seamless integration with Chrome DevTools as a native panel
- **Success criteria**:
  - Extension icon activates only when `window.__web_sqlite` is detected on the active page
  - Users can browse table contents, execute queries, and view logs for any opened database
  - Migration and seed playgrounds allow safe testing with automatic rollback
  - OPFS file tree displays with lazy loading and download functionality
- **Non-goals**:
  - Modifying the web-sqlite-js library itself
  - Supporting non-Chrome browsers initially
  - Direct database file editing without SQL
  - Server-side database management
- **Source of truth**: `agent-docs/01-discovery/01-brief.md`, `agent-docs/01-discovery/02-requirements.md`, `agent-docs/01-discovery/03-scope.md`

## 3) Current stage

- **Current stage (1-8)**: Stage 8 - Implementation (Worker - TASK-303)
- **Active release**: v1.2.0 (Enhancements) - Target: TBD
- **Status summary**: TASK-301 complete (F-005), TASK-302 complete (F-006), TASK-303 complete (Integration)
- **Last updated (YYYY-MM-DD)**: 2026-01-14 (TASK-303: Integration Testing & Polish)

## 4) Technology stack (chosen in Stage 2)

- **Language/Runtime**: TypeScript
- **Backend Framework**: N/A (Chrome Extension)
- **Client/UI**: React 18 + Tailwind CSS 4 + react-router-dom (hash routing)
- **Database**: N/A (connects to existing web-sqlite-js v2.1.0+)
- **Cache**: N/A
- **Messaging**: Chrome Runtime API (content script proxy pattern) + Service Layer (Feature F-001)
- **Routing**: react-router-dom v6 with HashRouter
- **SQL Editor**: CodeMirror 6 (pending spike S-003 validation)
- **Icons**: react-icons
- **Auth**: N/A
- **Infrastructure**: Chrome Extension Manifest V3 + @crxjs/vite-plugin
- **CI/CD**: TBD
- **Observability**: N/A

## 5) Document index (reading order)

- `agent-docs/00-control/01-status.md`
- `agent-docs/01-discovery/01-brief.md`
- `agent-docs/01-discovery/02-requirements.md`
- `agent-docs/01-discovery/03-scope.md`
- `agent-docs/01-discovery/features/F-001-service-layer-expansion.md` (NEW - Feature F-001)
- `agent-docs/01-discovery/features/F-002-database-tab-navigation.md`
- `agent-docs/01-discovery/features/F-003-schema-panel-enhancement.md` (NEW - Feature F-003)
- `agent-docs/01-discovery/features/F-004-ddl-syntax-highlight-copy.md` (COMPLETED - Feature F-004)
- `agent-docs/01-discovery/features/F-005-opened-table-tabs-management.md` (NEW - Feature F-005)
- `agent-docs/01-discovery/features/F-006-resizable-vertical-dividers.md` (NEW - Feature F-006)
- `agent-docs/02-feasibility/01-options.md`
- `agent-docs/02-feasibility/02-risk-assessment.md`
- `agent-docs/02-feasibility/03-spike-plan.md`
- `agent-docs/03-architecture/01-hld.md`
- `agent-docs/03-architecture/02-dataflow.md`
- `agent-docs/03-architecture/03-deployment.md`
- `agent-docs/04-adr/0001-content-script-proxy.md`
- `agent-docs/04-adr/0002-react-router-hash.md`
- `agent-docs/04-adr/0003-codemirror-sql-editor.md`
- `agent-docs/04-adr/0004-message-protocol.md`
- `agent-docs/04-adr/0005-log-ring-buffer.md`
- `agent-docs/04-adr/0006-auto-reconnect-strategy.md`
- `agent-docs/05-design/01-contracts/01-api.md` (UPDATED - Service Layer API)
- `agent-docs/05-design/01-contracts/02-events.md`
- `agent-docs/05-design/01-contracts/03-errors.md`
- `agent-docs/05-design/02-schema/01-message-types.md` (UPDATED - Service Layer Types)
- `agent-docs/05-design/03-modules/devtools-panel.md` (UPDATED - Service Layer Integration)
- `agent-docs/05-design/03-modules/database-service.md` (NEW - Feature F-001)
- `agent-docs/05-design/03-modules/content-script-proxy.md`
- `agent-docs/05-design/03-modules/background-service.md`
- `agent-docs/05-design/03-modules/opfs-browser.md`
- `agent-docs/07-taskManager/01-roadmap.md`
- `agent-docs/07-taskManager/02-task-catalog.md`
- `agent-docs/06-implementation/01-build-and-run.md` (pending)
- `agent-docs/06-implementation/02-test-plan.md` (pending)
- `agent-docs/06-implementation/03-observability.md` (pending)
- `agent-docs/06-implementation/04-release-and-rollback.md` (pending)
- `agent-docs/08-task/active/TASK-05.1.md` (NEW - TASK-05.1 Micro-Spec)
- `agent-docs/08-task/active/TASK-05.2.md` (NEW - TASK-05.2 Micro-Spec)

## 6) Recent changes

- **2026-01-13**: Stage 1 Discovery completed - brief, requirements, and scope documents created
- **2026-01-13**: Stage 2 Feasibility Analysis completed - Option A (Content Script Proxy) recommended, 4 spikes defined
- **2026-01-13**: Stage 3 Architecture completed - HLD, dataflow (8 flows), and deployment strategy documented
- **2026-01-13**: Stage 4 ADR completed - 6 ADRs created (Content Script Proxy, React Router, CodeMirror, Message Protocol, Log Ring Buffer, Auto-Reconnect)
- **2026-01-13**: Stage 5 Design completed - API contracts (10 channels), events (6 types), error standards, message types, and 4 module LLDs
- **2026-01-13**: Stage 7 Task Management completed - 6-phase roadmap (14 days) and 12 actionable tasks created
- **2026-01-13**: TASK-05 completed - Database List & Table Browser (inspectedWindow eval, sidebar DB list, table list)
- **2026-01-13**: Architecture refactor - replace channel messaging with inspectedWindow eval for DB access
- **2026-01-13**: Feature F-001 Architecture Update - Service Layer Expansion (3-layer pattern: Presentation → Service → Bridge)
  - Updated HLD to document 10 database service functions in centralized service layer
  - Separation of concerns: Components → databaseService.ts → inspectedWindowBridge → page context
  - All database operations now go through service layer for testability and maintainability
- **2026-01-13**: Feature F-001 Design Complete - Service Layer API and LLD Documentation
  - Updated `01-contracts/01-api.md` with complete service layer API (10 functions)
  - Created new `03-modules/database-service.md` with detailed service layer LLD
  - Updated `03-modules/devtools-panel.md` with service layer integration guide
  - Updated `02-schema/01-message-types.md` with ServiceResponse<T> types
  - Documented 3-layer architecture: Components → Service → Bridge → Page Context
  - Migration path defined for components to adopt service layer
- **2026-01-13**: TASK-05.1 completed - Service Layer Table Schema Functions
  - Added `ColumnInfo`, `TableSchema`, `QueryResult` types
  - Implemented `getTableSchema(dbname, tableName)` with PRAGMA table_info + DDL
  - Implemented `queryTableData(dbname, sql, limit, offset)` with pagination
  - Updated `databaseService` exports with new functions
- **2026-01-13**: TASK-05.2 completed - Service Layer SQL Execution Functions
  - Added `SqlValue`, `SQLParams`, `ExecResult` types
  - Implemented `execSQL(dbname, sql, params?)` with parameter support
  - Updated `DbQuery` type to include exec method
  - Updated `databaseService` exports with execSQL function
- **2026-01-13**: TASK-05.3 completed - Service Layer Log Streaming Functions
  - Added `LogEntry`, `LogSubscription`, `SubscribeResult` types (re-exported from DB types)
  - Implemented `subscribeLogs(dbname, callback)` with unique subscription ID generation
  - Implemented `unsubscribeLogs(subscriptionId)` with proper cleanup
  - Created `LogRingBuffer` module (500 entry circular buffer with batch sending)
  - Updated `databaseService` exports with subscribeLogs/unsubscribeLogs functions
  - Fixed TypeScript type issues for existing functions using DBInterface
- **2026-01-13**: TASK-05.4 completed - Service Layer Migration & Versioning Functions
  - Added `ReleaseConfig`, `DevReleaseResult`, `RollbackResult`, `DbVersionResult` types (re-exported from DB types)
  - Implemented `devRelease(dbname, version, migrationSQL?, seedSQL?)` using db.devTool.release()
  - Implemented `devRollback(dbname, toVersion)` using db.devTool.rollback()
  - Implemented `getDbVersion(dbname)` with PRAGMA user_version and fallback to DatabaseRecord maps
  - Updated `databaseService` exports with devRelease/devRollback/getDbVersion functions
- **2026-01-13**: TASK-05.5 completed - Service Layer OPFS File Browser Functions
  - Added `OpfsFileEntry`, `OpfsDownloadResult` types for OPFS file metadata
  - Implemented `formatFileSize` helper function for human-readable file sizes
  - Implemented `getOpfsFiles(path?, dbname?)` using navigator.storage.getDirectory()
  - Implemented `downloadOpfsFile(path)` with blob URL creation (caller responsible for cleanup)
  - Updated `databaseService` exports with getOpfsFiles/downloadOpfsFile functions
- **2026-01-14**: Feature F-004 completed - DDL Syntax Highlight & Copy Button
  - Implemented SQL syntax highlighting using `react-syntax-highlighter` with Prism.js light theme
  - Added copy button with clipboard API (`navigator.clipboard.writeText`)
  - Success feedback: green checkmark (`FaCheck`) persists until next click
  - Error handling: inline error message if clipboard API unavailable
  - Bundle impact: ~18.8KB for Prism.js variant, < 50KB total increase
- **2026-01-14**: Feature F-005 completed - Opened Table Tabs Management (TASK-301)
  - Created OpenedTableTabs component with memoized TabButton sub-component
  - Implemented state-managed opened tabs (show only opened tables, not all)
  - Close button with IoMdClose icon, visible on group-hover, hidden by default
  - Auto-switch to next tab after close (tries same index, falls back to last)
  - React Context for state sharing between TablesTab (parent) and TableDetail (child)
  - State owned by TablesTab, consumed via useOpenedTabs hook
  - Removed old TableTabButton component and tables.map() loop
  - Build passed with no errors (4.30s)
- **2026-01-14**: Feature F-006 completed - Resizable Vertical Dividers (TASK-302)
  - Created ResizeHandle component with draggable mouse events
  - Cursor change to `col-resize` on hover
  - Visual hover state: `hover:bg-blue-200 hover:w-2`
  - Visual dragging state: `w-2 bg-blue-300`
  - Left sidebar resize (min: 200px, max: 600px, default: 300px)
  - Right schema panel resize (min: 250px, max: 600px, default: 320px)
  - ARIA attributes: `role="separator"`, `aria-orientation="vertical"`, `aria-label="Resize panel"`
  - Build passed with no errors (4.00s)
- **2026-01-14**: TASK-303 completed - Integration Testing & Polish (F-005, F-006)
  - Fixed content area to use `flex-1` instead of `w-3/4` for proper resize behavior
  - Cross-feature testing: Resize works with opened tabs, schema toggle preserves width
  - Edge case testing: Min/max constraints enforced correctly
  - Marked F-005 and F-006 as completed in feature docs
  - Build passed with no errors (3.90s)
