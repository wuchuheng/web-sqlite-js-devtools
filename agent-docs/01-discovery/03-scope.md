<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/03-scope.md

OUTPUT MAP (write to)
agent-docs/01-discovery/03-scope.md

NOTES
- Keep headings unchanged.
- Capture terms in glossary to reduce ambiguity in later stages.
-->

# 03 Scope & Glossary

## 1) In scope
- **IS1**: Chrome DevTools extension for web-sqlite-js library debugging
- **IS2**: Detection and activation based on `window.__web_sqlite` global namespace presence
- **IS3**: Real-time icon state updates via `onDatabaseChange` event listener
- **IS4**: DevTools panel integration with "Sqlite" label and SiSqlite icon
- **IS5**: Hash-based routing system for all views and sub-views
- **IS6**: Sidebar navigation with database list and OPFS browser entry points
- **IS7**: Table browser with multi-tab support, pagination, and DDL display
- **IS8**: SQL query editor with syntax highlighting and result display
- **IS9**: Real-time log viewer using `db.onLog()` subscription
- **IS10**: OPFS file tree browser with lazy loading and download capability
- **IS11**: About tab showing database metadata, version info, and statistics
- **IS12**: Migration playground for safe testing (P1 feature)
- **IS13**: Seed playground for safe testing (P1 feature)

## 2) Out of scope
- **OS1**: Modifying web-sqlite-js library code or behavior
- **OS2**: Supporting non-Chrome browsers (Firefox, Safari) in initial release
- **OS3**: Direct binary file editing of SQLite databases
- **OS4**: Server-side or remote database connections
- **OS5**: Authentication or authorization features
- **OS6**: Multi-language support (English only for MVP)
- **OS7**: Offline usage (extension requires active page to be loaded)
- **OS8**: Database creation/deletion management (only inspection and query)
- **OS9**: Visual query builders or drag-and-drop interfaces
- **OS10**: Query result visualization (charts, graphs, etc.)

## 3) Boundary (interfaces with outside world)
- **External systems**:
  - **Chrome DevTools Protocol**: Extension panels, messaging, runtime
  - **web-sqlite-js library**: Via `window.__web_sqlite` global namespace
  - **OPFS API**: Navigator storage.getDirectory for file access
- **Data sources**:
  - `window.__web_sqlite.databases`: Map of opened databases
  - `window.__web_sqlite.onDatabaseChange`: Event subscription for lifecycle
  - `db.query()`, `db.exec()`, `db.transaction()`: Database operations
  - `db.onLog()`: Log event subscription
  - `db.devTool.release()`, `db.devTool.rollback()`: Migration testing
- **Outputs**:
  - Visual table data display in DevTools panel
  - SQL query results in tabular format
  - Log stream display
  - OPFS file downloads via browser download API

## 4) Glossary
| Term | Meaning |
|------|---------|
| **web-sqlite-js** | Browser-based SQLite library compiled to WebAssembly, using OPFS for storage |
| **OPFS** | Origin Private File System - browser API for private, efficient file storage |
| **DevTools Panel** | Custom tab within Chrome DevTools (not popup or options page) |
| **Content Script** | Extension script injected into web pages to access `window.__web_sqlite` |
| **DevTools Script** | Extension script running in DevTools context, communicates with content script |
| **Background Script** | Service worker for extension lifecycle and event handling |
| **Hash Routing** | URL-based navigation using #/ prefixes (e.g., #/openedDB/myapp.sqlite3) |
| **Sidebar** | Left navigation panel (20% width, collapsible) |
| **DDL** | Data Definition Language - SQL CREATE TABLE statements |
| **Migration** | Schema evolution SQL applied during version upgrades |
| **Seed** | Initial data population SQL |
| **Dev Version** | Test database version with `.dev` suffix, not persisted to release |
| **COOP/COEP** | Cross-Origin headers required for SharedArrayBuffer in SQLite WASM |
| **PRAGMA** | SQLite-specific commands for introspection (table_info, foreign_key_list, etc.) |
| **Lazy Loading** | Loading file tree nodes on-demand when expanded |
| **Active State** | Visual indicator showing currently selected menu item or tab |
| **About Tab** | Database information panel showing metadata, version, table/row counts, OPFS file info, and library version |

## 6) Icon Mapping (React Icons)
| Location | Icon | Import |
|----------|------|--------|
| DevTools panel title | SiSqlite | `import { SiSqlite } from "react-icons/si"` |
| Sidebar - App branding | SiSqlite | `import { SiSqlite } from "react-icons/si"` |
| Sidebar - Opened DB | FaDatabase | `import { FaDatabase } from "react-icons/fa6"` |
| Sidebar - OPFS | FaFile | `import { FaFile } from "react-icons/fa"` |
| Sidebar - Collapse (expanded) | FaAngleLeft | `import { FaAngleLeft } from "react-icons/fa"` |
| Sidebar - Collapse (collapsed) | FaAngleRight | `import { FaAngleRight } from "react-icons/fa"` |
| Tab - Table | CiViewTable | `import { CiViewTable } from "react-icons/ci"` |
| Tab - Query | BsFiletypeSql | `import { BsFiletypeSql } from "react-icons/bs"` |
| Tab - Log | LuLogs | `import { LuLogs } from "react-icons/lu"` |
| Tab - Migration | MdOutlineQueryBuilder | `import { MdOutlineQueryBuilder } from "react-icons/md"` |
| Tab - Seed | FaSeedling | `import { FaSeedling } from "react-icons/fa6"` |
| Tab - About | FaInfoCircle | `import { FaInfoCircle } from "react-icons/fa"` |
| Table tab close | FaXmark | `import { FaXmark } from "react-icons/fa6"` |
| Pagination refresh | FaRotate | `import { FaRotate } from "react-icons/fa"` |
| OPFS Folder (closed) | FaFolder | `import { FaFolder } from "react-icons/fa"` |
| OPFS Folder (open) | FaFolderOpen | `import { FaFolderOpen } from "react-icons/fa"` |
| OPFS Download | FaDownload | `import { FaDownload } from "react-icons/fa"` |

## 5) Risks (early)
- **R1**: **Chrome Extension Permissions** - Need `activeTab` or broader permissions to access `window.__web_sqlite`. Mitigation: Request minimal permissions, document clearly.
- **R2**: **OPFS Access Restrictions** - DevTools context may not directly access page's OPFS. Mitigation: Use content script as proxy for file operations.
- **R3**: **Cross-Context Messaging** - Content script and DevTools panel communication complexity. Mitigation: Use chrome.runtime.sendMessage with clear protocol.
- **R4**: **Large Dataset Performance** - Tables with millions of rows could hang UI. Mitigation: Enforce pagination limits, add loading states.
- **R5**: **API Version Compatibility** - Extension assumes web-sqlite-js v2.1.0+ structure. Mitigation: Add version detection, graceful degradation.
- **R6**: **Memory Leaks in Log Subscription** - Long-lived DevTools sessions with active log listeners. Mitigation: Implement cleanup on tab/database close.
- **R7**: **Race Conditions on Database Close** - User queries database while it's closing. Mitigation: Handle errors gracefully, show "database closed" state.
- **R8**: **CodeMirror Bundle Size** - SQL editor could exceed extension size targets. Mitigation: Use lightweight alternative or lazy-load.
