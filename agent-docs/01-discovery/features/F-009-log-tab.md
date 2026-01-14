<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/features/feature.md

OUTPUT MAP (write to)
agent-docs/01-discovery/features/F-009-log-tab.md

NOTES
- Feature F-009: Log Tab Integration
- Adds Log tab to database tab navigation
- Simple integration of existing LogView component into database tabs
-->

# Feature F-009: Log Tab Integration

## 0) Meta

- **Feature ID**: F-009
- **Title**: Log Tab Integration
- **Status**: Completed
- **Priority**: P2 (Medium) - Navigation enhancement
- **Created**: 2026-01-14
- **Completed**: 2026-01-14
- **Requester**: User request via `/s1-iterationLead`

## 1) Problem Statement

### Current Issue

The current implementation has the log view (`LogView`) at a separate route `/logs/:dbname`, outside of the database tab context. This means:

1. **Inconsistent navigation**: Logs are not accessible from the database tab bar
2. **Separate route structure**: Users must navigate away from database context to view logs
3. **Missing tab**: No "Log" tab in the database tab navigation (Tables, Query, Migration, Seed, About)

### User Request

Add a new "Log" tab to the database tab navigation:

- **Icon**: `IoTimeOutline` from `react-icons/io5`
- **Position**: Between "Query" and "Migration" tabs
- **Route**: `/openedDB/:dbname/logs`
- **Component**: Reuse existing `LogView` component

## 2) Proposed Solution

### Architecture Changes

**Current Tab Structure:**

```
Database Tabs (5 tabs):
├── Tables → /openedDB/:dbname/tables
├── Query → /openedDB/:dbname/query
├── Migration → /openedDB/:dbname/migration
├── Seed → /openedDB/:dbname/seed
└── About → /openedDB/:dbname/about

Separate Route:
/logs/:dbname → LogView (outside database context)
```

**Target Tab Structure:**

```
Database Tabs (6 tabs):
├── Tables → /openedDB/:dbname/tables
├── Query → /openedDB/:dbname/query
├── Log → /openedDB/:dbname/logs (NEW)
├── Migration → /openedDB/:dbname/migration
├── Seed → /openedDB/:dbname/seed
└── About → /openedDB/:dbname/about

Existing /logs/:dbname route can be deprecated or kept as redirect
```

### Component Changes

**DatabaseTabHeader.tsx**:

```tsx
import { IoTimeOutline } from "react-icons/io5";

const DATABASE_TABS: DatabaseTab[] = [
  { path: "tables", label: "Tables", icon: <CiViewTable size={18} /> },
  { path: "query", label: "Query", icon: <BsFiletypeSql size={16} /> },
  { path: "logs", label: "Log", icon: <IoTimeOutline size={18} /> }, // NEW
  {
    path: "migration",
    label: "Migration",
    icon: <MdOutlineQueryBuilder size={18} />,
  },
  { path: "seed", label: "Seed", icon: <FaSeedling size={16} /> },
  { path: "about", label: "About", icon: <FaInfoCircle size={16} /> },
];
```

**DevTools.tsx**:

```tsx
// Inside /openedDB/:dbname route, add logs route:
<Route path="logs" element={<LogView />} />

// Before Migration tab to maintain order
```

## 3) Functional Requirements

### FR-LOGTAB-001: Log Tab in Database Navigation

- Add "Log" tab to database tab header
- Position between "Query" and "Migration" tabs
- Use `IoTimeOutline` icon from `react-icons/io5`
- Navigate to `/openedDB/:dbname/logs` when clicked

### FR-LOGTAB-002: Route Integration

- Add `/openedDB/:dbname/logs` route inside DatabaseTabs route
- Render existing `LogView` component
- Maintain database context (dbname available from route params)

### FR-LOGTAB-003: Active State Styling

- Tab highlights when active (border-primary-600, text-primary-600)
- Inactive tabs show hover effects
- Consistent with existing tab styling

### FR-LOGTAB-004: Reuse Existing Component

- Use existing `LogView` component from `@/devtools/components/LogTab/LogView`
- No modifications to LogView required
- LogView gets dbname from route params via `useParams`

## 4) Non-Functional Requirements

### NFR-LOGTAB-001: Code Quality

- Follow existing component patterns
- Maintain TypeScript strict mode compliance
- Use consistent icon sizing (size={18} for consistency)

### NFR-LOGTAB-002: Visual Consistency

- Match existing tab styling
- Use F-007 theme tokens (primary-600, secondary-500, etc.)
- Consistent spacing and alignment

### NFR-LOGTAB-003: Backward Compatibility

- Keep existing `/logs/:dbname` route (optional: redirect to new route)
- No breaking changes to LogView component
- Existing bookmarks/links still work

## 5) Out of Scope

- Modifying LogView component behavior
- Changing log filtering or display logic
- Database-level log operations
- Removing the separate `/logs/:dbname` route (can be deprecated later)

## 6) Dependencies

### Blocks

- None

### Depends On

- F-002: Database Tab Navigation (complete) - provides tab infrastructure
- TASK-09: Log Streaming & Ring Buffer (complete) - provides LogView component

### Related Features

- F-002: Database Tab Navigation (complete)
- TASK-09: Log Streaming (complete)

## 7) Success Criteria

### Acceptance Criteria

1. **Tab Addition**
   - [x] "Log" tab appears in database tab header
   - [x] Positioned between "Query" and "Migration"
   - [x] Uses `IoTimeOutline` icon
   - [x] Label shows "Log"

2. **Navigation**
   - [x] Clicking "Log" tab navigates to `/openedDB/:dbname/logs`
   - [x] Active state styling applies correctly
   - [x] URL updates in browser address bar

3. **Component Rendering**
   - [x] LogView component renders correctly
   - [x] Database name available from route params
   - [x] Log functionality works (subscription, filtering)

4. **Integration**
   - [x] Tab switching works smoothly
   - [x] No visual glitches
   - [x] Consistent with other tabs

## 8) Open Questions

1. **Separate /logs/:dbname route**: Should we keep the old route or redirect to the new tab route?
   - **Decision**: Keep old route for now, can redirect later if needed

2. **Tab order**: Is the position between Query and Migration correct?
   - **Decision**: Yes, as requested by user

## 9) Implementation Notes

### Files to Modify

1. **DatabaseTabHeader.tsx**:
   - Add import: `import { IoTimeOutline } from "react-icons/io5";`
   - Add tab object to DATABASE_TABS array after "query"

2. **DevTools.tsx**:
   - Add logs route inside DatabaseTabs route
   - Place before "migration" route to maintain order

### Implementation Steps

1. Update `DATABASE_TABS` array in DatabaseTabHeader.tsx
2. Add logs route in DevTools.tsx
3. Test tab navigation and rendering
4. Build verification

### Route Order

The route inside DatabaseTabs must be in correct order:

```tsx
<Route path="/openedDB/:dbname" element={<DatabaseTabs />}>
  <Route index element={<Navigate to="tables" replace />} />

  <Route path="tables" element={<TablesTab />}>
    <Route path=":tableName" element={<TableDetail />} />
  </Route>

  <Route path="query" element={<QueryTab ... />} />
  <Route path="logs" element={<LogView />} />          {/* NEW */}
  <Route path="migration" element={<MigrationTab />} />
  <Route path="seed" element={<SeedTab />} />
  <Route path="about" element={<AboutTab />} />
</Route>
```

## 10) Testing Considerations

### Manual Testing

1. Click "Log" tab → should navigate to `/openedDB/:dbname/logs`
2. Check active state styling
3. Verify LogView renders correctly
4. Test tab switching between all tabs
5. Test with different databases

### Build Verification

- `npm run build` passes
- `npm run typecheck` passes
- No console errors

## 11) Effort Estimation

- **Estimated Time**: 0.5-1 hour
- **Complexity**: Low (simple integration)
- **Files to Change**: 2 files
- **Risk**: Low (uses existing component)
