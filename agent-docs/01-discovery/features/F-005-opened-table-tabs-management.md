<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/features/feature.md

OUTPUT MAP (write to)
agent-docs/01-discovery/features/F-005-opened-table-tabs-management.md

NOTES
- Feature F-005: Opened Table Tabs Management
- Adds state-managed opened tabs with close button functionality
- Improves UX by showing only opened tables, not all tables
-->

# Feature F-005: Opened Table Tabs Management

## 0) Meta

- **Feature ID**: F-005
- **Title**: Opened Table Tabs Management with Close Button
- **Status**: ✅ Completed
- **Priority**: P1 (High) - UX improvement for table navigation
- **Created**: 2026-01-14
- **Completed**: 2026-01-14
- **Requester**: User feedback on tab bar usability
- **Dependencies**: F-002 (Database Tab Navigation), F-003 (Schema Panel Enhancement)

## 1) Problem Statement

### Current Issue

The current table tab header in TableDetail view has several UX limitations:

1. **Shows ALL tables**: Header bar displays every table from the database (lines 191-198 in TableDetail.tsx)
2. **No opened tabs state**: Cannot distinguish between "opened" and "available" tables
3. **No close button**: Tabs cannot be closed, only switched between
4. **No auto-open**: First table is not automatically opened when database is selected
5. **Table list redundancy**: Left sidebar already shows all tables, header tabs duplicating this

### User Requirements

When viewing table data in the TableDetail view (`/openedDB/:dbname/tables/:tableName`), the user wants:

1. **Opened tabs only**: Header bar should show only opened tables (state-managed)
2. **Auto-open first table**: When database is selected, first table auto-opens as active tab
3. **Click to open**: Clicking table from sidebar adds it to opened tabs (no duplicates)
4. **Close button**: Each tab has close button (`IoMdClose` from `react-icons/io`)
   - Hidden by default
   - Visible on hover/focus
   - Closes tab on click
5. **Auto-switch after close**: After closing a tab, switch to next available tab (if any exists)
6. **Empty state**: Show appropriate message when no tabs are open

## 2) Proposed Solution

### Architecture Changes

**Current TableDetail Header Bar:**

```
┌─────────────────────────────────────────────────────────┐
│ [posts] [users] [orders] [products] [categories] ...  │ <- ALL tables
└─────────────────────────────────────────────────────────┘
```

**Target TableDetail Header Bar:**

```
┌─────────────────────────────────────────────────────────┐
│ [users] [orders] [categories]              [🔄 Toggle]  │ <- Opened tables only
│        ↑                              ↑                 │
│   Active tab                      Close buttons (on hover)
│   (blue bg)                       IoMdClose icon
└─────────────────────────────────────────────────────────┘
```

**After Closing "users" tab:**

```
┌─────────────────────────────────────────────────────────┐
│ [orders] [categories]                    [🔄 Toggle]  │ <- Auto-switch to orders
└─────────────────────────────────────────────────────────┘
```

**State Management Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│  TableDetail Component (State Owner)                        │
│  ├── openedTabs: TableTab[] (default: [firstTable])        │
│  ├── activeTab: TableTab (default: firstTable)             │
│  └── Handler Functions:                                     │
│      ├── handleOpenTable(tableName) - Add to opened tabs   │
│      ├── handleCloseTab(tab) - Remove and auto-switch      │
│      ├── handleSelectTab(tab) - Set as active              │
│      └── handleAutoOpenFirstTable() - On mount/db change   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  OpenedTableTabs Component (Controlled Props)               │
│  ├── tabs: TableTab[] (from parent)                        │
│  ├── activeTab: TableTab (from parent)                     │
│  ├── onSelectTab(tab): () => void                          │
│  └── onCloseTab(tab): () => void                           │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

**Modified Components:**

```
TableDetail (MODIFIED)
├── State Management (NEW)
│   ├── openedTabs: TableTab[]
│   ├── activeTab: TableTab
│   └── useEffect for auto-open first table
├── OpenedTableTabs (NEW COMPONENT)
│   ├── Tab button (with close icon)
│   │   ├── Table name
│   │   ├── Close button (IoMdClose)
│   │   │   ├── Hidden by default
│   │   │   ├── Visible on group-hover
│   │   │   └── Click stops propagation
│   └── Empty state message (if no tabs)
└── Table list sidebar (unchanged)
    └── Click now calls handleOpenTable()
```

**New OpenedTableTabs Component:**

```tsx
interface TableTab {
  dbname: string;
  tableName: string;
}

interface OpenedTableTabsProps {
  dbname: string;
  tabs: TableTab[];
  activeTab: TableTab | null;
  onOpenTable: (tableName: string) => void;
  onSelectTab: (tab: TableTab) => void;
  onCloseTab: (tab: TableTab) => void;
}
```

### State Management

```tsx
// In TableDetail component
const [openedTabs, setOpenedTabs] = useState<TableTab[]>([]);
const [activeTab, setActiveTab] = useState<TableTab | null>(null);

// Auto-open first table on mount or database change
useEffect(() => {
  if (tables.length > 0 && openedTabs.length === 0) {
    const firstTab = { dbname, tableName: tables[0] };
    setOpenedTabs([firstTab]);
    setActiveTab(firstTab);
    // Navigate to first table
    navigate(`/openedDB/${rawDbname}/tables/${tables[0]}`);
  }
}, [tables, dbname, openedTabs.length]);

// Open table (add to tabs, no duplicates)
const handleOpenTable = useCallback(
  (tableName: string) => {
    const newTab = { dbname, tableName };
    const exists = openedTabs.some(
      (t) => t.dbname === dbname && t.tableName === tableName,
    );

    if (!exists) {
      setOpenedTabs((prev) => [...prev, newTab]);
    }
    setActiveTab(newTab);
    navigate(`/openedDB/${rawDbname}/tables/${tableName}`);
  },
  [dbname, openedTabs, rawDbname, navigate],
);

// Close tab and auto-switch
const handleCloseTab = useCallback(
  (tabToClose: TableTab) => {
    setOpenedTabs((prev) => {
      const filtered = prev.filter(
        (t) =>
          !(
            t.dbname === tabToClose.dbname
            && t.tableName === tabToClose.tableName
          ),
      );

      // Auto-switch to next available tab
      if (filtered.length > 0) {
        // Try to select the tab after the closed one
        const closedIndex = prev.findIndex(
          (t) =>
            t.dbname === tabToClose.dbname
            && t.tableName === tabToClose.tableName,
        );
        const nextTab = filtered[closedIndex] || filtered[filtered.length - 1];
        setActiveTab(nextTab);
        navigate(`/openedDB/${rawDbname}/tables/${nextTab.tableName}`);
      } else {
        setActiveTab(null);
        // Navigate to parent route
        navigate(`/openedDB/${rawDbname}/tables`);
      }

      return filtered;
    });
  },
  [rawDbname, navigate],
);
```

## 3) Functional Requirements

### FR-TAB-001: Auto-Open First Table

- When database is selected, first table auto-opens as active tab
- Auto-open happens on component mount
- Auto-open happens when switching databases
- First table is determined by `tables[0]` from `getTableList()`
- Navigation redirects to `/openedDB/:dbname/tables/:tableName`

### FR-TAB-002: Opened Tabs Only

- Header bar displays only opened tables (state-managed)
- `openedTabs` state tracks which tables are opened
- Default: Empty array, then auto-populated with first table
- No duplicate tabs for the same table
- Table list sidebar remains unchanged (shows all tables)

### FR-TAB-003: Click to Open Table

- Clicking table from sidebar adds it to opened tabs
- If table already opened, just switch to it (no duplicate)
- New tables appended to end of tabs array
- Active tab updates to clicked table
- Navigation updates to reflect new table

### FR-TAB-004: Close Button

- Each tab has close button with `IoMdClose` icon from `react-icons/io`
- Close button is **hidden by default** (opacity-0)
- Close button **visible on group-hover** (group-hover:opacity-100)
- Close button size: ~14px (text-xs)
- Close button styling:
  - Rounded full background
  - Padding: p-0.5
  - Transition: opacity
  - Color: inherits from tab (white on active, gray on inactive)
  - Hover background: blue-700 (active) or gray-300 (inactive)

### FR-TAB-005: Close Tab Behavior

- Clicking close button removes tab from `openedTabs`
- Click event stops propagation (doesn't trigger tab selection)
- After closing, if other tabs exist:
  - Switch to next tab (same index or last tab)
  - Update navigation to new table
- After closing, if no tabs exist:
  - Set `activeTab` to null
  - Navigate to `/openedDB/:dbname/tables` (parent route)

### FR-TAB-006: Tab Styling

**Active Tab:**

```css
bg-blue-600 text-white
```

**Inactive Tab:**

```css
bg-gray-100 text-gray-700 hover:bg-gray-200
```

**Tab Container:**

```css
group flex items-center gap-2 px-4 py-2 text-sm border-r border-gray-200
```

**Close Button:**

```css
rounded-full p-0.5 transition-opacity opacity-0 group-hover:opacity-100
```

### FR-TAB-007: Empty State

- When `openedTabs.length === 0`, show empty state message
- Message: "No tables open. Select a table from the sidebar."
- Message centered in header area
- Message styling: `text-gray-500 text-sm`

### FR-TAB-008: Icon Import

- Import close icon from `react-icons/io`:
  ```tsx
  import { IoMdClose } from "react-icons/io";
  ```

## 4) Non-Functional Requirements

### NFR-TAB-001: Performance

- Tab switching should be instant (no loading delay)
- State updates should not cause unnecessary re-renders
- Use `useCallback` for event handlers
- Use `React.memo` for tab button component

### NFR-TAB-002: Backward Compatibility

- Preserve all existing table data display functionality
- Keep same data fetching via `getTableList()` and `queryTableData()`
- Maintain loading and error states
- URL routing remains unchanged

### NFR-TAB-003: Code Quality

- Use functional components with hooks
- TypeScript strict mode compliance
- Follow existing Tailwind CSS conventions
- Match blue theme from existing tabs

### NFR-TAB-004: Accessibility

- Close button should have `aria-label` attribute
- Tabs should be keyboard navigable
- Focus management when closing tabs
- Proper ARIA roles for tab interface

## 5) Out of Scope

- Persisting opened tabs across page navigation
- Dragging tabs to reorder
- Tab pinning/locking
- Maximum tab limit
- Tab grouping by database
- Middle-click to close

## 6) Dependencies

### Blocks

- F-006: Resizable Vertical Dividers (should be implemented after F-005)

### Depends On

- F-002: Database Tab Navigation (complete) - TableDetail component exists
- TASK-05.1: Service Layer Table Schema Functions (complete)
- F-003: Schema Panel Enhancement (complete) - Schema panel toggle exists

### Related Features

- F-004: DDL Syntax Highlight & Copy Button (complete) - Uses same tab area

## 7) Success Criteria

### Acceptance Criteria

1. **Auto-Open First Table**
   - [ ] First table auto-opens on database selection
   - [ ] Navigation redirects to first table
   - [ ] `openedTabs` contains first table
   - [ ] `activeTab` set to first table

2. **Opened Tabs Only**
   - [ ] Header bar shows only opened tables
   - [ ] No duplicate tabs for same table
   - [ ] Empty state shown when no tabs open

3. **Click to Open**
   - [ ] Clicking sidebar table adds to opened tabs
   - [ ] Existing table just switches to active
   - [ ] Navigation updates correctly

4. **Close Button**
   - [ ] Close button hidden by default
   - [ ] Close button visible on hover
   - [ ] Close button uses `IoMdClose` icon
   - [ ] Click stops propagation

5. **Close Tab Behavior**
   - [ ] Clicking close removes tab
   - [ ] Auto-switch to next tab if available
   - [ ] Navigate to parent if no tabs left
   - [ ] Active tab updates correctly

6. **Styling**
   - [ ] Active tab shows blue background
   - [ ] Inactive tab shows gray background
   - [ ] Close button hover effects work
   - [ ] Group hover triggers close button visibility

7. **State Management**
   - [ ] `openedTabs` state tracked correctly
   - [ ] `activeTab` state tracked correctly
   - [ ] No unnecessary re-renders

8. **Edge Cases**
   - [ ] Closing last tab works
   - [ ] Closing active tab switches correctly
   - [ ] Closing inactive tab doesn't change active
   - [ ] Switching databases resets tabs

## 8) Open Questions

1. **State persistence**: Should opened tabs persist when switching between databases?
   - **Decision**: Reset opened tabs when switching databases (fresh start per database)

2. **Tab order**: Should new tabs be added to end or after current tab?
   - **Decision**: Add to end of tabs array (append)

3. **Auto-switch preference**: After closing tab, switch to next or previous tab?
   - **Decision**: Switch to next tab (same index), or last tab if closing last

## 9) Implementation Notes

### Component File Structure

```
src/devtools/components/
├── TablesTab/
│   ├── TableDetail.tsx          # MODIFY: Add opened tabs state
│   ├── OpenedTableTabs.tsx      # NEW: Tab bar component
│   └── TablesTab.tsx            # MODIFY: Update onClick handler
```

### New Component: OpenedTableTabs.tsx

```tsx
import { memo } from "react";
import { IoMdClose } from "react-icons/io";

export interface TableTab {
  dbname: string;
  tableName: string;
}

interface OpenedTableTabsProps {
  dbname: string;
  tabs: TableTab[];
  activeTab: TableTab | null;
  onOpenTable: (tableName: string) => void;
  onSelectTab: (tab: TableTab) => void;
  onCloseTab: (tab: TableTab) => void;
}

const TabButton = memo(
  ({
    tab,
    isActive,
    onSelect,
    onClose,
  }: {
    tab: TableTab;
    isActive: boolean;
    onSelect: () => void;
    onClose: () => void;
  }) => {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`
          group flex items-center gap-2 px-4 py-2 text-sm border-r border-gray-200
          ${
            isActive
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
        `}
      >
        <span className="truncate max-w-[150px]" title={tab.tableName}>
          {tab.tableName}
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={`
            rounded-full p-0.5 transition-opacity
            ${isActive ? "hover:bg-blue-700" : "hover:bg-gray-300"}
            opacity-0 group-hover:opacity-100
          `}
          title="Close tab"
        >
          <IoMdClose size={14} />
        </span>
      </button>
    );
  },
);

TabButton.displayName = "TabButton";

export const OpenedTableTabs = ({
  dbname,
  tabs,
  activeTab,
  onOpenTable,
  onSelectTab,
  onCloseTab,
}: OpenedTableTabsProps) => {
  if (tabs.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 px-4 py-2 text-sm text-gray-500">
        No tables open. Select a table from the sidebar.
      </div>
    );
  }

  return (
    <div className="flex items-center flex-1 overflow-x-auto">
      {tabs.map((tab) => (
        <TabButton
          key={`${tab.dbname}.${tab.tableName}`}
          tab={tab}
          isActive={
            activeTab !== null
            && tab.dbname === activeTab.dbname
            && tab.tableName === activeTab.tableName
          }
          onSelect={() => onSelectTab(tab)}
          onClose={() => onCloseTab(tab)}
        />
      ))}
    </div>
  );
};
```

### Modified TableDetail.tsx

Key changes:

1. Add `openedTabs` and `activeTab` state
2. Add `useEffect` for auto-open first table
3. Add `handleOpenTable` and `handleCloseTab` handlers
4. Replace `tables.map()` with `<OpenedTableTabs />` component
5. Update sidebar `onClick` to call `handleOpenTable()`

### Service Layer Integration

No changes required - uses existing `getTableList()` and `queryTableData()` from databaseService.

### CSS Classes Reference

```tsx
// Active tab
"group flex items-center gap-2 px-4 py-2 text-sm border-r border-gray-200 bg-blue-600 text-white";

// Inactive tab
"group flex items-center gap-2 px-4 py-2 text-sm border-r border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200";

// Close button (hidden)
"rounded-full p-0.5 transition-opacity opacity-0 group-hover:opacity-100";

// Close button (active tab hover)
"hover:bg-blue-700";

// Close button (inactive tab hover)
"hover:bg-gray-300";

// Empty state
"flex items-center justify-center flex-1 px-4 py-2 text-sm text-gray-500";
```

### Testing Checklist

- [ ] First table auto-opens on mount
- [ ] Clicking sidebar table adds to tabs
- [ ] No duplicate tabs created
- [ ] Close button hidden by default
- [ ] Close button visible on hover
- [ ] Closing tab removes it from state
- [ ] Auto-switch to next tab works
- [ ] Empty state shows when no tabs
- [ ] Navigation updates correctly
- [ ] No console errors
- [ ] Works across different databases

---

**Feature Status**: Ready for Stage 3 (Architecture) review
**Next Steps**: Proceed to S3 (systemArchitect) for HLD updates
