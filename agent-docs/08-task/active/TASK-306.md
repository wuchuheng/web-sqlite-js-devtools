<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-306.md

NOTES
- Functional-first design (React hooks, no classes)
- All functions > 5 lines need numbered three-phase comments
- Exported/public functions need TSDoc comments
-->

# TASK-306: Database Refresh Coordination (F-010)

## 0) Meta

- **Task ID**: TASK-306
- **Feature**: F-010 - Database Refresh Coordination
- **Status**: Draft
- **Created**: 2026-01-14
- **Estimated**: 1-2 hours
- **Priority**: P2 (Medium)
- **Dependencies**: F-002, F-008, TASK-09

## 1) Purpose

Create a React Context for coordinating database list refresh between the sidebar and main page (`/openedDB` route). When refresh is triggered from either location, both components should update to show consistent data.

## 2) Upstream Documents

- **Spec**: `agent-docs/00-control/00-spec.md`
- **Feature**: `agent-docs/01-discovery/features/F-010-database-refresh-coordination.md`
- **HLD**: `agent-docs/03-architecture/01-hld.md` (Section 15)
- **LLD**: `agent-docs/05-design/03-modules/database-refresh.md`
- **Roadmap**: `agent-docs/07-taskManager/01-roadmap.md`

## 3) Boundary

### Files

| Type   | Path                                                    | Purpose                                         |
| ------ | ------------------------------------------------------- | ----------------------------------------------- |
| NEW    | `src/devtools/contexts/DatabaseRefreshContext.tsx`      | React Context for shared refresh state          |
| MODIFY | `src/devtools/DevTools.tsx`                             | Wrap DevToolsContent with provider              |
| MODIFY | `src/devtools/components/Sidebar/DatabaseList.tsx`      | Consume context, add refresh button (LEFT side) |
| MODIFY | `src/devtools/components/OpenedDBList/OpenedDBList.tsx` | Consume context, use refreshVersion             |

### Out of Scope

- Modifying service layer (uses existing `getDatabases()`)
- Adding loading indicators (auto-sync, no indicator)
- Keyboard shortcuts (separate feature)
- Auto-refresh on interval (not requested)

## 4) Implementation Design

### 4.1 Context API (Functional Design)

```tsx
// DatabaseRefreshContext.tsx
export interface DatabaseRefreshContextValue {
  triggerRefresh: () => void;
  refreshVersion: number;
}

export const DatabaseRefreshContext =
  createContext<DatabaseRefreshContextValue | null>(null);

export const DatabaseRefreshProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const triggerRefresh = useCallback(() => {
    setRefreshVersion((prev) => prev + 1);
  }, []);
  const value = useMemo(
    () => ({ triggerRefresh, refreshVersion }),
    [triggerRefresh, refreshVersion],
  );

  return (
    <DatabaseRefreshContext.Provider value={value}>
      {children}
    </DatabaseRefreshContext.Provider>
  );
};

export const useDatabaseRefresh = (): DatabaseRefreshContextValue => {
  const context = useContext(DatabaseRefreshContext);
  if (!context) {
    throw new Error(
      "useDatabaseRefresh must be used within DatabaseRefreshProvider",
    );
  }
  return context;
};
```

### 4.2 Component Integration Pattern

**DevTools.tsx**: Wrap existing DevToolsContent div with provider

**DatabaseList.tsx**:

- Consume context via `useDatabaseRefresh()`
- Add `refreshVersion` to dependency array of `useInspectedWindowRequest`
- Add refresh button to header (LEFT side, before SidebarLink)
- Use `IoMdRefresh` icon (16px)
- Styling: `text-secondary-500 hover:text-primary-600`

**OpenedDBList.tsx**:

- Consume context via `useDatabaseRefresh()`
- Add `refreshVersion` to dependency array of `useInspectedWindowRequest`
- Pass `triggerRefresh` to Header (existing prop interface)

## 5) Functional Requirements

### FR-306-001: Context Creation

- Create `DatabaseRefreshContext` at `src/devtools/contexts/DatabaseRefreshContext.tsx`
- Define `DatabaseRefreshContextValue` interface with `triggerRefresh` and `refreshVersion`
- Implement `DatabaseRefreshProvider` with `useState`, `useCallback`, `useMemo`
- Implement `useDatabaseRefresh` hook with error guard
- Export context, provider, and hook

### FR-306-002: DevTools Integration

- Import `DatabaseRefreshProvider` in `DevTools.tsx`
- Wrap DevToolsContent return JSX with provider
- Place provider before Sidebar/main split (at root of DevToolsContent)

### FR-306-003: Sidebar Integration

- Import `useDatabaseRefresh` in `DatabaseList.tsx`
- Import `IoMdRefresh` icon from `react-icons/io`
- Consume context: `const { triggerRefresh, refreshVersion } = useDatabaseRefresh()`
- Add `refreshVersion` to `useInspectedWindowRequest` dependency array
- Add refresh button to header (LEFT side of "Opened DB" text)
- Button layout: flex container with button before SidebarLink
- Button styling: `text-secondary-500 hover:text-primary-600`
- Button size: 16px icon
- ARIA label: "Refresh database list"

### FR-306-004: Main Page Integration

- Import `useDatabaseRefresh` in `OpenedDBList.tsx`
- Consume context: `const { triggerRefresh, refreshVersion } = useDatabaseRefresh()`
- Add `refreshVersion` to `useInspectedWindowRequest` dependency array
- Pass `triggerRefresh` to Header (unchanged prop interface)

### FR-306-005: Bidirectional Synchronization

- Clicking main page refresh → sidebar updates
- Clicking sidebar refresh → main page updates
- Both locations show consistent data
- Rapid clicks debounced via React state batching

## 6) Non-Functional Requirements

### NFR-306-001: Code Quality

- **Functional Design**: No classes, use React hooks
- **TSDoc**: Exported functions have TSDoc comments
- **Three-Phase Comments**: Functions > 5 lines have numbered comments
- **TypeScript**: Strict mode, no `any` types

### NFR-306-002: Performance

- `useCallback` for `triggerRefresh` (stable reference)
- `useMemo` for context value (prevent re-renders)
- Minimal bundle impact (< 5KB)

### NFR-306-003: Visual Consistency

- Icon: `IoMdRefresh` from `react-icons/io`
- Size: 16px (sidebar), 20px (main page)
- Hover: `text-secondary-500` → `text-primary-600`
- Position: LEFT side of "Opened DB" header

## 7) Testing Requirements

### Manual Testing Scenarios

1. Click main page refresh → verify sidebar updates
2. Click sidebar refresh → verify main page updates
3. Test collapsed sidebar (button visible, works)
4. Test expanded sidebar (button visible, works)
5. Test error state (both refresh buttons work)
6. Test empty state (both refresh buttons work)
7. Test rapid clicks (debounced, single refresh)
8. Verify no console errors
9. Verify no TypeScript errors

### Build Verification

- `npm run build` - no errors
- `npm run typecheck` - no errors
- Bundle size increase < 5KB

## 8) Definition of Done

- [ ] Context file created at `src/devtools/contexts/DatabaseRefreshContext.tsx`
- [ ] Context exports: Provider, Context, useDatabaseRefresh hook
- [ ] DevTools.tsx wraps DevToolsContent with provider
- [ ] DatabaseList.tsx consumes context
- [ ] DatabaseList.tsx has refresh button on LEFT side of header
- [ ] OpenedDBList.tsx consumes context
- [ ] Both components use refreshVersion in dependency array
- [ ] All exported functions have TSDoc comments
- [ ] Functions > 5 lines have three-phase numbered comments
- [ ] Manual testing: bidirectional refresh works
- [ ] Manual testing: collapsed sidebar button works
- [ ] Manual testing: expanded sidebar button works
- [ ] Manual testing: rapid clicks debounced
- [ ] Build passes with no errors
- [ ] TypeScript passes with no errors
- [ ] Feature spec marked complete
- [ ] Status doc updated with completion evidence

## 9) Implementation Phases

### Phase 1: Context Creation (0.5 hour)

- Create `src/devtools/contexts/DatabaseRefreshContext.tsx`
- Define interface with TSDoc
- Implement Provider component
- Implement useDatabaseRefresh hook
- Export all symbols

### Phase 2: DevTools Integration (0.25 hour)

- Import provider in DevTools.tsx
- Wrap DevToolsContent return

### Phase 3: Sidebar Integration (0.5 hour)

- Import hook and icon in DatabaseList.tsx
- Consume context
- Add refreshVersion to dependency array
- Add refresh button (LEFT side)

### Phase 4: Main Page Integration (0.25 hour)

- Import hook in OpenedDBList.tsx
- Consume context
- Add refreshVersion to dependency array
- Pass triggerRefresh to Header

### Phase 5: Testing & Build (0.5 hour)

- Manual testing (8 scenarios)
- Build verification
- TypeScript verification

### Phase 6: Documentation (0.125 hour)

- Update feature spec
- Update LLD with completion status
- Update status board

## 10) Risk Assessment

| Risk                    | Probability | Impact | Mitigation                          |
| ----------------------- | ----------- | ------ | ----------------------------------- |
| Context placement wrong | Low         | Medium | HLD specifies DevToolsContent root  |
| Button position issue   | Low         | Low    | User explicitly requested LEFT side |
| Dependency array bug    | Low         | Medium | Follow existing pattern in codebase |
| Bundle size increase    | Low         | Low    | Context pattern is lightweight      |

## 11) Open Questions

None - all resolved in upstream docs.

## 12) References

- Feature F-010 spec: `agent-docs/01-discovery/features/F-010-database-refresh-coordination.md`
- HLD Section 15: `agent-docs/03-architecture/01-hld.md` (lines 400+)
- LLD module: `agent-docs/05-design/03-modules/database-refresh.md`
- React Context pattern: Standard React API

## 13) Functional-First Design

This spec uses **functional-first design**:

- **No classes** - All components are functional components
- **React hooks** - useState, useCallback, useContext, useMemo
- **TypeScript interfaces** - For type safety
- **TSDoc comments** - For exported/public functions
- **Three-phase comments** - For functions > 5 lines

**Rationale**: React functional components with hooks are the established pattern in this codebase. Classes are not used for React components. Context API is a standard React pattern for shared state.
