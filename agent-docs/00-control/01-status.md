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
- **Current focus**: TASK-05.2 completed, TASK-05.3 ready to start
- **Last updated**: 2026-01-13 (TASK-05.2 - Service Layer SQL Execution Functions)

## 2) Active work

| Item                                  | Owner     | Status | Evidence |
| ------------------------------------- | --------- | ------ | -------- |
| (None - awaiting next task selection) | S8:worker | -      | -        |

## 3) Done (Recent)

| Task                                                | Owner     | Evidence                                                                                                                                                                                                                                          |
| ------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-05.2: Service Layer - SQL Execution Functions | S8:worker | `src/devtools/services/databaseService.ts` (SqlValue, SQLParams, ExecResult types, execSQL)                                                                                                                                                       |
| TASK-05.1: Service Layer - Table Schema Functions | S8:worker | `src/devtools/services/databaseService.ts` (ColumnInfo, TableSchema, QueryResult types, getTableSchema, queryTableData)                                                                                                                           |
| TASK-05: Database List & Table Browser             | S8:worker | `src/devtools/inspectedWindow.ts`, `src/devtools/hooks/useInspectedWindowRequest.ts`, `src/devtools/utils/databaseNames.ts`, `src/devtools/components/Sidebar/DatabaseList.tsx`, `src/devtools/components/TableTab/`, `src/devtools/DevTools.tsx` |
| TASK-04: Icon State & Auto-Reconnect               | S8:worker | `src/background/iconState/`, `src/devtools/hooks/useConnection.ts`, `public/img/*-inactive.png`                                                                                                                                                   |
| TASK-03: Content Script Proxy & Messaging          | S8:worker | `src/contentScript/messaging/`, `src/background/messaging/`                                                                                                                                                                                       |
| TASK-02: Sidebar UI & Navigation                   | S8:worker | `src/devtools/components/Sidebar/`, `EmptyState/`                                                                                                                                                                                                 |
| TASK-01: Project Setup (Bug Fix)                   | S8:worker | `devtools.html` panel creation script added                                                                                                                                                                                                       |
| TASK-01: Project Setup (Original)                  | S8:worker | `src/manifest.ts`, `src/messaging/`, `src/devtools/`                                                                                                                                                                                              |

## 4) Upcoming

- **Next task**: TASK-05.3 - Service Layer Log Streaming Functions
- **Next review date**: After TASK-05.3 completion

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
