<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/00-control/01-status.md

OUTPUT MAP (write to)
agent-docs/00-control/01-status.md

NOTES
- Keep headings unchanged.
- Keep entries short and link to evidence when possible.
-->

# 01 Status Board

## 1) Project stage

- **Current stage**: Stage 8 - Implementation (Worker)
- **Current focus**: F-002 implementation (documentation fixed, ready to code)
- **Last updated**: 2026-01-14 (S1-S8 documentation audit completed, conflicts resolved)

## 2) Active work

| Item                           | Owner     | Status      | Evidence                                                            |
| ------------------------------ | --------- | ----------- | ------------------------------------------------------------------- |
| F-002: Database Tab Navigation | S8:worker | In Progress | Documentation fixed (HLD, S5, S1, S7, S3), ready for implementation |

## 3) Done (Recent)

| Task                                                                       | Owner     | Evidence                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-09: Log Streaming & Ring Buffer UI                                    | S8:worker | `src/devtools/hooks/useLogSubscription.ts`, `src/devtools/components/LogTab/LogView.tsx`, `src/devtools/components/LogTab/LogList.tsx`, `src/devtools/components/LogTab/LogFilter.tsx`, `src/devtools/DevTools.tsx` (log route)                                           |
| TASK-06: Table Data & Schema UI                                            | S8:worker | `src/devtools/components/TableTab/TableSchemaPanel.tsx`, `src/devtools/components/TableTab/PaginationBar.tsx`, `src/devtools/components/TableTab/TableTabs.tsx`, `src/devtools/components/TableTab/TableContent.tsx`, `src/devtools/components/TableTab/DatabaseView.tsx` |
| TASK-05.7/05.8: Component Migration (SKIPPED - components don't exist yet) | S8:worker | QueryTab, LogTab, OPFSBrowser components created in later tasks will use service layer directly from the start                                                                                                                                                            |
| TASK-05.6: Component Migration - Table Browser Components                  | S8:worker | `src/devtools/components/Sidebar/DatabaseList.tsx` (databaseService.getDatabases), `src/devtools/components/TableTab/TableList.tsx` (databaseService.getTableList), `src/devtools/hooks/useInspectedWindowRequest.ts` (ServiceResponse)                                   |
| TASK-05.5: Service Layer - OPFS File Browser Functions                     | S8:worker | `src/devtools/services/databaseService.ts` (OpfsFileEntry, OpfsDownloadResult types, formatFileSize, getOpfsFiles, downloadOpfsFile)                                                                                                                                      |
| TASK-05.4: Service Layer - Migration & Versioning Functions                | S8:worker | `src/devtools/services/databaseService.ts` (ReleaseConfig, DevReleaseResult, RollbackResult, DbVersionResult types, devRelease, devRollback, getDbVersion)                                                                                                                |
| TASK-05.3: Service Layer - Log Streaming Functions                         | S8:worker | `src/devtools/services/databaseService.ts` (LogEntry, LogSubscription, SubscribeResult types, subscribeLogs, unsubscribeLogs), `src/contentScript/subscriptions/LogRingBuffer.ts` (new file)                                                                              |
| TASK-05.2: Service Layer - SQL Execution Functions                         | S8:worker | `src/devtools/services/databaseService.ts` (SqlValue, SQLParams, ExecResult types, execSQL)                                                                                                                                                                               |
| TASK-05.1: Service Layer - Table Schema Functions                          | S8:worker | `src/devtools/services/databaseService.ts` (ColumnInfo, TableSchema, QueryResult types, getTableSchema, queryTableData)                                                                                                                                                   |
| TASK-05: Database List & Table Browser                                     | S8:worker | `src/devtools/inspectedWindow.ts`, `src/devtools/hooks/useInspectedWindowRequest.ts`, `src/devtools/utils/databaseNames.ts`, `src/devtools/components/Sidebar/DatabaseList.tsx`, `src/devtools/components/TableTab/`, `src/devtools/DevTools.tsx`                         |
| TASK-04: Icon State & Auto-Reconnect                                       | S8:worker | `src/background/iconState/`, `src/devtools/hooks/useConnection.ts`, `public/img/*-inactive.png`                                                                                                                                                                           |
| TASK-03: Content Script Proxy & Messaging                                  | S8:worker | `src/contentScript/messaging/`, `src/background/messaging/`                                                                                                                                                                                                               |
| TASK-02: Sidebar UI & Navigation                                           | S8:worker | `src/devtools/components/Sidebar/`, `EmptyState/`                                                                                                                                                                                                                         |
| TASK-01: Project Setup (Bug Fix)                                           | S8:worker | `devtools.html` panel creation script added                                                                                                                                                                                                                               |
| TASK-01: Project Setup (Original)                                          | S8:worker | `src/manifest.ts`, `src/messaging/`, `src/devtools/`                                                                                                                                                                                                                      |

## 4) Upcoming

- **Next task**: F-002 implementation - Database tab navigation with nested routing
- **Pending**: TASK-10 (OPFS File Browser) - can proceed in parallel
- **Final task**: TASK-12 (Testing & Release) - depends on F-002 completion
- **Target date**: 2026-01-27 MVP release

## 5) Risks / blockers

- **R1 (HIGH)**: web-sqlite-js version mismatch | **Status**: LLD assumes v2.1.0+, spike S-004 pending
- **R2 (MED)**: Map serialization | **Status**: LLD specifies Map→Array conversion in Content Script Proxy
- **R3 (MED)**: CodeMirror bundle size | **Status**: LLD assumes CodeMirror 6, spike S-003 pending
- **R4 (HIGH)**: Page refresh handling | **Status**: LLD defines heartbeat+exponential backoff in Background Service
- **R5 (LOW)**: Log buffer overflow | **Status**: LLD implements LogRingBuffer with 500 entry limit
- **R6 (LOW)**: OPFS access restrictions | **Status**: LLD implements error handling for unsupported browsers

## 6) Recent changes

- **C1**: 2026-01-13 - Stage 1 Discovery completed (44 MVP FRs, icon mapping)
- **C2**: 2026-01-13 - Stage 2 Feasibility Analysis completed (Option A recommended, 4 spikes)
- **C3**: 2026-01-13 - Stage 3 Architecture completed (HLD, 8 dataflows, deployment)
- **C4**: 2026-01-13 - Stage 4 ADR completed (6 ADRs with alternatives and consequences)
- **C5**: 2026-01-13 - Stage 5 Design completed (10 API channels, 6 event types, 10 error codes, message type definitions, 4 module LLDs)
- **C6**: 2026-01-13 - Stage 7 Task Management completed (6-phase roadmap, 12 actionable tasks, target: 2026-01-27)
- **C7**: 2026-01-13 - TASK-01 completed (manifest, message channels, React Router setup)
- **C8**: 2026-01-13 - TASK-01 bug fix (DevTools panel creation script added to devtools.html with "Sqlite" label)
- **C9**: 2026-01-13 - TASK-09 completed (Log Streaming & Ring Buffer UI)
- **C10**: 2026-01-14 - F-002 feature documented (Database Tab Navigation Restructuring)
- **C11**: 2026-01-14 - S1-S8 documentation audit completed (fixed all conflicts with F-002)
  - HLD (S3): Updated component hierarchy with nested routing, 5 tabs
  - DevTools Panel (S5): Updated tab count, routes, component file tree
  - Requirements (S1): Updated FR-009, FR-015, FR-016, FR-017, FR-019, FR-022
  - Task Catalog (S7): Consolidated TASK-07/08/11/101/102 into F-002
  - Dataflow (S3): Fixed route paths for nested routing
