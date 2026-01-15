# TASK-323: File Tree Enhancements - Icon Visibility (F-014)

## Metadata

- **Task ID**: TASK-323
- **Feature**: F-014: OPFS UI Visual Redesign
- **Priority**: P1 (High)
- **Estimated**: 0.5 hours
- **Status**: In Progress
- **Dependencies**: F-012 ✅ (FileTree must exist)
- **Boundary**: `src/devtools/components/OPFSBrowser/FileTree.tsx`

## Objective

Make action icons (download, delete) always visible in the FileTree, removing the hover-only behavior:

1. Change `opacity-0 group-hover:opacity-100` to `opacity-100`
2. Remove hover-only transition behavior
3. Ensure icons remain positioned correctly

## Boundary

- **Files to modify**: `src/devtools/components/OPFSBrowser/FileTree.tsx` (FileTreeItem component, line ~243)
- **Files to create**: None
- **Files to delete**: None
- **No changes to**: Service layer, types, other components
- **Note**: FileNode.tsx exists but is not actively used (OPFSGallery uses FileTree)

## Upstream Documentation

- Feature spec: `agent-docs/01-discovery/features/F-014-opfs-ui-redesign.md`
- HLD Section 19: `agent-docs/03-architecture/01-hld.md`
- LLD Section 12: `agent-docs/05-design/03-modules/opfs-browser.md`
- Roadmap Phase 11: `agent-docs/07-taskManager/01-roadmap.md`

## Current State Analysis

**Current FileTree.tsx** (FileTreeItem component, line ~243):

```tsx
{/* Action Buttons (files only, TASK-313) */}
{!isDirectory && (
  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
    {/* Download Button */}
    <button onClick={...} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed">
      <FaDownload size={12} />
    </button>
    {/* Delete Button */}
    <button onClick={handleDelete} className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded">
      <IoMdTrash size={14} />
    </button>
  </div>
)}
```

**Behavior**: Icons are hidden by default (`opacity-0`), shown on hover (`group-hover:opacity-100`)

## Implementation Plan

### Phase 1: Update Icon Visibility (15 min)

1. Locate action icons container in FileTree.tsx FileTreeItem component (line ~243)
2. Change className from:
   - FROM: `"flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"`
   - TO: `"flex items-center gap-1 opacity-100"`
3. Update JSDoc comment to reference TASK-323
4. Verify icons remain positioned correctly (flex gap-1 maintains spacing)

### Phase 2: Testing (15 min)

- Verify icons are always visible for files
- Verify icons remain clickable
- Verify icon hover states (button background colors) still work
- ESLint verification
- Build verification

## Definition of Done

- [x] Action icons className updated to `opacity-100` (always visible)
- [x] Hover-only behavior removed (`group-hover:opacity-100` removed)
- [x] Transition removed (`transition-opacity duration-150` removed)
- [x] JSDoc comment updated with TASK-323 reference
- [x] Icons remain positioned correctly (flex layout unchanged)
- [x] Icons remain clickable
- [x] Icon hover states still work (button bg colors on hover)
- [x] ESLint passed with no new warnings
- [x] TypeScript compilation successful (pre-existing errors in other files unrelated to this task)

## Functional-First Design

This task uses only functional React patterns:

- Functional component with props
- No class components or OOP patterns
- CSS classes for styling (Tailwind)
- No side effects from visibility change

## Code Quality Requirements

- Simple className change
- Update JSDoc comment with task reference
- Follow S8 quality rules (functional components, no side effects)
- Maintain accessibility (buttons keep aria-label, title attributes)

## Component Change

```tsx
// BEFORE (line ~243)
<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">

// AFTER
<div className="flex items-center gap-1 opacity-100">
```

## Styling Changes

| Element        | Before                                                              | After         |
| -------------- | ------------------------------------------------------------------- | ------------- |
| Icon Container | `opacity-0 group-hover:opacity-100 transition-opacity duration-150` | `opacity-100` |

## Testing Strategy

Manual testing only (visual change):

1. Expand FileTree with files - verify download/delete icons always visible
2. Test download button click - verify works without hover
3. Test delete button click - verify works without hover
4. Test button hover states - verify background colors appear on hover
5. ESLint verification
6. Build verification

## Rollback Strategy

Instant rollback - revert className change if issues arise.
