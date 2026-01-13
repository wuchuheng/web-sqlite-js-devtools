<!--
TASK-304: Opened Database List Route Feature (F-008)
Status: Draft
Created: 2026-01-14
-->

# TASK-304: Opened Database List Route Feature (F-008)

## Task Summary

Add a generic `/openedDB` route to display a centralized list of all opened databases with clickable cards that navigate to each database's tables tab.

**Feature**: [F-008: Opened Database List Route](../01-discovery/features/F-008-opened-database-list-route.md)

## Boundary

- **New Components**: `src/devtools/components/OpenedDBList/` (7 components)
- **Modified Files**:
  - `src/devtools/DevTools.tsx` - Add `/openedDB` route
  - `src/devtools/components/Sidebar/DatabaseList.tsx` - Update "Opened DB" link from `/` to `/openedDB`

## Dependencies

- F-002 (Database Tab Navigation) - Complete
- F-007 (Uniform Theme Configuration) - Complete
- F-001 (Service Layer Expansion) - Complete (provides `getDatabases()`)

## Implementation Plan

### Phase 1: Create OpenedDBList Components (6 hours)

#### 1.1 DatabaseCard.tsx (1 hour)

```tsx
/**
 * Clickable database card component
 *
 * @remarks
 * Displays database icon, name, and optional table count.
 * Navigates to /openedDB/:dbname/tables on click.
 * Uses FaDatabase icon from react-icons/fa.
 *
 * @param props.database - Database summary with name
 * @param props.isActive - Whether this database is currently being viewed
 *
 * @returns JSX.Element - Clickable database card button
 */

interface DatabaseCardProps {
  database: DatabaseSummary;
  isActive?: boolean;
}

export const DatabaseCard = ({ database, isActive }: DatabaseCardProps) => {
  const navigate = useNavigate();

  // 1. Encode database name for URL safety
  // 2. Navigate to tables tab for this database
  const handleClick = useCallback(() => {
    const encodedName = encodeURIComponent(database.name);
    navigate(`/openedDB/${encodedName}/tables`);
  }, [database.name, navigate]);

  return (
    <button
      onClick={handleClick}
      aria-label={`Open database ${database.name}`}
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
      </div>
    </button>
  );
};
```

**DoD**:

- [ ] File created at `src/devtools/components/OpenedDBList/DatabaseCard.tsx`
- [ ] Uses `FaDatabase` icon from `react-icons/fa`
- [ ] Displays database name (bold, colored based on active state)
- [ ] Navigates to `/openedDB/:dbname/tables` on click
- [ ] Uses `encodeURIComponent` for database name
- [ ] Active state styling: bg-primary-50, border-primary-600, text-primary-600
- [ ] Inactive state: bg-white, border-gray-200, hover effects
- [ ] ARIA label: "Open database {name}"
- [ ] Export component with TSDoc

#### 1.2 LoadingSkeleton.tsx (0.5 hours)

```tsx
/**
 * Loading skeleton component for database list
 *
 * @remarks
 * Displays 3 animated placeholder cards while data loads.
 * Matches DatabaseCard layout for smooth transition.
 *
 * @returns JSX.Element - Loading skeleton with animated cards
 */

export const LoadingSkeleton = () => {
  return (
    <div className="p-6 space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-200 animate-pulse"
        >
          <div className="w-5 h-5 rounded" />
          <div className="flex-1 h-4 rounded" />
        </div>
      ))}
    </div>
  );
};
```

**DoD**:

- [ ] File created at `src/devtools/components/OpenedDBList/LoadingSkeleton.tsx`
- [ ] Shows 3 skeleton cards
- [ ] Uses `animate-pulse` for animation
- [ ] Matches DatabaseCard layout (flex, gap, padding)
- [ ] Export component with TSDoc

#### 1.3 ErrorState.tsx (0.5 hours)

```tsx
/**
 * Error state component with retry button
 *
 * @remarks
 * Displays error message and retry button when data fetch fails.
 * Uses FaExclamationCircle icon from react-icons/fa.
 *
 * @param props.error - Error message to display
 * @param props.retry - Function to retry data fetch
 *
 * @returns JSX.Element - Error display with retry button
 */

interface ErrorStateProps {
  error: string;
  retry: () => void;
}

export const ErrorState = ({ error, retry }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <FaExclamationCircle className="text-error-600 text-6xl mb-6" />
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">
        Error Loading Databases
      </h1>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={retry}
        aria-label="Retry loading database list"
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
      >
        <IoMdRefresh size={18} />
        Retry
      </button>
    </div>
  );
};
```

**DoD**:

- [ ] File created at `src/devtools/components/OpenedDBList/ErrorState.tsx`
- [ ] Uses `FaExclamationCircle` icon from `react-icons/fa`
- [ ] Uses `IoMdRefresh` icon from `react-icons/io`
- [ ] Displays error message
- [ ] Retry button calls retry function
- [ ] ARIA label: "Retry loading database list"
- [ ] Export component with TSDoc

#### 1.4 EmptyDatabaseList.tsx (1 hour)

```tsx
/**
 * Empty state component when no databases are opened
 *
 * @remarks
 * Displays helpful message and refresh button.
 * Uses SiSqlite icon from react-icons/si.
 * Consistent with root EmptyState styling.
 *
 * @param props.refresh - Function to refresh database list
 *
 * @returns JSX.Element - Empty state with refresh button
 */

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
        aria-label="Refresh database list"
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
      >
        <IoMdRefresh size={18} />
        Refresh
      </button>
    </div>
  );
};
```

**DoD**:

- [ ] File created at `src/devtools/components/OpenedDBList/EmptyDatabaseList.tsx`
- [ ] Uses `SiSqlite` icon from `react-icons/si`
- [ ] Uses `IoMdRefresh` icon from `react-icons/io`
- [ ] Title: "No Opened Databases"
- [ ] Message: "Could not detect any opened databases."
- [ ] Instructions about web-sqlite-js
- [ ] Refresh button with aria-label
- [ ] Export component with TSDoc

#### 1.5 Header.tsx (0.5 hours)

```tsx
/**
 * Page header with title and refresh button
 *
 * @remarks
 * Displays "Opened Databases" title with optional count.
 * Refresh button re-fetches database list.
 *
 * @param props.refresh - Function to refresh database list
 * @param props.count - Optional database count for badge
 *
 * @returns JSX.Element - Header with refresh button
 */

interface HeaderProps {
  refresh: () => void;
  count?: number;
}

export const Header = ({ refresh, count }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <h1 className="text-2xl font-semibold text-gray-700">
        Opened Databases
        {count !== undefined && (
          <span className="ml-2 text-sm text-secondary-500">({count})</span>
        )}
      </h1>
      <button
        onClick={refresh}
        aria-label="Refresh database list"
        className="p-2 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-100 transition-colors"
      >
        <IoMdRefresh size={20} />
      </button>
    </div>
  );
};
```

**DoD**:

- [ ] File created at `src/devtools/components/OpenedDBList/Header.tsx`
- [ ] Uses `IoMdRefresh` icon from `react-icons/io`
- [ ] Title: "Opened Databases"
- [ ] Optional count badge in parentheses
- [ ] Refresh button (right-aligned)
- [ ] ARIA label: "Refresh database list"
- [ ] Export component with TSDoc

#### 1.6 DatabaseList.tsx (0.5 hours)

```tsx
/**
 * Database list container with active state detection
 *
 * @remarks
 * Renders DatabaseCard components for each database.
 * Detects active database from current route.
 *
 * @param props.databases - Array of database summaries
 *
 * @returns JSX.Element - Nav list of database cards
 */

interface DatabaseListProps {
  databases: DatabaseSummary[];
}

export const DatabaseList = ({ databases }: DatabaseListProps) => {
  const location = useLocation();

  // 1. Extract current database name from route
  // 2. Compare with each database for active state
  const activeDatabase = useMemo(() => {
    const match = location.pathname.match(/^\/openedDB\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }, [location.pathname]);

  return (
    <nav aria-label="Database list" className="p-6 space-y-3">
      {databases.map((database) => (
        <DatabaseCard
          key={database.name}
          database={database}
          isActive={database.name === activeDatabase}
        />
      ))}
    </nav>
  );
};
```

**DoD**:

- [ ] File created at `src/devtools/components/OpenedDBList/DatabaseList.tsx`
- [ ] Uses `useLocation` hook from react-router-dom
- [ ] Detects active database from route (regex match)
- [ ] Passes isActive prop to DatabaseCard
- [ ] Semantic HTML: `<nav>` with aria-label
- [ ] Export component with TSDoc

#### 1.7 OpenedDBList.tsx (1.5 hours)

```tsx
/**
 * Main component for /openedDB route
 *
 * @remarks
 * Displays list of all opened databases with refresh functionality.
 * Uses useInspectedWindowRequest hook for data fetching.
 * Handles loading, error, empty, and success states.
 *
 * @returns JSX.Element - Database list page
 */

export const OpenedDBList = () => {
  // 1. Fetch databases using service layer
  // 2. Handle loading, error, empty, and success states
  const {
    data: databases,
    isLoading,
    error,
    reload,
  } = useInspectedWindowRequest<DatabaseSummary[]>(
    () => databaseService.getDatabases(),
    [],
    [],
  );

  // 1. Show loading skeleton while fetching
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // 1. Show error state with retry button
  if (error) {
    return <ErrorState error={error} retry={reload} />;
  }

  // 1. Show empty state when no databases
  if (databases.length === 0) {
    return <EmptyDatabaseList refresh={reload} />;
  }

  // 1. Show header and database list
  return (
    <div className="flex flex-col h-full">
      <Header refresh={reload} count={databases.length} />
      <DatabaseList databases={databases} />
    </div>
  );
};
```

**DoD**:

- [ ] File created at `src/devtools/components/OpenedDBList/OpenedDBList.tsx`
- [ ] Uses `useInspectedWindowRequest` hook
- [ ] Calls `databaseService.getDatabases()`
- [ ] Conditional rendering: LoadingSkeleton, ErrorState, EmptyDatabaseList, DatabaseList
- [ ] Header shows database count
- [ ] Export component with TSDoc

#### 1.8 index.tsx (0.5 hours)

```tsx
/**
 * OpenedDBList components barrel export
 *
 * @remarks
 * Exports all OpenedDBList components for public API.
 * Sub-components exported for testing purposes.
 */

export { OpenedDBList } from "./OpenedDBList";
export { DatabaseCard } from "./DatabaseCard";
export { EmptyDatabaseList } from "./EmptyDatabaseList";
export { LoadingSkeleton } from "./LoadingSkeleton";
export { ErrorState } from "./ErrorState";
export { Header } from "./Header";
export { DatabaseList } from "./DatabaseList";
```

**DoD**:

- [ ] File created at `src/devtools/components/OpenedDBList/index.tsx`
- [ ] Exports OpenedDBList as default
- [ ] Exports all sub-components
- [ ] Proper TypeScript exports

### Phase 2: Route Configuration (2 hours)

#### 2.1 Update DevTools.tsx (1.5 hours)

```tsx
// Add import at top of file
import { OpenedDBList } from "./components/OpenedDBList";

// In Routes component, ADD THIS BEFORE /openedDB/:dbname route:
<Route path="/openedDB" element={<OpenedDBList />} />;

// CRITICAL: Generic route must precede parameterized route
// Keep existing /openedDB/:dbname route after the new route
```

**DoD**:

- [ ] Import `OpenedDBList` component
- [ ] Add `<Route path="/openedDB" element={<OpenedDBList />} />`
- [ ] Route is placed BEFORE `/openedDB/:dbname` route
- [ ] Build passes without errors
- [ ] Direct navigation to `/openedDB` works

#### 2.2 Update Sidebar DatabaseList.tsx (0.5 hours)

```tsx
// CHANGE THIS LINE:
<SidebarLink to="/" label="Opened DB" ... />

// TO THIS:
<SidebarLink to="/openedDB" label="Opened DB" ... />

// Also update isActive logic:
const isActive =
  location.pathname === "/openedDB"
  || location.pathname.startsWith("/openedDB/:");
```

**DoD**:

- [ ] Change "Opened DB" link from `to="/"` to `to="/openedDB"`
- [ ] Update isActive logic to highlight on `/openedDB` and child routes
- [ ] Sidebar link navigates correctly
- [ ] Active state highlights properly

### Phase 3: Integration & Testing (3 hours)

#### 3.1 Testing Scenarios

Test each of the following scenarios:

1. **No databases opened** (15 min)
   - [ ] Navigate to `/openedDB` → shows EmptyDatabaseList
   - [ ] SiSqlite icon displays
   - [ ] Title: "No Opened Databases"
   - [ ] Message: "Could not detect any opened databases."
   - [ ] Refresh button works

2. **Single database** (15 min)
   - [ ] Navigate to `/openedDB` → shows one DatabaseCard
   - [ ] Database name displays correctly
   - [ ] Card is clickable
   - [ ] Clicking navigates to `/openedDB/:dbname/tables`

3. **Multiple databases** (15 min)
   - [ ] Navigate to `/openedDB` → shows multiple DatabaseCard components
   - [ ] All databases display as list
   - [ ] Active database highlighted
   - [ ] Cards are clickable

4. **Click database card** (15 min)
   - [ ] Click card → navigates to `/openedDB/:dbname/tables`
   - [ ] Database name is URL-encoded
   - [ ] Target database opens in tables tab

5. **Refresh functionality** (15 min)
   - [ ] Header refresh button re-fetches data
   - [ ] Empty state refresh button works
   - [ ] Loading skeleton shows during refresh
   - [ ] Error state retry button works

6. **Sidebar link navigation** (15 min)
   - [ ] Click "Opened DB" → navigates to `/openedDB`
   - [ ] Active state highlights on `/openedDB`
   - [ ] Active state stays highlighted on child routes

7. **Loading state** (10 min)
   - [ ] LoadingSkeleton shows on initial load
   - [ ] 3 skeleton cards animate
   - [ ] Smooth transition to data

8. **Error state** (10 min)
   - [ ] Mock API error → shows ErrorState
   - [ ] Error message displays
   - [ ] Retry button re-fetches data

9. **Active state highlighting** (10 min)
   - [ ] Current database card highlighted (bg-primary-50)
   - [ ] Inactive cards show default styling
   - [ ] Active state updates on navigation

10. **URL encoding** (10 min)
    - [ ] Database names with special characters work
    - [ ] URL-encoded in navigate()
    - [ ] Decoded correctly for active state

11. **Build verification** (15 min)
    - [ ] `npm run build` passes without errors
    - [ ] `npm run typecheck` passes
    - [ ] Bundle size check
    - [ ] No console errors

12. **Manual integration test** (15 min)
    - [ ] Extension loads correctly
    - [ ] All features work together
    - [ ] No state conflicts
    - [ ] Smooth navigation

**DoD**:

- [ ] All 12 testing scenarios pass
- [ ] No bugs found during testing
- [ ] Edge cases handled correctly

### Phase 4: Documentation (1 hour)

#### 4.1 Update Feature Spec

- [ ] Open `agent-docs/01-discovery/features/F-008-opened-database-list-route.md`
- [ ] Mark all acceptance criteria checkboxes as complete
- [ ] Add completion date: 2026-01-14
- [ ] Update status to "Completed"

#### 4.2 Update HLD

- [ ] Open `agent-docs/03-architecture/01-hld.md`
- [ ] Add implementation notes to Section 13 if needed
- [ ] No changes needed if architecture followed correctly

#### 4.3 Update LLD

- [ ] Open `agent-docs/05-design/03-modules/opened-db-list.md`
- [ ] Add implementation completion status
- [ ] Note any deviations from design

#### 4.4 Update Spec and Status

- [ ] Update `agent-docs/00-control/00-spec.md`:
  - Update "Last updated" to 2026-01-14
  - Update "Status" to reflect F-008 completion
- [ ] Update `agent-docs/00-control/01-status.md`:
  - Move TASK-304 to Done section
  - Add completion evidence

## Quality Standards

### Functional-First Design

- ✅ All components are functional (no classes)
- ✅ Props are simple interfaces
- ✅ State managed via hooks (useLocation, useNavigate, useInspectedWindowRequest)

### Code Quality Rules

**TSDoc Required**:

- All exported functions have TSDoc comments
- All exported components have @remarks

**Function Extraction**:

- Functions > 5 lines must be extracted (useCallback for event handlers)
- Component logic kept simple and focused

**No OOP**:

- No classes used
- Functional components with hooks pattern
- Props interfaces for type safety

## Success Criteria

### Acceptance Criteria

1. **Route Structure**
   - [ ] `/openedDB` route exists and renders `OpenedDBList` component
   - [ ] Direct navigation to `/openedDB` works
   - [ ] Route is added to `DevTools.tsx` Routes configuration

2. **Sidebar Navigation**
   - [ ] "Opened DB" link navigates to `/openedDB` instead of `/`
   - [ ] Active state highlights correctly on `/openedDB` and child routes
   - [ ] Clicking "Opened DB" shows database list in main content area

3. **Database List Display**
   - [ ] Fetches databases using `databaseService.getDatabases()`
   - [ ] Displays each database as a clickable card
   - [ ] Shows database name
   - [ ] Clicking card navigates to `/openedDB/:dbname/tables`

4. **Empty State**
   - [ ] Shows when no databases are opened
   - [ ] Displays SiSqlite icon
   - [ ] Shows "No Opened Databases" title
   - [ ] Shows helpful message about web-sqlite-js
   - [ ] Includes refresh button with `IoMdRefresh` icon

5. **Refresh Functionality**
   - [ ] Header refresh button re-fetches database list
   - [ ] Empty state refresh button re-fetches database list
   - [ ] Shows loading state during refresh
   - [ ] Handles errors with retry option

6. **Edge Cases**
   - [ ] Loading state shows on initial load
   - [ ] Error state shows with retry button
   - [ ] Empty database list shows custom empty state
   - [ ] Single database shows correctly
   - [ ] Multiple databases show as list

## Definition of Done

- [ ] All 7 OpenedDBList components created with TSDoc
- [ ] Route `/openedDB` added to DevTools.tsx (before `/openedDB/:dbname`)
- [ ] Sidebar "Opened DB" link updated to `/openedDB`
- [ ] All 12 testing scenarios pass
- [ ] Build passes with no errors (`npm run build`)
- [ ] TypeScript passes with no errors (`npm run typecheck`)
- [ ] Feature spec updated with completion status
- [ ] HLD and LLD updated if needed
- [ ] Spec and status documents updated
- [ ] Manual testing complete (all 10 scenarios from LLD)

## Estimated Time

**Total**: 12 hours (3-4 days)

- Component Creation: 6 hours (8 components)
- Route Configuration: 2 hours (DevTools.tsx + Sidebar)
- Integration & Testing: 3 hours (12 scenarios)
- Documentation: 1 hour (4 docs to update)
