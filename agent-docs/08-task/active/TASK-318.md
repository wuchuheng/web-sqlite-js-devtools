# TASK-318: Panel Resizing Integration (F-013)

## Overview

**Task ID**: TASK-318
**Feature**: F-013 - OPFS Browser Two-Panel Layout with File Preview
**Priority**: P1 (High)
**Estimated Time**: 2 hours
**Status**: Complete
**Completed**: 2026-01-15

## Description

Modify `OPFSGallery.tsx`, `FileTree.tsx`, and `FileNode.tsx` to implement two-panel layout with resizable divider. Add panel width state, file selection state, integrate ResizeHandle component from F-006, and add visual highlight for selected file.

## Dependencies

- **TASK-315** (File Preview Component Structure) - Must be complete
- **F-006** (Resizable Vertical Dividers) - Reuse ResizeHandle component
- **FilePreview component** - Right panel content

## Boundaries

**Files Modified**:

- `src/devtools/components/OPFSBrowser/OPFSGallery.tsx` (MODIFIED)
- `src/devtools/components/OPFSBrowser/FileTree.tsx` (MODIFIED)
- `src/devtools/components/OPFSBrowser/FileNode.tsx` (MODIFIED)

**Lines Changed**: ~150 lines across 3 files

## Technical Approach

### 1. OPFSGallery State Management

```typescript
const [leftPanelWidth, setLeftPanelWidth] = useState<number>(350); // Default width
const [selectedFile, setSelectedFile] = useState<OpfsFileEntry | null>(null);

const handleResize = useCallback((width: number) => {
  // Constrain between 200px and 600px
  const constrainedWidth = Math.max(200, Math.min(600, width));
  setLeftPanelWidth(constrainedWidth);
}, []);
```

### 2. OPFSGallery Layout Structure

```tsx
<div className="flex flex-col h-full">
  {/* Header (existing) */}
  <Header title="OPFS File Browser" />

  {/* Main Content (NEW: two-panel layout) */}
  <div className="flex flex-1 overflow-hidden">
    {/* Left Panel: File Tree */}
    <div
      style={{ width: `${leftPanelWidth}px` }}
      className="flex flex-col overflow-hidden"
    >
      <FileTree onFileSelect={setSelectedFile} selectedFile={selectedFile} />
    </div>

    {/* Divider */}
    <ResizeHandle
      direction="horizontal"
      onResize={handleResize}
      minSize={200}
      maxSize={600}
    />

    {/* Right Panel: Preview */}
    <div className="flex-1 flex flex-col overflow-hidden">
      <FilePreview file={selectedFile} />
    </div>
  </div>
</div>
```

### 3. FileTree Props Update

```typescript
interface FileTreeProps {
  files: OpfsFileEntry[];
  onDownload: (file: OpfsFileEntry) => void;
  onDelete: (file: OpfsFileEntry) => void;
  onFileSelect: (file: OpfsFileEntry) => void; // NEW
  selectedFile: OpfsFileEntry | null; // NEW
}
```

### 4. FileNode Selected State

```typescript
interface FileNodeProps {
  entry: OpfsFileEntry;
  level: number;
  onDownload: (file: OpfsFileEntry) => void;
  onDelete: (file: OpfsFileEntry) => void;
  onFileSelect: (file: OpfsFileEntry) => void; // NEW
  selectedFile: OpfsFileEntry | null; // NEW
  isLast?: boolean;
}

// NEW: Selected state styling
const isSelected = selectedFile?.path === entry.path;
const selectedClass = isSelected
  ? "bg-emerald-50 text-emerald-600 border-l-4 border-emerald-600"
  : "hover:bg-gray-100";

// NEW: Click handler (only for files, not directories)
const handleClick = () => {
  if (entry.type === "file") {
    onFileSelect(entry);
  }
};
```

### 5. ResizeHandle Integration

Import from F-006 component:

```typescript
import { ResizeHandle } from "../Shared/ResizeHandle";
```

Props:

- `direction="horizontal"` (resizes left/right panels)
- `onResize={handleResize}` (updates leftPanelWidth state)
- `minSize={200}` (minimum left panel width)
- `maxSize={600}` (maximum left panel width)

## Definition of Done

- [x] Modify `OPFSGallery.tsx` to use two-panel flex layout
- [x] Add `leftPanelWidth` state (useState<number>, default: 350)
- [x] Add `selectedFile` state (useState<OpfsFileEntry | null>, default: null)
- [x] Add `handleDrag` callback (useCallback, updates width with delta X)
- [x] Update JSX to use flex layout:
  - [x] Left panel div with `style={{ width: \`\${leftPanelWidth}px\` }}`
  - [x] `<ResizeHandle position="right" onDrag={handleDrag} minWidth={200} maxWidth={600} currentWidth={leftPanelWidth} />`
  - [x] Right panel div with `className="flex-1"`
- [x] Import ResizeHandle from `../Shared/ResizeHandle` (F-006 component)
- [x] Modify `FileTree.tsx` to accept `onFileSelect` callback prop
- [x] Modify `FileTree.tsx` to accept `selectedFile` prop
- [x] Pass `onFileSelect={setSelectedFile}` and `selectedFile={selectedFile}` to FileTree
- [x] Modify `FileTreeItem` to accept and pass `onFileSelect` and `selectedFile` props to children
- [x] Implement selected state highlight: `const isSelected = selectedFile?.path === entry.path`
- [x] Apply selected CSS class: `isSelected ? "bg-emerald-50 text-emerald-600 border-l-4 border-emerald-600" : "hover:bg-gray-100"`
- [x] Add click handler to FileTreeItem: `onClick={isDirectory ? handleClick : handleFileSelect}` (separate handlers for files vs directories)
- [x] Import FilePreview, TextPreview, ImagePreview components and render in right panel with `file={selectedFile}` prop
- [x] Test panel resizing smoothness (drag divider, should be 60fps)
- [x] Test minimum width constraint (cannot resize below 200px)
- [x] Test maximum width constraint (cannot resize above 600px)
- [x] Test file selection (click file, preview updates, visual highlight)
- [x] Test that selected file persists after resize
- [x] TSDoc comments on modified components
- [x] Type check passed with no errors (pre-existing Input.tsx error unrelated to this change)
- [x] ESLint passed with no new warnings

## Testing Checklist

- [x] Test panel resizing (drag divider left/right, panels resize smoothly)
- [x] Test minimum width constraint (cannot resize below 200px)
- [x] Test maximum width constraint (cannot resize above 600px)
- [x] Test file selection (click file, preview updates, visual highlight)
- [x] Test selected state persists after resize
- [x] Test that only files can be selected (directories don't trigger selection)
- [x] Test that clicking another file updates selection correctly
- [x] Test that resize cursor appears on hover (col-resize)
- [x] Test that right panel fills remaining space (flex-1)
- [x] Test that all F-012 features still work (tree lines, delete, metadata, toast)

## Related Documents

- **Feature Spec**: [F-013: OPFS Browser Two-Panel Layout](agent-docs/01-discovery/features/F-013-opfs-two-panel-preview.md)
- **HLD**: [Section 18.4 - Panel Resizing Architecture](agent-docs/03-architecture/01-hld.md#184-panel-resizing-architecture)
- **LLD**: [Section 11 - File Tree Update](agent-docs/05-design/03-modules/opfs-browser.md#file-tree-update-f-013-modified)
- **Roadmap**: [Phase 10 - TASK-318](agent-docs/07-taskManager/01-roadmap.md#task-318-panel-resizing-integration-f-013)

## Notes

- Reuses ResizeHandle from F-006 (proven pattern)
- Emerald theme for selected state (consistent with F-007)
- Similar complexity to TablesTab resizable sidebar (F-006)
- No breaking changes (additive props only)
- State lifted to OPFSGallery (consistent with existing patterns)
