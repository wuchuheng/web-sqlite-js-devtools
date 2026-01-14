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

**Milestone**: Panel <-> Content Script communication working

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

### Release v1.2.0 (Enhancements)

**Target Date**: 2026-01-21 (1 week from 2026-01-14)
**Focus**: UX improvements - Opened tabs management, Resizable panels, DDL syntax highlighting

#### Phase 1: DDL Syntax Highlight (Day 1)

**Milestone**: F-004 Complete

- [x] **F-004**: DDL Syntax Highlight & Copy Button (Completed 2026-01-14)
  - SQL syntax highlighting with react-syntax-highlighter (Prism.js light theme)
  - Copy button with clipboard API and success feedback

#### Phase 2: Tab Management (Days 2-4)

**Milestone**: F-005 Complete - Opened table tabs with close buttons

- [x] **TASK-301**: Opened Table Tabs Management Feature (F-005) (Completed 2026-01-14)
  - Create `OpenedTableTabs.tsx` component with close buttons
  - Implement state-managed opened tabs
  - Auto-open first table on database selection
  - Auto-switch to next tab after close
  - Empty state handling

#### Phase 3: Resizable Panels (Days 5-6)

**Milestone**: F-006 Complete - Draggable resize handles

- [x] **TASK-302**: Resizable Vertical Dividers Feature (F-006) (Completed 2026-01-14)
  - Create shared `ResizeHandle.tsx` component
  - Implement TablesTab resizable sidebar (200-600px)
  - Implement TableDetail resizable schema panel (250-600px)
  - Cursor change and visual feedback

#### Phase 4: Testing & Polish (Day 7)

**Milestone**: Production-ready features

- [x] **TASK-303**: Integration Testing & Polish (Completed 2026-01-14)
  - Test both features together
  - Fix any visual glitches or state bugs
  - Update documentation

#### Phase 5: Opened Database List Route (Days 8-10)

**Milestone**: F-008 Complete - Generic /openedDB route with database list

- [x] **TASK-304**: Opened Database List Route Feature (F-008) (Completed 2026-01-14)
  - Create OpenedDBList component with 6 sub-components
  - Add generic /openedDB route to DevTools.tsx
  - Update sidebar "Opened DB" link from / to /openedDB
  - Implement loading, error, empty, and success states
  - Add refresh button with IoMdRefresh icon
  - Implement database card navigation to /openedDB/:dbname/tables
  - Testing and documentation

#### Phase 6: Log Tab Integration (Day 11)

**Milestone**: F-009 Complete - Log tab in database navigation

- [x] **TASK-305**: Log Tab Integration Feature (F-009) (Completed 2026-01-14)
  - Add IoTimeOutline icon import to DatabaseTabHeader
  - Add logs tab to DATABASE_TABS array (between Query and Migration)
  - Add logs route to DevTools.tsx nested routes (before migration)
  - Test tab navigation and active state styling
  - Verify LogView component renders correctly
  - Testing and documentation

#### Phase 7: Database Refresh Coordination (Day 12)

**Milestone**: F-010 Complete - Coordinated refresh between sidebar and main page

- [ ] **TASK-306**: Database Refresh Coordination Feature (F-010)
  - Create DatabaseRefreshContext with Provider and hook
  - Add refresh button to sidebar "Opened DB" header (left side)
  - Integrate context with DatabaseList and OpenedDBList
  - Test bidirectional refresh synchronization
  - Testing and documentation

### Release v1.3.0 (Future Enhancements)

**Target Date**: TBD
**Focus**: Additional UX improvements and features

- [ ] **TASK-401**: Dark/Light Theme Toggle (F-009)
  - Theme provider implementation
  - Settings panel
  - Persist to chrome.storage

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
- [x] **v1.2.0 Phase 1-5 Complete**: 2026-01-14 (F-004, F-005, F-006, F-008)
- [x] **v1.2.0 Phase 6 Complete**: 2026-01-14 (F-009)
- [ ] **v1.2.0 Phase 7 Complete**: TBD (F-010)

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

## 5. Feature F-008: Opened Database List Route

### Overview

**Feature ID**: F-008 (Discovery)
**Status**: Implementation Ready
**Priority**: High (P1 - Navigation enhancement)
**Target**: Complete during v1.2.0 Phase 5 (Days 8-10 from 2026-01-14)

### Objective

Add a generic `/openedDB` route to display a list of all opened databases, enabling centralized database navigation. This resolves the issue where the sidebar "Opened DB" link navigates to `/` instead of a proper database list view.

### Tasks Breakdown

#### TASK-304: Opened Database List Route Feature (F-008)

**Estimated**: 12 hours (3-4 days)
**Priority**: P1 (High)
**Dependencies**: F-002 (Database Tab Navigation), F-007 (Uniform Theme Configuration)

**Implementation Phases**:

1. **Component Creation** (6 hours)
   - Create `OpenedDBList.tsx` - Main component with data fetching
   - Create `DatabaseCard.tsx` - Individual database card with navigation
   - Create `EmptyDatabaseList.tsx` - Empty state with refresh button
   - Create `LoadingSkeleton.tsx` - Loading skeleton (3 cards)
   - Create `ErrorState.tsx` - Error state with retry button
   - Create `Header.tsx` - Page header with refresh button
   - Create `DatabaseList.tsx` - List container with active state detection

2. **Route Configuration** (2 hours)
   - Add `/openedDB` route to `DevTools.tsx` (BEFORE `/openedDB/:dbname`)
   - Verify route order (generic before parameterized)
   - Update sidebar "Opened DB" link from `/` to `/openedDB`
   - Test navigation flow

3. **Integration & Testing** (3 hours)
   - Test loading state on initial load
   - Test empty state when no databases
   - Test error state with retry button
   - Test database list display
   - Test refresh functionality (header button)
   - Test navigation: Click card -> /openedDB/:dbname/tables
   - Test active state highlighting
   - Test keyboard navigation

4. **Documentation** (1 hour)
   - Update feature spec with completion status
   - Update HLD if needed
   - Update LLD with implementation notes
   - Verify all acceptance criteria met

### Dependencies

- **Upstream**: F-002 (Database Tab Navigation), F-007 (Uniform Theme Configuration)
- **Downstream**: None (can proceed independently)

### Success Criteria

1. Route Structure
   - [x] `/openedDB` route exists and renders `OpenedDBList` component
   - [x] Direct navigation to `/openedDB` works
   - [x] Route is added to `DevTools.tsx` Routes configuration

2. Sidebar Navigation
   - [x] "Opened DB" link navigates to `/openedDB` instead of `/`
   - [x] Active state highlights correctly on `/openedDB` and child routes
   - [x] Clicking "Opened DB" shows database list in main content area

3. Database List Display
   - [x] Fetches databases using `databaseService.getDatabases()`
   - [x] Displays each database as a clickable card
   - [x] Shows database name and table count
   - [x] Clicking card navigates to `/openedDB/:dbname/tables`

4. Empty State
   - [x] Shows when no databases are opened
   - [x] Displays SiSqlite icon
   - [x] Shows "No Opened Databases" title
   - [x] Shows helpful message about web-sqlite-js
   - [x] Includes refresh button with `IoMdRefresh` icon

5. Refresh Functionality
   - [x] Header refresh button re-fetches database list
   - [x] Empty state refresh button re-fetches database list
   - [x] Shows loading state during refresh
   - [x] Handles errors with retry option

6. Edge Cases
   - [x] Loading state shows on initial load
   - [x] Error state shows with retry button
   - [x] Empty database list shows custom empty state
   - [x] Single database shows correctly
   - [x] Multiple databases show as list

### Risk Mitigation

- **Route Conflicts**: Ensure generic `/openedDB` route precedes parameterized `/openedDB/:dbname`
- **State Management**: Use existing `useInspectedWindowRequest` hook (no new state logic needed)
- **Service Layer**: Uses existing `getDatabases()` function (no service changes needed)
- **Theme Consistency**: Follow F-007 semantic color tokens

### Timeline

- **Day 1** (3 hours): Component creation (OpenedDBList, DatabaseCard, EmptyDatabaseList)
- **Day 2** (3 hours): Component creation (LoadingSkeleton, ErrorState, Header, DatabaseList)
- **Day 3** (2 hours): Route configuration and sidebar link update
- **Day 3** (3 hours): Integration testing and bug fixes
- **Day 4** (1 hour): Documentation and final verification

### Definition of Done

- [x] All 7 components implemented with TypeScript strict mode
- [x] All components use F-007 theme tokens
- [x] Route configuration updated with correct order
- [x] Sidebar link updated to `/openedDB`
- [x] Loading, error, empty states implemented
- [x] Keyboard navigation tested
- [x] ARIA labels added
- [x] Build passes with no errors
- [x] Manual testing complete (all 10 scenarios from LLD)
- [x] Feature spec marked complete
- [x] Documentation updated

## 6. Feature F-009: Log Tab Integration

### Overview

**Feature ID**: F-009 (Discovery)
**Status**: Implementation Ready
**Priority**: P2 (Medium - Navigation enhancement)
**Target**: Complete during v1.2.0 Phase 6 (Day 11 from 2026-01-14)

### Objective

Add Log tab to database tab navigation, integrating the existing LogView component into the database context. This provides unified navigation for all database-related features (Tables, Query, Log, Migration, Seed, About).

### Tasks Breakdown

#### TASK-305: Log Tab Integration Feature (F-009)

**Estimated**: 0.5-1 hour
**Priority**: P2 (Medium)
**Dependencies**: F-002 (Database Tab Navigation), TASK-09 (Log Streaming - provides LogView component)

**Implementation Phases**:

1. **Tab Header Update** (0.25 hour)
   - Add import: `import { IoTimeOutline } from "react-icons/io5";` to DatabaseTabHeader.tsx
   - Add logs tab to DATABASE_TABS array after "query" tab
   - Position: 3rd tab (between Query and Migration)
   - Icon: IoTimeOutline with size={18}
   - Label: "Log"

2. **Route Configuration** (0.25 hour)
   - Add `<Route path="logs" element={<LogView />} />` to DevTools.tsx
   - Place logs route BEFORE migration route (maintains tab order)
   - Import LogView component from existing location
   - Verify nested route structure

3. **Testing & Verification** (0.25 hour)
   - Click "Log" tab → should navigate to `/openedDB/:dbname/logs`
   - Verify tab highlights with active state styling
   - Verify LogView renders correctly
   - Test tab switching between all 6 tabs
   - Test with different databases
   - Verify log functionality (filtering, subscription) works

4. **Documentation** (0.25 hour)
   - Update feature spec with completion status
   - Verify LLD implementation notes
   - Update module doc implementation status
   - Verify all acceptance criteria met

### Dependencies

- **Upstream**: F-002 (Database Tab Navigation), TASK-09 (Log Streaming)
- **Downstream**: None (can proceed independently)

### Success Criteria

1. **Tab Addition**
   - [ ] "Log" tab appears in database tab header
   - [ ] Positioned between "Query" and "Migration"
   - [ ] Uses `IoTimeOutline` icon
   - [ ] Label shows "Log"

2. **Navigation**
   - [ ] Clicking "Log" tab navigates to `/openedDB/:dbname/logs`
   - [ ] Active state styling applies correctly
   - [ ] URL updates in browser address bar

3. **Component Rendering**
   - [ ] LogView component renders correctly
   - [ ] Database name available from route params
   - [ ] Log functionality works (subscription, filtering)

4. **Integration**
   - [ ] Tab switching works smoothly
   - [ ] No visual glitches
   - [ ] Consistent with other tabs

5. **Build Verification**
   - [ ] `npm run build` passes
   - [ ] `npm run typecheck` passes
   - [ ] No console errors

### Risk Mitigation

- **Complexity**: Low (simple integration of existing component)
- **Files Modified**: Only 2 files (DatabaseTabHeader.tsx, DevTools.tsx)
- **Component Reuse**: LogView works as-is, no modifications needed
- **Route Order**: Ensure logs route placed before migration route
- **Backward Compatibility**: Old `/logs/:dbname` route kept (optional redirect)

### Timeline

- **15 minutes**: Add IoTimeOutline import and logs tab to DATABASE_TABS array
- **15 minutes**: Add logs route to DevTools.tsx nested routes
- **15 minutes**: Manual testing (all scenarios)
- **15 minutes**: Documentation and final verification

### Definition of Done

- [x] DatabaseTabHeader.tsx updated with IoTimeOutline icon and logs tab
- [x] DevTools.tsx updated with logs route inside DatabaseTabs
- [x] Build passes with no errors (npm run build)
- [x] Type checking passes (npm run typecheck)
- [x] Manual testing complete (all 10 scenarios from LLD)
- [x] Tab navigation works correctly
- [x] Active state styling applied correctly
- [x] LogView functionality preserved
- [x] No console errors
- [x] Feature spec marked complete
- [x] Documentation updated

## 7. Feature F-010: Database Refresh Coordination

### Overview

**Feature ID**: F-010 (Discovery)
**Status**: Implementation Ready
**Priority**: P2 (Medium - UX enhancement)
**Target**: Complete during v1.2.0 Phase 7 (Day 12 from 2026-01-14)

### Objective

Add shared React Context to coordinate database refresh between sidebar and main page, ensuring consistent data across both locations. Add refresh button to sidebar "Opened DB" header (left side) for better UX.

### Tasks Breakdown

#### TASK-306: Database Refresh Coordination Feature (F-010)

**Estimated**: 1-2 hours
**Priority**: P2 (Medium)
**Dependencies**: F-002 (Database Tab Navigation), F-008 (Opened Database List Route), TASK-09 (Log Streaming - provides context pattern reference)

**Implementation Phases**:

1. **Context Creation** (0.5 hour)
   - Create `src/devtools/contexts/DatabaseRefreshContext.tsx`
   - Define `DatabaseRefreshContextValue` interface
   - Create `DatabaseRefreshContext` with null default
   - Implement `DatabaseRefreshProvider` component
     - Add refreshVersion state (useState, default 0)
     - Implement triggerRefresh callback (useCallback)
     - Memoize context value (useMemo)
     - Add TSDoc comments
   - Implement `useDatabaseRefresh` hook
     - Call useContext
     - Add error if context missing
     - Add TSDoc comments
   - Export context, provider, and hook

2. **DevTools Integration** (0.25 hour)
   - Import `DatabaseRefreshProvider` in DevTools.tsx
   - Wrap DevToolsContent return with provider
   - Verify provider placement (before Sidebar/main split)

3. **Sidebar Integration** (0.5 hour)
   - Import `useDatabaseRefresh` in DatabaseList.tsx
   - Import `IoMdRefresh` icon from react-icons/io
   - Consume context in component
   - Add refreshVersion to dependency array
   - Add refresh button to header (left side)
     - Button positioned before SidebarLink
     - Flex container for layout
     - Button styling (text-secondary-500 hover:text-primary-600)
     - ARIA label added

4. **Main Page Integration** (0.25 hour)
   - Import `useDatabaseRefresh` in OpenedDBList.tsx
   - Consume context in component
   - Add refreshVersion to dependency array
   - Pass triggerRefresh to Header (existing prop)

5. **Testing & Verification** (0.5 hour)
   - Test bidirectional refresh (main page → sidebar)
   - Test bidirectional refresh (sidebar → main page)
   - Test data consistency (both show same data)
   - Test collapsed sidebar (button visible, works)
   - Test expanded sidebar (button visible, works)
   - Test error state (both refresh buttons work)
   - Test empty state (both refresh buttons work)
   - Test rapid clicks (debounced, single refresh)
   - Verify no console errors
   - Verify no TypeScript errors

6. **Build & Documentation** (0.125 hour each)
   - Run build: `npm run build`
   - Run type check: `npm run typecheck`
   - Update feature spec with completion status
   - Update LLD with implementation notes
   - Update status board with completion evidence
   - Verify all DoD items complete

### Dependencies

- **Upstream**: F-002 (Database Tab Navigation), F-008 (Opened Database List Route), TASK-09 (Log Streaming)
- **Downstream**: None (can proceed independently)

### Success Criteria

1. **Context Creation**
   - [ ] DatabaseRefreshContext created with proper TypeScript types
   - [ ] Provider wraps DevTools content
   - [ ] Context exports useDatabaseRefresh hook
   - [ ] TSDoc comments added

2. **Sidebar Refresh Button**
   - [ ] Refresh button appears on left side of "Opened DB" header
   - [ ] Button uses IoMdRefresh icon (16px)
   - [ ] Clicking button triggers shared refresh
   - [ ] Button styling matches F-007 theme tokens

3. **Main Page Integration**
   - [ ] OpenedDBList consumes DatabaseRefreshContext
   - [ ] Header refresh button uses shared trigger
   - [ ] Component refetches on refreshVersion change

4. **Synchronization**
   - [ ] Clicking main page refresh updates sidebar list
   - [ ] Clicking sidebar refresh updates main page list
   - [ ] Both locations show consistent data after refresh
   - [ ] No duplicate API calls (single refreshVersion increment)

5. **Edge Cases**
   - [ ] Refresh works when sidebar is collapsed
   - [ ] Refresh works when sidebar is expanded
   - [ ] Refresh works on error state
   - [ ] Refresh works on empty state
   - [ ] Multiple rapid clicks only trigger one refresh (debounced)

6. **Build Verification**
   - [ ] `npm run build` passes
   - [ ] `npm run typecheck` passes
   - [ ] No console errors
   - [ ] Bundle size impact acceptable (< 5KB)

### Risk Mitigation

- **Complexity**: Low (standard React Context pattern)
- **Files Modified**: 4 files (1 new, 3 existing)
- **Component Reuse**: 100% (no new components, just context)
- **API Changes**: None (uses existing getDatabases)
- **Breaking Changes**: None (additive only)
- **Rollback**: Simple (remove provider wrapper, revert imports)

### Timeline

- **30 minutes**: Create DatabaseRefreshContext with Provider and hook
- **15 minutes**: Update DevTools.tsx to wrap content with provider
- **30 minutes**: Update DatabaseList to consume context and add refresh button
- **15 minutes**: Update OpenedDBList to consume context
- **30 minutes**: Testing and bug fixes
- **7 minutes**: Build verification
- **8 minutes**: Documentation and final verification

### Definition of Done

- [ ] DatabaseRefreshContext created with proper TypeScript types
- [ ] DatabaseRefreshProvider wraps DevTools content
- [ ] useDatabaseRefresh hook exported and documented
- [ ] Sidebar refresh button added (left side, IoMdRefresh icon)
- [ ] Sidebar refresh button styling matches F-007 tokens
- [ ] OpenedDBList consumes DatabaseRefreshContext
- [ ] Main page refresh button uses shared trigger
- [ ] Bidirectional refresh working (both directions)
- [ ] Data consistency verified (both locations show same data)
- [ ] Debounce working (rapid clicks = single refresh)
- [ ] Edge cases handled (collapsed, error, empty states)
- [ ] Build passed with no errors
- [ ] Type check passed with no errors
- [ ] Bundle size impact acceptable (< 5KB)
- [ ] Feature spec updated
- [ ] LLD updated with implementation status
- [ ] Status board updated
