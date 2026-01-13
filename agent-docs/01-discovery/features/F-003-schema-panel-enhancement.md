<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/features/feature.md

OUTPUT MAP (write to)
agent-docs/01-discovery/features/F-003-schema-panel-enhancement.md

NOTES
- Feature F-003: Schema Panel Enhancement
- Adds toggle visibility and tabbed view (Table/DDL) to schema panel
- Improves UX with collapsible right panel and view switching
-->

# Feature F-003: Schema Panel Enhancement

## 0) Meta

- **Feature ID**: F-003
- **Title**: Schema Panel Enhancement - Toggle & Tabbed View
- **Status**: Pending Approval
- **Priority**: P1 (High) - UX improvement for table detail view
- **Created**: 2026-01-14
- **Requester**: User feedback on schema panel UX

## 1) Problem Statement

### Current Issue

The current schema panel in the TableDetail view has several UX limitations:

1. **Fixed panel width**: Schema panel always takes up 320px of horizontal space
2. **No view switching**: Shows both table schema AND DDL simultaneously, wasting vertical space
3. **No visibility toggle**: Cannot hide the schema panel to maximize table data viewing area
4. **"SCHEMA" title**: Unnecessary title that consumes vertical space

### User Requirements

When viewing table data in the TableDetail view (`/openedDB/:dbname/tables/:tableName`), the user wants:

1. **Toggle button** (`BsReverseLayoutSidebarInsetReverse` icon) to show/hide the schema panel
2. **Hidden by default**: Schema panel should be collapsed when page loads
3. **Remove "SCHEMA" title**: Eliminate the title to save vertical space
4. **Tab buttons in header**: Small buttons to switch between "Table" view and "DDL" view
   - Table icon button (`ImTable2`) → displays column info in table format
   - DDL text button → displays SQL CREATE TABLE statement
5. **Active state styling**: Button background changes based on active/inactive state
6. **Responsive table panel**: When schema is hidden, table data expands to full width

## 2) Proposed Solution

### Architecture Changes

**Current TableDetail Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Table Tabs Header (all tables)                          │
├────────────────────────────────┬────────────────────────┤
│ Table Data (flex-1)            │ DDL Panel (w-80)       │
│ - Table with scroll            │ - "SCHEMA" title       │
│ - Pagination bar               │ - Column info table   │
│                                 │ - DDL section         │
└────────────────────────────────┴────────────────────────┘
```

**Target TableDetail Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Table Tabs Header (all tables)                          │
├────────────────────────────────┬────────────────────────┤
│ Table Data (flex-1)            │ ┌───────────────────┐  │
│ - Table with scroll            │ │ 🔄 Table │ DDL │  │  │
│ - Pagination bar               │ ├───────────────────┤  │
│                                 │ │ [Current View]   │  │
│                                 │ └───────────────────┘  │
└────────────────────────────────┴────────────────────────┘
                        ↑
                    Toggle button in table data header
                    (when collapsed, table expands to full width)
```

**When Panel is Hidden:**

```
┌─────────────────────────────────────────────────────────┐
│ Table Tabs Header (all tables)                          │
├─────────────────────────────────────────────────────────┤
│ Table Data (full width)                                 │
│ - Table with scroll                                    │
│ - Pagination bar                                       │
└─────────────────────────────────────────────────────────┘
```

### Component Structure

**Modified Components:**

```
TableDetail (MODIFIED)
├── Table tabs header (unchanged)
├── Split view container (conditional width)
│   ├── TableDataPanel (left) - MODIFIED
│   │   ├── Add toggle button in header
│   │   └── Full width when panel hidden
│   └── SchemaPanel (right) - MODIFIED
│       ├── Add header with toggle + tabs
│       ├── Tab button: Table icon (ImTable2)
│       ├── Tab button: "DDL" text
│       ├── Content area: Table view OR DDL view
│       └── Animated collapse/expand
```

**New SchemaPanel Structure:**

```tsx
interface SchemaPanelProps {
  schema: TableSchema | null;
  loading?: boolean;
  error?: string | null;
  visible: boolean; // NEW: controlled by parent
  activeTab: "table" | "ddl"; // NEW: which view to show
  onToggle: () => void; // NEW: toggle visibility
  onTabChange: (tab: "table" | "ddl") => void; // NEW: switch view
}
```

### State Management

- **Panel visibility**: `useState<boolean>` in TableDetail, default `false` (hidden)
- **Active tab**: `useState<'table' | 'ddl'>` in TableDetail, default `'table'`
- Both states passed to SchemaPanel as props

## 3) Functional Requirements

### FR-SCHEMA-001: Toggle Visibility

- Add toggle button with `BsReverseLayoutSidebarInsetReverse` icon
- Clicking toggle button shows/hides the schema panel
- When hidden: table data panel expands to full width
- When visible: schema panel takes 320px (w-80) width
- Smooth transition animation for collapse/expand (150-200ms)
- Panel is **hidden by default** when component mounts

### FR-SCHEMA-002: Header Controls

- Remove "SCHEMA" title (line 57 in current TableSchemaPanel)
- Add header bar with three controls:
  1. **Left**: Toggle button (icon only, size ~16px)
  2. **Right**: Two tab buttons (small text-xs size)
     - Table icon button: `ImTable2` icon
     - DDL text button: "DDL" text
- Header height: ~28px (py-1.5 px-2)
- Background: `bg-gray-50`

### FR-SCHEMA-003: Tab Switching

- Two tab buttons: "Table view" and "DDL view"
- Only one view visible at a time
- Active tab button shows background color (emerald-50)
- Active tab button shows emerald-600 text color
- Inactive tab buttons show gray-500 text color
- Clicking tab button switches the content view
- Tab state persists when toggling panel visibility

### FR-SCHEMA-004: Table View Content

- Displays column information in table format (existing behavior)
- Columns: Column name, Type, Constraints
- PK/NOT NULL/DEFAULT badges as before
- No changes to content structure
- Just remove the "SCHEMA" title above it

### FR-SCHEMA-005: DDL View Content

- Displays SQL CREATE TABLE statement in code block
- Dark background (bg-gray-900) with green text (text-green-400)
- Monospace font with syntax highlighting colors
- `pre` tag with overflow-x-auto for horizontal scrolling
- Remove "DDL" sub-heading (redundant with tab button)

### FR-SCHEMA-006: Responsive Table Panel

- When schema panel is **hidden**: Table data takes 100% width
- When schema panel is **visible**: Table data takes flex-1 (remaining space)
- Smooth CSS transition for width change
- No horizontal scroll or content overflow during transition

### FR-SCHEMA-007: Icon Import

- Import required icons from `react-icons`:
  ```tsx
  import { BsReverseLayoutSidebarInsetReverse } from "react-icons/bs";
  import { ImTable2 } from "react-icons/im";
  ```
- Icon sizes: 14-16px for consistency

### FR-SCHEMA-008: Active State Styling

**Active Tab Button:**

```css
bg-emerald-50 text-emerald-600 border-emerald-200
```

**Inactive Tab Button:**

```css
text-gray-500 hover:text-gray-700 border-gray-200 hover:bg-gray-50
```

**Toggle Button:**

- When panel visible: `text-gray-600 hover:text-gray-800`
- When panel hidden: `text-gray-400 hover:text-gray-600`

## 4) Non-Functional Requirements

### NFR-SCHEMA-001: Performance

- Toggle animation should be smooth (150-200ms)
- Tab switching should be instant (no loading delay)
- No layout shift when toggling panel (use CSS transitions)

### NFR-SCHEMA-002: Backward Compatibility

- Preserve all existing schema display functionality
- Keep same data fetching via `getTableSchema()`
- Maintain loading and error states

### NFR-SCHEMA-003: Code Quality

- Use functional components with hooks
- TypeScript strict mode compliance
- Follow existing Tailwind CSS conventions
- Match emerald theme from index.css

### NFR-SCHEMA-004: Accessibility

- Toggle button should have `aria-label` and `title` attributes
- Tab buttons should be keyboard navigable
- Proper ARIA roles for tab interface
- Focus management when toggling panel

## 5) Out of Scope

- Changing the table data panel layout (left side)
- Modifying pagination behavior
- Adding new schema views (indexes, foreign keys, triggers)
- Persisting panel state across page navigation
- Editing schema or DDL content

## 6) Dependencies

### Blocks

- None (can proceed independently)

### Depends On

- F-002: Database Tab Navigation (complete) - TableDetail component exists
- TASK-05.1: Service Layer Table Schema Functions (complete)

### Related Features

- None - standalone UX enhancement

## 7) Success Criteria

### Acceptance Criteria

1. **Toggle Functionality**
   - [ ] Toggle button visible in schema panel header
   - [ ] Clicking toggle shows/hides panel
   - [ ] Table data expands to full width when hidden
   - [ ] Panel is hidden by default on mount
   - [ ] Smooth transition animation (150-200ms)

2. **Tab Controls**
   - [ ] Two tab buttons in header: Table icon + DDL text
   - [ ] "SCHEMA" title removed
   - [ ] Active tab shows emerald-50 background
   - [ ] Inactive tab shows gray-500 text
   - [ ] Clicking tab switches content view

3. **Table View**
   - [ ] Shows column info table when "Table" tab active
   - [ ] Columns: name, type, constraints
   - [ ] PK/NOT NULL/DEFAULT badges visible
   - [ ] No title above table

4. **DDL View**
   - [ ] Shows CREATE TABLE statement when "DDL" tab active
   - [ ] Dark background with green text
   - [ ] "DDL" sub-heading removed
   - [ ] Code block scrollable horizontally

5. **Responsive Behavior**
   - [ ] No horizontal overflow when toggling
   - [ ] Table data width adjusts smoothly
   - [ ] Tab state persists across toggle

6. **Icons & Styling**
   - [ ] `BsReverseLayoutSidebarInsetReverse` icon visible
   - [ ] `ImTable2` icon visible on table tab
   - [ ] Button size: text-xs (~12px font)
   - [ ] Emerald theme colors applied correctly

## 8) Open Questions

1. **State persistence**: Should panel visibility state persist when switching between tables?
   - **Decision**: Reset to hidden when switching tables (fresh start each time)

2. **Animation timing**: Should the collapse/expand be instant or animated?
   - **Decision**: Animated with 150-200ms CSS transition for smooth UX

3. **Mobile support**: How should panel behave on very small screens (< 768px)?
   - **Decision**: Not addressing mobile - DevTools panel is desktop-only

## 9) Implementation Notes

### Component File Structure

```
src/devtools/components/TableTab/
├── TableDetail.tsx          # MODIFY: Add panel state, toggle handler
└── TableSchema.tsx          # MODIFY: Rename to SchemaPanel, add header + tabs
```

### State Management in TableDetail

```tsx
const [schemaPanelVisible, setSchemaPanelVisible] = useState(false); // Hidden by default
const [schemaTab, setSchemaTab] = useState<"table" | "ddl">("table");

const handleToggleSchema = () => {
  setSchemaPanelVisible((prev) => !prev);
};

const handleSchemaTabChange = (tab: "table" | "ddl") => {
  setSchemaTab(tab);
};
```

### Modified SchemaPanel Props

```tsx
interface SchemaPanelProps {
  schema: TableSchema | null;
  loading?: boolean;
  error?: string | null;
  visible: boolean;
  activeTab: "table" | "ddl";
  onToggle: () => void;
  onTabChange: (tab: "table" | "ddl") => void;
}
```

### CSS Transition Classes

```tsx
// Panel container
className={`transition-all duration-200 ease-in-out ${visible ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}

// Table panel width adjustment
className={`transition-all duration-200 ease-in-out ${visible ? 'flex-1' : 'w-full'}`}
```

### Button Styling Reference

```tsx
// Toggle button
<button
  className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
  title={visible ? "Hide schema panel" : "Show schema panel"}
>
  <BsReverseLayoutSidebarInsetReverse size={14} />
</button>

// Tab button (active)
<button
  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
    activeTab === 'table'
      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      : 'text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50'
  }`}
>
  <ImTable2 size={14} />
</button>

// DDL button (text)
<button
  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
    activeTab === 'ddl'
      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      : 'text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50'
  }`}
>
  DDL
</button>
```

### Service Layer Integration

No changes required - uses existing `getTableSchema()` from databaseService.

### Testing Checklist

- [ ] Toggle button shows/hides panel
- [ ] Table expands to full width when hidden
- [ ] Default state is hidden
- [ ] Tab buttons switch views
- [ ] Active state styling correct
- [ ] Icons render correctly
- [ ] Animation is smooth
- [ ] No console errors
- [ ] Works across different table selections
