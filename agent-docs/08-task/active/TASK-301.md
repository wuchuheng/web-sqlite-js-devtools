# TASK-301: Opened Table Tabs Management Feature (F-005)

## 0) Meta

- **Task ID**: TASK-301
- **Feature**: F-005: Opened Table Tabs Management
- **Status**: In Progress ([-] locked)
- **Priority**: P1 (High)
- **Estimated**: 10 hours (3-4 days)
- **Started**: 2026-01-14
- **Dependencies**: F-002, F-003

## 1) Objective

Replace "all tables" tab bar with state-managed opened tabs, enabling users to control which tables are visible in the header. Add close button (`IoMdClose` icon) visible on hover, auto-open first table on database selection, and auto-switch to next tab after close.

## 2) Current State Analysis

**File: `src/devtools/components/TablesTab/TableDetail.tsx`** (lines 178-200)

Currently:

- Header bar shows **ALL tables** from `tables` array
- Uses `TableTabButton` component for each table
- No close buttons
- No state management for opened tabs
- `handleTableClick` navigates to table but doesn't manage tabs

**File: `src/devtools/components/TablesTab/TablesTab.tsx`** (lines 113-128)

Currently:

- Sidebar table list uses `NavLink` for navigation
- No integration with opened tabs state

## 3) Implementation Plan

### Phase 1: Create OpenedTableTabs Component (4 hours)

**New File**: `src/devtools/components/TablesTab/OpenedTableTabs.tsx`

**1.1 Export TableTab Type** (5 min)

```tsx
export interface TableTab {
  dbname: string;
  tableName: string;
}
```

**1.2 Create TabButton Sub-Component** (1 hour)

- Use `React.memo` for performance (NFR-TAB-001)
- Props: `tab`, `isActive`, `onSelect`, `onClose`
- Styling: FR-TAB-006 (active blue-600, inactive gray-100)
- Close button: FR-TAB-004 (IoMdClose, opacity-0, group-hover:opacity-100)
- Click stops propagation on close button

**1.3 Create OpenedTableTabs Component** (2 hours)

- Props: `dbname`, `tabs`, `activeTab`, `onOpenTable`, `onSelectTab`, `onCloseTab`
- Empty state: FR-TAB-007 (centered message)
- Render `TabButton` for each tab
- Use `tab.dbname` + `tab.tableName` as key

**1.4 Export and TSDoc** (55 min)

- Export component with TSDoc comments
- Export `TableTab` type for use in other components

### Phase 2: State Management in TableDetail (3 hours)

**File**: `src/devtools/components/TablesTab/TableDetail.tsx`

**2.1 Import OpenedTableTabs** (5 min)

```tsx
import { OpenedTableTabs, type TableTab } from "./OpenedTableTabs";
import { IoMdClose } from "react-icons/io"; // For reference, used in component
```

**2.2 Add State** (15 min)

```tsx
// Opened tabs state (F-005)
const [openedTabs, setOpenedTabs] = useState<TableTab[]>([]);
const [activeTab, setActiveTab] = useState<TableTab | null>(null);
```

**2.3 Auto-Open First Table** (1 hour)

- Add `useEffect` for FR-TAB-001
- Trigger when `tables.length > 0 && openedTabs.length === 0`
- Create firstTab from `tables[0]`
- Set `openedTabs` and `activeTab`
- Navigate to first table

**2.4 Handle Open Table** (1 hour)

- Add `handleOpenTable(tableName)` callback
- Check if table already in openedTabs (FR-TAB-002)
- If not, append to openedTabs
- Set as activeTab
- Navigate to table

**2.5 Handle Close Tab** (45 min)

- Add `handleCloseTab(tab)` callback
- Filter closed tab from openedTabs
- If other tabs exist: select next tab, navigate
- If no tabs: set activeTab null, navigate to parent

### Phase 3: Integration with TablesTab (2 hours)

**File**: `src/devtools/components/TablesTab/TablesTab.tsx`

**3.1 Lift State to TablesTab** (1 hour)

- Move `openedTabs` and `activeTab` state from TableDetail to TablesTab
- Create `handleOpenTable` in TablesTab
- Pass state and handlers via Outlet context

**3.2 Update TableDetail Props** (30 min)

- Accept `openedTabs`, `activeTab`, `onOpenTable`, `onSelectTab`, `onCloseTab` as props
- Remove local state (now owned by TablesTab)
- Use props in OpenedTableTabs component

**3.3 Wire Up Handlers** (30 min)

- Update `NavLink` onClick in sidebar to call `handleOpenTable`
- Ensure table list passes correct callbacks

### Phase 4: Replace Table Tab Bar (1 hour)

**File**: `src/devtools/components/TablesTab/TableDetail.tsx`

**4.1 Remove Old Table Tab Bar** (15 min)

- Delete `TableTabButton` component (lines 13-40)
- Remove `tables.map()` loop in header (lines 191-198)

**4.2 Render OpenedTableTabs** (30 min)

- Import and render `OpenedTableTabs` component
- Pass props: `dbname`, `openedTabs`, `activeTab`, handlers
- Replace existing tab container

**4.3 Remove Unused Code** (15 min)

- Remove `handleTableClick` (no longer needed)
- Remove `tables` loading state from header (moved to sidebar)

### Phase 5: Testing (1 hour)

**5.1 Manual Testing** (30 min)

- Auto-open first table on database selection
- Clicking sidebar table adds to opened tabs
- No duplicate tabs created
- Close button visible on hover, hidden by default
- Closing active tab switches to next tab
- Closing inactive tab keeps current active
- Closing last tab shows empty state
- Navigation updates correctly

**5.2 Build Verification** (30 min)

- Run `npm run build`
- Fix any TypeScript errors
- Fix any build errors

## 4) Code Quality Rules

**Functional-First**:

- Use functional components with hooks (NFR-TAB-003)
- Use `React.memo` for `TabButton` to prevent re-renders
- Use `useCallback` for all event handlers

**Three-Phase Comments**:

- Functions > 5 lines must have numbered three-phase comments
- Example:
  ```tsx
  // 1. Filter closed tab from openedTabs
  // 2. Auto-switch to next available tab
  // 3. Navigate to new table or parent
  const handleCloseTab = useCallback(
    (tabToClose: TableTab) => {
      setOpenedTabs((prev) => {
        const filtered = prev.filter(/* ... */);
        // ... rest of logic
      });
    },
    [rawDbname, navigate],
  );
  ```

**TSDoc for Exported Functions**:

```tsx
/**
 * Handle opening a table and adding it to opened tabs
 *
 * @param tableName - The name of the table to open
 * @remarks
 * - Checks if table already opened (no duplicates)
 * - Appends to openedTabs if new
 * - Sets as activeTab and navigates
 */
```

## 5) Functional Requirements Coverage

| FR             | Description           | Implementation                                                          |
| -------------- | --------------------- | ----------------------------------------------------------------------- |
| **FR-TAB-001** | Auto-open first table | `useEffect` with `tables.length > 0 && openedTabs.length === 0`         |
| **FR-TAB-002** | Opened tabs only      | `openedTabs` state, render only these in header                         |
| **FR-TAB-003** | Click to open table   | `handleOpenTable` in TablesTab, append if not exists                    |
| **FR-TAB-004** | Close button          | `IoMdClose` icon, `opacity-0 group-hover:opacity-100`                   |
| **FR-TAB-005** | Close tab behavior    | `handleCloseTab` with auto-switch logic                                 |
| **FR-TAB-006** | Tab styling           | Active: `bg-blue-600 text-white`, Inactive: `bg-gray-100 text-gray-700` |
| **FR-TAB-007** | Empty state           | "No tables open..." message when `tabs.length === 0`                    |
| **FR-TAB-008** | Icon import           | `import { IoMdClose } from "react-icons/io"`                            |

## 6) Files Changed

### New Files

- `src/devtools/components/TablesTab/OpenedTableTabs.tsx` (NEW)

### Modified Files

- `src/devtools/components/TablesTab/TableDetail.tsx` (MODIFY)
- `src/devtools/components/TablesTab/TablesTab.tsx` (MODIFY)

### Files Deleted (N/A)

- None

## 7) Build Verification

**After implementation, run:**

```bash
npm run build
```

**Expected:** No errors, successful build

## 8) Acceptance Criteria

From task catalog DoD:

- [ ] **Component: OpenedTableTabs.tsx** (4 hours)
  - [ ] Create `OpenedTableTabs.tsx` component file
  - [ ] Implement `TabButton` sub-component (memoized with React.memo)
    - Table name with truncate (max-w-150px)
    - Close button with `IoMdClose` icon (react-icons/io)
    - Close button hidden by default (opacity-0), visible on group-hover (opacity-100)
    - Click stops propagation on close button
  - [ ] Implement empty state: "No tables open. Select a table from the sidebar."
  - [ ] Props interface: `dbname`, `tabs`, `activeTab`, `onOpenTable`, `onSelectTab`, `onCloseTab`
  - [ ] Active tab styling: bg-blue-600 text-white
  - [ ] Inactive tab styling: bg-gray-100 text-gray-700 hover:bg-gray-200
  - [ ] Close button hover: bg-blue-700 (active), bg-gray-300 (inactive)
  - [ ] Export component and types

- [ ] **State Management in TableDetail** (3 hours)
  - [ ] Add state: `openedTabs: TableTab[]` (default: [])
  - [ ] Add state: `activeTab: TableTab | null` (default: null)
  - [ ] Add `useEffect` for auto-opening first table
  - [ ] Add `handleOpenTable(tableName)` handler
  - [ ] Add `handleCloseTab(tab)` handler
  - [ ] Add `isSameTab(a, b)` utility function

- [ ] **Integration with TablesTab** (2 hours)
  - [ ] Update TablesTab to pass handlers to OpenedTableTabs
  - [ ] Update TableList onClick to call handleOpenTable
  - [ ] Wire up state and handlers between TablesTab and TableDetail

- [ ] **Testing** (1 hour)
  - [ ] Auto-open first table works on database selection
  - [ ] Clicking sidebar table adds to opened tabs
  - [ ] No duplicate tabs created
  - [ ] Close button visible on hover, hidden by default
  - [ ] Closing active tab switches to next tab
  - [ ] Closing inactive tab keeps current active
  - [ ] Closing last tab shows empty state
  - [ ] Navigation updates correctly on all actions

- [ ] Build passed with no errors

## 9) Exceptions

**No class-based components** - All functional components with hooks (NFR-TAB-003)

**No global state** - State owned by TablesTab component, passed via props

## 10) Notes

- **State owner**: TablesTab (not TableDetail) for proper lifecycle management
- **Key format**: `${tab.dbname}.${tab.tableName}` for unique tab identification
- **Navigation**: Use `rawDbname` (URL-encoded) in navigate calls
- **Empty state**: Navigate to `/openedDB/:dbname/tables` (parent route) when no tabs
