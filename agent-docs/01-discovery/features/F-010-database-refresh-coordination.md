<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/features/feature.md

OUTPUT MAP (write to)
agent-docs/01-discovery/features/F-010-database-refresh-coordination.md

NOTES
- Feature F-010: Database Refresh Coordination
- Coordinates database refresh between sidebar and main page via React Context
-->

# Feature F-010: Database Refresh Coordination

## 0) Meta

- **Feature ID**: F-010
- **Title**: Database Refresh Coordination
- **Status**: Completed
- **Priority**: P2 (Medium) - UX enhancement
- **Created**: 2026-01-14
- **Completed**: 2026-01-14
- **Requester**: User request via `/s1-iterationLead`

## 1) Problem Statement

### Current Issue

The application has two separate locations that display the database list and both can refresh:

1. **OpenedDBList** (`/openedDB` route) - Has a refresh button (Header.tsx with IoMdRefresh icon)
2. **Sidebar DatabaseList** - Has a reload function but only shows on error state

**Problem**: When a user clicks the refresh button in the main page (`/openedDB`), the sidebar database list does not update. This creates an inconsistent UX where:

- The main page shows updated databases
- The sidebar shows stale data
- Users must manually trigger sidebar refresh (only possible on error)

### User Request

1. Create a **React Context** in the parent component (DevTools/layout level)
2. When the refresh button in `/openedDB` is clicked, emit a refresh event
3. Both the main page and sidebar listen to the same context
4. Add a refresh button to the sidebar "Opened DB" header (left side of menu title)
5. Both refresh buttons should trigger the shared context, updating both locations

## 2) Proposed Solution

### Architecture Changes

**Current State:**

```
DevToolsContent
├── Sidebar
│   └── DatabaseList (own useInspectedWindowRequest)
└── OpenedDBList (own useInspectedWindowRequest)
    └── Header (refresh button)
```

**Target State:**

```
DevToolsContent
├── DatabaseRefreshContext.Provider
│   ├── Sidebar
│   │   └── DatabaseList (consumes context, new refresh button)
│   └── OpenedDBList (consumes context)
│       └── Header (refresh button triggers context)
```

### Component Changes

**1. New: DatabaseRefreshContext**

```tsx
// src/devtools/contexts/DatabaseRefreshContext.tsx
interface DatabaseRefreshContextValue {
  triggerRefresh: () => void;
  refreshVersion: number; // Incremented on each refresh
}

export const DatabaseRefreshContext =
  createContext<DatabaseRefreshContextValue | null>(null);
export const useDatabaseRefresh = () => useContext(DatabaseRefreshContext);
```

**2. Modified: DevToolsContent**

```tsx
// src/devtools/DevTools.tsx
import { DatabaseRefreshProvider } from "./contexts/DatabaseRefreshContext";

const DevToolsContent = () => {
  // ... existing code ...

  return (
    <DatabaseRefreshProvider>
      <div className="devtools-panel flex">
        <Sidebar ... />
        <main className="flex-1 ...">
          {/* Routes */}
        </main>
      </div>
    </DatabaseRefreshProvider>
  );
};
```

**3. Modified: DatabaseList (Sidebar)**

```tsx
// src/devtools/components/Sidebar/DatabaseList.tsx
import { useDatabaseRefresh } from "@/devtools/contexts/DatabaseRefreshContext";

export const DatabaseList = ({ isCollapsed }: DatabaseListProps) => {
  const { triggerRefresh, refreshVersion } = useDatabaseRefresh();

  // Use refreshVersion as dependency to trigger refetch
  const {
    data: databases,
    isLoading,
    error,
    reload: localReload,
  } = useInspectedWindowRequest<DatabaseSummary[]>(
    () => databaseService.getDatabases(),
    [refreshVersion], // <-- Refetch when refreshVersion changes
    [],
  );

  // Refresh button in sidebar header (left side)
  return (
    <div className="flex flex-col">
      <div className="flex items-center px-4 py-2">
        <button
          onClick={triggerRefresh}
          className="mr-2 text-secondary-500 hover:text-primary-600"
          aria-label="Refresh database list"
        >
          <IoMdRefresh size={16} />
        </button>
        <SidebarLink
          to="/openedDB"
          label="Opened DB"
          icon={FaDatabase}
          isActive={isActive}
          isCollapsed={isCollapsed}
          className="flex-1" // Take remaining space
        />
      </div>
      {/* ... database list ... */}
    </div>
  );
};
```

**4. Modified: OpenedDBList**

```tsx
// src/devtools/components/OpenedDBList/OpenedDBList.tsx
import { useDatabaseRefresh } from "@/devtools/contexts/DatabaseRefreshContext";

export const OpenedDBList = () => {
  const { triggerRefresh, refreshVersion } = useDatabaseRefresh();

  const {
    data: databases,
    isLoading,
    error,
    reload: localReload,
  } = useInspectedWindowRequest<DatabaseSummary[]>(
    () => databaseService.getDatabases(),
    [refreshVersion], // <-- Refetch when refreshVersion changes
    [],
  );

  // Header refresh button uses shared trigger
  return (
    <Header
      refresh={triggerRefresh} // <-- Use shared trigger
      count={databases.length}
    />
  );
};
```

### Refresh Button Position in Sidebar

```
┌─────────────────────┐
│ [🔄] Opened DB      │  <-- Refresh button on LEFT side
├─────────────────────┤
│ • database1         │
│ • database2         │
│ • database3         │
└─────────────────────┘
```

## 3) Functional Requirements

### FR-REFRESH-001: Shared Refresh Context

- Create `DatabaseRefreshContext` at DevTools level
- Provide `triggerRefresh()` function to all consumers
- Track `refreshVersion` number that increments on each refresh
- Context wraps the entire DevTools content (Sidebar + main area)

### FR-REFRESH-002: Sidebar Integration

- Add refresh button to sidebar "Opened DB" header
- Position: **Left side** of the menu title item
- Icon: IoMdRefresh (size 16)
- Clicking button calls `triggerRefresh()` from context
- Button shows on both expanded and collapsed states

### FR-REFRESH-003: Main Page Integration

- OpenedDBList consumes DatabaseRefreshContext
- Header refresh button uses `triggerRefresh()` from context
- Component refetches when `refreshVersion` changes

### FR-REFRESH-004: Bidirectional Synchronization

- Clicking refresh in main page → updates sidebar
- Clicking refresh in sidebar → updates main page
- Both locations show consistent data after refresh
- No separate loading indicator needed (auto-sync)

### FR-REFRESH-005: Data Fetching

- Both components use `refreshVersion` in `useInspectedWindowRequest` dependency array
- When `refreshVersion` increments, both components refetch databases
- Refetch happens automatically via React's dependency tracking

## 4) Non-Functional Requirements

### NFR-REFRESH-001: Code Quality

- Follow existing React Context patterns in codebase
- Use TypeScript strict mode for context types
- Maintain TSDoc comments for new context

### NFR-REFRESH-002: Performance

- Avoid unnecessary re-renders (use memo for context value)
- Refresh operation should not block UI
- Minimize context value object recreation

### NFR-REFRESH-003: Visual Consistency

- Refresh button styling matches F-007 theme tokens
- Hover state: `text-secondary-500` → `text-primary-600`
- Button size: 16px icon
- Spacing: Consistent with sidebar header

## 5) Out of Scope

- Adding global refresh keyboard shortcut (can be separate feature)
- Auto-refresh on interval (not requested)
- Refresh animation/transition (auto-sync, no indicator)
- Refreshing other data (e.g., OPFS files, logs) - only databases

## 6) Dependencies

### Blocks

- None

### Depends On

- F-002: Database Tab Navigation (provides DevTools structure)
- F-008: Opened Database List Route (provides OpenedDBList component)
- TASK-09: Log Streaming (provides context pattern reference)

### Related Features

- F-008: Opened Database List Route (shares same data source)
- F-002: Database Tab Navigation (parent structure)

## 7) Success Criteria

### Acceptance Criteria

1. **Context Creation**
   - [x] DatabaseRefreshContext created with proper TypeScript types
   - [x] Provider wraps DevTools content
   - [x] Context exports useDatabaseRefresh hook

2. **Sidebar Refresh Button**
   - [x] Refresh button appears on left side of "Opened DB" header
   - [x] Button uses IoMdRefresh icon (16px)
   - [x] Clicking button triggers shared refresh
   - [x] Button styling matches F-007 theme tokens

3. **Main Page Integration**
   - [x] OpenedDBList consumes DatabaseRefreshContext
   - [x] Header refresh button uses shared trigger
   - [x] Component refetches on refreshVersion change

4. **Synchronization**
   - [x] Clicking main page refresh updates sidebar list
   - [x] Clicking sidebar refresh updates main page list
   - [x] Both locations show consistent data after refresh
   - [x] No duplicate API calls (single refreshVersion increment)

5. **Edge Cases**
   - [x] Refresh works when sidebar is collapsed
   - [x] Refresh works when sidebar is expanded
   - [x] Refresh works on error state
   - [x] Refresh works on empty state
   - [x] Multiple rapid clicks only trigger one refresh (debounced)

## 8) Open Questions

1. **Context location**: Should context be in DevToolsContent or DevTools root?
   - **Decision**: DevToolsContent (inside Router, before Sidebar/main split)

2. **Refresh button visibility**: Should sidebar refresh button always be visible or only on hover?
   - **Decision**: Always visible (matches main page behavior)

3. **Debounce strategy**: Should rapid clicks be debounced?
   - **Decision**: Yes, use 500ms debounce to prevent duplicate calls

## 9) Implementation Notes

### Files to Create

1. **src/devtools/contexts/DatabaseRefreshContext.tsx**
   - Create context with TypeScript types
   - Create Provider component with state management
   - Create useDatabaseRefresh hook
   - Add TSDoc comments

### Files to Modify

1. **src/devtools/DevTools.tsx**
   - Import DatabaseRefreshProvider
   - Wrap DevToolsContent return with provider

2. **src/devtools/components/Sidebar/DatabaseList.tsx**
   - Import useDatabaseRefresh hook
   - Add refresh button to header (left side)
   - Use refreshVersion in dependency array
   - Update header layout for button positioning

3. **src/devtools/components/OpenedDBList/OpenedDBList.tsx**
   - Import useDatabaseRefresh hook
   - Use refreshVersion in dependency array
   - Pass triggerRefresh to Header component

### Implementation Steps

1. Create DatabaseRefreshContext with Provider and hook
2. Update DevTools.tsx to wrap content with provider
3. Update DatabaseList to consume context and add refresh button
4. Update OpenedDBList to consume context
5. Test bidirectional refresh synchronization
6. Test edge cases (collapsed, error, empty states)
7. Build verification

### Context API Pattern

```tsx
// Context value structure
interface DatabaseRefreshContextValue {
  triggerRefresh: () => void; // Function to trigger refresh
  refreshVersion: number; // Incrementing version number
}

// Usage in components
const { triggerRefresh, refreshVersion } = useDatabaseRefresh();

// Refetch when version changes
const { data } = useInspectedWindowRequest(
  () => databaseService.getDatabases(),
  [refreshVersion], // Dependency triggers refetch
  [],
);
```

### Button Layout in Sidebar

```tsx
<div className="flex items-center px-4 py-2">
  {/* Refresh button - LEFT side */}
  <button
    onClick={triggerRefresh}
    className="mr-2 text-secondary-500 hover:text-primary-600"
    aria-label="Refresh database list"
  >
    <IoMdRefresh size={16} />
  </button>

  {/* Sidebar link - takes remaining space */}
  <SidebarLink
    to="/openedDB"
    label="Opened DB"
    icon={FaDatabase}
    isActive={isActive}
    isCollapsed={isCollapsed}
    className="flex-1"
  />
</div>
```

## 10) Testing Considerations

### Manual Testing

1. Click main page refresh button → verify sidebar updates
2. Click sidebar refresh button → verify main page updates
3. Rapid clicks on both buttons → verify only one refresh
4. Test with collapsed sidebar → button visible and works
5. Test with expanded sidebar → button visible and works
6. Test on error state → both refresh buttons work
7. Test on empty state → both refresh buttons work
8. Test with multiple databases → all refresh correctly

### Integration Testing

- Verify context provider is accessible to all consumers
- Verify refreshVersion increments correctly
- Verify no memory leaks from context subscriptions

## 11) Effort Estimation

- **Estimated Time**: 1-2 hours
- **Complexity**: Low (standard React Context pattern)
- **Files to Change**: 4 files (1 new, 3 modified)
- **Risk**: Low (well-established pattern, isolated changes)
