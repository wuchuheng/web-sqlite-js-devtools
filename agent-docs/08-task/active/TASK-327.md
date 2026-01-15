# TASK-327: Expansion State Update (F-015)

## Metadata

- **Task ID**: TASK-327
- **Feature**: F-015: OPFS Tree Visual Enhancements
- **Priority**: P0 (Blocker)
- **Estimated**: 0.5 hours
- **Status**: In Progress
- **Dependencies**: TASK-326
- **Boundary**: `src/devtools/components/OPFSBrowser/FileTree.tsx`

## Objective

Update expansion state to auto-expand root directories on load:

1. Change `useState(false)` to `useState(level === 0)`
2. Add useEffect hook for auto-loading root children
3. Verify dependency array prevents infinite loops

## Boundary

- **Files to modify**: `src/devtools/components/OPFSBrowser/FileTree.tsx`
- **Files to create**: None
- **Files to delete**: None
- **No changes to**: Service layer, types, other components

## Upstream Documentation

- Feature spec: `agent-docs/01-discovery/features/F-015-opfs-tree-enhancements.md`
- HLD Section 20: `agent-docs/03-architecture/01-hld.md`
- LLD Section 13: `agent-docs/05-design/03-modules/opfs-browser.md`
- Roadmap Phase 12: `agent-docs/07-taskManager/01-roadmap.md`

## Current State Analysis

**Current FileTree.tsx** (line 190):

```tsx
const [isExpanded, setIsExpanded] = useState(false);
```

**Issue**: Root directories start collapsed, requiring user to click to expand.

## Implementation Plan

### Phase 1: Update Expansion State (15 min)

1. Change `useState(false)` to `useState(level === 0)`
2. This makes root-level items (level 0) start expanded
3. Child directories (level > 0) start collapsed

### Phase 2: Add Auto-Load Effect (15 min)

1. Add useEffect that calls loadChildren when isExpanded is true and hasLoaded is false
2. Dependency array: `[isExpanded, hasLoaded, isDirectory]`
3. This effect runs for root directories on mount

### Phase 3: Testing (15 min)

- Test root directories (level 0) auto-expand on load
- Test child directories (level > 0) remain collapsed
- Test expand/collapse behavior still works
- Test lazy-loading preserved for child directories
- ESLint verification
- Build verification

## Definition of Done

- [ ] Expansion state updated to useState(level === 0)
- [ ] Auto-load useEffect added with correct dependencies
- [ ] Root directories auto-expand on load
- [ ] Child directories remain collapsed
- [ ] Expand/collapse behavior preserved
- [ ] Lazy-loading preserved for child directories
- [ ] ESLint passed (no new warnings)
- [ ] Build passed (no errors)

## Functional-First Design

This task uses only functional React patterns:

- useState hook for state
- useEffect hook for side effects
- Functional components
- No class components or OOP patterns

## Code Quality Requirements

- Follow S8 quality rules
- Functional components with hooks
- Three-phase comments for useEffect
- Proper dependency array to prevent infinite loops
- Type-safe with TypeScript

## Implementation Notes

**useState Update** (line ~190):

```tsx
// BEFORE:
const [isExpanded, setIsExpanded] = useState(false);

// AFTER:
const [isExpanded, setIsExpanded] = useState(level === 0);
```

**useEffect Addition** (after useState declarations, line ~195):

```tsx
// Auto-load root directories on mount
useEffect(() => {
  if (isExpanded && !hasLoaded && isDirectory) {
    loadChildren();
  }
}, [isExpanded, hasLoaded, isDirectory, loadChildren]);
```

**Dependency Array Notes**:

- `isExpanded`: Triggers load when expanded
- `hasLoaded`: Prevents duplicate loads
- `isDirectory`: Only loads directories
- `loadChildren`: Stable function (useCallback)

## Testing Strategy

Manual testing only:

1. Load OPFS browser and verify root directories are expanded
2. Verify child directories are collapsed
3. Click child directory and verify it expands
4. Click root directory to collapse, verify it works
5. ESLint verification
6. Build verification

## Rollback Strategy

Instant rollback - revert useState change and useEffect addition if issues arise.
