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

- **Current stage (1-8)**: Stage 8 - Implementation (Worker - TASK-05.1)
- **Active release**: v1.0.0 (MVP) - Target: 2026-01-27
- **Status summary**: TASK-01 through TASK-05 completed, TASK-05.1 in progress, 10 tasks remaining for MVP
- **Last updated (YYYY-MM-DD)**: 2026-01-13 (TASK-05.1: Service Layer - Table Schema Functions)

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
