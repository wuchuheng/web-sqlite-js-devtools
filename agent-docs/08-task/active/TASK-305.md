<!--
TASK-305: Log Tab Integration Feature (F-009)
Status: Draft
Created: 2026-01-14
-->

# TASK-305: Log Tab Integration Feature (F-009)

## Task Summary

Add "Log" tab to database tab navigation between Query and Migration tabs, using IoTimeOutline icon from react-icons/io5, at route `/openedDB/:dbname/logs`.

**Feature**: [F-009: Log Tab Integration](../01-discovery/features/F-009-log-tab.md)

## Boundary

- **Modified Files**:
  - `src/devtools/components/DatabaseTabs/DatabaseTabHeader.tsx` - Add IoTimeOutline import and logs tab
  - `src/devtools/DevTools.tsx` - Add logs route to DatabaseTabs nested routes

## Dependencies

- F-002 (Database Tab Navigation) - Complete
- TASK-09 (Log Streaming) - Complete (provides LogView component)

## Implementation Plan

### Phase 1: Tab Header Update (0.25 hour)

#### 1.1 Add IoTimeOutline Import to DatabaseTabHeader.tsx

```tsx
// Add to imports at top of file
import { IoTimeOutline } from "react-icons/io5";
```

**DoD**:

- [ ] File: `src/devtools/components/DatabaseTabs/DatabaseTabHeader.tsx`
- [ ] Add import: `import { IoTimeOutline } from "react-icons/io5";`
- [ ] Place after other icon imports (line ~6)
- [ ] Verify TypeScript compilation

#### 1.2 Add Logs Tab to DATABASE_TABS Array

```tsx
const DATABASE_TABS: DatabaseTab[] = [
  { path: "tables", label: "Tables", icon: <CiViewTable size={18} /> },
  { path: "query", label: "Query", icon: <BsFiletypeSql size={16} /> },
  { path: "logs", label: "Log", icon: <IoTimeOutline size={18} /> }, // NEW - after query
  {
    path: "migration",
    label: "Migration",
    icon: <MdOutlineQueryBuilder size={18} />,
  },
  { path: "seed", label: "Seed", icon: <FaSeedling size={16} /> },
  { path: "about", label: "About", icon: <FaInfoCircle size={16} /> },
];
```

**DoD**:

- [ ] Add logs tab object after "query" tab (position 3 of 6)
- [ ] Path: "logs"
- [ ] Label: "Log"
- [ ] Icon: `<IoTimeOutline size={18} />`
- [ ] Verify TypeScript compilation
- [ ] Update TSDoc comment from "5 tabs" to "6 tabs"

### Phase 2: Route Configuration (0.25 hour)

#### 2.1 Add Logs Route to DevTools.tsx

```tsx
// Inside DatabaseTabs nested route, add logs route
// Place BEFORE migration route to maintain order

<Route path="/openedDB/:dbname" element={<DatabaseTabs />}>
  <Route index element={<Navigate to="tables" replace />} />

  <Route path="tables" element={<TablesTab />}>
    <Route path=":tableName" element={<TableDetail />} />
  </Route>

  <Route
    path="query"
    element={
      <QueryTab
        onExecuteRef={queryExecuteRef}
        onClearRef={queryClearRef}
        onToggleHistoryRef={queryToggleHistoryRef}
      />
    }
  />

  {/* NEW: Add logs route before migration */}
  <Route path="logs" element={<LogView />} />

  <Route path="migration" element={<MigrationTab />} />
  <Route path="seed" element={<SeedTab />} />
  <Route path="about" element={<AboutTab />} />
</Route>
```

**DoD**:

- [ ] File: `src/devtools/DevTools.tsx`
- [ ] Add import: `import { LogView } from "./components/LogTab/LogView";`
- [ ] Add `<Route path="logs" element={<LogView />} />`
- [ ] Place logs route BEFORE migration route
- [ ] Verify nested route structure
- [ ] Verify TypeScript compilation

### Phase 3: Testing & Verification (0.25 hour)

#### 3.1 Testing Scenarios

Test each of the following:

1. **Tab Visibility** (2 min)
   - [ ] "Log" tab appears in database tab header
   - [ ] Positioned between "Query" and "Migration"
   - [ ] IoTimeOutline icon displays correctly
   - [ ] "Log" label displays correctly

2. **Tab Navigation** (3 min)
   - [ ] Click "Log" tab → navigates to `/openedDB/:dbname/logs`
   - [ ] Tab highlights with active state styling (border-b-2 border-primary-600 text-primary-600)
   - [ ] URL updates in browser address bar
   - [ ] Back/forward navigation works

3. **LogView Rendering** (3 min)
   - [ ] LogView component renders correctly
   - [ ] Database name available from route params
   - [ ] Log list displays (if logs available)
   - [ ] Filter controls work

4. **Tab Switching** (3 min)
   - [ ] Switch between all 6 tabs (Tables, Query, Log, Migration, Seed, About)
   - [ ] Active tab highlights correctly
   - [ ] No visual glitches
   - [ ] Smooth transitions

5. **Database Context** (2 min)
   - [ ] Test with different databases
   - [ ] Logs show correct database context
   - [ ] Route params passed correctly

6. **Direct URL Access** (2 min)
   - [ ] Navigate directly to `/openedDB/:dbname/logs`
   - [ ] Log tab shows as active
   - [ ] LogView renders correctly

7. **Log Functionality** (3 min)
   - [ ] Log subscription works
   - [ ] Filter by level works (all, info, debug, error)
   - [ ] Real-time updates work
   - [ ] Unsubscribe on unmount

8. **Console & Errors** (2 min)
   - [ ] No console errors
   - [ ] No TypeScript errors
   - [ ] No runtime errors
   - [ ] Proper error handling

**DoD**:

- [ ] All 8 testing scenarios pass
- [ ] No bugs found during testing
- [ ] Edge cases handled correctly

### Phase 4: Build Verification (0.125 hour)

**DoD**:

- [ ] Run `npm run build` - verify no errors
- [ ] Run `npm run typecheck` - verify no type errors
- [ ] Check bundle size impact (< 5KB increase expected)
- [ ] Build time under 5 seconds

### Phase 5: Documentation (0.125 hour)

**DoD**:

- [ ] Update feature spec: `agent-docs/01-discovery/features/F-009-log-tab.md`
  - Mark all acceptance criteria as complete
  - Update status to "Completed"
- [ ] Update LLD: `agent-docs/05-design/03-modules/log-tab-integration.md`
  - Add implementation notes and completion status
- [ ] Update status board with completion evidence
- [ ] Verify all DoD items complete

## Quality Standards

### Functional-First Design

- ✅ No new components created (reuse existing LogView)
- ✅ Simple array addition to DATABASE_TABS
- ✅ Standard React Router nested route pattern

### Code Quality Rules

**TSDoc Required**:

- Update DatabaseTabHeader TSDoc from "5 tabs" to "6 tabs"
- Update DatabaseTabs TSDoc if needed

**No OOP**:

- Functional components with hooks pattern
- Props interfaces for type safety

### Risk Level

- **Complexity**: Low (simple integration)
- **Files Modified**: 2 files
- **Component Reuse**: 100% (LogView unchanged)
- **API Changes**: None

## Success Criteria

### Acceptance Criteria

1. **Tab Addition**
   - [ ] "Log" tab appears in database tab header
   - [ ] Positioned between "Query" and "Migration"
   - [ ] Uses IoTimeOutline icon
   - [ ] Label shows "Log"

2. **Navigation**
   - [ ] Clicking "Log" tab navigates to `/openedDB/:dbname/logs`
   - [ ] Active state styling applies correctly
   - [ ] URL updates in browser address bar

3. **Component Rendering**
   - [ ] LogView component renders correctly
   - [ ] Database name available from route params
   - [ ] Log functionality works (subscription, filtering)

4. **Integration**
   - [ ] Tab switching works smoothly
   - [ ] No visual glitches
   - [ ] Consistent with other tabs

## Definition of Done

- [ ] IoTimeOutline import added
- [ ] Logs tab added to DATABASE_TABS array
- [ ] Logs route added to DevTools.tsx
- [ ] All 8 testing scenarios pass
- [ ] Build passed with no errors
- [ ] TypeScript passed with no errors
- [ ] Bundle size impact acceptable (< 5KB)
- [ ] Feature spec updated
- [ ] Status board updated

## Estimated Time

**Total**: 0.5-1 hour

- Tab Header Update: 0.25 hour (15 min)
- Route Configuration: 0.25 hour (15 min)
- Testing & Verification: 0.25 hour (15 min)
- Build Verification: 0.125 hour (~8 min)
- Documentation: 0.125 hour (~8 min)
