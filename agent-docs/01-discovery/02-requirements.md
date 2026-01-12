<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/02-requirements.md

OUTPUT MAP (write to)
agent-docs/01-discovery/02-requirements.md

NOTES
- Keep headings unchanged.
- Use IDs: FR-xxx, NFR-xxx, Backlog B-xxx.
-->

# 02 Requirements

## 1) MVP (P0) — must have
| ID | Requirement | Acceptance test (how to verify) |
|----|-------------|----------------------------------|
| FR-001 | Extension name: "web-sqlite devtools" | Extension manifest displays correct name |
| FR-002 | Popup icon activates when `window.__web_sqlite` detected | Icon state changes from inactive to active when API is present on page |
| FR-003 | Listen to `onDatabaseChange` for real-time icon state updates | Icon updates immediately when database is opened/closed |
| FR-004 | DevTools panel named "Sqlite" with SiSqlite icon | Panel appears in DevTools drawer with correct label and icon |
| FR-005 | Hash-based routing for all navigation | URL routes update with hash (#/openedDB/dbname, #/opfs, etc.) |
| FR-006 | Sidebar menu (20% width, collapsible) with app branding | Left sidebar displays "Web Sqlite" with SiSqlite icon |
| FR-007 | Sidebar menu item: "Opened DB" with FaDatabase icon | Clickable menu item that shows list of databases |
| FR-008 | Database list as nested items under "Opened DB" | Each opened database displays as clickable item |
| FR-009 | Route `/openedDB/<db-name>` for selected database | Clicking database navigates to database detail view |
| FR-010 | Sidebar menu item: "OPFS" with FaFile icon | Clickable menu item for OPFS file browser |
| FR-011 | Route `/opfs` for OPFS file browser | Clicking OPFS navigates to file tree view |
| FR-012 | Sidebar collapse toggle (FaAngleRight/FaAngleLeft) at bottom | Clicking toggle switches sidebar between expanded (20%) and collapsed (icons only) |
| FR-013 | Main content area (remaining width/height) | Right side displays routed content |
| FR-014 | Empty state notice for route `/` | Helpful instructions display when no route is selected |
| FR-015 | Database detail component with 6 tabs | Table, Query, Log, Migration, Seed, About tabs with icons |
| FR-016 | Table tab: List all tables in alphabetical order | Left column (20%) shows sorted table list from PRAGMA queries |
| FR-017 | Table tab: Route `/openedDB/:dbname/:tableName` for selected table | Clicking table updates route and displays active state styling |
| FR-018 | Table tab: Multi-table tab bar (10% height) | Each table opens in separate tab with icon, name, and close button |
| FR-019 | Table tab: Table content area (80% height) | Displays paginated table data with fixed header |
| FR-020 | Table tab: Fixed header with field names and types | Header shows PRAGMA table_info results (field + type vertically) |
| FR-021 | Table tab: Pagination (default 100, custom input) | Bottom bar (10% height) with prev/next and customizable record count |
| FR-022 | Table tab: DDL info panel (30% width, complete schema) | Right column displays CREATE TABLE, indexes, triggers, views |
| FR-023 | Table tab: Refresh and close action buttons | Left side of pagination bar has refresh and close icons |
| FR-024 | Query tab: CodeMirror with auto-theme matching DevTools | SQL editor with syntax highlighting, auto-matches Chrome DevTools theme |
| FR-025 | Query tab: Execute via button or Ctrl+Enter | Button and keyboard shortcut execute SQL, only SELECT shows results table |
| FR-026 | Query tab: Sortable result columns | Click column headers to sort query results |
| FR-027 | Query tab: Export results to CSV/JSON | Download button exports current query results |
| FR-028 | Query tab: Inline error display | SQL errors display inline below editor |
| FR-029 | Log tab: Subscribe to `db.onLog()` with 500 entry limit | Real-time log streaming with level indicators, retains last 500 entries |
| FR-030 | Log tab: Filter by field (sql, action, event) | Filter logs by payload fields + level indicators |
| FR-031 | Migration tab: CodeMirror editor for migration SQL | SQL editor (same as Query tab) for writing migration scripts |
| FR-032 | Migration tab: Create dev version and test | Helper notice explains safe testing, auto-rollback after test |
| FR-033 | Seed tab: CodeMirror editor for seed SQL | Same editor as Migration tab for INSERT statements |
| FR-034 | Seed tab: Create dev version and test seed | Helper notice, auto-rollback after testing seed SQL |
| FR-035 | About tab: Full database information | DB name, version, table count, row counts, OPFS file info, web-sqlite-js version |
| FR-036 | OPFS file tree with FaFolder/FaFolderOpen icons | Lazy-loaded folders and files with human-readable sizes |
| FR-037 | OPFS per-file download button | Each file row has individual download button |
| FR-038 | OPFS folder icon state | Open folders show FaFolderOpen, closed show FaFolder |
| FR-039 | Connection to `window.__web_sqlite` API | All features communicate through the global namespace API |
| FR-040 | React + Tailwind CSS for UI | Component-based styling using existing template stack |
| FR-041 | Auto-reconnect with timeout on page refresh | Attempt to reconnect when page reloads, show error after timeout |
| FR-042 | Empty state when no database detected | Show helpful instructions when `window.__web_sqlite` not available |
| FR-043 | Table tabs clear on database change | Switching databases clears all open table tabs |
| FR-044 | Sidebar always expanded on DevTools open | Sidebar state does not persist, always starts expanded |

## 2) P1/P2 — nice to have
| ID | Requirement | Notes |
|----|-------------|------|
| FR-101 | Migration playground with test version creation | Uses `db.devTool.release()` to create dev version |
| FR-102 | Migration playground with automatic rollback | After testing, calls `db.devTool.rollback()` to restore |
| FR-103 | Migration playground helper notice | Explains safe testing workflow to users |
| FR-104 | Seed playground with dev version creation | Creates dev version for seed SQL testing |
| FR-105 | Seed playground with automatic rollback | Restores original version after testing |
| FR-106 | Query history | Persist recent queries for quick re-execution |
| FR-107 | Keyboard shortcuts beyond Ctrl+Enter | Quick access to more common actions |

## 3) Non-functional requirements (NFR)
| ID | Metric | Target | Measurement |
|----|--------|--------|-------------|
| NFR-001 | Panel open time | < 500ms | Time from click to render |
| NFR-002 | Table data load time | < 200ms | Time to fetch and display 100 records |
| NFR-003 | OPFS file tree load time | < 300ms | Time to load first level of files |
| NFR-004 | Memory usage | < 50MB | Chrome Task Manager measurement |
| NFR-005 | Extension bundle size | < 2MB | Unpacked extension size |
| NFR-006 | Icon state update latency | < 100ms | Time from database change to icon update |

## 4) Backlog (future ideas)
- B-001: Visual query builder (drag-and-drop for SELECT statements)
- B-002: Database comparison tool (diff between two versions)
- B-003: Query performance profiling and optimization suggestions
- B-004: Export/import entire database
- B-005: Collaborative query sharing
- B-006: Support for other browsers (Firefox, Safari) when COOP/COEP more widely adopted
- B-007: Mobile DevTools support (via Chrome Remote Debugging)

## 5) Constraints
- **Tech constraints**:
  - Must use Manifest V3 for Chrome extension
  - React for UI components (per template)
  - Tailwind CSS for styling (per template)
  - CodeMirror for SQL editor (or similar)
  - React Icons for all iconography
- **Compliance/security constraints**:
  - Content script must only access `window.__web_sqlite` API
  - No direct file system access outside OPFS
  - No cross-origin data leakage
- **Delivery constraints**:
  - Single developer project
  - MVP should include Core + OPFS features
  - Testing features (Migration/Seed playgrounds) can follow MVP
