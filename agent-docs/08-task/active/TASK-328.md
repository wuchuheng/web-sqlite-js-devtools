# TASK-328: Tree Line Styling (F-015)

## Metadata

- **Task ID**: TASK-328
- **Feature**: F-015: OPFS Tree Visual Enhancements
- **Priority**: P0 (Blocker)
- **Estimated**: 0.5 hours
- **Status**: In Progress
- **Dependencies**: TASK-326, TASK-327
- **Boundary**: `src/devtools/components/OPFSBrowser/TreeLines.tsx`

## Objective

Update tree line styling to use dotted lines with lighter color:

1. Change className from `bg-gray-200` to `border-dotted border-gray-300`
2. Verify dotted lines display correctly
3. Verify color is lighter (gray-300 vs gray-200)

## Boundary

- **Files to modify**: `src/devtools/components/OPFSBrowser/TreeLines.tsx`
- **Files to create**: None
- **Files to delete**: None
- **No changes to**: Service layer, types, other components

## Upstream Documentation

- Feature spec: `agent-docs/01-discovery/features/F-015-opfs-tree-enhancements.md`
- HLD Section 20: `agent-docs/03-architecture/01-hld.md`
- LLD Section 13: `agent-docs/05-design/03-modules/opfs-browser.md`
- Roadmap Phase 12: `agent-docs/07-taskManager/01-roadmap.md`

## Current State Analysis

**Current TreeLines.tsx** (line 62):

```tsx
className =
  "tree-line-vertical absolute top-0 w-px bg-gray-200 pointer-events-none";
```

**Issue**: Tree lines use solid background color (`bg-gray-200`) instead of dotted border style.

## Implementation Plan

### Phase 1: Update Tree Line Styling (15 min)

1. Change `bg-gray-200` to `border-dotted border-gray-300`
2. Remove `w-px` (1px width) and add border width class
3. Update className to use border styling

### Phase 2: Testing (15 min)

- Verify dotted lines display correctly
- Verify color is lighter (gray-300 vs gray-200)
- ESLint verification
- Build verification

## Definition of Done

- [ ] Tree line className updated to border-dotted border-gray-300
- [ ] Dotted lines display correctly
- [ ] Color is lighter (gray-300 vs gray-200)
- [ ] ESLint passed (no new warnings)
- [ ] Build passed (no errors)

## Functional-First Design

This task uses only functional React patterns:

- Functional components
- No side effects
- CSS class updates only

## Code Quality Requirements

- Follow S8 quality rules
- Functional components
- No side effects
- Type-safe with TypeScript

## Implementation Notes

**className Update** (line 62):

```tsx
// BEFORE:
className =
  "tree-line-vertical absolute top-0 w-px bg-gray-200 pointer-events-none";

// AFTER:
className =
  "tree-line-vertical absolute top-0 border-l border-dotted border-gray-300 pointer-events-none";
```

**Explanation**:

- `border-l` - Left border
- `border-dotted` - Dotted line style
- `border-gray-300` - Lighter color than gray-200

## Testing Strategy

Manual testing only:

1. Load OPFS browser and verify tree lines are dotted
2. Verify lines are lighter color (gray-300)
3. ESLint verification
4. Build verification

## Rollback Strategy

Instant rollback - revert className change if issues arise.
