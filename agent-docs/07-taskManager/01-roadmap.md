<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/07-roadmap.md

OUTPUT MAP (write to)
agent-docs/07-taskManager/01-roadmap.md

NOTES
- Keep headings unchanged.
-->

# 01 Roadmap & Strategy

## 1. Active Release: v1.0.0 (MVP)

> **Focus**: Core DevTools extension for web-sqlite-js debugging (Table browser, Query editor, Log viewer, OPFS browser)
> **Target Date**: 2026-01-27
> **Duration**: 14 days (from 2026-01-13)

### Key Features (Scope)

- [x] **F-001**: DevTools Panel with Sidebar navigation (FR-001 to FR-014)
- [ ] **F-002**: Table browser with multi-tab support (FR-016 to FR-023)
- [ ] **F-003**: SQL Query editor with CodeMirror (FR-024 to FR-028)
- [ ] **F-004**: Real-time Log viewer with filtering (FR-029 to FR-030)
- [ ] **F-005**: OPFS file browser with download (FR-036 to FR-038)
- [ ] **F-006**: Icon state management (FR-002, FR-003)
- [ ] **F-007**: About tab with database metadata (FR-035)
- [ ] **F-008**: Auto-reconnect on page refresh (FR-041)
- [ ] **F-009**: Service Layer Expansion (F-001 Discovery Feature)
  - Implement all 10 missing database service functions
  - Migrate components to use service layer instead of direct inspectedWindow access

### Release Phases (20 Tasks - Updated for F-001)

#### Phase 1: Foundation (Days 1-2)

**Milestone**: Project setup + messaging infrastructure

- [x] TASK-01: Project Setup & Configuration
- [x] TASK-02: Sidebar UI & Navigation

#### Phase 2: Core Messaging (Days 3-4)

**Milestone**: Panel ↔ Content Script communication working

- [x] TASK-03: Content Script Proxy & Background Messaging
- [x] TASK-04: Icon State & Auto-Reconnect

#### Phase 3: Database Inspection (Days 5-9)

**Milestone**: Service layer complete + Can list and browse database tables

- [x] TASK-05: Database List & Table Browser
- [ ] **TASK-05.1**: Service Layer - Table Schema Functions (getTableSchema, queryTableData)
- [ ] **TASK-05.2**: Service Layer - SQL Execution Functions (execSQL)
- [ ] **TASK-05.3**: Service Layer - Log Streaming Functions (subscribeLogs, unsubscribeLogs)
- [ ] **TASK-05.4**: Service Layer - Migration & Versioning Functions (devRelease, devRollback, getDbVersion)
- [ ] **TASK-05.5**: Service Layer - OPFS File Browser Functions (getOpfsFiles, downloadOpfsFile)
- [ ] **TASK-05.6**: Component Migration - Table Browser Components
- [ ] **TASK-06**: Table Data & Schema UI (depends on TASK-05.1, TASK-05.6)

#### Phase 4: Query & Logs (Days 10-12)

**Milestone**: SQL execution and log streaming working

- [ ] **TASK-05.7**: Component Migration - Query Editor Components
- [ ] **TASK-05.8**: Component Migration - Log & OPFS Components
- [ ] TASK-07: Query Editor with CodeMirror (depends on TASK-05.2, TASK-05.7)
- [ ] TASK-08: Query Results & Export (depends on TASK-05.7)
- [ ] TASK-09: Log Streaming & Ring Buffer (depends on TASK-05.3, TASK-05.8)

#### Phase 5: OPFS & About (Days 13-14)

**Milestone**: File browsing and database info working

- [ ] TASK-10: OPFS File Browser (depends on TASK-05.5, TASK-05.8)
- [ ] TASK-11: About Tab & Tab Navigation (depends on TASK-05.4)

#### Phase 6: Testing & Release (Day 14)

**Milestone**: Production-ready extension

- [ ] TASK-12: Testing & Release (includes service layer tests)

## 2. Upcoming Releases (Backlog)

### Release v1.1.0 (Post-MVP)

- [ ] **TASK-101**: Migration playground (FR-031, FR-032, FR-033)
  - **Note**: Service layer functions implemented in TASK-05.4
- [ ] **TASK-102**: Seed playground (FR-033, FR-034)
  - **Note**: Service layer functions implemented in TASK-05.4

### Release v1.2.0 (Future)

- [ ] **TASK-201**: Query history (FR-106)
- [ ] **TASK-202**: Keyboard shortcuts (FR-107)
- [ ] **TASK-203**: Dark/light theme toggle (FR-108)

## 3. Milestones (History)

- [x] **Planning (2026-01-13)**: Stages 1-5 completed (Discovery, Feasibility, Architecture, ADR, Design)
- [x] **Foundation Complete**: By end of Day 2 (TASK-01, TASK-02)
- [x] **Core Messaging Working**: By end of Day 4 (TASK-03, TASK-04)
- [ ] **Service Layer Complete**: By end of Day 7 (TASK-05.1 through TASK-05.5)
- [ ] **Component Migration Complete**: By end of Day 8 (TASK-05.6 through TASK-05.8)
- [ ] **Database Inspection Working**: By end of Day 9 (TASK-05, TASK-05.1, TASK-05.6, TASK-06)
- [ ] **Query & Logs Working**: By end of Day 12 (TASK-05.2, TASK-05.3, TASK-05.7, TASK-05.8, TASK-07, TASK-08, TASK-09)
- [ ] **OPFS & About Working**: By end of Day 13 (TASK-05.4, TASK-05.5, TASK-10, TASK-11)
- [ ] **v1.0.0 MVP Released**: 2026-01-27 (TASK-12)

## 4. Feature F-001: Service Layer Expansion

### Overview

**Feature ID**: F-001 (Discovery)
**Status**: Implementation Ready
**Priority**: High (P0 Blocker for MVP)
**Target**: Complete during Phase 3 (Days 5-9)

### Objective

Implement all 10 missing database service functions in `databaseService.ts` to establish a clean separation between business logic and Chrome API concerns. This ensures all database interactions flow through the service layer instead of direct `inspectedWindow.eval` calls in components.

### Tasks Breakdown

#### Service Layer Implementation (5 tasks)

1. **TASK-05.1**: Table Schema Functions (2 functions)
   - `getTableSchema(dbname, tableName)` - Get table columns, types, constraints, DDL
   - `queryTableData(dbname, sql, limit, offset)` - Execute SELECT with pagination

2. **TASK-05.2**: SQL Execution Functions (1 function)
   - `execSQL(dbname, sql, params?)` - Execute INSERT/UPDATE/DELETE/DDL

3. **TASK-05.3**: Log Streaming Functions (2 functions)
   - `subscribeLogs(dbname)` - Subscribe to log events
   - `unsubscribeLogs(subscriptionId)` - Unsubscribe from log events

4. **TASK-05.4**: Migration & Versioning Functions (3 functions)
   - `devRelease(dbname, version, migrationSQL?, seedSQL?)` - Create dev version
   - `devRollback(dbname, toVersion)` - Rollback dev version
   - `getDbVersion(dbname)` - Get current database version

5. **TASK-05.5**: OPFS File Browser Functions (2 functions)
   - `getOpfsFiles(path?, dbname?)` - List OPFS files
   - `downloadOpfsFile(path)` - Download OPFS file

#### Component Migration (3 tasks)

6. **TASK-05.6**: Table Browser Components
   - Migrate `DatabaseList.tsx`, `TableList.tsx`, `TableContent.tsx`

7. **TASK-05.7**: Query Editor Components
   - Migrate `CodeMirrorEditor.tsx`, `QueryResults.tsx`, `ExportButton.tsx`

8. **TASK-05.8**: Log & OPFS Components
   - Migrate `LogList.tsx`, `LogFilter.tsx`, `FileTree.tsx`, `DownloadButton.tsx`

### Dependencies

- **Upstream**: TASK-05 (Database List & Table Browser)
- **Downstream**: TASK-06 through TASK-11 (all UI tasks now depend on service layer)

### Success Criteria

1. All 10 service functions implemented with proper TypeScript types
2. All components migrated to use service layer
3. Old `inspectedWindow` exports marked as `@deprecated`
4. Service layer unit tests with mocked bridge layer
5. Component integration tests updated

### Risk Mitigation

- **Complexity**: Break down into 8 small, focused tasks (4 hours each)
- **Dependencies**: Clear task ordering (service layer before component migration)
- **Testing**: Unit tests for service layer, integration tests for components
- **Rollback**: Keep old `inspectedWindow` exports during transition period

### Timeline

- **Days 5-7**: Implement service layer functions (TASK-05.1 through TASK-05.5)
- **Days 8-9**: Migrate components to use service layer (TASK-05.6 through TASK-05.8)
- **Day 14**: Final testing and cleanup (TASK-12)
