<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-309.md

NOTES
- Functional-first design (CSS-only implementation)
- All components > 5 lines need numbered three-phase comments
- Exported/public functions need TSDoc comments
-->

# TASK-309: Guided Tree Lines Component (F-012)

## 0) Meta

- **Task ID**: TASK-309
- **Feature**: F-012 - OPFS Browser Enhancement
- **Status**: Draft
- **Created**: 2026-01-15
- **Estimated**: 2 hours
- **Priority**: P1 (High) - Core Feature Completion
- **Dependencies**: TASK-10 (OPFS File Browser)

## 1) Purpose

Create a reusable TreeLines component that renders vertical and horizontal guide lines for hierarchical file tree displays, matching VSCode's file tree visual style. This improves visual hierarchy and makes it easier to understand the parent-child relationships in the OPFS file browser.

## 2) Upstream Documents

- **Spec**: `agent-docs/00-control/00-spec.md`
- **Feature**: `agent-docs/01-discovery/features/F-012-opfs-browser-enhancement.md`
- **HLD**: `agent-docs/03-architecture/01-hld.md`
- **LLD**: `agent-docs/05-design/03-modules/opfs-browser-enhancement.md` (if exists)
- **Roadmap**: `agent-docs/07-taskManager/01-roadmap.md` (Phase 9, F-012)
- **Task Catalog**: `agent-docs/07-taskManager/02-task-catalog.md` (TASK-309)

## 3) Boundary

### Files

| Type   | Path                                                | Purpose                              |
| ------ | --------------------------------------------------- | ------------------------------------ |
| CREATE | `src/devtools/components/OPFSBrowser/TreeLines.tsx` | TreeLines component with CSS styling |
| UPDATE | `src/devtools/components/OPFSBrowser/FileTree.tsx`  | Integrate TreeLines component        |

### Out of Scope

- Tree node expansion/collapse (already exists)
- File icons (already exists)
- Selection highlighting (already exists)
- Drag-and-drop (separate feature)

## 4) Implementation Design

### Component: `TreeLines.tsx`

#### Props Interface

```typescript
interface TreeLinesProps {
  /** Depth level in the tree (0 = root level, no lines) */
  depth: number;
  /** Whether this is the last child (affects line rendering) */
  isLast?: boolean;
  /** Whether sidebar is collapsed (lines hidden when < 200px) */
  isCollapsed?: boolean;
}
```

#### Component Structure

```typescript
/**
 * TreeLines component for visual hierarchy in file trees
 *
 * Renders vertical and horizontal guide lines matching VSCode's file tree style.
 * Lines are hidden at root level (depth = 0) and when sidebar is collapsed.
 *
 * @param props - TreeLinesProps
 * @returns React component
 *
 * @example
 * <TreeLines depth={2} isLast={false} />
 */
export const TreeLines: React.FC<TreeLinesProps> = ({
  depth,
  isLast = false,
  isCollapsed = false,
}) => {
  // 1. Don't render lines at root level
  // 2. Don't render lines when sidebar collapsed
  // 3. Render vertical line for parent connection
  // 4. Render horizontal line for child connection
  // 5. Adjust for last child (no vertical line after)
};
```

#### CSS Styling Strategy

**CSS-in-JS Approach** (using Tailwind + inline styles):

```typescript
import React from 'react';

export const TreeLines: React.FC<TreeLinesProps> = ({ depth, isLast = false, isCollapsed = false }) => {
  // Don't render at root level or when collapsed
  if (depth === 0 || isCollapsed) {
    return null;
  }

  return (
    <div
      className="tree-lines-container"
      style={{
        position: 'relative',
        width: '12px',
        height: '100%',
        flexShrink: 0,
      }}
    >
      {/* Vertical line (parent connection) */}
      {!isLast && (
        <div
          className="tree-line-vertical"
          style={{
            position: 'absolute',
            left: '0',
            top: '0',
            bottom: '0',
            width: '1px',
            backgroundColor: '#e5e7eb', // gray-200
          }}
        />
      )}

      {/* Horizontal line (child connection) */}
      <div
        className="tree-line-horizontal"
        style={{
          position: 'absolute',
          left: '0',
          top: '50%',
          width: '12px',
          height: '1px',
          backgroundColor: '#e5e7eb', // gray-200
        }}
      />
    </div>
  );
};
```

**Alternative: CSS Module Approach** (recommended for better maintainability):

```css
/* TreeLines.module.css */
.treeLinesContainer {
  position: relative;
  width: 12px;
  height: 100%;
  flex-shrink: 0;
}

.verticalLine {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #e5e7eb; /* gray-200 */
}

.horizontalLine {
  position: absolute;
  left: 0;
  top: 50%;
  width: 12px;
  height: 1px;
  background-color: #e5e7eb; /* gray-200 */
}

.lastChild .verticalLine {
  /* Extend horizontal line from vertical for last child */
  height: 50%;
}
```

#### Responsive Behavior

```typescript
// Hide lines when sidebar is collapsed (< 200px)
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

// In parent component (FileTree.tsx):
<TreeLines
  depth={depth}
  isLast={index === entries.length - 1}
  isCollapsed={isSidebarCollapsed}
/>
```

### Integration: `FileTree.tsx`

#### Update FileTree Component

```typescript
import { TreeLines } from './TreeLines';

interface FileTreeProps {
  entries: OpfsFileEntry[];
  depth?: number;
  isLast?: boolean;
  isCollapsed?: boolean;
}

export const FileTree: React.FC<FileTreeProps> = ({
  entries,
  depth = 0,
  isLast = false,
  isCollapsed = false,
}) => {
  return (
    <div className="flex flex-col">
      {entries.map((entry, index) => (
        <div key={entry.path} className="flex items-start">
          {/* Render tree lines for nested items */}
          {depth > 0 && (
            <TreeLines
              depth={depth}
              isLast={isLast}
              isCollapsed={isCollapsed}
            />
          )}

          {/* Render file node */}
          <FileNode entry={entry} depth={depth} />

          {/* Render children recursively */}
          {entry.type === 'directory' && entry.isExpanded && entry.children && (
            <FileTree
              entries={entry.children}
              depth={depth + 1}
              isLast={index === entries.length - 1}
              isCollapsed={isCollapsed}
            />
          )}
        </div>
      ))}
    </div>
  );
};
```

#### Layout Adjustments

```typescript
// Update FileNode to account for tree lines
<div className="flex items-center" style={{ paddingLeft: `${depth * 12}px` }}>
  {/* Tree lines rendered by parent */}
  <span className="mr-2">{icon}</span>
  <span>{entry.name}</span>
</div>
```

## 5) Functional Requirements

### FR-309-001: Vertical Line Rendering

**Requirement**: Render vertical line connecting parent to all children except the last

**Implementation**:

- Use `::before` pseudo-element or absolute positioned div
- Position: `left: 0`, `top: 0`, `bottom: 0`
- Width: `1px`
- Color: `#e5e7eb` (Tailwind gray-200)
- Not rendered for last child
- Not rendered at root level (depth = 0)

### FR-309-002: Horizontal Line Rendering

**Requirement**: Render horizontal line connecting each child to the vertical line

**Implementation**:

- Use `::before` pseudo-element or absolute positioned div
- Position: `left: 0`, `top: 50%`
- Width: `12px`
- Height: `1px`
- Color: `#e5e7eb` (Tailwind gray-200)
- Rendered for all children
- Not rendered at root level (depth = 0)

### FR-309-003: Last Child Adjustment

**Requirement**: Extend horizontal line from vertical line for last child, no vertical line after

**Implementation**:

- For last child: vertical line height = `50%` (from top to middle)
- Horizontal line still connects to middle
- Visual appearance: L-shaped connector

### FR-309-004: Responsive Hiding

**Requirement**: Hide lines when sidebar is collapsed (< 200px width)

**Implementation**:

- Pass `isCollapsed` prop to TreeLines component
- Return `null` when `isCollapsed === true`
- Parent component tracks sidebar width
- Use CSS media query or state-based class

### FR-309-005: VSCode-Style Appearance

**Requirement**: Match VSCode's file tree visual style

**Visual Characteristics**:

- Thin lines (1px)
- Gray color (#e5e7eb - gray-200)
- No shadows or borders
- Clean, minimal appearance
- Consistent spacing (12px indentation per level)

### FR-309-006: Root Level Handling

**Requirement**: Don't render lines at root level (depth = 0)

**Implementation**:

- Check `depth === 0` in TreeLines component
- Return `null` if depth is 0
- Only render for depth > 0

## 6) Non-Functional Requirements

### NFR-309-001: Performance

- CSS-only implementation (no JS layout calculations)
- No re-renders on hover/interaction
- Minimal DOM nodes (2 divs per level)
- Should not impact tree expansion performance

### NFR-309-002: Accessibility

- Lines are decorative, no semantic meaning
- Use `aria-hidden="true"` to hide from screen readers
- No impact on keyboard navigation
- No impact on screen reader announcements

### NFR-309-003: Maintainability

- Reusable component (can be used in other tree views)
- Clear prop interface with TypeScript
- Well-documented with TSDoc comments
- Consistent with project code style

### NFR-309-004: Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Edge, Safari)
- Uses standard CSS (no vendor prefixes needed)
- Fallback: no lines if CSS not supported (graceful degradation)

## 7) Testing Requirements

### Visual Tests

1. **Single Level Tree**
   - Render tree with depth = 0
   - Verify no lines rendered
   - Verify alignment looks correct

2. **Two Level Tree**
   - Render tree with depth = 1
   - Verify horizontal line rendered
   - Verify vertical line rendered (if not last child)

3. **Deep Nesting**
   - Render tree with depth = 5+
   - Verify lines align correctly at each level
   - Verify indentation accumulates correctly

4. **Last Child**
   - Render tree with multiple children
   - Verify last child has L-shaped connector
   - Verify vertical line doesn't extend past last child

5. **Collapsed Sidebar**
   - Set `isCollapsed = true`
   - Verify lines are hidden
   - Verify tree still functional

### Integration Tests

1. **FileTree Integration**
   - Render FileTree with TreeLines
   - Verify lines appear between parents and children
   - Verify tree expansion/collapse still works

2. **Responsive Behavior**
   - Resize sidebar below 200px
   - Verify lines hide automatically
   - Verify lines reappear when expanded

## 8) Definition of Done

- [ ] TreeLines component created with proper TypeScript types
- [ ] Vertical line rendering implemented
- [ ] Horizontal line rendering implemented
- [ ] Last child adjustment implemented
- [ ] Responsive hiding implemented
- [ ] Component integrated with FileTree.tsx
- [ ] TSDoc comments added
- [ ] Visual testing completed (various depths)
- [ ] VSCode-style appearance verified
- [ ] ESLint passed with no new warnings
- [ ] Build passed with no errors
- [ ] LLD updated with implementation status

## 9) Implementation Phases

### Phase 1: Component Structure (0.5 hour)

- Create TreeLines.tsx file
- Define Props interface
- Create component skeleton
- Add TSDoc comments
- Export component

### Phase 2: CSS Styling (0.5 hour)

- Implement vertical line styling
- Implement horizontal line styling
- Implement last child adjustment
- Test line appearance
- Verify VSCode-style appearance

### Phase 3: Responsive Behavior (0.25 hour)

- Add isCollapsed prop
- Implement conditional rendering
- Test collapsed state
- Test expanded state

### Phase 4: Integration (0.5 hour)

- Update FileTree.tsx
- Add TreeLines import
- Wrap children containers
- Pass depth and isLast props
- Test with various tree structures

### Phase 5: Testing & Polish (0.25 hour)

- Visual testing with various depths
- Test last child rendering
- Test responsive behavior
- Verify accessibility
- Fix any visual glitches

## 10) Risk Assessment

| Risk                  | Probability | Impact | Mitigation                    |
| --------------------- | ----------- | ------ | ----------------------------- |
| Visual glitches       | Low         | Low    | Test with various tree depths |
| Performance issues    | Low         | Low    | CSS-only, no JS calculations  |
| Browser compatibility | Low         | Low    | Use standard CSS              |
| Alignment issues      | Medium      | Medium | Use flexbox, test carefully   |

## 11) Open Questions

None - all resolved in upstream docs.

## 12) References

- Feature F-012 spec: `agent-docs/01-discovery/features/F-012-opfs-browser-enhancement.md`
- VSCode file tree: https://code.visualstudio.com/docs/getstarted/userinterface
- FileTree component: `src/devtools/components/OPFSBrowser/FileTree.tsx`

## 13) Functional-First Design

This spec uses **functional-first design**:

- **Pure component** - No internal state, props-driven rendering
- **CSS-only styling** - No JavaScript calculations for layout
- **Reusability** - Can be used in any tree view component
- **Accessibility** - Decorative only, no semantic impact

**Rationale**: Tree lines are purely visual. CSS-only approach ensures best performance and keeps component simple and maintainable.
