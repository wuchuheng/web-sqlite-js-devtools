<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/features/feature.md

OUTPUT MAP (write to)
agent-docs/01-discovery/features/F-002-database-tab-navigation.md

NOTES
- Feature F-002: Database Tab Navigation Restructuring
- Addresses user feedback on incorrect layout for /openedDB/:dbname
- Implements proper two-level navigation with tab header and nested routes
-->

# Feature F-002: Database Tab Navigation Restructuring

## 0) Meta

- **Feature ID**: F-002
- **Title**: Database Tab Navigation Restructuring
- **Status**: Pending Approval
- **Priority**: P0 (Blocker) - Layout correction for database view
- **Created**: 2026-01-14
- **Requester**: User feedback on incorrect layout

## 1) Problem Statement

### Current Issue

The current implementation of `/openedDB/:dbname` route does not match the expected layout:

1. **Missing database-level tab navigation**: No tabs for Tables/Query/Migration/Seed/About
2. **Incorrect routing structure**: Single route `/openedDB/:dbname` instead of nested routes
3. **DDL panel placement**: DDL is integrated in TableContent instead of separate column
4. **No tools bar**: Missing toolbar for table operations

### User Requirements

When user clicks a database in the main sidebar, the preview section should display:

```
Row 1: Tab Header
├── Tables → /openedDB/:dbname/tables (default)
├── Query → /openedDB/:dbname/query
├── Migration → /openedDB/:dbname/migration
├── Seed → /openedDB/:dbname/seed
└── About → /openedDB/:dbname/about

Row 2: Tab Body (renders nested routes)
└── For /openedDB/:dbname/tables:
    ├── Column 1 (25%): Table list with scrollbar
    │   └── Selecting table → /openedDB/:dbname/tables/:tableName
    └── Column 2 (75%): Table content area
        ├── Row 1: Opened table tabs (header bar)
        │   └── Click to change route between :tableName values, close button
        └── Row 2: Split view
            ├── Column 1: Table content + pagination bar
            │   ├── Top: Table data with fixed header
            │   └── Bottom: Tools (left) + Pagination (right)
            └── Column 2: DDL panel for current table
```

## 2) Proposed Solution

### Architecture Changes

**Current Route Structure:**

```
/openedDB/:dbname → DatabaseView (single layout)
```

**Target Route Structure:**

```
/openedDB/:dbname → DatabaseTabs (tab header + outlet)
├── /openedDB/:dbname/tables → TablesTab (table list + content)
│   └── /openedDB/:dbname/tables/:tableName → TableDetail (specific table)
├── /openedDB/:dbname/query → QueryTab
├── /openedDB/:dbname/migration → MigrationTab
├── /openedDB/:dbname/seed → SeedTab
└── /openedDB/:dbname/about → AboutTab
```

### Component Structure

```
DatabaseTabs (NEW)
├── DatabaseTabHeader (NEW) - Tab navigation buttons
├── Outlet (React Router Outlet)
└── Default redirect → /tables

TablesTab (MODIFIED from DatabaseView)
├── TableListSidebar (25% width)
└── TableContentArea (75% width)
    ├── OpenedTableTabs (header bar)
    └── SplitView (two columns)
        ├── TableDataPanel (left) - data + tools + pagination
        └── DDLPanel (right) - always visible
```

### Key Requirements

1. **Default Route**: `/openedDB/:dbname` should redirect to `/openedDB/:dbname/tables`
2. **Table Selection**: Clicking table in list → `/openedDB/:dbname/tables/:tableName`
3. **Empty State**: When no table selected → show empty state in content area
4. **DDL Panel**: Always visible in right column when table is selected
5. **Full Scope**: Implement all 5 tabs (Tables, Query, Migration, Seed, About)
6. **Backward Compatible**: Preserve existing table data functionality

### Migration/Seed/Query Tab Content

- **Query Tab**: SQL editor with CodeMirror + execution results
- **Migration Tab**: Migration SQL editor + test controls + rollback
- **Seed Tab**: Seed SQL editor + test controls + auto-rollback
- **About Tab**: Database metadata (name, version, table count, web-sqlite-js version)

## 3) Functional Requirements

### FR-NAVI-001: Database-Level Tab Navigation

- When user clicks database in main sidebar, navigate to `/openedDB/:dbname/tables`
- Display tab header with 5 tabs: Tables, Query, Migration, Seed, About
- Default to Tables tab on initial database selection
- Tab buttons highlight when active
- Clicking tab button changes route to `/openedDB/:dbname/{tab}`

### FR-NAVI-002: Nested Route Structure

- Implement React Router nested routes under `/openedDB/:dbname`
- Use `<Routes>` and `<Outlet>` pattern for tab content
- Preserve database context across tab switches
- Maintain scroll position when switching between tables (same tab)
- Reset scroll position when switching tabs (different tab)

### FR-NAVI-003: Tables Tab Layout

- **Split Layout**: Table list sidebar (25%) + Table content area (75%)
- **Table List**: Scrollable list of tables, selecting table changes route
- **Opened Table Tabs**: Horizontal tabs showing opened tables with close buttons
- **Split View**: Table data (left) + DDL panel (right)
- **DDL Panel**: Always visible when table selected, right column

### FR-NAVI-004: Query Tab

- SQL editor with CodeMirror (syntax highlighting)
- Execute button + keyboard shortcut (Ctrl+Enter)
- Results table below editor
- Export buttons (CSV/JSON)

### FR-NAVI-005: Migration Tab

- Migration SQL editor
- Version input (semantic version)
- Test release button
- Rollback to version button
- Shows current database version

### FR-NAVI-006: Seed Tab

- Seed SQL editor
- Version input (for dev releases)
- Test seed button
- Auto-rollback after test
- Shows seed results

### FR-NAVI-007: About Tab

- Database name
- Current version (from `getDbVersion`)
- Table count
- Total row counts (sum of all tables)
- OPFS file info (if applicable)
- web-sqlite-js version

### FR-NAVI-008: Table Selection Routing

- Clicking table in list → route changes to `/openedDB/:dbname/tables/:tableName`
- URL updates in browser address bar
- Can navigate directly to specific table via URL
- Back/forward browser navigation works correctly
- Table tabs update when URL changes

### FR-NAVI-009: Multi-Table Tab Management

- Opening multiple tables creates tabs
- Clicking tab switches route to that table's detail view
- Close button removes tab and switches to next available tab
- "Clear All" button closes all table tabs
- Tabs persist when switching between Tables/Query/Migration/Seed tabs
- Tabs clear when switching to different database

### FR-NAVI-010: Empty State Handling

- When no table selected: Show "Select a table to view data and schema"
- Empty state displays in table content area (not DDL panel)
- DDL panel shows empty state or hides when no table selected

## 4) Non-Functional Requirements

### NFR-NAVI-001: Performance

- Tab switching should be instant (no lag)
- Route changes should update UI within 100ms
- Preserve component state when switching between tabs

### NFR-NAVI-002: Backward Compatibility

- Preserve all existing table data functionality
- Maintain service layer integration (databaseService)
- Keep existing pagination, filtering, and data display

### NFR-NAVI-003: Code Organization

- Follow existing component patterns
- Use functional components with hooks
- Maintain TypeScript strict mode compliance
- Follow Tailwind CSS styling conventions

### NFR-NAVI-004: Accessibility

- Tab buttons should be keyboard navigable
- Proper ARIA labels on tab navigation
- Focus management when switching tabs
- Semantic HTML structure

## 5) Out of Scope

- Modifying web-sqlite-js library behavior
- Changing main sidebar structure (left navigation)
- OPFS browser functionality (separate feature)
- Log streaming (separate feature - TASK-09)
- Database-level operations (create/drop database)

## 6) Dependencies

### Blocks

- None (can proceed independently)

### Depends On

- TASK-05.1: Service Layer Table Schema Functions (complete)
- TASK-05.2: Service Layer SQL Execution Functions (complete)
- TASK-05.4: Service Layer Migration & Versioning Functions (complete)
- TASK-06: Table Data & Schema UI (complete)
- TASK-09: Log Streaming (complete)

### Related Features

- F-001: Service Layer Expansion (complete)

## 7) Success Criteria

### Acceptance Criteria

1. **Tab Navigation**
   - [ ] 5 tabs visible when database is opened
   - [ ] Clicking tab changes route correctly
   - [ ] Default tab is Tables
   - [ ] Active tab is highlighted

2. **Tables Tab**
   - [ ] 25% table list sidebar
   - [ ] 75% table content area
   - [ ] Selecting table changes route to `/openedDB/:dbname/tables/:tableName`
   - [ ] Opened table tabs show in header bar
   - [ ] DDL panel visible in right column

3. **Routing**
   - [ ] `/openedDB/:dbname` redirects to `/openedDB/:dbname/tables`
   - [ ] Direct navigation to `/openedDB/:dbname/tables/:tableName` works
   - [ ] Back/forward navigation preserves state
   - [ ] URL updates in browser address bar

4. **Other Tabs**
   - [ ] Query tab has SQL editor
   - [ ] Migration tab has test controls
   - [ ] Seed tab has test controls
   - [ ] About tab shows database metadata

5. **Edge Cases**
   - [ ] Empty state when no table selected
   - [ ] DDL panel empty when no table selected
   - [ ] Tabs clear when switching databases
   - [ ] Close button on last tab shows empty state

## 8) Open Questions

1. **Tab persistence**: Should opened table tabs persist when switching between Tables/Query/Migration/Seed tabs?
   - **Decision**: Yes, tabs should persist across database-level tabs

2. **URL handling**: Should the table list sidebar remain visible when viewing Query/Migration/Seed/About tabs?
   - **Decision**: No, only Tables tab has the table list sidebar. Other tabs have different layouts.

3. **Default selection**: Should the first table be auto-selected when entering Tables tab?
   - **Decision**: No, show empty state and let user select a table manually.

## 9) Implementation Notes

### React Router Setup

```tsx
// In DevTools.tsx
<Route path="/openedDB/:dbname" element={<DatabaseTabs />}>
  <Route path="tables" element={<TablesTab />}>
    <Route path=":tableName" element={<TableDetail />} />
  </Route>
  <Route path="query" element={<QueryTab />} />
  <Route path="migration" element={<MigrationTab />} />
  <Route path="seed" element={<SeedTab />} />
  <Route path="about" element={<AboutTab />} />
  {/* Default redirect */}
  <Route index element={<Navigate to="tables" replace />} />
</Route>
```

### Component Migration Path

1. **Create DatabaseTabs** (NEW): Tab header + outlet
2. **Refactor DatabaseView → TablesTab**: Adjust layout for 25%/75% split
3. **Extract TableDetail** from TableContent: Handle `:tableName` route param
4. **Create QueryTab** (NEW): SQL editor + results
5. **Create MigrationTab** (NEW): Test controls for migrations
6. **Create SeedTab** (NEW): Test controls for seeds
7. **Create AboutTab** (NEW): Database metadata display
8. **Update Sidebar**: Database links navigate to `/openedDB/:dbname/tables`

### Service Layer Integration

All tabs use existing service layer functions:

- `getTableSchema()`, `queryTableData()`, `execSQL()`
- `devRelease()`, `devRollback()`, `getDbVersion()`
- `getDatabases()`, `getTableList()`
