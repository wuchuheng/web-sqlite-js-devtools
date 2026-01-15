# TASK-330: Separator Line Color Consistency (Visual Fix)

## Metadata

- **Task ID**: TASK-330
- **Feature**: Visual Fix - OPFS Browser Separator Line
- **Priority**: P1 (High) - Visual Polish
- **Estimated**: 0.5 hours
- **Status**: In Progress
- **Dependencies**: None
- **Boundary**: `src/devtools/components/Shared/ResizeHandle.tsx`

## Objective

Fix separator line color to be consistent gray instead of blue:

1. Change ResizeHandle colors from blue (`bg-blue-300` / `bg-blue-200`) to gray
2. Add visible gray separator line between folder tree and preview area
3. Ensure consistent gray color scheme across the divider

## Boundary

- **Files to modify**: `src/devtools/components/Shared/ResizeHandle.tsx`
- **Files to create**: None
- **Files to delete**: None
- **No changes to**: Service layer, types, other components

## Current State Analysis

**Current ResizeHandle.tsx** (line 149):

```tsx
className={`
  absolute top-0 bottom-0 z-10 transition-all duration-150
  ${position === "left" ? "-left-2" : "-right-2"}
  ${isDragging ? "w-2 bg-blue-300" : "w-1 hover:bg-blue-200 hover:w-2"}
`}
```

**Issue**: Uses blue colors (`bg-blue-300`, `bg-blue-200`) for the separator line, which doesn't match the gray color scheme of the OPFS browser interface.

## Implementation Plan

### Phase 1: Update Separator Colors (15 min)

1. Change `bg-blue-300` to `bg-gray-300` (dragging state)
2. Change `bg-blue-200` to `bg-gray-200` (hover state)
3. Verify gray colors match the overall UI theme

### Phase 2: Testing (15 min)

- Visual test: Verify separator line is gray (not blue)
- Test hover state shows gray highlight
- Test drag state shows darker gray
- ESLint verification
- Build verification

## Definition of Done

- [ ] Separator colors changed from blue to gray
- [ ] Dragging state uses `bg-gray-300`
- [ ] Hover state uses `bg-gray-200`
- [ ] Gray colors match UI theme
- [ ] ESLint passed (no new warnings)
- [ ] Build passed (no errors)

## Functional-First Design

This task uses only functional React patterns:

- Functional components
- No side effects
- CSS className updates only

## Code Quality Requirements

- Follow S8 quality rules
- Functional components
- No side effects
- Type-safe with TypeScript

## Implementation Notes

**className Update** (line ~149):

```tsx
// BEFORE:
${isDragging ? "w-2 bg-blue-300" : "w-1 hover:bg-blue-200 hover:w-2"}

// AFTER:
${isDragging ? "w-2 bg-gray-300" : "w-1 hover:bg-gray-200 hover:w-2"}
```

**Explanation**:

- `bg-gray-300` - Medium gray for dragging state (was blue-300)
- `bg-gray-200` - Light gray for hover state (was blue-200)
- Matches existing gray color scheme used elsewhere in OPFS browser

## Testing Strategy

Manual testing only:

1. Load OPFS browser and verify separator line is gray
2. Hover over separator and verify gray highlight
3. Drag separator and verify darker gray
4. ESLint verification
5. Build verification

## Rollback Strategy

Instant rollback - revert className change if issues arise.
