# UI Design Prompts for web-sqlite DevTools Extension

## Project Overview

**Product Name**: Web SQLite DevTools Extension
**Purpose**: Chrome DevTools extension for inspecting, querying, and debugging SQLite databases in web applications using web-sqlite-js
**Target Users**: Frontend developers, full-stack developers, QA engineers
**Platform**: Chrome DevTools Panel (desktop only)

**Key Design Principles**:

- Clean, professional developer tool aesthetic
- Information-dense but not cluttered
- Consistent with Chrome DevTools design language
- Emerald/green primary theme (#059669)
- Gray-scale secondary colors for hierarchy

---

## Color System (Theme Tokens)

### Primary Colors

```
Primary (emerald):
- primary-50:  #ecfdf5  (light backgrounds, hover states)
- primary-600: #059669  (primary actions, active states, icons)
- primary-700: #047857  (button hover states)

Secondary (gray):
- gray-50:  #f9fafb  (code block backgrounds)
- gray-100: #f3f4f6  (inactive tabs, panel backgrounds)
- gray-200: #e5e7eb  (borders, dividers)
- gray-500: #6b7280  (secondary text, icons)
- gray-600: #4b5563  (body text)
- gray-700: #374151  (headings, primary text)
- gray-900: #111827  (dark backgrounds, DDL code)

Semantic Colors:
- Blue (active tabs):   blue-600 (#2563eb), blue-700 (#1d4ed8)
- Green (success):      green-600 (#16a34a)
- Red (danger/delete):  red-500 (#ef4444), red-600 (#dc2626)
- Yellow (warnings):    yellow-100 (#fef3c7), yellow-700 (#a16207)
- Purple (file types):  purple-100 (#f3e8ff), purple-700 (#6b21a8)
```

---

## Icon System (React Icons)

| Location               | Icon Name                          | Library         | Size    | Color                |
| ---------------------- | ---------------------------------- | --------------- | ------- | -------------------- |
| App branding           | SiSqlite                           | react-icons/si  | 24px    | primary-600          |
| Sidebar - Opened DB    | FaDatabase                         | react-icons/fa  | 18px    | gray-600/primary-600 |
| Sidebar - OPFS         | FaFile                             | react-icons/fa  | 18px    | gray-600/primary-600 |
| Sidebar - Collapse     | FaAngleLeft/Right                  | react-icons/fa  | 18px    | gray-600             |
| Refresh button         | IoMdRefresh                        | react-icons/io  | 16-18px | gray-500/primary-600 |
| Tab - Tables           | CiViewTable                        | react-icons/ci  | 18px    | active/inactive      |
| Tab - Query            | BsFiletypeSql                      | react-icons/bs  | 16px    | active/inactive      |
| Tab - Log              | IoTimeOutline                      | react-icons/io5 | 18px    | active/inactive      |
| Tab - Migration        | MdOutlineQueryBuilder              | react-icons/md  | 18px    | active/inactive      |
| Tab - Seed             | FaSeedling                         | react-icons/fa6 | 16px    | active/inactive      |
| Tab - About            | FaInfoCircle                       | react-icons/fa  | 16px    | active/inactive      |
| Tab - Close            | IoMdClose                          | react-icons/io  | 14px    | white/gray-700       |
| Schema Toggle          | BsReverseLayoutSidebarInsetReverse | react-icons/bs  | 14px    | gray-600             |
| Schema - Table view    | ImTable2                           | react-icons/im  | 14px    | active/inactive      |
| Copy button            | MdOutlineContentCopy               | react-icons/md  | 14px    | gray-600             |
| Copy success           | FaCheck                            | react-icons/fa  | 14px    | green-600            |
| OPFS - Folder (closed) | FaFolder                           | react-icons/fa  | 16px    | gray-600             |
| OPFS - Folder (open)   | FaFolderOpen                       | react-icons/fa  | 16px    | gray-600             |
| OPFS - Download        | FaDownload                         | react-icons/fa  | 14px    | gray-600             |
| OPFS - Delete          | IoMdTrash                          | react-icons/io  | 14px    | red-500              |
| Modal - Warning        | FaExclamationTriangle              | react-icons/fa  | -       | red                  |
| Toast - Error          | FaExclamationCircle                | react-icons/fa  | -       | red                  |

---

## Component Design Prompts

### 1. Main Layout (DevTools Panel)

```
LAYOUT STRUCTURE:
┌─────────────────────────────────────────────────────────────────┐
│ ┌──────────────┬─────────────────────────────────────────────┐ │
│ │              │                                             │ │
│ │   Sidebar    │           Main Content Area                 │ │
│ │   (20%)      │           (80% or full)                    │ │
│ │              │                                             │ │
│ │              │                                             │ │
│ └──────────────┴─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

SIDEBAR (left, 20% width, collapsible):
├────────────────────────────────┐
│  🟢 Web Sqlite          [≡]    │  ← Header with collapse toggle
├────────────────────────────────┤
│  🔄 Opened DB                   │  ← Refresh button on left
│    • database1.sqlite3          │  ← Database list (indented)
│    • database2.sqlite3          │
│    • myapp.db                   │
├────────────────────────────────┤
│  📁 OPFS Browser                │  ← OPFS link
└────────────────────────────────┘

SIDEBAR COLLAPSED (icons only, ~60px width):
┌───┐
│ 🟢 │  ← SiSqlite icon
├───┤
│ 🗄️ │  ← Database icon
│ 🗄️ │
│ 🗄️ │
├───┤
│ 📁 │  ← Folder icon
└───┘

DESIGN PROMPT:
"A vertical sidebar panel on the left side of a DevTools interface,
approximately 20% width, with a header showing 'Web Sqlite' text with
a green SQLite icon, and a collapse toggle button on the right side.
Below the header, a menu section titled 'Opened DB' with a small
refresh icon on the left, followed by a list of database names
indented with bullet points. At the bottom, an OPFS Browser link with
a folder icon. Clean, minimal design with gray borders, emerald
green accents, and white background."
```

### 2. Opened Database List View (/openedDB route)

```
LAYOUT:
┌─────────────────────────────────────────────────────────────────┐
│ Opened Databases                                    [🔄]         │  ← Header with refresh
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 🗄️  main.sqlite3                              12 tables    │  │  ← Database card
│ └───────────────────────────────────────────────────────────┘  │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 🗄️  cache.db                                  8 tables     │  │  ← Database card (hover)
│ └───────────────────────────────────────────────────────────┘  │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ 🗄️  user_data.db                             24 tables    │  │
│ └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

EMPTY STATE (when no databases):
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        🟢                                      │  ← Large SiSqlite icon
│                                                                 │
│                   No Opened Databases                          │  ← Title (gray-700)
│                                                                 │
│           Could not detect any opened databases.               │  ← Message (gray-600)
│                                                                 │
│    Open a page that uses web-sqlite-js to see databases here.  │  ← Instructions (gray-500)
│                                                                 │
│              [  🔄  Refresh  ]                                 │  ← Button (primary-600 bg)
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

DATABASE CARD STYLE:
- Background: white (default) or primary-50 (hover)
- Border: gray-200 (default) → primary-300 (hover) → primary-600 (active)
- Border radius: 8px (rounded-lg)
- Padding: 12px (px-3 py-3)
- Icon: FaDatabase, 20px, gray-600 or primary-600 (active)
- Database name: font-medium, gray-700 or primary-600 (active)
- Table count: text-xs, gray-500 (secondary)
- Shadow: subtle on hover (shadow-sm)

DESIGN PROMPT:
"A database list view in a DevTools panel. At the top, a header
showing 'Opened Databases' title on the left and a circular refresh
button on the right. Below, a vertical list of database cards. Each
card has a database icon on the left, database name in bold text,
and table count in smaller gray text below. Cards have a light
gray border, rounded corners, and show a subtle green background
on hover. Clean, professional developer tool aesthetic with
emerald green accent colors."
```

### 3. Database Tab Navigation

```
LAYOUT (6 tabs in header row):
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────┬────────┬──────┬───────────┬──────┬──────┐              │
│ │ 📊 │  📝    │ 🕐   │  📐       │ 🌱   │ ℹ️   │              │
│ │Tbls │ Query  │ Log  │Migration │ Seed │About │              │
│ └─────┴────────┴──────┴───────────┴──────┴──────┘              │
├─────────────────────────────────────────────────────────────────┤
│                        Tab Content                              │
│                       (varies by tab)                           │
└─────────────────────────────────────────────────────────────────┘

TAB STYLING:
- Container: flex row, border-b-2 border-gray-200
- Individual tab: px-4 py-2, text-sm font-medium
- Active tab: border-b-2 border-primary-600, text-primary-600
- Inactive tab: border-b-2 border-transparent, text-gray-600, hover:text-gray-800
- Icon above text: icon size 16-18px, vertically aligned
- Active background: optional bg-primary-50 for emphasis

TAB ICONS & COLORS:
1. Tables:    CiViewTable icon,   📊
2. Query:     BsFiletypeSql icon, 📝
3. Log:       IoTimeOutline icon, 🕐
4. Migration: MdOutlineQueryBuilder icon, 📐
5. Seed:      FaSeedling icon,    🌱
6. About:     FaInfoCircle icon,  ℹ️

DESIGN PROMPT:
"A tab navigation bar with 6 tabs arranged horizontally. Each tab
has an icon centered above a text label. The active tab has a green
bottom border and green text color. Inactive tabs have gray text
and no bottom border. Tab labels are: 'Tables' with a grid icon,
'Query' with a SQL icon, 'Log' with a clock icon, 'Migration'
with a branching icon, 'Seed' with a seedling icon, and 'About'
with an info icon. Minimal, clean design with emerald green accent
for the active state."
```

### 4. Tables Tab (Main Table Browser)

```
LAYOUT (3-column resizable layout):
┌─────────────────────────────────────────────────────────────────┐
│ [users] [orders] [products]                            [⚙️]      │  ← Opened tabs header
├──────┬──────────────────────────────────────────────┬───────────┤
│      │                                              │           │
│Table │              Table Data                      │  Schema   │
│List  │           (scrollable)                      │  Panel    │
│      │                                              │ (toggle)  │
│      │                                              │           │
├──────┴──────────────────────────────────────────────┴───────────┤
│ « Prev 1-100 of 1,247 Next  [100 ▼]          [↻] [×]          │  ← Pagination bar
└─────────────────────────────────────────────────────────────────┘

SIDEBAR (left, resizable 200-600px, default 300px):
┌─────────────────────────┐
│  ○ users               │  ← Clickable table items
│ ● orders (active)       │  ← Active state styling
│  ○ products            │
│  ○ categories          │
│  ○ order_items         │
└─────────────────────────┘

OPENED TABS HEADER (10% height):
┌─────────────────────────────────────────────────────────────────┐
│ [users] [orders ●] [products]             [toggle schema panel]  │
│    ↑        ↑                                      ↑           │
│  Inactive  Active (blue bg)                  Toggle button       │
│  (gray)    white text              (sidebar icon, gray)         │
│            Close button on hover (×)                               │
└─────────────────────────────────────────────────────────────────┘

CLOSE BUTTON BEHAVIOR:
- Hidden by default (opacity-0)
- Visible on hover of parent tab (group-hover:opacity-100)
- Icon: IoMdClose, 14px
- Background: rounded-full, p-0.5
- Hover: bg-blue-700 (active tab) or bg-gray-300 (inactive tab)

TABLE DATA AREA (left, flex-1, responsive):
┌─────────────────────────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ id │ name    │ email           │ created_at  │ updated_at │  │  ← Fixed header
│ ├───┼─────────┼─────────────────┼─────────────┼─────────────│  │
│ │ 1 │ John    │ john@exa...     │ 2024-01-15  │ 2024-01-15  │  │
│ │ 2 │ Jane    │ jane@exa...     │ 2024-01-15  │ 2024-01-15  │  │
│ │ 3 │ Bob     │ bob@example.com │ 2024-01-14  │ 2024-01-14  │  │
│ │   │ ...     │ ...             │ ...         │ ...         │  │  ← Scrollable body
│ └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
- Header: bg-gray-100, sticky top, border-b
- Rows: border-t border-gray-100
- Text: text-sm, monospace for data
- Max width: scroll horizontally for wide tables

SCHEMA PANEL (right, resizable 250-600px, default 320px, toggleable):
┌──────────────────────┐
│ [⬅] [📊] [DDL]      │  ← Toggle | Table tab | DDL tab
├──────────────────────┤
│ COLUMN    │ TYPE     │  ← Table view (active)
│───────────┼──────────│
│ id        │ INTEGER  │
│ name      │ TEXT     │
│ email     │ TEXT     │
│ PK badge  │ NOT NULL │  ← Constraint badges
└──────────────────────┘

OR (DDL tab active):
┌──────────────────────┐
│ [⬅] [📊] [DDL ●]    │
├──────────────────────┤
│ ┌──────────────────┐ │
│ │ CREATE TABLE...  │ │  ← DDL with syntax highlighting
│ │   id INTEGER...  │ │  Dark bg, green text
│ │   name TEXT...   │ │
│ └──────────────────┘ │
└──────────────────────┘

SCHEMA PANEL STATES:
- Hidden (default): w-0, opacity-0, overflow-hidden
- Visible: w-80 (320px), opacity-100
- Transition: all 200ms ease-in-out
- Header height: ~28px, bg-gray-50
- Active tab: bg-emerald-50 text-emerald-600 border-emerald-200
- Inactive tab: text-gray-500 border-gray-200

PAGINATION BAR (bottom, 10% height):
┌─────────────────────────────────────────────────────────────────┐
│ « Prev  Page 1-100 of 1,247  Next »    [100 ▼]    [↻] [×]    │
│  ↑        ↑                        ↑         ↑       ↑    ↑     │
│ button   page info              limit    select  refresh close │
└─────────────────────────────────────────────────────────────────┘

RESIZE HANDLE (4px wide, appears on hover):
┌────┐
│    │  ← Transparent drag area
│    │  Cursor: col-resize
└────┘
Hover state: 8px wide, bg-blue-200
Dragging state: 8px wide, bg-blue-300

DESIGN PROMPT:
"A three-column table browser layout. Left sidebar (300px) shows a
list of table names with bullet points. Middle area (flexible width)
displays a data table with a fixed header row showing column names
and scrollable body with data rows. A horizontal pagination bar at
the bottom shows page range and navigation buttons. Right panel
(320px, toggleable) shows schema information with a tab header for
switching between table view and DDL view. Vertical resize handles
appear on hover between columns. Clean, data-dense design with
gray borders and emerald accents."
```

### 5. Query Tab (SQL Editor)

```
LAYOUT:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ SQL Editor (CodeMirror)                  [▶ Run] [Ctrl] │   │  ← Editor with execute button
│  │                                                         │   │
│  │ SELECT * FROM users                                     │   │  ← SQL input area
│  │ WHERE email LIKE '%@example.com'                        │   │  with syntax highlighting
│  │ LIMIT 100;                                              │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Results (142 rows)                              [↓ CSV] │   │  ← Result header with export
│  ├─────────────────────────────────────────────────────────┤   │
│  │ id │ name    │ email                  │ created_at     │   │  ← Sortable headers
│  ├───┼─────────┼────────────────────────┼─────────────────│   │
│  │ 1 │ John    │ john@example.com       │ 2024-01-15      │   │  ← Data rows
│  │ 2 │ Jane    │ jane@example.com       │ 2024-01-15      │   │
│  │ 3 │ Bob     │ robert@example.com     │ 2024-01-14      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

EDITOR AREA:
- Height: ~200px, expandable
- Background: dark or light theme matching DevTools
- Syntax highlighting: SQL keywords (blue), strings (green), comments (gray)
- Line numbers: visible on left gutter
- Execute button: top-right, primary-600 background, "▶ Run" text
- Keyboard shortcut hint: "Ctrl+Enter" in gray text

RESULTS TABLE:
- Max height: ~400px, scrollable vertical
- Header: bg-gray-100, sticky top
- Sortable columns: click to sort, show indicator (▲/▼)
- Export button: top-right, "↓ CSV" or "↓ JSON" text
- Empty state: "Execute a SELECT query to see results here"

DESIGN PROMPT:
"A SQL query editor interface. Top section shows a code editor area
with SQL syntax highlighting - keywords in blue, strings in green,
comments in gray. Line numbers visible on left. A blue 'Run' button
with play icon on the top right. Bottom section shows a results
table with sortable column headers and data rows. Export button on
top right of results. Clean, code-focused design with dark gray
editor background and light gray results table."
```

### 6. Log Tab (Log Viewer)

```
LAYOUT:
┌─────────────────────────────────────────────────────────────────┐
│ Log Filters                                           [🔄]     │  ← Filter header with refresh
├─────────────────────────────────────────────────────────────────┤
│ [All ▼] [☑ sql] [☑ action] [☑ event]  [⚙️]          [Clear]  │  ← Filter controls
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 14:32:01.123  INFO    sql    SELECT * FROM users          │ │  ← Log entry
│ │ 14:32:01.234  WARN    action  Database connection slow    │ │
│ │ 14:32:01.345  ERROR   event   Transaction failed           │ │
│ │ 14:32:01.456  INFO    sql    INSERT INTO users...         │ │
│ │ ...                                                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                        ↑ Ring buffer (500)     │
└─────────────────────────────────────────────────────────────────┘

LOG ENTRY STYLING:
- Font: monospace (text-xs font-mono)
- Background: alternating row colors (odd/even)
- Level indicators:
  * INFO:  green badge, text-green-700
  * WARN:  yellow badge, text-yellow-700
  * ERROR: red badge, text-red-700
- Timestamp: gray-500, right-aligned
- Type badge: small, rounded, color-coded
- Message: gray-700, word-wrap

FILTER CONTROLS:
- Dropdown: "All", "sql", "action", "event"
- Checkboxes: multi-select for categories
- Settings button: filter configuration
- Clear button: clear all logs

DESIGN PROMPT:
"A log viewer interface with a filter bar at the top. Filter bar
has dropdown menus and checkboxes for filtering by log level and
type. Main area shows a scrollable list of log entries in a
monospace font. Each entry has a timestamp on the left, a colored
badge for log level (INFO=green, WARN=yellow, ERROR=red), and
the log message. Entries alternate light gray background for
readability. Clean, terminal-like aesthetic with subtle colors."
```

### 7. Migration/Seed Tabs (Testing Playgrounds)

```
LAYOUT (same for both Migration and Seed):
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ℹ️  Safe Testing Environment                             │   │  ← Helper notice
│  │     Test your SQL in a dev version. Changes            │   │
│  │     automatically rollback after testing.               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ SQL Editor (CodeMirror)                     [Test]      │   │  ← Editor + test button
│  │                                                         │   │
│  │ CREATE TABLE users_v2 (                                 │   │
│  │   id INTEGER PRIMARY KEY,                               │   │
│  │   username TEXT UNIQUE NOT NULL                         │   │
│  │ );                                                      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Version: 1.0.0 → 1.0.1-dev                        [Rollback]  │  ← Version info + rollback
└─────────────────────────────────────────────────────────────────┘

HELPER NOTICE:
- Background: bg-blue-50 border-blue-200
- Icon: Info icon (blue)
- Title: font-medium text-blue-900
- Text: text-sm text-blue-700

VERSION CONTROL:
- Current version: gray-700 text
- Dev version: primary-600 text (emerald green)
- Rollback button: red button with warning icon

TEST RESULTS:
┌─────────────────────────────────────────────────────────────────┐
│ ✅ Migration tested successfully                              │  ← Success state
│    1 table created, 0 errors                                  │
└─────────────────────────────────────────────────────────────────┘

OR:

┌─────────────────────────────────────────────────────────────────┐
│ ❌ Migration failed                                            │  ← Error state
│    Table 'users_v2' already exists                             │
└─────────────────────────────────────────────────────────────────┘

DESIGN PROMPT:
"A migration testing playground interface. Top section shows a
blue info box explaining safe testing with automatic rollback.
Middle section has a SQL code editor with syntax highlighting.
Bottom section shows version numbers with current version in gray
and dev version in green, plus a red rollback button. A success
message in green shows test results. Clean, reassuring design
with blue and green accent colors."
```

### 8. About Tab (Database Metadata)

```
LAYOUT:
┌─────────────────────────────────────────────────────────────────┐
│ Database Information                                            │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Property             Value                                  │ │
│ │ ├─────────────────────────────────────────────────────────┤ │
│ │ Database Name        main.sqlite3                           │ │
│ │ Version              1.0.0                                  │ │
│ │ Tables               12                                     │ │
│ │ Total Rows           ~1.2M                                  │ │
│ │ OPFS File            /sqlite/main.sqlite3                   │ │
│ │ File Size            2.4 MB                                 │ │
│ │ Last Modified        2024-01-15 14:32:01                    │ │
│ │ ───────────────────────────────────────────────────────────│ │
│ │ web-sqlite-js        v2.1.0                                 │ │
│ │ Extension            v1.2.0                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

METADATA TABLE STYLING:
- Layout: key-value pairs in two-column format
- Headers: gray-500 text-sm uppercase
- Property column: gray-700, width ~40%
- Value column: gray-900, monospace for paths/versions
- Row divider: border-b border-gray-100
- Section divider: border-t border-gray-200, margin-top
- Icon: SiSqlite or FaDatabase for visual interest

DESIGN PROMPT:
"A database information display showing key-value metadata pairs
in a two-column table format. Left column shows property names
in gray text, right column shows values in darker text with
monospace font for technical values. Properties include database
name, version, table count, file size, last modified date, and
library versions. Subtle row dividers and section headers.
Clean, reference-style layout."
```

### 9. OPFS Browser (File Tree)

```
LAYOUT:
┌─────────────────────────────────────────────────────────────────┐
│ OPFS File Browser                                               │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ├── 📂 databases/                       3 files 2 dirs      │ │
│ │ │   ├── 📄 main.sqlite3           1.2 MB  SQLite DB        │ │
│ │ │   │   ├── 📄 cache.db            256 KB  SQLite DB        │ │
│ │ │   │   └── 📄 user_data.db        890 KB  SQLite DB        │ │
│ │ │   └── 📂 logs/                              15 files     │ │
│ │ │       └── 📄 app.log             45 KB   Text File        │ │
│ │ ├── 📂 storage/                          120 files      │ │
│ │ └── 📄 config.json                      12 KB   JSON Data  │
│ │     ↓ Hover for metadata, click actions →                      │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

FILE NODE STRUCTURE:
┌─────────────────────────────────────────────────────────────────┐
│ │   ├── 📂 databases/                   [⬇️]              [↓] [🗑️] │
│ │         ↑        ↑                         ↑       ↑       ↑    │
│ │     Tree     Folder                   Expand Download Delete│
│ │     lines   name + badge              chevron  (hover) (hover)│
│ └─────────────────────────────────────────────────────────────┘ │

TREE LINES (VSCode-style):
├── Vertical line: gray-200, 1px solid
│   Horizontal connector: gray-200, 1px solid, 12px wide
└── Last child: adjusted horizontal connector

FILE NODE STYLING:
- Folder icon: FaFolder (closed) or FaFolderOpen (open), gray-600
- File icon: FaFile, gray-600
- Name: text-sm, gray-700 (files), gray-900 (folders), font-medium
- Badge: small, rounded, color-coded by file type
- Size: text-xs, gray-500, right-aligned
- Type badge: SQLite (blue), JSON (yellow), Text (gray), Image (purple)
- Actions:
  * Expand: chevron on left, visible for directories
  * Download: ↓ button on hover, gray-500
  * Delete: 🗑️ button on hover, red-500

DELETE CONFIRMATION MODAL:
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  Delete main.sqlite3?                              [×]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Type:     SQLite Database                                       │
│  Size:     1.2 MB                                                │
│  Modified: 2024-01-15 14:32:01                                    │
│  Path:     /databases/main.sqlite3                               │
│                                                                 │
│  ⚠️  This action cannot be undone.                               │
│                                                                 │
│           [Cancel]           [Delete 🗑️]                        │
│                              ↑                                   │
│                        Red danger button                         │
└─────────────────────────────────────────────────────────────────┘

TOAST NOTIFICATIONS:
┌─────────────────────────────────────────────────────────────────┐
│ ✅ Deleted successfully                              [×]  3s    │  ← Success toast
│    main.sqlite3 has been deleted.                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ❌ Delete failed                                        [×]  5s │  ← Error toast
│    Permission denied. [Retry]                                    │
└─────────────────────────────────────────────────────────────────┘

DESIGN PROMPT:
"A file tree browser interface showing a hierarchical folder
structure. VSCode-style tree lines with vertical and horizontal
connectors in light gray. Each node has an icon (folder or file),
name, size, and file type badge. Hover reveals action buttons
for download and delete on the right. Folders show expand/collapse
chevrons. Clean, tree-view design with subtle colors and
hierarchical indentation."
```

---

## Responsive Layout Variations

### Collapsed Sidebar State

```
┌──┬──────────────────────────────────────────────────────────────┐
│  │                                                              │
│🗄️ │  Main Content Area (full width ~95%)                         │
│🗄️ │  Sidebar collapsed to icons only (~60px)                     │
│📁 │                                                              │
│  │                                                              │
└──┴──────────────────────────────────────────────────────────────┘
```

### Schema Panel Hidden State

```
┌─────────────────────────────────────────────────────────────────┐
│ [users] [orders] [products]                            [⚙️]      │
├─────────────────────────────────────────────────────────────────┤
│ Table Data (full width, 100%)                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Table with all columns visible, no schema panel              │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ « Prev 1-100 of 1,247 Next  [100 ▼]          [↻] [×]            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Interactive State Specifications

### Button States

```
PRIMARY BUTTON (execute, test, etc.):
┌─────────────────────┐
│ Default: bg-primary-600 text-white rounded px-4 py-2      │
│ Hover:   bg-primary-700                                    │
│ Active:  bg-primary-700 scale-95                            │
│ Disabled: opacity-50 cursor-not-allowed                     │
└─────────────────────┘

SECONDARY BUTTON (cancel, etc.):
┌─────────────────────┐
│ Default: bg-white text-gray-700 border border-gray-300     │
│ Hover:   bg-gray-50                                         │
└─────────────────────┘

DANGER BUTTON (delete, rollback):
┌─────────────────────┐
│ Default: bg-red-600 text-white rounded                    │
│ Hover:   bg-red-700                                         │
└─────────────────────┘

ICON BUTTON (refresh, toggle):
┌─────────────────────┐
│ Default: text-gray-500 hover:text-gray-700 p-2            │
│ Active:  text-primary-600                                  │
└─────────────────────┘
```

### Tab States

```
ACTIVE TAB:
┌─────────────────────┐
│ bg-primary-50 text-primary-600 border-b-2 border-primary-600│
│ Icon + text both colored                                     │
└─────────────────────┘

INACTIVE TAB:
┌─────────────────────┐
│ text-gray-600 hover:text-gray-800 border-b-2 transparent   │
│ Hover: bg-gray-50                                           │
└─────────────────────┘

CLOSED TAB (with close button):
┌───────────────────────────┐
│ [TabName ×]  group-hover   │
│  ↑       ↑                │
│  Name   Close button       │
│         (opacity-0         │
│          group-hover       │
│          opacity-100)      │
└───────────────────────────┘
```

### Loading States

```
SKELETON LOADING:
┌─────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓  (animate-pulse)     │
│ ▓▓▓▓▓                           │
│ ▓▓▓▓▓▓▓▓                         │
│ Background: bg-gray-200          │
│ Animation: pulse                 │
└─────────────────────────────────┘

SPINNER LOADING:
┌──────┐
│ ◐    │  (border-4 border-gray-200)
│      │  (border-t-primary-600)
│      │  (animate-spin)
└──────┘
```

### Empty States

```
DATABASE EMPTY STATE:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        🟢                                      │
│                   No Opened Databases                          │
│           Could not detect any opened databases.               │
│    Open a page that uses web-sqlite-js to see databases here.  │
│              [  🔄  Refresh  ]                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

TABLE EMPTY STATE:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  No tables open. Select a table from the sidebar.               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

RESULTS EMPTY STATE:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Execute a SELECT query to see results here.                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Spacing & Layout System

### Grid System

```
DevTools Panel Width: ~800-1200px (flexible)
- Sidebar: 20% (200px min, 600px max)
- Main Content: 80% (flex-1)
- Gutter: 4px (border width)

Component Heights:
- Tab Header: ~40px
- Pagination Bar: ~40px
- Filter Bar: ~40px
- Modal Header: ~40px
- Modal Footer: ~60px
```

### Padding Scale

```
p-2  = 8px   (small elements)
p-3  = 12px  (cards, buttons)
p-4  = 16px  (containers)
p-6  = 24px  (sections)
p-8  = 32px  (large sections)
```

### Border Radius

```
rounded:   4px  (small elements)
rounded-lg: 8px  (cards, buttons)
rounded-xl: 12px (modals)
rounded-full: circular (badges, icons)
```

### Font Sizes

```
text-xs:   12px (metadata, badges)
text-sm:   14px (body text, table data)
text-base: 16px (headings)
text-lg:   18px (section titles)
text-xl:   20px (page titles)
text-2xl:  24px (empty state titles)
```

---

## Accessibility Notes

### Focus States

```
All interactive elements:
- Focus ring: 2px solid primary-600, offset 2px
- Visible on keyboard navigation
- Z-index: above surrounding content

Buttons:
- Focus: ring-offset-2 ring-2 ring-primary-600
- Hover: maintain focus indicator

Tabs:
- Focus: ring-primary-600
- Selected: aria-selected="true"
```

### ARIA Labels

```
- Icons: aria-label="{action} {context}"
- Buttons: aria-label="{action}" (if text unclear)
- Modals: aria-modal="true", role="dialog"
- Tabs: role="tablist", role="tab"
- Tree: role="tree", role="treeitem"
```

### Color Contrast

```
- Normal text (gray-700 on white): 11:1 ratio (AAA)
- Large text (gray-500 on white): 7:1 ratio (AAA)
- Primary buttons (white on primary-600): 4.5:1 ratio (AA)
- Disabled text (gray-400 on white): 3.9:1 ratio (fails - acceptable)
```

---

## Design Asset Specifications

### Icon Formats

- SVG vector icons from react-icons
- Monoline style (2px stroke)
- 16px, 18px, 20px, 24px sizes
- Gray-scale with accent colors

### Typography

- System font stack: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- Monospace: "SF Mono", "Monaco", "Inconsolata", "Fira Code"
- Font weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Shadows

```
shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05)     (cards hover)
shadow:     0 1px 3px 0 rgba(0, 0, 0, 0.1)      (dropdowns)
shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1)   (modals)
shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1) (popovers)
```

---

## Summary: Key Visual Attributes

```
PRIMARY ACCENT: Emerald green (#059669)
- Active tabs, primary buttons, success states
- Provides distinctive, professional appearance

SECONDARY COLORS: Gray scale
- Backgrounds, borders, text hierarchy
- Creates visual separation without distraction

LAYOUT: Flexible, data-dense
- Resizable panels with drag handles
- Information organized hierarchically
- Scrolling areas for large datasets

INTERACTION: Subtle, responsive
- Hover states with color changes
- Smooth transitions (150-200ms)
- Clear active states

TYPOGRAPHY: Clean, readable
- System fonts for native feel
- Monospace for code and data
- Size hierarchy for information architecture

ICONOGRAPHY: Consistent style
- Monoline icons from react-icons
- Semantic icon choices
- Appropriate sizing (14-24px)
```

---

## Usage Notes for Image Generation

When generating UI mockups, use these prompt structures:

**For component views:**
"A [component name] interface for a Chrome DevTools extension.
[Layout description]. [Color scheme: emerald green primary, gray
secondary]. [Key elements: icons, tables, buttons]. Clean,
professional developer tool aesthetic."

**For state variations:**
"[Component name] showing [state: empty/loading/error/success].
[Specific visual elements for this state]. [Color coding: green
for success, red for error, gray for empty]."

**For interactions:**
"[Component name] with [hover/focus/active state] on [specific
element]. [Visual changes: background color, shadow, border].
[Button/cursor style]."

**For responsive layouts:**
"[Component name] in [responsive state: collapsed sidebar,
hidden panel, full width]. [Layout adjustments]. [Icon-only
navigation for collapsed state]."
