<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/05-design/03-modules/module.md

OUTPUT MAP (write to)
agent-docs/05-design/03-modules/database-refresh.md

NOTES
- Module: Database Refresh Coordination (Feature F-010)
- Defines React Context API for coordinated database refresh
-->

# Module: Database Refresh Coordination

## 0) Meta

- **Module ID**: database-refresh
- **Feature**: F-010 - Database Refresh Coordination
- **Status**: Draft
- **Created**: 2026-01-14
- **Type**: React Context API (State Management)

## 1) Module Purpose

**Purpose**: Coordinate database list refresh between sidebar and main page via shared React Context, ensuring consistent data across both locations.

**Problem Solved**:

- Eliminates stale data inconsistency when refresh is triggered from one location
- Enables bidirectional refresh (sidebar ↔ main page)
- Provides refresh button in sidebar for better UX

**Scope**:

- Shared refresh state management via React Context
- Sidebar refresh button integration (left side of "Opened DB" header)
- Automatic data synchronization across consumers
- No service layer changes (uses existing `getDatabases()`)

## 2) API Contract (React Context)

### 2.1 Context Types

````typescript
/**
 * Database refresh context value
 *
 * @remarks
 * - triggerRefresh: Function to increment refreshVersion and trigger refetch
 * - refreshVersion: Incrementing number that changes on each refresh
 *
 * Consumers use refreshVersion in dependency arrays to trigger refetch:
 * ```tsx
 * const { triggerRefresh, refreshVersion } = useDatabaseRefresh();
 * const { data } = useInspectedWindowRequest(
 *   () => databaseService.getDatabases(),
 *   [refreshVersion], // Refetch when version changes
 *   []
 * );
 * ```
 */
export interface DatabaseRefreshContextValue {
  /**
   * Trigger refresh by incrementing refreshVersion
   *
   * @remarks
   * - Increments refreshVersion by 1
   * - All consumers refetch databases via dependency array
   * - Debounced via React state batching (rapid clicks = single refresh)
   *
   * @returns void
   */
  triggerRefresh: () => void;

  /**
   * Current refresh version number
   *
   * @remarks
   * - Starts at 0
   * - Increments on each triggerRefresh call
   * - Used in dependency arrays to trigger refetch
   * - Changes propagate to all context consumers
   */
  refreshVersion: number;
}
````

### 2.2 Context Exports

````typescript
/**
 * Database refresh context
 *
 * @remarks
 * - React Context for coordinating database refresh across components
 * - Null by default (must be used within DatabaseRefreshProvider)
 * - Use useDatabaseRefresh hook for type-safe access
 */
export const DatabaseRefreshContext: React.Context<DatabaseRefreshContextValue | null>;

/**
 * Database refresh provider component
 *
 * @param props.children - Child components to wrap
 * @returns JSX.Element - Context provider with refresh state
 *
 * @remarks
 * - Manages refreshVersion state (starts at 0)
 * - Provides triggerRefresh function via context
 * - Memoizes context value to prevent unnecessary re-renders
 * - Throws error if used outside provider (development guard)
 *
 * @example
 * ```tsx
 * <DatabaseRefreshProvider>
 *   <Sidebar />
 *   <MainContent />
 * </DatabaseRefreshProvider>
 * ```
 */
export const DatabaseRefreshProvider: React.FC<{
  children: React.ReactNode;
}>;

/**
 * Hook to access database refresh context
 *
 * @returns DatabaseRefreshContextValue - Context value with triggerRefresh and refreshVersion
 * @throws Error if used outside DatabaseRefreshProvider
 *
 * @remarks
 * - Type-safe context access (returns non-null value)
 * - Throws descriptive error if context is missing
 * - Use in any component under DatabaseRefreshProvider
 *
 * @example
 * ```tsx
 * const { triggerRefresh, refreshVersion } = useDatabaseRefresh();
 *
 * // Trigger refresh
 * triggerRefresh();
 *
 * // Use version in dependency array
 * const { data } = useInspectedWindowRequest(
 *   () => databaseService.getDatabases(),
 *   [refreshVersion],
 *   []
 * );
 * ```
 */
export const useDatabaseRefresh: () => DatabaseRefreshContextValue;
````

## 3) Component Integration

### 3.1 Provider Setup (DevToolsContent)

**File**: `src/devtools/DevTools.tsx`

**Changes**:

```tsx
// 1. Import provider
import { DatabaseRefreshProvider } from "./contexts/DatabaseRefreshContext";

// 2. Wrap DevToolsContent return
const DevToolsContent = () => {
  // ... existing state and hooks ...

  return (
    <DatabaseRefreshProvider>
      <div className="devtools-panel flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <main className="flex-1 h-full overflow-auto flex flex-col text-left">
          {/* Existing routes and components */}
        </main>
      </div>
    </DatabaseRefreshProvider>
  );
};
```

**Requirements**:

- Provider wraps entire DevTools content (Sidebar + main area)
- Placed inside HashRouter, before component split
- No other changes to DevToolsContent logic

### 3.2 Sidebar Integration (DatabaseList)

**File**: `src/devtools/components/Sidebar/DatabaseList.tsx`

**Changes**:

```tsx
// 1. Import hook and icon
import { useDatabaseRefresh } from "@/devtools/contexts/DatabaseRefreshContext";
import { IoMdRefresh } from "react-icons/io";

// 2. Consume context
export const DatabaseList = ({ isCollapsed }: DatabaseListProps) => {
  const { triggerRefresh, refreshVersion } = useDatabaseRefresh();

  // 3. Use refreshVersion in dependency array
  const {
    data: databases,
    isLoading,
    error,
    reload: localReload,
  } = useInspectedWindowRequest<DatabaseSummary[]>(
    () => databaseService.getDatabases(),
    [refreshVersion], // Refetch when version changes
    [],
  );

  // 4. Add refresh button to header (LEFT side)
  return (
    <div className="flex flex-col">
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

      {/* Database list items */}
      {!isCollapsed && (
        <div className="pb-2">{/* Existing database items rendering */}</div>
      )}
    </div>
  );
};
```

**Requirements**:

- Refresh button positioned on LEFT side of menu title
- Button always visible (expanded or collapsed)
- Button uses IoMdRefresh icon (16px)
- Styling: `text-secondary-500 hover:text-primary-600`
- ARIA label: "Refresh database list"

### 3.3 Main Page Integration (OpenedDBList)

**File**: `src/devtools/components/OpenedDBList/OpenedDBList.tsx`

**Changes**:

```tsx
// 1. Import hook
import { useDatabaseRefresh } from "@/devtools/contexts/DatabaseRefreshContext";

// 2. Consume context
export const OpenedDBList = () => {
  const { triggerRefresh, refreshVersion } = useDatabaseRefresh();

  // 3. Use refreshVersion in dependency array
  const {
    data: databases,
    isLoading,
    error,
    reload: localReload,
  } = useInspectedWindowRequest<DatabaseSummary[]>(
    () => databaseService.getDatabases(),
    [refreshVersion], // Refetch when version changes
    [],
  );

  // 4. Pass triggerRefresh to Header (existing)
  return (
    <div className="flex flex-col h-full">
      <Header refresh={triggerRefresh} count={databases.length} />
      <DatabaseList databases={databases} />
    </div>
  );
};
```

**Requirements**:

- OpenedDBList consumes DatabaseRefreshContext
- Header refresh button uses triggerRefresh from context
- Component refetches when refreshVersion changes
- No visual changes to Header component

## 4) Data Flow

### 4.1 Refresh Trigger Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User Action                                                │
│    - Click main page refresh button                           │
│    - OR Click sidebar refresh button                          │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. triggerRefresh() Call                                      │
│    - Increments refreshVersion (prev + 1)                     │
│    - React batches state updates                             │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Context Update                                             │
│    - Context value changes (new refreshVersion)              │
│    - useMemo detects refreshVersion change                    │
│    - Creates new context value object                        │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Consumer Re-render                                         │
│    - All consumers re-render with new refreshVersion         │
│    - useInspectedWindowRequest detects dependency change      │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Data Refetch                                               │
│    - databaseService.getDatabases() called                   │
│    - Both locations fetch fresh data                         │
│    - UI updates with new database list                       │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Debounce Behavior

```
Rapid Clicks (3 clicks in 100ms):
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Click 1 │  │ Click 2 │  │ Click 3 │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     └────────────┴────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ React Batching │
         │ Single Update   │
         └────────┬────────┘
                  │
                  ▼
         refreshVersion: 0 → 1

Result: Only 1 refetch (not 3)
```

## 5) Component Contracts

### 5.1 DatabaseRefreshProvider

**File**: `src/devtools/contexts/DatabaseRefreshContext.tsx`

**Props Contract**:

```typescript
interface DatabaseRefreshProviderProps {
  children: React.ReactNode;
}
```

**State Contract**:

```typescript
interface DatabaseRefreshProviderState {
  refreshVersion: number; // Starts at 0, increments on refresh
}
```

**Behavior Contract**:

- Manages refreshVersion state
- Provides triggerRefresh function via context
- Memoizes context value (useMemo)
- Throws error if hook used outside provider

### 5.2 useDatabaseRefresh Hook

**Returns**:

```typescript
type HookReturn = DatabaseRefreshContextValue;
```

**Throws**:

- Error: "useDatabaseRefresh must be used within DatabaseRefreshProvider"

**Usage Contract**:

- Must be called within DatabaseRefreshProvider
- Must be called at component level (not in callbacks/event handlers)
- Returns stable reference (memoized context value)

### 5.3 DatabaseList (Sidebar) Contract Changes

**New Props**: None (uses context instead of props)

**New Behavior**:

- Consumes DatabaseRefreshContext
- Renders refresh button in header (left side)
- Uses refreshVersion in dependency array
- Refetches databases when refreshVersion changes

**Visual Changes**:

- Added: Refresh button (IoMdRefresh, 16px) on left side of "Opened DB" header
- Layout: Flex container with button + SidebarLink (flex-1)

### 5.4 OpenedDBList Contract Changes

**New Props**: None (uses context instead of props)

**New Behavior**:

- Consumes DatabaseRefreshContext
- Uses refreshVersion in dependency array
- Refetches databases when refreshVersion changes
- Passes triggerRefresh to Header (existing prop)

**Visual Changes**: None (Header component unchanged)

## 6) State Management Details

### 6.1 Context Value Memoization

```typescript
// Prevents unnecessary re-renders of consumers
const value = useMemo(
  () => ({
    triggerRefresh,
    refreshVersion,
  }),
  [triggerRefresh, refreshVersion],
);
```

**Rationale**:

- Context value only changes when refreshVersion changes
- Prevents consumer re-renders on parent updates
- Ensures stable reference for triggerRefresh function

### 6.2 Callback Memoization

```typescript
const triggerRefresh = useCallback(() => {
  setRefreshVersion((prev) => prev + 1);
}, []);
```

**Rationale**:

- Stable function reference (never recreates)
- Prevents useMemo from detecting false changes
- Enables inline usage in onClick handlers

### 6.3 Dependency Array Pattern

```typescript
// Consumer component
const {
  data: databases,
  isLoading,
  error,
  reload: localReload,
} = useInspectedWindowRequest<DatabaseSummary[]>(
  () => databaseService.getDatabases(),
  [refreshVersion], // Dependency triggers refetch
  [],
);
```

**Rationale**:

- Refresh version in dependency array triggers refetch
- useInspectedWindowRequest detects version change
- Automatic refetch without manual reload calls

## 7) Error Handling

### 7.1 Context Missing Error

```typescript
export const useDatabaseRefresh = () => {
  const context = useContext(DatabaseRefreshContext);
  if (!context) {
    throw new Error(
      "useDatabaseRefresh must be used within DatabaseRefreshProvider",
    );
  }
  return context;
};
```

**Guard Behavior**:

- Throws descriptive error if hook used outside provider
- Error message indicates missing provider
- Helps catch misuse during development

### 7.2 Service Layer Errors

**No Changes Required**:

- Each component handles its own error state
- useInspectedWindowRequest returns error string
- Error display unchanged (existing ErrorState components)

## 8) Performance Considerations

### 8.1 Re-render Prevention

- **Context Value Memoization**: useMemo prevents unnecessary consumer re-renders
- **Callback Memoization**: useCallback prevents function recreation
- **Dependency Array**: Refresh version only changes on trigger

### 8.2 Refetch Efficiency

- **Single Version Increment**: One trigger = one refetch per consumer
- **React Batching**: Rapid clicks debounced automatically
- **No Duplicate Calls**: Dependency array prevents redundant fetches

### 8.3 Bundle Impact

- **New Context File**: ~1KB (TypeScript, minimal dependencies)
- **Icon Import**: IoMdRefresh (16px) from react-icons/io
- **No External Dependencies**: Uses existing React APIs

## 9) Accessibility

### 9.1 Refresh Button Accessibility

```tsx
<button
  onClick={triggerRefresh}
  className="mr-2 text-secondary-500 hover:text-primary-600"
  aria-label="Refresh database list"
>
  <IoMdRefresh size={16} />
</button>
```

**Features**:

- **ARIA Label**: "Refresh database list" (screen reader announcement)
- **Focusable**: Button is focusable via Tab key
- **Keyboard**: Activates on Enter/Space keys
- **Visual Feedback**: Hover state (gray-500 → emerald-600)

### 9.2 Screen Reader Experience

- Refresh button announced as "Refresh database list, button"
- Icon is decorative (no extra label needed)
- Button position (left side) is keyboard-accessible

## 10) Styling Specification

### 10.1 Sidebar Refresh Button

**CSS Classes**:

```tsx
className = "mr-2 text-secondary-500 hover:text-primary-600";
```

**Breakdown**:

- `mr-2`: Right margin (8px) spacing between button and link
- `text-secondary-500`: Gray-500 (#6b7280) - default icon color
- `hover:text-primary-600`: Emerald-600 (#059669) - hover icon color

**Theme Tokens** (F-007):

- `secondary-500`: `#6b7280` (gray-500)
- `primary-600`: `#059669` (emerald-600)

### 10.2 Icon Sizing

```tsx
<IoMdRefresh size={16} />
```

**Size**: 16px (smaller than main page 18px)
**Rationale**: Fits sidebar header without overwhelming layout

### 10.3 Layout Structure

```tsx
<div className="flex items-center px-4 py-2">
  {/* Refresh button - fixed width */}
  <button onClick={triggerRefresh} className="mr-2">
    <IoMdRefresh size={16} />
  </button>

  {/* Sidebar link - takes remaining space */}
  <SidebarLink className="flex-1" ... />
</div>
```

**Flex Behavior**:

- `flex items-center`: Vertically center button and link
- `flex-1`: SidebarLink takes remaining horizontal space
- `px-4 py-2`: Consistent padding with other sidebar items

## 11) Testing Considerations

### 11.1 Unit Tests

**Context Provider**:

- [ ] Provider renders children
- [ ] Context value has triggerRefresh function
- [ ] Context value has refreshVersion starting at 0
- [ ] triggerRefresh increments refreshVersion
- [ ] Context value memoized when refreshVersion unchanged

**useDatabaseRefresh Hook**:

- [ ] Returns context value when used inside provider
- [ ] Throws error when used outside provider
- [ ] Returns stable reference (same object between renders)

### 11.2 Integration Tests

**Bidirectional Refresh**:

- [ ] Click main page refresh → sidebar refetches
- [ ] Click sidebar refresh → main page refetches
- [ ] Both locations show same data after refresh
- [ ] No duplicate API calls on single refresh

**Edge Cases**:

- [ ] Refresh works when sidebar collapsed
- [ ] Refresh works when sidebar expanded
- [ ] Refresh works on error state
- [ ] Refresh works on empty state
- [ ] Rapid clicks trigger single refresh (debounced)

### 11.3 Manual Testing

**Test Scenarios**:

1. Navigate to `/openedDB` → main page shows databases
2. Click main page refresh button → sidebar database list updates
3. Click sidebar refresh button → main page database list updates
4. Open new database in inspected page → refresh both locations → new database appears
5. Collapse sidebar → refresh button still visible and functional
6. Expand sidebar → refresh button visible and functional
7. Trigger error state → both refresh buttons work
8. Empty database list → both refresh buttons work
9. Rapid clicks (5 clicks in 1 second) → only 1 refresh triggered

## 12) Implementation Checklist

### Phase 1: Context Creation (0.5 hour)

- [ ] Create `src/devtools/contexts/DatabaseRefreshContext.tsx`
- [ ] Define `DatabaseRefreshContextValue` interface
- [ ] Create `DatabaseRefreshContext` with null default
- [ ] Implement `DatabaseRefreshProvider` component
  - [ ] Add refreshVersion state (useState, default 0)
  - [ ] Implement triggerRefresh callback (useCallback)
  - [ ] Memoize context value (useMemo)
  - [ ] Add TSDoc comments
- [ ] Implement `useDatabaseRefresh` hook
  - [ ] Call useContext
  - [ ] Add error if context missing
  - [ ] Add TSDoc comments
- [ ] Export context, provider, and hook
- [ ] Verify TypeScript compilation

### Phase 2: DevTools Integration (0.25 hour)

- [ ] Import `DatabaseRefreshProvider` in DevTools.tsx
- [ ] Wrap DevToolsContent return with provider
- [ ] Verify provider placement (before Sidebar/main split)
- [ ] Verify TypeScript compilation

### Phase 3: Sidebar Integration (0.5 hour)

- [ ] Import `useDatabaseRefresh` in DatabaseList.tsx
- [ ] Import `IoMdRefresh` icon from react-icons/io
- [ ] Consume context in component
- [ ] Add refreshVersion to dependency array
- [ ] Add refresh button to header (left side)
  - [ ] Button positioned before SidebarLink
  - [ ] Flex container for layout
  - [ ] Button styling (text-secondary-500 hover:text-primary-600)
  - [ ] ARIA label added
- [ ] Test refresh button functionality
- [ ] Test collapsed/expanded states
- [ ] Verify TypeScript compilation

### Phase 4: Main Page Integration (0.25 hour)

- [ ] Import `useDatabaseRefresh` in OpenedDBList.tsx
- [ ] Consume context in component
- [ ] Add refreshVersion to dependency array
- [ ] Pass triggerRefresh to Header (existing prop)
- [ ] Verify Header refresh button uses shared trigger
- [ ] Verify TypeScript compilation

### Phase 5: Testing & Verification (0.5 hour)

- [ ] Test bidirectional refresh (main page → sidebar)
- [ ] Test bidirectional refresh (sidebar → main page)
- [ ] Test data consistency (both show same data)
- [ ] Test collapsed sidebar (button visible, works)
- [ ] Test expanded sidebar (button visible, works)
- [ ] Test error state (both refresh buttons work)
- [ ] Test empty state (both refresh buttons work)
- [ ] Test rapid clicks (debounced, single refresh)
- [ ] Verify no console errors
- [ ] Verify no TypeScript errors

### Phase 6: Build Verification (0.125 hour)

- [ ] Run `npm run build` - verify no errors
- [ ] Run `npm run typecheck` - verify no type errors
- [ ] Check bundle size impact (< 5KB expected)
- [ ] Build time under 5 seconds

### Phase 7: Documentation (0.125 hour)

- [ ] Update feature spec (F-010) with implementation status
- [ ] Update HLD if needed (already done in Stage 3)
- [ ] Update LLD with completion status
- [ ] Update status board with completion evidence
- [ ] Verify all DoD items complete

## 13) Definition of Done

- [x] HLD updated (Section 15 added to 01-hld.md)
- [ ] LLD created (this document)
- [ ] DatabaseRefreshContext created with proper TypeScript types
- [ ] DatabaseRefreshProvider wraps DevTools content
- [ ] useDatabaseRefresh hook exported and documented
- [ ] Sidebar refresh button added (left side, IoMdRefresh icon)
- [ ] Sidebar refresh button styling matches F-007 tokens
- [ ] OpenedDBList consumes DatabaseRefreshContext
- [ ] Main page refresh button uses shared trigger
- [ ] Bidirectional refresh working (both directions)
- [ ] Data consistency verified (both locations show same data)
- [ ] Debounce working (rapid clicks = single refresh)
- [ ] Edge cases handled (collapsed, error, empty states)
- [ ] Build passed with no errors
- [ ] Type check passed with no errors
- [ ] Bundle size impact acceptable (< 5KB)
- [ ] Feature spec updated
- [ ] Status board updated

## 14) Planned Changes (F-010)

- [x] HLD Update (Stage 3) - Section 15 added to 01-hld.md
- [x] LLD Design (Stage 5) - This document
- [ ] Task Management (Stage 7) - Micro-spec creation
- [ ] Implementation (Stage 8) - Code changes

## 15) Code Changes Required

- [ ] Update `src/devtools/DevTools.tsx`:
  - [ ] Import DatabaseRefreshProvider
  - [ ] Wrap DevToolsContent return with provider
  - [ ] Verify provider placement

- [ ] Update `src/devtools/components/Sidebar/DatabaseList.tsx`:
  - [ ] Import useDatabaseRefresh hook
  - [ ] Import IoMdRefresh icon
  - [ ] Consume context
  - [ ] Add refreshVersion to dependency array
  - [ ] Add refresh button to header (left side)
  - [ ] Update layout (flex container)

- [ ] Update `src/devtools/components/OpenedDBList/OpenedDBList.tsx`:
  - [ ] Import useDatabaseRefresh hook
  - [ ] Consume context
  - [ ] Add refreshVersion to dependency array
  - [ ] Pass triggerRefresh to Header

- [ ] Create `src/devtools/contexts/DatabaseRefreshContext.tsx`:
  - [ ] Define DatabaseRefreshContextValue interface
  - [ ] Create DatabaseRefreshContext
  - [ ] Implement DatabaseRefreshProvider component
  - [ ] Implement useDatabaseRefresh hook
  - [ ] Export all public APIs
  - [ ] Add TSDoc comments

## 16) Implementation Notes

### File Structure

```
/src/devtools
  /contexts (NEW FOLDER)
    DatabaseRefreshContext.tsx    # NEW - Context provider + hook
  /components
    /Sidebar
      DatabaseList.tsx             # MODIFIED - Add refresh button, consume context
    /OpenedDBList
      OpenedDBList.tsx             # MODIFIED - Consume context
  DevTools.tsx                     # MODIFIED - Wrap with provider
```

### Module Dependencies

```
DatabaseRefreshContext.tsx
  ├── react (useContext, useState, useCallback, useMemo, createContext)
  └── No internal dependencies (pure context module)

DatabaseList.tsx
  ├── DatabaseRefreshContext (useDatabaseRefresh)
  ├── react-icons/io (IoMdRefresh)
  ├── databaseService (getDatabases)
  └── useInspectedWindowRequest (existing hook)

OpenedDBList.tsx
  ├── DatabaseRefreshContext (useDatabaseRefresh)
  ├── databaseService (getDatabases)
  └── useInspectedWindowRequest (existing hook)

DevTools.tsx
  ├── DatabaseRefreshContext (DatabaseRefreshProvider)
  ├── Sidebar (existing)
  └── Routes (existing)
```

### Risk Assessment

- **Complexity**: Low (standard React Context pattern)
- **Files Modified**: 4 files (1 new, 3 existing)
- **Component Reuse**: 100% (no new components, just context)
- **API Changes**: None (uses existing getDatabases)
- **Breaking Changes**: None (additive only)
- **Test Coverage**: Manual testing required (no automated tests)
- **Bundle Impact**: < 5KB (context file + icon)

### Migration Path

**No Migration Required**:

- Additive feature (no breaking changes)
- Existing components work without consuming context
- Gradual adoption (can add consumers incrementally)

### Rollback Plan

**If Issues Arise**:

1. Remove provider wrapper from DevTools.tsx
2. Remove context imports from DatabaseList.tsx and OpenedDBList.tsx
3. Revert dependency array changes
4. Delete DatabaseRefreshContext.tsx file
5. System restored to pre-F-010 state

## 17) Success Metrics

### Functional Metrics

- [ ] Sidebar refresh button visible and functional
- [ ] Main page refresh button triggers sidebar update
- [ ] Sidebar refresh button triggers main page update
- [ ] Both locations show consistent data after refresh
- [ ] No duplicate API calls on single refresh

### Non-Functional Metrics

- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build time under 5 seconds
- [ ] Bundle size increase < 5KB
- [ ] Refresh response time < 500ms

### User Experience Metrics

- [ ] Refresh button discoverable (visible on left side)
- [ ] Visual feedback on hover (color change)
- [ ] No jank/flash on refresh (smooth transition)
- [ ] Works in all sidebar states (collapsed/expanded)
