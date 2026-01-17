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

- [x] **TASK-306**: Database Refresh Coordination Feature (F-010) (Completed 2026-01-14)
  - Create DatabaseRefreshContext with Provider and hook
  - Add refresh button to sidebar "Opened DB" header (left side)
  - Integrate context with DatabaseList and OpenedDBList
  - Test bidirectional refresh synchronization
  - Testing and documentation

#### Phase 8: ESLint Integration (Day 13)

**Milestone**: F-011 Complete - Automated code linting with ESLint 9

- [x] **TASK-307**: ESLint Integration Feature (F-011) (Completed 2026-01-15)
  - Install ESLint packages (7 packages: eslint, @eslint/js, @typescript-eslint/\*, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-prettier)
  - Create eslint.config.js (flat config format with 5 layers)
  - Create .vscode/settings.json (ESLint integration)
  - Add NPM scripts (lint, lint:fix)
  - Test configuration and IDE integration
  - Run lint:fix on existing codebase
  - Documentation updates

#### Phase 9: OPFS Browser Enhancement (Days 14-17)

**Milestone**: F-012 Complete - Tree lines, delete operations, enhanced metadata

- [ ] **TASK-308**: Service Layer - Delete Operations (F-012)
  - Implement `deleteOpfsFile(path)` in databaseService.ts
  - Implement `deleteOpfsDirectory(path)` in databaseService.ts
  - Update `OpfsFileEntry` type with metadata fields
  - Add metadata fetching to `getOpfsFiles()`
  - Error handling and testing

- [ ] **TASK-309**: Guided Tree Lines Component (F-012)
  - Create `TreeLines.tsx` component
  - CSS styling for vertical/horizontal connectors
  - Responsive hiding for collapsed sidebar
  - Integration with FileTree.tsx

- [ ] **TASK-310**: Delete Confirmation Modal (F-012)
  - Create `DeleteConfirmModal.tsx` component
  - Metadata display grid layout
  - Confirm/cancel button logic
  - Loading state handling
  - Accessibility (focus trap, ARIA)

- [ ] **TASK-311**: Enhanced Metadata Display (F-012)
  - Create `MetadataPanel.tsx` component
  - File type detection and badges
  - Timestamp formatting utilities
  - Hover/click interaction
  - Directory item counting

- [ ] **TASK-312**: Toast Notifications (F-012)
  - Create `Toast.tsx` component
  - Success and error variants
  - Auto-dismiss logic
  - Position styling (top-right)
  - Integration with delete operations

- [ ] **TASK-313**: Integration & Testing (F-012)
  - Integrate all components with FileTree.tsx
  - Update OPFSGallery.tsx for toast handling
  - Test delete operations (files and directories)
  - Test metadata display for all file types
  - Test tree line rendering at various depths
  - ESLint and build verification

#### Phase 10: OPFS Browser Two-Panel Layout (Days 18-20)

**Milestone**: F-013 Complete - Two-panel layout with file preview

**Target Date**: 2026-01-17 (3 days from 2026-01-15)
**Dependencies**: F-012 (OPFS Browser Enhancement) - Must be complete

**Feature Overview**: Transform OPFS browser into two-panel layout with file preview capability. Left panel shows file tree navigation (existing FileTree component), right panel shows selected file contents (new FilePreview components). Users can resize panels using draggable divider (reusing ResizeHandle from F-006).

**Tasks Breakdown**:

- [ ] **TASK-314**: Service Layer - File Content Loading (F-013)
  - Add `getFileContent(path)` function to databaseService.ts
  - Implement file type detection (text/image/binary)
  - Read file content based on type (text() for text, Blob for images)
  - Enforce file size limits (text: 10MB max, images: 5MB max)
  - Return metadata (size, lastModified, mimeType)
  - Error handling (file not found, permission denied, encoding errors)
  - Three-phase comments for functions > 5 lines
  - TSDoc comments on exported function
  - Estimated time: 2 hours

- [ ] **TASK-315**: File Preview Component Structure (F-013)
  - Create `FilePreview.tsx` main container component
  - Implement state management (loading, error, content)
  - Add useEffect hook for file content loading
  - Implement conditional rendering based on file state
  - Add loading spinner with emerald theme
  - Add error state with retry button
  - Delegate to appropriate preview component (TextPreview, ImagePreview, UnsupportedPreview)
  - Handle empty state (no file selected)
  - TSDoc comments on component and interfaces
  - Estimated time: 2 hours

- [ ] **TASK-316**: Text Preview Implementation (F-013)
  - Create `TextPreview.tsx` component
  - Display text content in monospace font (<pre> tag)
  - Show "Preview: {filename}" header with emerald theme
  - Display metadata (size, modified date) in header
  - Preserve line breaks and formatting (whitespace-pre-wrap)
  - Optional: JSON syntax highlighting if feasible
  - Handle large text files (> 1MB warning, > 10MB block)
  - TSDoc comments on component and interfaces
  - Estimated time: 1.5 hours

- [ ] **TASK-317**: Image Preview Implementation (F-013)
  - Create `ImagePreview.tsx` component
  - Display image with responsive scaling (object-fit: contain)
  - Show "Preview: {filename}" header with emerald theme
  - Display metadata (size, modified date) in header
  - Create object URL for image display
  - Cleanup object URL on unmount (useEffect return)
  - Handle large images (> 5MB block)
  - Maintain aspect ratio (max-width: 100%, max-height: 100%)
  - TSDoc comments on component and interfaces
  - Estimated time: 1.5 hours

- [ ] **TASK-318**: Panel Resizing Integration (F-013)
  - Modify `OPFSGallery.tsx` to use two-panel flex layout
  - Add `leftPanelWidth` state (default: 350px, range: 200-600px)
  - Add `selectedFile` state for preview
  - Add `handleResize` callback with width constraints
  - Integrate `ResizeHandle` component from F-006
  - Modify `FileTree.tsx` to accept `onFileSelect` and `selectedFile` props
  - Modify `FileNode.tsx` to show selected state highlight (emerald-50 background)
  - Add click handler to FileNode for file selection
  - Test panel resizing smoothness (60fps target)
  - Test minimum/maximum width constraints
  - Estimated time: 2 hours

- [ ] **TASK-319**: Integration & Testing (F-013)
  - Create `EmptyPreview.tsx` component (no selection state)
  - Create `UnsupportedPreview.tsx` component (binary files)
  - Integrate all preview components with FilePreview
  - Test file selection and preview updates
  - Test text preview with various file types (.log, .txt, .json, .xml, .csv, .md)
  - Test image preview with various formats (.jpg, .png, .gif, .svg, .webp)
  - Test SQLite database placeholder (with download button)
  - Test unsupported file placeholder (with download button)
  - Test empty state (no file selected)
  - Test loading state (large files)
  - Test error state (file not found, permission denied)
  - Test panel resizing at different widths
  - Test that all F-012 features still work (tree lines, delete, metadata, toast)
  - ESLint verification (no new warnings)
  - Type check verification (no type errors)
  - Build verification (bundle size check)
  - Manual testing with 10+ test scenarios
  - Update documentation (feature spec, status board)
  - Estimated time: 2 hours

**Success Criteria**:

- **Two-Panel Layout**: [ ] File tree (left) and preview (right) displayed side by side
- **Resizable Divider**: [ ] Panels resize smoothly with 200-600px constraints
- **File Selection**: [ ] Clicking file updates preview panel with visual highlight
- **Text Preview**: [ ] Text files displayed in monospace font with line breaks
- **Image Preview**: [ ] Images displayed with responsive scaling
- **SQLite Placeholder**: [ ] Database files show placeholder with download button
- **Unsupported Placeholder**: [ ] Binary files show placeholder with download button
- **Empty State**: [ ] Preview panel shows empty state when no file selected
- **Loading State**: [ ] Preview panel shows loading spinner during file load
- **Error State**: [ ] Preview panel shows error with retry button on failure
- **Feature Preservation**: [ ] All F-012 features work (tree lines, delete, metadata, toast)

**Risk Mitigation**:

- **Complexity**: Medium (similar to F-012, reuses proven patterns)
- **Files Modified**: 4 files (OPFSGallery, FileTree, FileNode, databaseService)
- **New Components**: 5 components (FilePreview, TextPreview, ImagePreview, EmptyPreview, UnsupportedPreview)
- **Breaking Changes**: None (additive changes only)
- **Migration Path**: N/A (new feature, no existing data)
- **Rollback Strategy**: Remove new components, revert modified files (git checkout)
- **Performance**: File loading < 1s for text < 1MB, < 2s for images < 5MB, panel resize 60fps

**Timeline**:

- **Day 1 (2h)**: TASK-314 (Service Layer) + TASK-315 (FilePreview Container)
- **Day 2 (3h)**: TASK-316 (TextPreview) + TASK-317 (ImagePreview)
- **Day 3 (4h)**: TASK-318 (Panel Resizing) + TASK-319 (Integration & Testing)
- **Total**: 9 hours (within 8-12 hour estimate from feasibility analysis)

**Definition of Done**:

- [ ] All 6 tasks complete (TASK-314 through TASK-319)
- [ ] Two-panel layout implemented with resizable divider
- [ ] File selection updates preview panel
- [ ] Text preview working for all text file types
- [ ] Image preview working for all image formats
- [ ] SQLite and unsupported file placeholders working
- [ ] Empty, loading, and error states working
- [ ] All F-012 features preserved (tree lines, delete, metadata, toast)
- [ ] ESLint passed with no new warnings
- [ ] Type check passed with no errors
- [ ] Build passed with no errors
- [ ] Manual testing completed with 10+ scenarios
- [ ] Documentation updated (feature spec, status board)
- [ ] Bundle size impact assessed (< 100KB increase)

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
- [x] **v1.2.0 Phase 7 Complete**: 2026-01-14 (F-010)
- [x] **v1.2.0 Phase 8 Complete**: 2026-01-15 (F-011)
- [x] **v1.2.0 Phase 9 Complete**: 2026-01-15 (F-012)
- [ ] **v1.2.0 Phase 10 Complete**: TBD (F-013)

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

- [x] DatabaseRefreshContext created with proper TypeScript types
- [x] DatabaseRefreshProvider wraps DevTools content
- [x] useDatabaseRefresh hook exported and documented
- [x] Sidebar refresh button added (left side, IoMdRefresh icon)
- [x] Sidebar refresh button styling matches F-007 tokens
- [x] OpenedDBList consumes DatabaseRefreshContext
- [x] Main page refresh button uses shared trigger
- [x] Bidirectional refresh working (both directions)
- [x] Data consistency verified (both locations show same data)
- [x] Debounce working (rapid clicks = single refresh)
- [x] Edge cases handled (collapsed, error, empty states)
- [x] Build passed with no errors
- [x] Type check passed with no errors
- [x] Bundle size impact acceptable (< 5KB)
- [x] Feature spec updated
- [x] LLD updated with implementation status
- [x] Status board updated with completion evidence

## 8. Feature F-011: ESLint Integration

### Overview

**Feature ID**: F-011 (Discovery)
**Status**: Design Complete - Ready for Implementation
**Priority**: High (P1) - Code Quality
**Target**: Complete during Phase 8 (Day 13)

### Objective

Add ESLint 9 with flat config format, TypeScript support, React rules, and Prettier integration to maintain code quality and consistency across the project. This provides automated linting during development and catches bugs before runtime.

### Task Breakdown: TASK-307

**Implementation Phases** (7 phases, 2-4 hours total):

#### Phase 1: Package Installation (0.5 hour)

**Milestone**: ESLint packages installed

- [ ] Install ESLint 9 core: `npm install --save-dev eslint@^9`
- [ ] Install base config: `npm install --save-dev @eslint/js@^9`
- [ ] Install TypeScript packages: `npm install --save-dev @typescript-eslint/eslint-plugin@^8 @typescript-eslint/parser@^8`
- [ ] Install React packages: `npm install --save-dev eslint-plugin-react@^7.34 eslint-plugin-react-hooks@^5.0`
- [ ] Install Prettier integration: `npm install --save-dev eslint-plugin-prettier@^5`
- [ ] Verify package.json contains all 7 packages
- [ ] Run `npm install` to ensure dependencies resolve

#### Phase 2: Configuration File Creation (0.5 hour)

**Milestone**: eslint.config.js created with flat config

- [ ] Create `eslint.config.js` in project root
- [ ] Add ignore patterns (build/, dist/, node_modules/, \*.config.js/ts)
- [ ] Import all required packages (js, tseslint, tsparser, react, reactHooks, prettier)
- [ ] Configure Layer 1: Base JS (@eslint/js with ES2021 + browser)
- [ ] Configure Layer 2: TypeScript (parser, plugin, type-aware linting)
- [ ] Configure Layer 3: React (settings, plugins, rules, React 17+ JSX)
- [ ] Configure Layer 4: Prettier (plugin, disable conflicting rules)
- [ ] Configure Layer 5: Airbnb-style overrides (consistent-return, curly, console)
- [ ] Export configuration array with all layers

#### Phase 3: VSCode Integration (0.25 hour)

**Milestone**: VSCode ESLint settings configured

- [ ] Create `.vscode/settings.json` (if not exists)
- [ ] Enable ESLint for TS/TSX/JS/JSX files
- [ ] Enable format-on-save
- [ ] Enable fix-on-save (source.fixAll.eslint)
- [ ] Configure working directories
- [ ] Test VSCode integration by opening a file

#### Phase 4: NPM Scripts (0.25 hour)

**Milestone**: Lint scripts added to package.json

- [ ] Add `lint` script: `eslint . --ext .ts,.tsx,.js,.jsx`
- [ ] Add `lint:fix` script: `eslint . --ext .ts,.tsx,.js,.jsx --fix`
- [ ] Verify scripts don't conflict with existing scripts
- [ ] Test `npm run lint` runs without errors
- [ ] Test `npm run lint:fix` runs and auto-fixes issues

#### Phase 5: Initial Lint Run (0.5 hour)

**Milestone**: Configuration validated and baseline established

- [ ] Run `npm run lint` to see all existing issues
- [ ] Categorize issues: auto-fixable, legitimate, false positives
- [ ] Run `npm run lint:fix` to fix auto-fixable issues
- [ ] Review remaining issues and categorize
- [ ] Configure rule overrides for false positives (if any)
- [ ] Document known issues (if any)

#### Phase 6: Testing & Validation (0.75 hour)

**Milestone**: All scenarios tested and working

1. **Configuration Testing**
   - [ ] Verify ESLint loads without errors
   - [ ] Test TypeScript linting works on .ts files
   - [ ] Test React linting works on .tsx files
   - [ ] Test Prettier integration works
   - [ ] Test ignore patterns work correctly

2. **IDE Integration Testing**
   - [ ] Open TSX file in VSCode
   - [ ] Verify real-time lint errors appear in Problems panel
   - [ ] Verify red squiggly lines for errors
   - [ ] Test save triggers Prettier format + ESLint fix
   - [ ] Test fix-on-save via command palette

3. **NPM Script Testing**
   - [ ] Run `npm run lint` - see all issues
   - [ ] Run `npm run lint:fix` - auto-fix issues
   - [ ] Run `npm run typecheck` - still works
   - [ ] Run `npm run build` - still works

#### Phase 7: Documentation (0.25 hour)

**Milestone**: All documentation updated

- [ ] Update README with ESLint instructions
- [ ] Document known issues/exceptions (if any)
- [ ] Update feature spec status
- [ ] Update LLD implementation status
- [ ] Update status board

### Success Criteria

1. **Installation**
   - [x] All 7 ESLint packages installed
   - [x] Package.json updated with devDependencies
   - [x] No install errors or warnings

2. **Configuration**
   - [x] eslint.config.js created with flat config format
   - [x] All 5 configuration layers working
   - [x] TypeScript parser configured
   - [x] React plugins configured
   - [x] Prettier integration configured

3. **NPM Scripts**
   - [x] `npm run lint` works
   - [x] `npm run lint:fix` works
   - [x] Scripts don't conflict with existing scripts
   - [x] Exit codes correct (0 for pass, 1 for errors)

4. **IDE Integration**
   - [x] VSCode shows ESLint errors in real-time
   - [x] Fix-on-save works via command palette
   - [x] Format-on-save integrates with ESLint
   - [x] No console errors from ESLint server

5. **Build Compatibility**
   - [x] `npm run build` still works
   - [x] `npm run dev` still works
   - [x] `npm run typecheck` still works
   - [x] No new build errors introduced

6. **Code Quality**
   - [x] Lint passes on existing code (or only minor issues)
   - [x] No breaking changes to existing code style
   - [x] Prettier and ESLint don't conflict
   - [x] At least 80% of issues auto-fixable

### Risk Mitigation

- **Complexity**: Low (well-established pattern, good tooling)
- **Files Modified**: 3 files (1 new, 2 existing)
- **Breaking Changes**: None (additive only)
- **Migration Path**: Run `npm run lint:fix` to auto-fix
- **Rollback**: Simple (remove eslint.config.js, uninstall packages, revert scripts)
- **Performance**: Minimal impact (ESLint is fast, incremental in IDE)

### Timeline

- **30 minutes**: Package installation and verification
- **30 minutes**: Create eslint.config.js with all layers
- **15 minutes**: Create .vscode/settings.json
- **15 minutes**: Add NPM scripts and test
- **30 minutes**: Initial lint run and issue categorization
- **45 minutes**: Testing and validation (config, IDE, scripts)
- **15 minutes**: Documentation and final verification

**Total**: 3 hours

### Definition of Done

- [x] All 7 ESLint packages installed
- [x] eslint.config.js created with flat config
- [x] .vscode/settings.json created/updated
- [x] NPM scripts (lint, lint:fix) added and working
- [x] TypeScript linting configured and working
- [x] React linting configured and working
- [x] Prettier integration configured and working
- [x] Airbnb-style rules applied
- [x] Ignore patterns configured
- [x] `npm run lint` runs without crashing
- [x] `npm run lint:fix` auto-fixes issues
- [x] VSCode shows real-time lint errors
- [x] Fix-on-save works in VSCode
- [x] Build scripts still work (build, dev, typecheck)
- [x] Known issues documented (if any)
- [x] Feature spec marked complete
- [x] LLD marked implementation complete
- [x] Status board updated with completion evidence

## 9. Feature F-012: OPFS Browser Enhancement

### Overview

**Feature ID**: F-012 (Discovery)
**Status**: Design Complete - Ready for Implementation
**Priority**: High (P1) - Core Feature Completion
**Target**: Complete during v1.2.0 Phase 9 (Days 14-17 from 2026-01-14)

### Objective

Enhance the OPFS File Browser with guided tree lines for visual hierarchy, delete operations for files and directories with confirmation modals, and enhanced metadata display including file types, last modified dates, and full paths. This completes the OPFS browser feature set for better file management and user experience.

### Task Breakdown

**Implementation Phases** (6 tasks, 8-12 hours total):

#### TASK-308: Service Layer - Delete Operations (1.5 hours)

**Milestone**: Delete functions implemented in databaseService.ts

- [ ] Implement `deleteOpfsFile(path)` service function
  - Navigate to file path in OPFS
  - Delete file using `removeEntry(filename)`
  - Return `ServiceResponse<void>`
  - Handle file not found errors
- [ ] Implement `deleteOpfsDirectory(path)` service function
  - Navigate to directory path in OPFS
  - Count items before delete
  - Delete recursively using `removeEntry(dirname, { recursive: true })`
  - Return `ServiceResponse<{ itemCount: number }>`
  - Handle directory not found errors
- [ ] Update `OpfsFileEntry` type with metadata fields
  - Add `lastModified?: Date`
  - Add `fileType?: string`
  - Add `itemCount?: { files: number; directories: number }`
- [ ] Update `getOpfsFiles()` to fetch metadata
  - Fetch last modified timestamp from file handles
  - Detect file types based on extension
  - Count items in directories
- [ ] Add JSDoc comments to all functions
- [ ] TypeScript strict mode compliance

#### TASK-309: Guided Tree Lines Component (2 hours)

**Milestone**: TreeLines component created and integrated

- [ ] Create `src/devtools/components/OPFSBrowser/TreeLines.tsx`
- [ ] Implement vertical line connector
  - CSS `::before` pseudo-element
  - Position: absolute, left: 12px, top: 0, bottom: 0
  - Width: 1px, background: gray-200 (#e5e7eb)
- [ ] Implement horizontal line connector
  - CSS `::before` pseudo-element on tree-node-item
  - Position: absolute, left: -12px, top: 50%
  - Width: 12px, height: 1px, background: gray-200
- [ ] Implement last child adjustment
  - Extend horizontal line from vertical
  - No vertical line after last child
- [ ] Add responsive hiding
  - Hide lines when sidebar collapsed (< 200px)
  - Use CSS media query or state-based class
- [ ] Integrate with FileTree.tsx
  - Wrap children containers with TreeLines
  - Pass depth prop for line positioning
  - Conditional rendering for root items (depth = 0)
- [ ] Test with various nesting depths
- [ ] Verify VSCode-style appearance

#### TASK-310: Delete Confirmation Modal (2 hours)

**Milestone**: DeleteConfirmModal component created and integrated

- [ ] Create `src/devtools/components/OPFSBrowser/DeleteConfirmModal.tsx`
- [ ] Implement modal structure
  - Backdrop: `bg-gray-900 bg-opacity-50`
  - Modal container: centered, max-w-md
  - Close on: Cancel button, backdrop click, Escape key
- [ ] Implement metadata display grid
  - Title: "Delete {item_name}?"
  - Type badge: File / Directory (color-coded)
  - Size: {size_formatted}
  - Type: {file_type}
  - Modified: {last_modified}
  - Path: {full_path} (monospace)
- [ ] Implement warning text
  - Red text: "This action cannot be undone."
  - Enhanced warning for directories: "Delete directory and all contents?"
  - Show item count for directories
- [ ] Implement buttons
  - Cancel: Gray secondary button
  - Delete: Red danger button with IoMdTrash icon
  - Loading state on Delete button during deletion
- [ ] Add accessibility features
  - `role="dialog"`
  - `aria-modal="true"`
  - `aria-label="Delete confirmation"`
  - Focus trap (Tab cycles within modal)
  - Escape key closes modal
- [ ] Export component and types

#### TASK-311: Enhanced Metadata Display (2 hours)

**Milestone**: MetadataPanel component created and integrated

- [ ] Create `src/devtools/components/OPFSBrowser/MetadataPanel.tsx`
- [ ] Implement file type detection
  - SQLite databases: `.sqlite`, `.db`, `.sqlite3` → "SQLite Database" (blue badge)
  - JSON files: `.json` → "JSON Data" (yellow badge)
  - Text files: `.txt`, `.md` → "Text File" (gray badge)
  - Images: `.png`, `.jpg`, `.svg` → "Image File" (purple badge)
  - Unknown: Use extension or "File" (default gray badge)
- [ ] Implement timestamp formatting
  - Format: `YYYY-MM-DD HH:mm` (local time)
  - Color: gray-500 (secondary text)
  - Utility function: `formatTimestamp(date)`
- [ ] Implement inline metadata display
  - Default: Name + size (existing)
  - Hover: Show type badge and modified timestamp
  - Transition: smooth fade-in/out (150ms)
- [ ] Implement directory metadata
  - Item count: `{file_count} files, {dir_count} dirs`
  - Visible when expanded
  - Updated on lazy load
  - Full path on hover/click (monospace)
- [ ] Export component and utility functions

#### TASK-312: Toast Notifications (1 hour)

**Milestone**: Toast component created and integrated

- [ ] Create `src/devtools/components/OPFSBrowser/Toast.tsx`
- [ ] Implement toast container
  - Position: fixed, top-right
  - Z-index: high (above modal)
  - Animation: slide-in from right
- [ ] Implement success toast
  - Icon: FaCheck (green)
  - Title: "Deleted successfully"
  - Message: "{item_name} has been deleted."
  - Duration: 3 seconds (auto-dismiss)
  - Background: bg-green-50 border-green-200 text-green-700
- [ ] Implement error toast
  - Icon: FaExclamationCircle (red)
  - Title: "Delete failed"
  - Message: {error_message}
  - Duration: 5 seconds (auto-dismiss)
  - Action: "Retry" button (reopens modal)
  - Background: bg-red-50 border-red-200 text-red-700
- [ ] Implement auto-dismiss logic
  - setTimeout with duration
  - Cleanup on unmount
  - Pause on hover (optional)
- [ ] Export component and types

#### TASK-313: Integration & Testing (1.5 hours)

**Milestone**: All components integrated and tested

- [ ] Update FileTree.tsx with tree lines
  - Import TreeLines component
  - Wrap children containers
  - Pass depth prop
  - Test various nesting depths
- [ ] Update FileNode.tsx with delete button
  - Import IoMdTrash icon
  - Add delete button (right side, group-hover)
  - Add onClick handler to open modal
  - Add ARIA label
- [ ] Update FileNode.tsx with metadata display
  - Import MetadataPanel component
  - Add hover state for metadata
  - Display type badge and timestamp
  - Show item count for directories
- [ ] Update OPFSGallery.tsx for toast handling
  - Import Toast component
  - Add toast container
  - Handle delete confirmations
  - Show success/error toasts
  - Refresh tree after successful delete
- [ ] Test delete operations (files)
  - Click delete icon → modal opens
  - Verify metadata displayed correctly
  - Confirm delete → file removed from tree
  - Success toast shown
  - Error handling tested
- [ ] Test delete operations (directories)
  - Click delete icon → modal opens
  - Verify item count shown
  - Confirm delete → directory removed from tree
  - Success toast shown
  - Error handling tested
- [ ] Test metadata display
  - File type badges correct for all types
  - Timestamps formatted correctly
  - Directory item counts accurate
  - Full path displays on hover
- [ ] Test tree lines
  - Lines render correctly for nested items
  - Lines hide when sidebar collapsed
  - Lines match VSCode style
- [ ] ESLint verification
  - Run `npm run lint`
  - Fix any issues
- [ ] Build verification
  - Run `npm run build`
  - Run `npm run typecheck`
  - Verify no errors

### Dependencies

- **Upstream**: TASK-10 (OPFS File Browser - provides base FileTree, FileNode, OPFSGallery components)
- **Downstream**: None (can proceed independently)

### Success Criteria

1. **Tree Lines Display**
   - [ ] Vertical lines connect parent to all children
   - [ ] Horizontal lines connect each child to vertical line
   - [ ] Lines render correctly for nested directories (depth > 0)
   - [ ] Lines hide when sidebar collapsed (< 200px)
   - [ ] Lines match VSCode file tree style

2. **Delete Operation - Files**
   - [ ] Delete icon visible on file row hover
   - [ ] Clicking delete opens confirmation modal
   - [ ] Modal shows file metadata (name, size, type, path)
   - [ ] Confirming delete removes file from tree
   - [ ] Success toast shown after deletion
   - [ ] Error toast shown on failure

3. **Delete Operation - Directories**
   - [ ] Delete icon visible on directory row hover
   - [ ] Confirmation shows item count (files, subdirectories)
   - [ ] Recursive delete removes directory and contents
   - [ ] Success toast shown after deletion
   - [ ] Error toast shown on failure

4. **Enhanced Metadata - Files**
   - [ ] File type badge shown on hover (SQLite, JSON, etc.)
   - [ ] Last modified timestamp shown on hover
   - [ ] File extension shown in type badge
   - [ ] Metadata displays correctly for all file types

5. **Enhanced Metadata - Directories**
   - [ ] Item count shown when directory expanded
   - [ ] Last modified timestamp shown on hover
   - [ ] Full path shown on hover/click

6. **Delete Confirmation Modal**
   - [ ] Modal opens on delete button click
   - [ ] Modal shows all item metadata
   - [ ] Warning text displayed clearly
   - [ ] Cancel button closes modal
   - [ ] Delete button shows loading state
   - [ ] Modal closes on backdrop click or Escape key

7. **Service Layer Functions**
   - [ ] `deleteOpfsFile(path)` implemented in databaseService.ts
   - [ ] `deleteOpfsDirectory(path)` implemented in databaseService.ts
   - [ ] Both functions return `ServiceResponse<void>` or with data
   - [ ] Error handling for OPFS API failures
   - [ ] Recursive delete for directories

8. **Integration**
   - [ ] OPFS browser route (`/opfs`) works with all enhancements
   - [ ] No regression in existing download functionality
   - [ ] No regression in existing lazy loading
   - [ ] Build passes without errors
   - [ ] ESLint passes without new warnings

### Risk Mitigation

- **Data Loss**: Confirmation modal with warning text prevents accidental deletion
- **OPFS API Compatibility**: Graceful degradation if not supported, error messages
- **Tree Line Performance**: CSS-only implementation, no JS layout calculations
- **Metadata Fetching Delay**: Lazy load on-demand, show loading indicator
- **Modal Accessibility**: Focus trap, ARIA attributes, keyboard support

### Timeline

- **Day 1** (1.5 hours): Service layer functions (deleteOpfsFile, deleteOpfsDirectory, metadata fetching)
- **Day 2** (2 hours): Guided tree lines component
- **Day 3** (2 hours): Delete confirmation modal
- **Day 4** (2 hours): Enhanced metadata display
- **Day 5** (1 hour): Toast notifications
- **Day 5** (1.5 hours): Integration & testing

**Total**: 10 hours (3-4 days)

### Definition of Done

- [ ] Service layer functions implemented and tested
- [ ] TreeLines component created and integrated
- [ ] DeleteConfirmModal component created and integrated
- [ ] MetadataPanel component created and integrated
- [ ] Toast component created and integrated
- [ ] FileTree.tsx updated with tree lines
- [ ] FileNode.tsx updated with delete button and metadata
- [ ] OPFSGallery.tsx updated with toast handling
- [ ] All acceptance criteria met (8 categories above)
- [ ] Manual testing complete (all scenarios)
- [ ] ESLint passed with no new warnings
- [ ] Build passed with no errors
- [ ] Type check passed with no errors
- [ ] Feature spec marked complete
- [ ] Documentation updated (HLD, LLD, status board)

---

#### Phase 11: OPFS UI Visual Redesign (Days 21-22)

**Milestone**: F-014 Complete - Visual redesign to match product prototype

**Target Date**: 2026-01-21 (2 days from 2026-01-19)

**Dependencies**: F-012 (OPFS Browser Enhancement) - Complete, F-013 (OPFS Two-Panel Preview) - Complete

**Feature Overview**: Complete visual redesign of OPFS File Browser to match product prototype. Implement green color theme (#4CAF50), add preview header with status badge, display file/directory counts, make action icons always visible, and remove helper notice/footer sections. All changes are visual-only with no functional changes to existing behavior.

**Tasks Breakdown**:

- [ ] **TASK-320**: Color Scheme Updates (F-014)
  - Update main header icon: `text-blue-600` → `text-green-600`
  - Remove helper notice section entirely ("Origin Private File System" banner)
  - Update preview panel background: `bg-emerald-50` → `bg-white`
  - Update OPFSGallery.tsx styles
  - Test color contrast for accessibility (WCAG AA)
  - Estimated time: 1.5 hours

- [ ] **TASK-321**: Preview Header Component (F-014)
  - Create `PreviewHeader.tsx` component with green background (#4CAF50)
  - Display "Preview: [filename]" title in white text
  - Add status badge component (white background, green text, "started" text)
  - Implement props interface (fileName, showStatus, statusText)
  - Add TSDoc comments
  - Integrate into FilePreview.tsx
  - Estimated time: 1 hour

- [ ] **TASK-322**: File Tree Enhancements - File Counts (F-014)
  - Add `getDirectoryCounts(entry)` helper function to FileTree.tsx
  - Calculate file and directory counts from `entry.children`
  - Display counts in FileNode.tsx for directories only
  - Format: "3 files", "2 dirs", or "3 files 2 dirs"
  - Style: `text-xs text-gray-500 ml-2`
  - Test with empty directories, large directories
  - Estimated time: 1.5 hours

- [ ] **TASK-323**: File Tree Enhancements - Icon Visibility (F-014)
  - Update FileNode.tsx action icons: `opacity-0 group-hover:opacity-100` → `opacity-100`
  - Make download and delete icons always visible (not hover-only)
  - Test icon positioning and spacing
  - Ensure icons remain clickable and accessible
  - Estimated time: 0.5 hours

- [ ] **TASK-324**: Footer Removal (F-014)
  - Remove footer tip section from OPFSGallery.tsx
  - Verify layout stability without footer
  - Test panel resize behavior
  - Estimated time: 0.5 hours

- [ ] **TASK-325**: Integration & Testing (F-014)
  - Visual regression testing vs prototype screenshot
  - Functional testing: download, delete, preview all work
  - Test all preview states: empty, text, image, unsupported
  - Test file count display accuracy
  - Test action icon visibility and accessibility
  - Test color contrast with accessibility tools
  - Keyboard navigation testing (Tab, Enter, Escape)
  - ESLint verification (no new warnings)
  - Build verification (no errors)
  - Estimated time: 1 hour

**Total**: 6 hours (2 days)

### Acceptance Criteria

**Visual Design**:

- [ ] Main header icon is green (#4CAF50)
- [ ] Helper notice section removed
- [ ] Preview panel has green header bar
- [ ] Preview panel has white background
- [ ] Preview header shows "Preview: [filename]"
- [ ] Preview header has "started" status badge (white/green)
- [ ] Footer tip section removed
- [ ] Visual design matches prototype screenshot

**File Tree Enhancements**:

- [ ] Directory nodes show file/directory counts
- [ ] File count format is correct ("3 files 2 dirs")
- [ ] Action icons (download/delete) are always visible
- [ ] Action icons remain functional and accessible

**Functionality**:

- [ ] All existing features work: expand/collapse, download, delete, preview
- [ ] File preview loads and displays correctly
- [ ] Panel resize works correctly
- [ ] Delete confirmation modal works
- [ ] Toast notifications work

**Accessibility**:

- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] ARIA labels preserved on all interactive elements
- [ ] Screen reader testing passes

**Code Quality**:

- [ ] ESLint passed with no new warnings
- [ ] Build passed with no errors
- [ ] Type check passed with no errors
- [ ] TSDoc comments added to new components
- [ ] Code follows S8 quality rules (functional components, hooks)

### Risk Mitigation

| Risk                       | Impact | Mitigation                                         |
| -------------------------- | ------ | -------------------------------------------------- |
| Color accessibility issues | Medium | Use WCAG compliant green shades (#4CAF50, #16A34A) |
| Breaking existing UX       | Low    | Visual-only changes, no logic modifications        |
| Prototype ambiguity        | Low    | Reference screenshot for clarification             |
| File count performance     | Low    | Calculate from existing data, no new API calls     |

### Definition of Done

- [ ] Color scheme updated (green theme)
- [ ] PreviewHeader component created and integrated
- [ ] File counts display implemented
- [ ] Action icons always visible
- [ ] Helper notice and footer removed
- [ ] Visual regression testing passed
- [ ] Functional testing passed (all features work)
- [ ] Accessibility testing passed (WCAG AA)
- [ ] ESLint passed with no new warnings
- [ ] Build passed with no errors
- [ ] Type check passed with no errors
- [ ] Feature spec marked complete
- [ ] Documentation updated (HLD, LLD, status board)

---

#### Phase 12: OPFS Tree Visual Enhancements (Day 22)

**Milestone**: Default root expansion, dotted tree lines, file type icons

**Feature**: F-015 - OPFS Tree Visual Enhancements

**Overview**: Enhance the OPFS File Tree with three visual improvements: (1) Root directories expand by default on load, (2) Tree hierarchy lines use dotted/dashed styling for subtle visual guidance, (3) File type-specific icons for quick identification (sqlite3, images, txt, json, folders, unknown).

**Target Date**: 2026-01-22
**Duration**: 3 hours (0.5 days)
**Baseline**: Option A (Component-Based Enhancement)

### Task Breakdown

- [ ] **TASK-326**: Icon Imports and Helper Functions (F-015)
  - Add 6 icon imports to FileTree.tsx: FaDatabase (fa6), FaRegFileImage, FaFolder, FaFolderOpen, FaFile (fa), TiDocumentText (ti), LuFileJson (lu)
  - Create getFileExtension(filename) helper to extract file extension
  - Create getFileIcon(entry, isExpanded) helper with switch statement for 6 file types
  - Add TSDoc comments with @example for both helpers
  - Test icon rendering for all 6 types
  - Estimated time: 1 hour

- [ ] **TASK-327**: Expansion State Update (F-015)
  - Update useState(false) to useState(level === 0) for root-level auto-expansion
  - Add useEffect hook to auto-load root directory children on mount
  - Verify only root (level 0) directories auto-expand
  - Verify child directories remain lazy-loaded
  - Test expand/collapse behavior still works
  - Estimated time: 0.5 hours

- [ ] **TASK-328**: Tree Line Styling (F-015)
  - Update TreeLines.tsx className: bg-gray-200 to border-dotted border-gray-300
  - Verify dotted lines display correctly
  - Test responsive hiding (sidebar collapse) still works
  - Estimated time: 0.5 hours

- [ ] **TASK-329**: Integration and Testing (F-015)
  - Visual testing: verify all 6 icon types display correctly
  - Functional testing: verify expand, lazy-load, download, delete work
  - Integration testing: verify compatibility with F-012, F-013, F-014
  - Performance testing: verify no significant load time increase
  - ESLint verification (no new warnings)
  - Build verification (no errors)
  - Estimated time: 1 hour

**Total**: 3 hours (0.5 days)

### Acceptance Criteria

**Default Expansion**:

- [ ] Root directories (level 0) are expanded on load
- [ ] Root directory children are loaded automatically
- [ ] Child directories (level > 0) remain collapsed (lazy-loaded)
- [ ] Expand/collapse behavior still works for all directories

**Tree Line Styling**:

- [ ] Tree lines use dotted/dashed styling (not solid)
- [ ] Line color is lighter (gray-300 vs gray-200)
- [ ] Responsive hiding works (sidebar collapse)

**File Type Icons**:

- [ ] .sqlite3 files display FaDatabase icon (purple)
- [ ] Image files (.png, .jpg, etc.) display FaRegFileImage icon (purple)
- [ ] .txt files display TiDocumentText icon (gray)
- [ ] .json/.json5 files display LuFileJson icon (yellow)
- [ ] Closed directories display FaFolder icon (gray)
- [ ] Open directories display FaFolderOpen icon (yellow)
- [ ] Unknown file types display FaFile icon (gray fallback)

**Functionality**:

- [ ] All existing features work: expand/collapse, download, delete, preview
- [ ] File selection works correctly
- [ ] Panel resize works correctly
- [ ] Delete confirmation modal works
- [ ] Toast notifications work

**Performance**:

- [ ] Initial load time increased by < 100ms (acceptable)
- [ ] No render performance regression
- [ ] Bundle size increased by ~15KB (acceptable)

**Code Quality**:

- [ ] ESLint passed with no new warnings
- [ ] Build passed with no errors
- [ ] Type check passed with no errors
- [ ] TSDoc comments added to helper functions
- [ ] Code follows S8 quality rules (functional components, hooks)

### Risk Mitigation

| Risk                   | Impact | Mitigation                                    |
| ---------------------- | ------ | --------------------------------------------- |
| Missing icon libraries | Medium | Verify imports before committing              |
| Performance regression | Low    | Root-only expansion preserves lazy-loading    |
| Icon bundle size       | Low    | ~15KB acceptable for DevTools extension       |
| Visual inconsistency   | Low    | Reference prototype screenshot for validation |

### Definition of Done

- [ ] Icon imports added to FileTree.tsx (6 icons from 4 libraries)
- [ ] getFileExtension() helper created with TSDoc
- [ ] getFileIcon() helper created with switch statement for 6 types
- [ ] Expansion state updated: useState(level === 0)
- [ ] Auto-loading useEffect added for root directories
- [ ] TreeLines styling updated to dotted border
- [ ] Visual testing passed (all 6 icon types display correctly)
- [ ] Functional testing passed (expand, lazy-load, download, delete)
- [ ] Integration testing passed (F-012, F-013, F-014 compatibility)
- [ ] Performance testing passed (< 100ms load time increase)
- [ ] ESLint passed with no new warnings
- [ ] Build passed with no errors
- [ ] Type check passed with no errors
- [ ] Feature spec marked complete
- [ ] Documentation updated (HLD Section 20, LLD Section 13, status board)

---

#### Phase 13: Developer Tooling - Logo Generator (ASAP)

**Milestone**: F-016 Complete - Automated SVG to PNG logo generation

**Feature**: F-016 - SVG to PNG Logo Generator

**Overview**: Create a developer tooling script to automate the conversion of `public/icons/logo.svg` into multiple PNG files (4 sizes × 2 states = 8 files). This eliminates manual image conversion work when the extension logo design changes.

**Target Date**: ASAP
**Duration**: 2.5 hours (REDUCED from 3 hours - using SVG filters)
**Baseline**: Feature spec complete, ready for implementation

### Task Breakdown

- [ ] **TASK-331**: SVG to PNG Logo Generator (F-016)
  - **Estimated**: 2.5 hours (single consolidated task)
  - **Priority**: P2 (Medium) - Developer Tooling
  - **Dependencies**: None
  - **Micro-Spec**: [TASK-331.md](../../08-task/active/TASK-331.md)

  **Implementation Phases**:
  1. **Setup & Configuration** (0.5 hour)
     - Create `scripts/` directory if not exists
     - Verify `tsx` is installed in devDependencies
     - Add `generate:logos` script to package.json scripts section
     - Test that `npm run generate:logos` is recognized

  2. **Script Implementation** (1.5 hours - REDUCED from 2 hours)
     - Create `scripts/generate-logos.ts` with TypeScript
     - Define TypeScript interfaces: `LogoSize`, `LogoState`, `GenerateOptions`
     - Implement SVG file reading (read `public/icons/logo.svg` as text/string)
     - Implement SVG filter approach for inactive state:
       - Add grayscale filter to SVG `<defs>` section:
         ```xml
         <filter id="grayscale">
           <feColorMatrix type="saturate" values="0"/>
         </filter>
         ```
       - Apply filter to SVG root element: `filter="url(#grayscale)"`
       - Handle existing `<defs>` case (append filter)
       - Handle no `<defs>` case (create new defs section)
       - Handle existing filter attribute (replace)
     - Implement gray background addition:
       - Extract viewBox dimensions from SVG
       - Create background rectangle: `<rect fill="#808080" .../>`
       - Insert as first child (behind all content)
     - Use native SVG filters - NO color parsing/replacement needed!
       - Works automatically with ALL colors (hex, rgb, named, gradients)
       - No regex patterns for colors needed
       - No color format conversion needed
       - Much simpler and more maintainable
     - Implement PNG generation for 4 sizes: 16, 32, 48, 128
       - Active state: Use original SVG (full blue gradient colors)
       - Inactive state: Use modified SVG (filter applied + gray background)
     - Use `sharp` library for SVG to PNG rendering (recommended by research)
     - Implement file system operations (write PNGs to `public/img/`)
     - Add error handling for missing SVG, write permissions, invalid sizes
     - Add validation that all 8 files were created successfully
     - Add console output with progress and completion messages
     - Add TSDoc comments to all functions
     - TypeScript strict mode compliance
     - Reference: See `agent-docs/08-task/active/SVG_COLOR_CONVERSION_RULES.md` for detailed rules
     - Research: See `agent-docs/08-task/active/SVG_FILTER_RESEARCH.md` for best practices research

  3. **Testing & Verification** (0.5 hour)
     - Run `npm run generate:logos` and verify all 8 PNGs generated
     - Test error scenarios: missing SVG, invalid directory
     - Verify output quality in image viewer (all sizes and states)
     - Verify active state has full blue gradient color
     - Verify inactive state has grayscale content on gray background (SVG filter applied)
     - Verify grayscale filter works correctly with all logo colors
     - Verify gray background (`#808080`) is added behind content
     - Verify SVG filter is properly embedded in output PNGs
     - Verify file sizes are reasonable (not corrupted or empty)
     - ESLint verification (no new warnings for script)
     - Build verification (script compiles with tsx)
     - Update feature spec with completion status
     - Update status board with completion evidence

### Acceptance Criteria

**Happy Path**:

- [ ] Running `npm run generate:logos` successfully creates 8 PNG files in `public/img/`:
  - [ ] `logo-16.png`, `logo-16-inactive.png`
  - [ ] `logo-32.png`, `logo-32-inactive.png`
  - [ ] `logo-48.png`, `logo-48-inactive.png`
  - [ ] `logo-128.png`, `logo-128-inactive.png`
- [ ] All PNGs are rendered correctly from the SVG source
- [ ] Active state uses the full-color SQLite logo (blue gradient) - original SVG
- [ ] Inactive state uses grayscale content on gray background (SVG filter applied)
- [ ] Grayscale filter properly converts all colors (native SVG feature)
- [ ] Gray background added: `<rect fill="#808080"/>`
- [ ] Script completes without errors in < 5 seconds

**Error Path**:

- [ ] Script fails with clear error message if `public/icons/logo.svg` is missing
- [ ] Script fails with clear error message if `public/img/` directory cannot be written
- [ ] Script validates file creation (checks if all 8 files were successfully written)

**Non-Functional Requirements**:

- [ ] **Performance**: Script completes in < 5 seconds for all 8 PNG files
- [ ] **Maintainability**: TypeScript code with clear comments and type definitions
- [ ] **Dependencies**: Uses `tsx` for TypeScript execution + `sharp` for SVG→PNG rendering
- [ ] **Compatibility**: Works on Node.js 18+ (matches project's Node version)

### Risk Mitigation

| Risk                    | Impact | Mitigation                                                   |
| ----------------------- | ------ | ------------------------------------------------------------ |
| Image quality issues    | Low    | Test with various SVG sizes and compare to manual export     |
| Performance issues      | Low    | SVG filters are hardware-accelerated, should be fast         |
| Platform compatibility  | Low    | `sharp` library is cross-platform (Linux/Mac/Windows)        |
| SVG filter support      | Low    | Native SVG feature (W3C standard), supported by all browsers |
| Filter rendering issues | Low    | Test with actual SQLite logo SVG before finalizing           |

### Definition of Done

- [ ] `scripts/generate-logos.ts` created and compiles without errors
- [ ] `package.json` updated with `generate:logos` script
- [ ] All 8 PNG files generated successfully on test run
- [ ] Active state has full blue gradient color (original SVG)
- [ ] Inactive state has grayscale content on gray background (SVG filter applied)
- [ ] Grayscale filter (`<feColorMatrix type="saturate" values="0"/>`) properly embedded
- [ ] Gray background (`#808080`) added and visible
- [ ] Error handling tested (missing SVG, write permissions)
- [ ] Output quality verified in image viewer
- [ ] File sizes are reasonable (not corrupted or empty)
- [ ] Script completes in < 5 seconds
- [ ] ESLint passed with no new warnings
- [ ] Feature spec marked complete
- [ ] Documentation updated (status board)
