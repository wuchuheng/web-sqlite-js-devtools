<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/active/task-micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-06.md

NOTES
- Micro-Spec for TASK-06: Table Data & Schema UI
- Spec-first implementation per S8 Worker guidelines
- UI-focused task: service layer functions already implemented in TASK-05.1
-->

# TASK-06: Table Data & Schema UI

## 0) Meta

- **Task ID**: TASK-06
- **Title**: Table Data & Schema UI
- **Priority**: P0 (Blocker)
- **Status**: In Progress
- **Dependencies**: TASK-05.1 (Service Layer Table Schema Functions), TASK-05.6 (Component Migration)
- **Maps to**: FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-043
- **Created**: 2026-01-13

## 1) Summary

Implement table data viewer and schema panel UI components. When a user selects a table in the database view, display:

1. Table data with fixed column headers (field name + type)
2. DDL info panel showing the complete CREATE TABLE SQL
3. Pagination controls with customizable limit
4. Multi-table tab support with close buttons

## 2) Boundary

**Files to create:**

- `src/devtools/components/TableTab/TableContent.tsx` - Main table data viewer
- `src/devtools/components/TableTab/PaginationBar.tsx` - Pagination controls
- `src/devtools/components/TableTab/TableSchema.tsx` - Schema panel with DDL
- `src/devtools/components/TableTab/TableTabs.tsx` - Multi-table tab bar

**Files to modify:**

- `src/devtools/components/TableTab/DatabaseView.tsx` - Replace placeholder with TableContent + tabs

**Files to read (context):**

- `src/devtools/services/databaseService.ts` - Service layer functions (getTableSchema, queryTableData)
- `src/devtools/components/TableTab/TableList.tsx` - Existing table list component for styling reference

**Files NOT to modify:**

- No changes to service layer (already complete in TASK-05.1)
- No changes to TableList.tsx

## 3) Upstream Traceability

### HLD References

- DevTools Panel Architecture: `agent-docs/03-architecture/01-hld.md` (Section 6)
- Three-Layer Pattern: Components → Service → Bridge → Page Context

### API Contract References

- Service Layer API: `agent-docs/05-design/01-contracts/01-api.md` (Table Schema & Query)
- Message Types: `agent-docs/05-design/02-schema/01-message-types.md`

### Module LLD References

- DevTools Panel: `agent-docs/05-design/03-modules/devtools-panel.md`

### Functional Requirements

- **FR-018**: Display table schema (column names, types, constraints)
- **FR-019**: Show DDL (CREATE TABLE SQL statement)
- **FR-020**: Paginated table data view
- **FR-021**: Pagination controls (page size, next/prev, jump to page)
- **FR-022**: Sortable columns (optional - can defer)
- **FR-023**: Filter/search rows (optional - can defer)
- **FR-043**: Multi-table tab support with close buttons

## 4) Functional Design

### Component 1: TableContent.tsx

**Purpose**: Display paginated table data with schema info

**Props Interface:**

```typescript
interface TableContentProps {
  dbname: string;
  tableName: string;
  onClose?: () => void; // Optional callback for tab close
}
```

**State Management:**

```typescript
// Schema state
const {
  data: schema,
  isLoading: schemaLoading,
  error: schemaError,
} = useInspectedWindowRequest<TableSchema>(
  () => databaseService.getTableSchema(dbname, tableName),
  [dbname, tableName],
  null,
);

// Data state
const [page, setPage] = useState(0);
const [limit, setLimit] = useState(50);

const {
  data: tableData,
  isLoading: dataLoading,
  error: dataError,
} = useInspectedWindowRequest<QueryResult>(
  () =>
    databaseService.queryTableData(
      dbname,
      `SELECT * FROM ${tableName}`,
      limit,
      page * limit,
    ),
  [dbname, tableName, limit, page],
  null,
);
```

**UI Structure:**

```
┌─────────────────────────────────────────────────────────┐
│ Table: users                                            │
├─────────────────────────────────────────────────────────┤
│ ┌─ Schema Panel ─────────────────────────────────────┐  │
│ │ DDL: CREATE TABLE users (                          │  │
│ │   id INTEGER PRIMARY KEY,                          │  │
│ │   name TEXT NOT NULL,                              │  │
│ │   email TEXT UNIQUE                                │  │
│ │ )                                                   │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ Data Table ──────────────────────────────────────┐  │
│ │ ┌──────────────┬─────────────┬──────────────┐      │  │
│ │ │ id (INTEGER) │ name (TEXT) │ email (TEXT) │      │  │
│ │ ├──────────────┼─────────────┼──────────────┤      │  │
│ │ │ 1            │ Alice       │ a@ex.com     │      │  │
│ │ │ 2            │ Bob         │ b@ex.com     │      │  │
│ │ └──────────────┴─────────────┴──────────────┘      │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌─ Pagination Bar ──────────────────────────────────┐  │
│ │ ← 1 of 5 →    Rows per page: [50▼] [Refresh]      │  │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Loading/Error States:**

- Loading skeleton while schema/data loads
- Error banner if query fails with retry button
- Empty state if table has no rows

### Component 2: PaginationBar.tsx

**Purpose**: Pagination controls with customizable limit

**Props Interface:**

```typescript
interface PaginationBarProps {
  page: number;
  total: number;
  limit: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => void;
}
```

**Features:**

- Previous/Next buttons (disabled at boundaries)
- Page indicator: "Page X of Y" where Y = ceil(total / limit)
- Limit dropdown: [10, 25, 50, 100, 500] rows
- Refresh button with icon
- Disable all controls while loading

**Styling:**

```tsx
<div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t">
  {/* Page controls */}
  <button
    onClick={() => onPageChange(page - 1)}
    disabled={page === 0 || loading}
  >
    ← Previous
  </button>
  <span>
    Page {page + 1} of {Math.ceil(total / limit)}
  </span>
  <button
    onClick={() => onPageChange(page + 1)}
    disabled={end >= total || loading}
  >
    Next →
  </button>

  {/* Limit selector */}
  <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
    <option value={10}>10 rows</option>
    <option value={25}>25 rows</option>
    <option value={50}>50 rows</option>
    <option value={100}>100 rows</option>
    <option value={500}>500 rows</option>
  </select>

  {/* Refresh button */}
  <button onClick={onRefresh} disabled={loading}>
    🔄 Refresh
  </button>
</div>
```

### Component 3: TableSchema.tsx

**Purpose**: Display table schema with DDL panel

**Props Interface:**

```typescript
interface TableSchemaProps {
  schema: TableSchema;
  loading?: boolean;
  error?: string | null;
}
```

**Column Info Table:**

```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="bg-gray-100">
      <th className="px-4 py-2 text-left">Column</th>
      <th className="px-4 py-2 text-left">Type</th>
      <th className="px-4 py-2 text-left">Constraints</th>
    </tr>
  </thead>
  <tbody>
    {schema.columns.map((col) => (
      <tr key={col.cid}>
        <td className="px-4 py-2">{col.name}</td>
        <td className="px-4 py-2 text-gray-600">{col.type}</td>
        <td className="px-4 py-2">
          {col.pk > 0 && <span className="text-blue-600">PK </span>}
          {col.notnull > 0 && <span className="text-red-600">NOT NULL </span>}
          {col.dflt_value !== null && (
            <span className="text-gray-500">DEFAULT {col.dflt_value}</span>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**DDL Panel:**

```tsx
<div className="mt-4">
  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">DDL</h3>
  <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
    {schema.ddl}
  </pre>
</div>
```

### Component 4: TableTabs.tsx

**Purpose**: Multi-table tab bar with close buttons

**Props Interface:**

```typescript
interface TableTab {
  dbname: string;
  tableName: string;
}

interface TableTabsProps {
  tabs: TableTab[];
  activeTab: TableTab | null;
  onSelectTab: (tab: TableTab) => void;
  onCloseTab: (tab: TableTab) => void;
  onClearAll: () => void;
}
```

**UI Structure:**

```
┌─────────────────────────────────────────────────────────┐
│ [users ×] [products ×] [orders ×]           [Clear All] │
└─────────────────────────────────────────────────────────┘
```

**Styling:**

- Active tab: blue background, white text
- Inactive tab: gray background, dark text
- Close button: × icon, visible on hover
- Clear All: right-aligned button

### Integration: DatabaseView.tsx Updates

**Current State (placeholder):**

```tsx
<div className="rounded border border-dashed border-gray-300 p-4 text-sm text-gray-500">
  {selectedTable
    ? `Table "${selectedTable}" view coming in TASK-06.`
    : "Table view coming in TASK-06."}
</div>
```

**Target State:**

```tsx
// State for open tabs
const [openTabs, setOpenTabs] = useState<TableTab[]>([]);
const [activeTab, setActiveTab] = useState<TableTab | null>(null);

// When user clicks a table in TableList
const handleTableSelect = (tableName: string) => {
  const newTab: TableTab = { dbname, tableName };

  // Add to tabs if not already open
  setOpenTabs((prev) => {
    if (prev.some((t) => t.dbname === dbname && t.tableName === tableName)) {
      return prev;
    }
    return [...prev, newTab];
  });

  setActiveTab(newTab);
};

// Clear tabs when database changes
useEffect(() => {
  setOpenTabs([]);
  setActiveTab(null);
}, [dbname]);

// Render tabs or empty state
return (
  <div className="flex h-full">
    <aside className="w-64 border-r border-gray-200 bg-white">
      {/* TableList unchanged */}
    </aside>

    <section className="flex-1 flex flex-col">
      {openTabs.length > 0 ? (
        <>
          <TableTabs
            tabs={openTabs}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onCloseTab={(tab) =>
              setOpenTabs((prev) => prev.filter((t) => t !== tab))
            }
            onClearAll={() => setOpenTabs([])}
          />
          {activeTab && (
            <TableContent
              dbname={activeTab.dbname}
              tableName={activeTab.tableName}
            />
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a table to view data and schema
        </div>
      )}
    </section>
  </div>
);
```

## 5) Implementation Notes

### Styling Consistency

Use existing patterns from `TableList.tsx`:

- Text colors: `text-gray-700`, `text-gray-500`, `text-blue-600`
- Borders: `border-gray-200`
- Spacing: `px-4 py-2` for buttons/padding
- Font sizes: `text-xs`, `text-sm`, `text-lg`

### Data Table Styling

Fixed header with overflow:

```tsx
<div className="overflow-auto flex-1">
  <table className="w-full">
    <thead className="sticky top-0 bg-white shadow-sm">
      {/* Header row */}
    </thead>
    <tbody>{/* Data rows */}</tbody>
  </table>
</div>
```

Column headers show field + type:

```tsx
<th className="px-4 py-2 text-left bg-gray-50 border-b">
  <div>
    <div className="font-medium">{columnName}</div>
    <div className="text-xs text-gray-500">{columnType}</div>
  </div>
</th>
```

### SQL Escaping

When constructing the SELECT query, use the `escapeIdentifier` helper from `databaseService.ts`:

```typescript
// Import the helper (may need to export it)
const escapedTableName = escapeIdentifier(tableName);
const sql = `SELECT * FROM ${escapedTableName}`;
```

### Empty States

Handle various empty states gracefully:

- No tables selected: "Select a table to view data and schema"
- Table has no columns: (error state, shouldn't happen)
- Table has no rows: "No data in this table"
- Query error: Show error message with retry button

## 6) Definition of Done

### Components Created

- [ ] `TableContent.tsx` - Main table data viewer with schema panel
- [ ] `PaginationBar.tsx` - Pagination controls with limit selector
- [ ] `TableSchema.tsx` - Schema display with DDL panel
- [ ] `TableTabs.tsx` - Multi-table tab bar with close buttons

### Integration

- [ ] `DatabaseView.tsx` updated to use new components
- [ ] Multi-table tabs work correctly
- [ ] Tabs clear when database changes
- [ ] Table selection opens new tab

### Functionality

- [ ] Table data loads and displays correctly
- [ ] Schema panel shows columns and DDL
- [ ] Pagination controls work (prev/next/limit/refresh)
- [ ] Loading states display properly
- [ ] Error states show retry button

### Code Quality

- [ ] TypeScript compiles without errors
- [ ] Tailwind CSS classes used consistently
- [ ] Components follow existing patterns
- [ ] JSDoc comments on exported components

## 7) Testing Notes

### Manual Testing Checklist

1. **Table Selection:**
   - Click a table in TableList
   - Verify tab opens with table name
   - Verify data loads and displays

2. **Pagination:**
   - Click Next/Previous buttons
   - Change limit dropdown
   - Verify page indicator updates
   - Click Refresh button

3. **Multi-Table Tabs:**
   - Open multiple tables
   - Switch between tabs
   - Close individual tabs
   - Click "Clear All" button

4. **Database Change:**
   - Switch to a different database
   - Verify all tabs are cleared
   - Verify no stale data

5. **Error Handling:**
   - Test with invalid table name (should show error)
   - Test with very large table (pagination should work)
   - Test with table containing special characters in name

### Edge Cases

- Table with no rows (empty data)
- Table with many columns (horizontal scroll)
- Table with very long column names
- Table names with SQL special characters (quotes, spaces)
- Rapid clicking of pagination controls

## 8) References

- Service Layer API: `agent-docs/05-design/01-contracts/01-api.md`
- Module LLD (DevTools Panel): `agent-docs/05-design/03-modules/devtools-panel.md`
- Functional Requirements: `agent-docs/01-discovery/02-requirements.md`
