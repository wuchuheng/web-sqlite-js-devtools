<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/features/feature.md

OUTPUT MAP (write to)
agent-docs/01-discovery/features/F-008-opened-database-list-route.md

NOTES
- Feature F-008: Opened Database List Route
- Adds /openedDB route to display list of opened databases
- Addresses user request to show databases in main content area
-->

# Feature F-008: Opened Database List Route

## 0) Meta

- **Feature ID**: F-008
- **Title**: Opened Database List Route
- **Status**: Completed
- **Priority**: P1 (High) - Navigation enhancement
- **Created**: 2026-01-14
- **Completed**: 2026-01-14
- **Requester**: User request via `/s1-iterationLead`

## 1) Problem Statement

### Current Issue

The current implementation has a gap in the navigation structure:

1. **No generic `/openedDB` route**: The route structure requires a specific database parameter (`/openedDB/:dbname`)
2. **Sidebar "Opened DB" links to root**: Clicking "Opened DB" in sidebar navigates to `/` instead of a database list view
3. **No centralized database list view**: Users cannot see all opened databases in the main content area
4. **Inconsistent empty state**: When no databases are opened, the empty state doesn't clearly explain this specific condition

### User Request

From the screenshot and user request:

- Display currently opened databases in a list when the router is `/openedDB`
- When there are no opened databases, show an empty component that explains there are no opened DBs
- Add a manual refresh button using `IoMdRefresh` icon from `react-icons/io`
- Allow users to manually refresh the database list

## 2) Proposed Solution

### Architecture Changes

**Current Route Structure:**

```
/ → EmptyState (welcome screen)
/openedDB/:dbname → DatabaseTabs (specific database)
```

**Target Route Structure:**

```
/ → EmptyState (welcome screen)
/openedDB → OpenedDBList (NEW - list of all opened databases)
/openedDB/:dbname → DatabaseTabs (specific database)
```

### Component Structure

```
OpenedDBList (NEW COMPONENT)
├── Header
│   ├── Title: "Opened Databases"
│   └── Refresh Button (IoMdRefresh icon)
├── Database List
│   └── Database cards/rows (clickable, navigate to /openedDB/:dbname/tables)
└── Empty State (when no databases)
    ├── Icon: SiSqlite
    ├── Title: "No Opened Databases"
    ├── Message: "Could not detect any opened databases."
    ├── Instructions: "Open a page that uses web-sqlite-js to see databases here."
    └── Refresh Button
```

### Key Requirements

1. **New Route**: Add `/openedDB` route in `DevTools.tsx`
2. **Sidebar Update**: Change "Opened DB" link from `/` to `/openedDB`
3. **Database List Component**: Create `OpenedDBList` component
4. **Service Integration**: Use existing `getDatabases()` function from service layer
5. **Empty State**: Custom empty state with refresh button
6. **Navigation**: Clicking database → `/openedDB/:dbname/tables`

## 3) Functional Requirements

### FR-DBLIST-001: Generic OpenedDB Route

- When user navigates to `/openedDB`, display the `OpenedDBList` component
- Route should be accessible via direct URL entry
- Route should be accessible via sidebar "Opened DB" link

### FR-DBLIST-002: Database List Display

- Fetch databases using `databaseService.getDatabases()`
- Display each database as a clickable card/row
- Show database name as primary label
- Show database metadata (if available): table count, row count, file size
- Clicking a database navigates to `/openedDB/:dbname/tables`

### FR-DBLIST-003: Empty State with No Databases

- When `getDatabases()` returns empty array, show empty state
- Display SiSqlite icon (consistent with root EmptyState)
- Title: "No Opened Databases"
- Message: "Could not detect any opened databases."
- Instructions: "Open a page that uses web-sqlite-js to see databases here."
- Include refresh button with `IoMdRefresh` icon

### FR-DBLIST-004: Manual Refresh

- Add refresh button in component header (right-aligned)
- Use `IoMdRefresh` icon from `react-icons/io`
- Clicking refresh button re-fetches database list
- Show loading state during refresh
- Handle errors gracefully with retry option

### FR-DBLIST-005: Sidebar Navigation Update

- Change "Opened DB" `SidebarLink` from `to="/"` to `to="/openedDB"`
- Active state should highlight when on `/openedDB` or `/openedDB/:dbname/*`
- Collapse behavior should remain consistent

### FR-DBLIST-006: Loading States

- Show loading skeleton while fetching databases
- Show inline loading indicator when refreshing
- Preserve existing database list during refresh (optimistic UI)

### FR-DBLIST-007: Error Handling

- Show error message if `getDatabases()` fails
- Display error with retry button
- Use ServiceResponse error format from service layer

### FR-DBLIST-008: Database Card Design

- Card layout with:
  - Database icon (FaDatabase or similar)
  - Database name (primary text, bold)
  - Table count (secondary text, gray)
  - Clickable entire card (navigate to tables tab)
- Hover effect: background color change, subtle shadow
- Active state: highlight if currently viewing this database

## 4) Non-Functional Requirements

### NFR-DBLIST-001: Performance

- Database list should load within 500ms
- Refresh should be instant (optimistic UI)
- No blocking operations during rendering

### NFR-DBLIST-002: Code Organization

- Follow existing component patterns
- Use `useInspectedWindowRequest` hook for data fetching
- Maintain TypeScript strict mode compliance
- Follow Tailwind CSS styling conventions (use theme tokens from F-007)

### NFR-DBLIST-003: Accessibility

- Database cards should be keyboard navigable
- Refresh button should have proper ARIA label
- Semantic HTML structure
- Focus management after refresh

### NFR-DBLIST-004: Visual Consistency

- Use theme color tokens from F-007 (primary-600, secondary-500, etc.)
- Match EmptyState styling with root EmptyState
- Consistent icon sizing and spacing
- Responsive layout (works in DevTools panel)

## 5) Out of Scope

- Modifying web-sqlite-js library behavior
- Creating/deleting databases from this view
- Editing database metadata
- Database-level operations (backup, export, etc.)
- Changing sidebar structure beyond "Opened DB" link update

## 6) Dependencies

### Blocks

- None (can proceed independently)

### Depends On

- F-001: Service Layer Expansion (complete) - provides `getDatabases()` function
- F-007: Uniform Theme Configuration (complete) - provides semantic color tokens

### Related Features

- F-002: Database Tab Navigation (complete) - provides `/openedDB/:dbname` routes
- F-005: Opened Table Tabs Management (complete) - tab management patterns

## 7) Success Criteria

### Acceptance Criteria

1. **Route Structure**
   - [x] `/openedDB` route exists and renders `OpenedDBList` component
   - [x] Direct navigation to `/openedDB` works
   - [x] Route is added to `DevTools.tsx` Routes configuration

2. **Sidebar Navigation**
   - [x] "Opened DB" link navigates to `/openedDB` instead of `/`
   - [x] Active state highlights correctly on `/openedDB` and child routes
   - [x] Clicking "Opened DB" shows database list in main content area

3. **Database List Display**
   - [x] Fetches databases using `databaseService.getDatabases()`
   - [x] Displays each database as a clickable card
   - [x] Shows database name
   - [x] Clicking card navigates to `/openedDB/:dbname/tables`

4. **Empty State**
   - [x] Shows when no databases are opened
   - [x] Displays SiSqlite icon
   - [x] Shows "No Opened Databases" title
   - [x] Shows helpful message about web-sqlite-js
   - [x] Includes refresh button with `IoMdRefresh` icon

5. **Refresh Functionality**
   - [x] Header refresh button re-fetches database list
   - [x] Empty state refresh button re-fetches database list
   - [x] Shows loading state during refresh
   - [x] Handles errors with retry option

6. **Edge Cases**
   - [x] Loading state shows on initial load
   - [x] Error state shows with retry button
   - [x] Empty database list shows custom empty state
   - [x] Single database shows correctly
   - [x] Multiple databases show as list

## 8) Open Questions

1. **Database card layout**: Should databases display as cards (grid) or list items (vertical stack)?
   - **Decision**: List items (vertical stack) - consistent with sidebar pattern, better for DevTools panel width

2. **Database metadata**: What metadata should be displayed for each database?
   - **Decision**: Database name (required), table count (if available), file size (if available via OPFS)

3. **Refresh behavior**: Should refresh be automatic or manual-only?
   - **Decision**: Manual-only via button (no auto-refresh to avoid unnecessary API calls)

## 9) Implementation Notes

### React Router Setup

```tsx
// In DevTools.tsx - Add BEFORE /openedDB/:dbname route
<Route path="/openedDB" element={<OpenedDBList />} />

// Existing route (keep after generic route)
<Route path="/openedDB/:dbname" element={<DatabaseTabs />}>
  {/* ... nested routes ... */}
</Route>
```

**Important**: Generic route (`/openedDB`) must come before parameterized route (`/openedDB/:dbname`) to avoid route conflicts.

### Component Structure

```tsx
// OpenedDBList.tsx
export const OpenedDBList = () => {
  const {
    data: databases,
    isLoading,
    error,
    reload,
  } = useInspectedWindowRequest(() => databaseService.getDatabases(), [], []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} retry={reload} />;
  }

  if (databases.length === 0) {
    return <EmptyDatabaseList refresh={reload} />;
  }

  return (
    <div>
      <Header refresh={reload} />
      <DatabaseList databases={databases} />
    </div>
  );
};
```

### Sidebar Update

```tsx
// In DatabaseList.tsx (Sidebar component)
// Change:
<SidebarLink to="/" label="Opened DB" ... />

// To:
<SidebarLink to="/openedDB" label="Opened DB" ... />
```

### Empty State Component

```tsx
// EmptyDatabaseList.tsx
import { SiSqlite } from "react-icons/si";
import { IoMdRefresh } from "react-icons/io";

interface EmptyDatabaseListProps {
  refresh: () => void;
}

export const EmptyDatabaseList = ({ refresh }: EmptyDatabaseListProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <SiSqlite className="text-primary-600 text-6xl mb-6" />
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">
        No Opened Databases
      </h1>
      <p className="text-gray-600 mb-4">
        Could not detect any opened databases.
      </p>
      <p className="text-gray-500 text-sm mb-6">
        Open a page that uses web-sqlite-js to see databases here.
      </p>
      <button
        onClick={refresh}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
      >
        <IoMdRefresh size={18} />
        Refresh
      </button>
    </div>
  );
};
```

### Service Layer Integration

Uses existing service layer function:

```typescript
// From databaseService.ts
getDatabases(): Promise<ServiceResponse<DatabaseSummary[]>>
```

No service layer changes required.

### Theme Tokens (from F-007)

Use semantic color tokens:

- `text-primary-600` - Primary actions, icons
- `text-secondary-500` - Secondary text
- `bg-primary-50` - Hover states
- `hover:bg-primary-600` - Button hover states
- `text-gray-700` - Headings
- `text-gray-600` - Body text
- `text-gray-500` - Muted text

### File Structure

```
src/devtools/components/
├── OpenedDBList/
│   ├── index.tsx
│   ├── OpenedDBList.tsx (main component)
│   ├── DatabaseCard.tsx (individual database card)
│   ├── EmptyDatabaseList.tsx (empty state component)
│   ├── LoadingSkeleton.tsx (loading state)
│   └── ErrorState.tsx (error state)
└── ...
```

### Database Card Design

```tsx
// DatabaseCard.tsx
import { FaDatabase } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface DatabaseCardProps {
  database: DatabaseSummary;
  isActive?: boolean;
}

export const DatabaseCard = ({ database, isActive }: DatabaseCardProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() =>
        navigate(`/openedDB/${encodeURIComponent(database.name)}/tables`)
      }
      className={`
        flex items-center gap-3 w-full px-4 py-3 rounded-lg border transition-all
        ${
          isActive
            ? "bg-primary-50 border-primary-600 shadow-sm"
            : "bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm"
        }
      `}
    >
      <FaDatabase
        className={isActive ? "text-primary-600" : "text-gray-600"}
        size={20}
      />
      <div className="flex-1 text-left">
        <div
          className={`font-medium ${isActive ? "text-primary-600" : "text-gray-700"}`}
        >
          {database.name}
        </div>
        {database.tableCount !== undefined && (
          <div className="text-xs text-secondary-500">
            {database.tableCount} tables
          </div>
        )}
      </div>
    </button>
  );
};
```

## 10) Testing Considerations

### Unit Tests

- `OpenedDBList` component renders correctly
- Loading state displays during fetch
- Empty state displays when no databases
- Error state displays with retry button
- Refresh button calls `reload` function

### Integration Tests

- Navigation to `/openedDB` renders component
- Clicking database card navigates to correct route
- Sidebar "Opened DB" link navigates to `/openedDB`
- Refresh button re-fetches database list

### Manual Testing Scenarios

1. **No databases opened**: Navigate to `/openedDB` → see empty state with refresh button
2. **Single database**: Navigate to `/openedDB` → see one database card
3. **Multiple databases**: Navigate to `/openedDB` → see list of database cards
4. **Click database**: Click card → navigate to `/openedDB/:dbname/tables`
5. **Refresh**: Click refresh button → list updates
6. **Sidebar link**: Click "Opened DB" in sidebar → navigate to `/openedDB`
7. **Error state**: Mock API error → see error state with retry button
