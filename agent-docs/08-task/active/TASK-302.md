# TASK-302: Resizable Vertical Dividers Feature (F-006)

## 0) Meta

- **Task ID**: TASK-302
- **Feature**: F-006: Resizable Vertical Dividers
- **Status**: In Progress ([-] locked)
- **Priority**: P2 (Medium)
- **Estimated**: 10 hours (3-4 days)
- **Started**: 2026-01-14
- **Dependencies**: F-005 (TASK-301)

## 1) Objective

Add draggable resize handles to all vertical pane dividers in TablesTab and TableDetail views. Users can drag dividers to adjust panel widths within min/max constraints. Cursor changes to `col-resize` on hover with visual feedback.

## 2) Current State Analysis

**File: `src/devtools/components/TablesTab/TablesTab.tsx`**

Currently:

- Sidebar has fixed width: `w-1/4` (25%, 200-300px range)
- No resize capability
- No visual feedback for draggable area

**File: `src/devtools/components/TablesTab/TableDetail.tsx`**

Currently:

- Schema panel has fixed width: `w-80` (320px)
- No resize capability
- No visual feedback for draggable area

## 3) Implementation Plan

### Phase 1: Create ResizeHandle Component (4 hours)

**New File**: `src/devtools/components/Shared/ResizeHandle.tsx`

**1.1 Create Props Interface** (5 min)

```tsx
interface ResizeHandleProps {
  position: "left" | "right";
  onDrag: (deltaX: number) => void;
  minWidth?: number;
  maxWidth?: number;
  currentWidth: number;
}
```

**1.2 Create Component with State** (15 min)

```tsx
export const ResizeHandle = ({
  position,
  onDrag,
  minWidth = 150,
  maxWidth = 800,
  currentWidth,
}: ResizeHandleProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  // ...
};
```

**1.3 Implement handleMouseDown** (30 min)

- Prevent default to avoid text selection
- Set dragging state to true
- Capture initial mouse X position

**1.4 Implement useEffect for Drag Events** (2 hours)

- Listen for mousemove on document (not element)
- Calculate delta X from dragStartX
- Adjust delta based on position (left vs right)
- Enforce min/max constraints
- Call onDrag(adjustedDelta)
- Update dragStartX for next frame
- Listen for mouseup to end drag
- Cleanup event listeners on unmount

**1.5 Add Styling and ARIA** (1 hour)

- Cursor: `col-resize` (inline style)
- Hover state: `hover:bg-blue-200 hover:w-2`
- Dragging state: `w-2 bg-blue-300`
- Positioning: `absolute top-0 bottom-0 -left-2` or `-right-2`
- ARIA: `role="separator"`, `aria-orientation="vertical"`, `aria-label="Resize panel"`

**1.6 Export and TSDoc** (15 min)

- Export component with TSDoc comments
- Document props and behavior

### Phase 2: TablesTab Resizable Sidebar (3 hours)

**File**: `src/devtools/components/TablesTab/TablesTab.tsx`

**2.1 Import ResizeHandle** (5 min)

```tsx
import { ResizeHandle } from "@/devtools/components/Shared/ResizeHandle";
```

**2.2 Add State** (15 min)

```tsx
// Sidebar width state (F-006)
const [sidebarWidth, setSidebarWidth] = useState(300); // pixels
```

**2.3 Add Handler** (30 min)

```tsx
/**
 * Handle sidebar resize drag
 *
 * @param deltaX - Change in mouse X position
 * @remarks
 * - Updates sidebar width by adding delta
 * - Enforces min (200px) and max (600px) constraints
 * - Uses Math.max/min for clamping
 */
const handleSidebarResize = useCallback((deltaX: number) => {
  setSidebarWidth((prev) => {
    const newWidth = prev + deltaX;
    return Math.max(200, Math.min(600, newWidth));
  });
}, []);
```

**2.4 Apply Styles to Sidebar** (1 hour)

- Add `relative` class to sidebar container
- Remove `w-1/4` fixed width class
- Add inline style: `style={{ width: \`${sidebarWidth}px\`, minWidth: \`${sidebarWidth}px\` }}`

**2.5 Add ResizeHandle** (30 min)

- Add ResizeHandle at right edge of sidebar
- Props: `position="right"`, `onDrag={handleSidebarResize}`, `currentWidth={sidebarWidth}`, `minWidth={200}`, `maxWidth={600}`

### Phase 3: TableDetail Resizable Schema Panel (3 hours)

**File**: `src/devtools/components/TablesTab/TableDetail.tsx`

**3.1 Import ResizeHandle** (5 min)

```tsx
import { ResizeHandle } from "@/devtools/components/Shared/ResizeHandle";
```

**3.2 Add State** (15 min)

```tsx
// Schema panel width state (F-006)
const [schemaPanelWidth, setSchemaPanelWidth] = useState(320); // pixels
```

**3.3 Add Handler** (30 min)

```tsx
/**
 * Handle schema panel resize drag
 *
 * @param deltaX - Change in mouse X position
 * @remarks
 * - Subtracts delta (dragging left expands panel)
 * - Enforces min (250px) and max (600px) constraints
 */
const handleSchemaResize = useCallback((deltaX: number) => {
  setSchemaPanelWidth((prev) => {
    const newWidth = prev - deltaX; // Subtract because dragging left expands
    return Math.max(250, Math.min(600, newWidth));
  });
}, []);
```

**3.4 Apply Styles to Schema Panel** (1 hour)

- Add `relative` class to schema panel wrapper
- Remove `w-80` fixed width class
- Add inline style: `style={{ width: schemaPanelVisible ? \`${schemaPanelWidth}px\` : '0px', minWidth: schemaPanelVisible ? \`${schemaPanelWidth}px\` : '0px' }}`

**3.5 Add ResizeHandle** (30 min)

- Add ResizeHandle at left edge of schema panel
- Only show when `schemaPanelVisible === true`
- Props: `position="left"`, `onDrag={handleSchemaResize}`, `currentWidth={schemaPanelWidth}`, `minWidth={250}`, `maxWidth={600}`

### Phase 4: Testing (1 hour)

**4.1 Manual Testing** (45 min)

- Cursor changes to col-resize on hover
- Visual indicator appears on hover (bg-blue-200, width expands)
- Sidebar resize works (200-600px)
- Schema panel resize works (250-600px)
- Min constraints stop resize at limits
- Max constraints stop resize at limits
- Table content area adjusts during resize
- No horizontal scroll during resize
- Resize is smooth (60fps)
- Resize works when schema panel hidden
- Mouse release outside browser window handled

**4.2 Build Verification** (15 min)

- Run `npm run build`
- Fix any TypeScript errors
- Fix any build errors

## 4) Code Quality Rules

**Functional-First**:

- Use functional components with hooks
- Use `useCallback` for event handlers
- Use `useEffect` for drag event listeners with proper cleanup

**Three-Phase Comments**:

- Functions > 5 lines must have numbered three-phase comments
- Example:
  ```tsx
  /**
   * Handle sidebar resize drag
   *
   * @param deltaX - Change in mouse X position
   * @remarks
   * - Updates sidebar width by adding delta
   * - Enforces min/max constraints
   * - Uses Math.max/min for clamping
   */
  const handleSidebarResize = useCallback((deltaX: number) => {
    setSidebarWidth((prev) => {
      const newWidth = prev + deltaX;
      return Math.max(200, Math.min(600, newWidth));
    });
  }, []);
  ```

**TSDoc for Exported Functions**:

```tsx
/**
 * Resize handle component for draggable panel dividers
 *
 * @remarks
 * - Renders 4px wide drag area that expands to 6px on hover
 * - Cursor changes to col-resize when hovering
 * - Captures mouse events for drag operation
 * - Enforces min/max width constraints
 * - Cleans up event listeners on unmount
 *
 * @param props - Component props
 * @returns Resize handle JSX element
 */
export const ResizeHandle = ({ ... }: ResizeHandleProps) => {
  // ...
};
```

## 5) Functional Requirements Coverage

| FR                | Description            | Implementation                                     |
| ----------------- | ---------------------- | -------------------------------------------------- |
| **FR-RESIZE-001** | Cursor change          | `cursor: col-resize` (inline style)                |
| **FR-RESIZE-002** | Visual hover indicator | `hover:bg-blue-200 hover:w-2`                      |
| **FR-RESIZE-003** | Drag to resize         | Mouse events in useEffect, onDrag callback         |
| **FR-RESIZE-004** | Left sidebar resize    | TablesTab: handleSidebarResize (200-600px)         |
| **FR-RESIZE-005** | Right schema resize    | TableDetail: handleSchemaResize (250-600px)        |
| **FR-RESIZE-006** | Min/max constraints    | Math.max/min clamping in handlers                  |
| **FR-RESIZE-007** | Content adjustment     | Flex layout, remaining space auto-adjusts          |
| **FR-RESIZE-008** | Component props        | position, onDrag, minWidth, maxWidth, currentWidth |

## 6) Files Changed

### New Files

- `src/devtools/components/Shared/ResizeHandle.tsx` (NEW)

### Modified Files

- `src/devtools/components/TablesTab/TablesTab.tsx` (MODIFY)
- `src/devtools/components/TablesTab/TableDetail.tsx` (MODIFY)

### Files Deleted (N/A)

- None

## 7) Build Verification

**After implementation, run:**

```bash
npm run build
```

**Expected:** No errors, successful build

## 8) Acceptance Criteria

From task catalog DoD:

- [ ] **Component: ResizeHandle.tsx** (4 hours)
  - [ ] Create `ResizeHandle.tsx` in Shared components folder
  - [ ] Props interface: `position`, `onDrag`, `minWidth`, `maxWidth`, `currentWidth`
  - [ ] Add state: `isDragging`, `dragStartX`
  - [ ] Implement `handleMouseDown(e)` - Start drag, capture initial X
  - [ ] Implement `handleMouseMove(e)` in useEffect
    - [ ] Calculate delta X from dragStartX
    - [ ] Adjust delta based on position (left vs right)
    - [ ] Enforce min/max constraints
    - [ ] Call `onDrag(adjustedDelta)`
    - [ ] Update dragStartX for next frame
  - [ ] Implement `handleMouseUp()` - End drag, cleanup listeners
  - [ ] Cursor change: `cursor: col-resize` (inline style)
  - [ ] Visual hover state: `hover:bg-blue-200 hover:w-2`
  - [ ] Visual dragging state: `w-2 bg-blue-300`
  - [ ] Positioning: absolute, left/right offset, top-0, bottom-0
  - [ ] ARIA attributes: `role="separator"`, `aria-orientation="vertical"`, `aria-label="Resize panel"`
  - [ ] Export component

- [ ] **TablesTab Resizable Sidebar** (3 hours)
  - [ ] Add state: `sidebarWidth: number` (default: 300)
  - [ ] Add `handleSidebarResize(deltaX)` handler
  - [ ] Apply inline style to sidebar
  - [ ] Add `relative` class to sidebar container
  - [ ] Add ResizeHandle at right edge
  - [ ] Remove fixed `w-1/4` class from sidebar

- [ ] **TableDetail Resizable Schema Panel** (3 hours)
  - [ ] Add state: `schemaPanelWidth: number` (default: 320)
  - [ ] Add `handleSchemaResize(deltaX)` handler
  - [ ] Apply inline style to schema panel wrapper
  - [ ] Add `relative` class to schema panel wrapper
  - [ ] Add ResizeHandle at left edge
  - [ ] Only show ResizeHandle when `schemaPanelVisible === true`
  - [ ] Remove fixed `w-80` class from schema panel

- [ ] **Testing** (1 hour)
  - [ ] Cursor changes to col-resize on hover
  - [ ] Visual indicator appears on hover
  - [ ] Sidebar resize works (200-600px)
  - [ ] Schema panel resize works (250-600px)
  - [ ] Table content area adjusts during resize
  - [ ] No horizontal scroll during resize
  - [ ] Resize is smooth (60fps)
  - [ ] Resize works when schema panel hidden

- [ ] Build passed with no errors

## 9) Exceptions

**No class-based components** - All functional components with hooks

**No global state** - Width state owned by parent components

**Position matters** - Left-positioned handles subtract delta, right-positioned handles add delta

## 10) Notes

- **Left handle**: Dragging left increases width (subtract delta)
- **Right handle**: Dragging right increases width (add delta)
- **Constraints**: Enforced in parent handlers, not in ResizeHandle
- **Event listeners**: Attached to document for reliable drag detection
- **Cleanup**: useEffect returns cleanup function for event listeners
- **Accessibility**: ARIA attributes for screen reader support
