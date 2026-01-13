<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/features/feature.md

OUTPUT MAP (write to)
agent-docs/01-discovery/features/F-006-resizable-vertical-dividers.md

NOTES
- Feature F-006: Resizable Vertical Dividers
- Adds draggable resize handles to all vertical pane dividers
- Improves UX by allowing custom panel widths
-->

# Feature F-006: Resizable Vertical Dividers

## 0) Meta

- **Feature ID**: F-006
- **Title**: Resizable Vertical Dividers with Drag Handles
- **Status**: ✅ Completed
- **Priority**: P2 (Medium) - UX improvement for panel layout
- **Created**: 2026-01-14
- **Completed**: 2026-01-14
- **Requester**: User feedback on panel layout customization
- **Dependencies**: F-002 (Database Tab Navigation), F-005 (Opened Table Tabs Management)

## 1) Problem Statement

### Current Issue

The current panel layout in TableDetail and TablesTab views has fixed panel widths:

1. **Fixed sidebar width**: Table list sidebar is fixed at `w-1/4` (25%, 200-300px range)
2. **Fixed schema panel width**: Schema panel is fixed at `w-80` (320px)
3. **No resize capability**: Users cannot adjust panel widths to their preference
4. **No visual feedback**: No cursor change to indicate dividers are draggable
5. **Content overflow**: Users with wide tables or long column names cannot expand panels

### User Requirements

When viewing table data in the TableDetail and TablesTab views, the user wants:

1. **Draggable vertical dividers**: All vertical pane borders should be draggable
2. **Cursor change**: Mouse cursor should change to `col-resize` when hovering over dividers
3. **Left sidebar resize**: Table list sidebar (TablesTab) should be resizable
4. **Right schema panel resize**: DDL schema panel (TableDetail) should be resizable
5. **Visual feedback**: Drag handle should be visible on hover
6. **Smooth resizing**: Dragging should update panel width in real-time
7. **Min/max constraints**: Panels should have minimum and maximum width limits

## 2) Proposed Solution

### Architecture Changes

**Current Layout (Fixed Widths):**

```
┌─────────────────────────────────────────────────────────┐
│ Table Tabs Header                                        │
├──────────┬──────────────────────────────────┬───────────┤
│ Sidebar  │ Table Data                      │ DDL       │
│ (w-1/4)  │ (flex-1)                        │ (w-80)    │
│ Fixed    │ Flexible                        │ Fixed     │
└──────────┴──────────────────────────────────┴───────────┘
     ↑                                              ↑
  Not draggable                                Not draggable
```

**Target Layout (Resizable):**

```
┌─────────────────────────────────────────────────────────┐
│ Table Tabs Header                                        │
├──┬───────────────────────────────────────────────┬──────┤
│  │                                               │      │
│  │                                               │      │
│  │                                               │      │
└──┴───────────────────────────────────────────────┴──────┘
  │                                               │
  └─> Draggable (cursor: col-resize)              └─> Draggable (cursor: col-resize)
```

**Resize Handle Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│  ResizeHandle Component (Reusable)                           │
│  ├── position: absolute                                     │
│  ├── width: 4px (drag area)                                │
│  ├── cursor: col-resize                                    │
│  ├── hover state: Show visual indicator                     │
│  └── drag events: Update parent width state                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Parent Component (TablesTab, TableDetail)                  │
│  ├── width state (pixels or percentage)                     │
│  ├── minWidth constraint                                    │
│  ├── maxWidth constraint                                    │
│  └── onWidthChange callback                                 │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

**Reusable ResizeHandle Component:**

```tsx
interface ResizeHandleProps {
  position: "left" | "right";
  onDrag: (deltaX: number) => void;
  minWidth?: number;
  maxWidth?: number;
  currentWidth: number;
}

export const ResizeHandle = ({
  position,
  onDrag,
  minWidth = 150,
  maxWidth = 800,
  currentWidth,
}: ResizeHandleProps) => {
  // Mouse event handlers for drag operation
  // Cursor: col-resize
  // Visual indicator on hover
};
```

**Modified Components:**

```
TablesTab (MODIFIED)
├── sidebarWidth state (default: 25% or 300px)
├── ResizeHandle (right edge of sidebar)
└── Apply width state to sidebar

TableDetail (MODIFIED)
├── schemaPanelWidth state (default: 320px)
├── ResizeHandle (left edge of schema panel)
└── Apply width state to schema panel
```

### State Management

```tsx
// In TablesTab component
const [sidebarWidth, setSidebarWidth] = useState(300); // pixels
const [isDragging, setIsDragging] = useState(false);

const handleSidebarResize = useCallback((deltaX: number) => {
  setSidebarWidth(prev => {
    const newWidth = prev + deltaX;
    return Math.max(200, Math.min(600, newWidth)); // Min: 200px, Max: 600px
  });
}, []);

// Apply to sidebar
<aside
  className="border-r border-gray-200 bg-white flex flex-col"
  style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
>
  {/* Sidebar content */}
</aside>

<ResizeHandle
  position="right"
  onDrag={handleSidebarResize}
  currentWidth={sidebarWidth}
  minWidth={200}
  maxWidth={600}
/>
```

```tsx
// In TableDetail component (schema panel)
const [schemaPanelWidth, setSchemaPanelWidth] = useState(320);

const handleSchemaResize = useCallback((deltaX: number) => {
  setSchemaPanelWidth(prev => {
    const newWidth = prev - deltaX; // Subtract because dragging left expands
    return Math.max(250, Math.min(600, newWidth));
  });
}, []);

// Apply to schema panel
<SchemaPanel
  style={{ width: `${schemaPanelWidth}px`, minWidth: `${schemaPanelWidth}px` }}
  // ... other props
/>

<ResizeHandle
  position="left"
  onDrag={handleSchemaResize}
  currentWidth={schemaPanelWidth}
  minWidth={250}
  maxWidth={600}
/>
```

## 3) Functional Requirements

### FR-RESIZE-001: Cursor Change on Hover

- Mouse cursor changes to `col-resize` when hovering over divider
- Cursor applies to 4px drag area
- Cursor resets to default when outside drag area
- Cursor change is immediate (no delay)

### FR-RESIZE-002: Visual Hover Indicator

- Divider shows visual indicator when hovering
- Indicator: Background color change (e.g., `hover:bg-blue-200`)
- Indicator: Slight width expansion (e.g., 4px → 6px)
- Transition: Smooth (150ms)

### FR-RESIZE-003: Drag to Resize

- Click and drag on divider adjusts panel width
- Dragging updates width in real-time (no lag)
- Drag direction matches cursor movement (intuitive)
- Drag stops on mouse up

### FR-RESIZE-004: Left Sidebar Resize (TablesTab)

- Table list sidebar (left) has resize handle on right edge
- Default width: 300px (or 25% of viewport)
- Minimum width: 200px (unreadable below this)
- Maximum width: 600px (too wide beyond this)
- Resize handle positioned absolutely at right edge

### FR-RESIZE-005: Right Schema Panel Resize (TableDetail)

- Schema panel (right) has resize handle on left edge
- Default width: 320px (w-80)
- Minimum width: 250px (DDL unreadable below this)
- Maximum width: 600px (too wide beyond this)
- Resize handle positioned absolutely at left edge

### FR-RESIZE-006: Min/Max Constraints

- Panel width cannot go below minimum
- Panel width cannot exceed maximum
- Dragging beyond constraints stops at constraint
- No visual "bounce" or elastic effect

### FR-RESIZE-007: Content Area Adjustment

- Center content area (table data) adjusts automatically
- Content area takes remaining space (flex-1 or calc)
- No horizontal scroll or overflow
- Smooth transition during resize

### FR-RESIZE-008: ResizeHandle Component

**Props:**

```tsx
interface ResizeHandleProps {
  position: "left" | "right"; // Which edge to attach to
  onDrag: (deltaX: number) => void; // Delta X during drag
  minWidth?: number; // Minimum panel width (px)
  maxWidth?: number; // Maximum panel width (px)
  currentWidth: number; // Current panel width (px)
}
```

**Behavior:**

- Renders 4px wide drag area
- Captures mouse events (mousedown, mousemove, mouseup)
- Calculates delta X from drag start
- Calls `onDrag(deltaX)` on mouse move
- Cleans up event listeners on unmount

## 4) Non-Functional Requirements

### NFR-RESIZE-001: Performance

- Resize should be 60fps smooth (no jank)
- Use `requestAnimationFrame` for updates if needed
- Debounce/throttle not required (direct drag)
- No layout thrashing

### NFR-RESIZE-002: Backward Compatibility

- Preserve all existing panel functionality
- Default widths match current fixed widths
- Falls back gracefully if resize not used
- No breaking changes to existing components

### NFR-RESIZE-003: Code Quality

- Reusable `ResizeHandle` component
- TypeScript strict mode compliance
- Custom hook for resize logic (optional)
- Follow existing Tailwind CSS conventions

### NFR-RESIZE-004: Accessibility

- Resize handle should have `aria-label` ("Resize panel")
- Resize handle should have `role="separator"`
- Keyboard resize support (optional, with arrow keys)
- Focus indicator on resize handle

### NFR-RESIZE-005: Browser Compatibility

- Works in Chrome DevTools panel environment
- Uses standard Mouse Events (compatible)
- No external dependencies required

## 5) Out of Scope

- Persisting resize widths across page navigation
- Horizontal resizers (top/bottom panels)
- Touch/mobile resize support
- Double-click to auto-size
- Resize percentage vs pixels
- Collapsible panels (one-panel mode)

## 6) Dependencies

### Depends On

- F-002: Database Tab Navigation (complete) - TablesTab, TableDetail exist
- F-003: Schema Panel Enhancement (complete) - Schema panel component exists
- F-005: Opened Table Tabs Management (pending) - Tab component updates

### Related Features

- None - standalone UX enhancement

### Blocks

- None

## 7) Success Criteria

### Acceptance Criteria

1. **Cursor Change**
   - [ ] Cursor changes to `col-resize` on hover
   - [ ] Cursor resets when leaving drag area
   - [ ] Cursor works on both left and right dividers

2. **Visual Indicator**
   - [ ] Divider background changes on hover
   - [ ] Width expands slightly on hover
   - [ ] Transition is smooth (150ms)

3. **Left Sidebar Resize**
   - [ ] Dragging right edge adjusts sidebar width
   - [ ] Min constraint: 200px
   - [ ] Max constraint: 600px
   - [ ] Default: 300px

4. **Right Schema Panel Resize**
   - [ ] Dragging left edge adjusts schema width
   - [ ] Min constraint: 250px
   - [ ] Max constraint: 600px
   - [ ] Default: 320px

5. **Content Area Adjustment**
   - [ ] Table data area adjusts during resize
   - [ ] No horizontal scroll
   - [ ] No content overflow

6. **ResizeHandle Component**
   - [ ] Reusable component created
   - [ ] Props interface correct
   - [ ] Works for left and right positions
   - [ ] Event listeners cleaned up

7. **Edge Cases**
   - [ ] Dragging to min width stops
   - [ ] Dragging to max width stops
   - [ ] Rapid drag movements handled
   - [ ] Mouse release outside component handled

## 8) Open Questions

1. **Width persistence**: Should resized widths persist when switching tables or databases?
   - **Decision**: No persistence in this feature - reset to defaults on navigation (future feature)

2. **Width units**: Should widths be pixels or percentage?
   - **Decision**: Pixels for precision (easier to calculate constraints)

3. **Resize handle visibility**: Should drag handle be always visible or only on hover?
   - **Decision**: Always visible (4px transparent area), visual indicator on hover

4. **Live resize vs ghost**: Should panel resize live or show ghost outline?
   - **Decision**: Live resize (real-time width updates)

## 9) Implementation Notes

### Component File Structure

```
src/devtools/components/
├── Shared/
│   └── ResizeHandle.tsx         # NEW: Reusable resize handle
├── TablesTab/
│   └── TablesTab.tsx            # MODIFY: Add sidebar width state
└── TableDetail/
    └── TableDetail.tsx          # MODIFY: Add schema width state
```

### New Component: ResizeHandle.tsx

```tsx
import { useEffect, useState, useCallback } from "react";

interface ResizeHandleProps {
  position: "left" | "right";
  onDrag: (deltaX: number) => void;
  minWidth?: number;
  maxWidth?: number;
  currentWidth: number;
}

export const ResizeHandle = ({
  position,
  onDrag,
  minWidth = 150,
  maxWidth = 800,
  currentWidth,
}: ResizeHandleProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;

      // For left-positioned handle, dragging left increases width
      // For right-positioned handle, dragging right increases width
      const adjustedDelta = position === "left" ? -deltaX : deltaX;

      const newWidth = currentWidth + adjustedDelta;

      // Enforce constraints
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        onDrag(adjustedDelta);
        setDragStartX(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    dragStartX,
    position,
    onDrag,
    currentWidth,
    minWidth,
    maxWidth,
  ]);

  return (
    <div
      className={`
        absolute top-0 bottom-0 z-10 transition-all duration-150
        ${position === "left" ? "-left-2" : "-right-2"}
        ${isDragging ? "w-2 bg-blue-300" : "w-1 hover:bg-blue-200 hover:w-2"}
        cursor-col-resize
      `}
      style={{ cursor: "col-resize" }}
      onMouseDown={handleMouseDown}
      aria-label="Resize panel"
      role="separator"
      aria-orientation="vertical"
    />
  );
};
```

### Modified TablesTab.tsx

```tsx
// Add state
const [sidebarWidth, setSidebarWidth] = useState(300);

// Add handler
const handleSidebarResize = useCallback((deltaX: number) => {
  setSidebarWidth((prev) => Math.max(200, Math.min(600, prev + deltaX)));
}, []);

// Apply to sidebar
<aside
  className="border-r border-gray-200 bg-white flex flex-col relative"
  style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
>
  {/* Sidebar content */}
  <ResizeHandle
    position="right"
    onDrag={handleSidebarResize}
    currentWidth={sidebarWidth}
    minWidth={200}
    maxWidth={600}
  />
</aside>;
```

### Modified TableDetail.tsx

```tsx
// Add state
const [schemaPanelWidth, setSchemaPanelWidth] = useState(320);

// Add handler
const handleSchemaResize = useCallback((deltaX: number) => {
  setSchemaPanelWidth((prev) => Math.max(250, Math.min(600, prev - deltaX)));
}, []);

// Apply to schema panel
<div
  className="relative transition-all duration-200 ease-in-out"
  style={{
    width: schemaPanelVisible ? `${schemaPanelWidth}px` : "0px",
    minWidth: schemaPanelVisible ? `${schemaPanelWidth}px` : "0px",
  }}
>
  {schemaPanelVisible && (
    <ResizeHandle
      position="left"
      onDrag={handleSchemaResize}
      currentWidth={schemaPanelWidth}
      minWidth={250}
      maxWidth={600}
    />
  )}
  <SchemaPanel
  // ... existing props
  />
</div>;
```

### CSS Classes Reference

```tsx
// Resize handle base
"absolute top-0 bottom-0 z-10 transition-all duration-150";

// Position classes (left edge)
"-left-2"; // Positioned 8px left (negative margin)

// Position classes (right edge)
"-right-2"; // Positioned 8px right (negative margin)

// Hover state
"hover:bg-blue-200 hover:w-2";

// Dragging state
"w-2 bg-blue-300";

// Cursor (inline style)
cursor: "col-resize";
```

### Service Layer Integration

No changes required - this is purely a UI/UX feature.

### Testing Checklist

- [ ] Cursor changes to col-resize on hover
- [ ] Visual indicator appears on hover
- [ ] Dragging left sidebar adjusts width
- [ ] Dragging right schema panel adjusts width
- [ ] Min constraints enforced
- [ ] Max constraints enforced
- [ ] Content area adjusts automatically
- [ ] No horizontal scroll during resize
- [ ] Resize is smooth (60fps)
- [ ] Mouse release stops resize
- [ ] Mouse release outside component handled
- [ ] Event listeners cleaned up on unmount

---

**Feature Status**: Ready for Stage 3 (Architecture) review
**Next Steps**: Proceed to S3 (systemArchitect) for HLD updates
