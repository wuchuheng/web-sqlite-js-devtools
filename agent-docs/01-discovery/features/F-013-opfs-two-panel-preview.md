# F-013: OPFS Browser Two-Panel Layout with File Preview

## 1) Feature Overview

- **ID**: F-013
- **Title**: OPFS Browser Two-Panel Layout with File Preview
- **Status**: In Progress (Stage 2 Complete)
- **Created**: 2026-01-15
- **Priority**: P1 (High)
- **Type**: UI Enhancement
- **Dependencies**: F-012 (OPFS Browser Enhancement) - Must be complete

## 2) Problem Statement

The current OPFS browser (`/opfs` route) implements a single-panel file tree layout (completed in F-012). While it provides comprehensive file management capabilities (tree lines, delete confirmation, metadata panels, toast notifications), users cannot preview file contents without downloading them first.

This creates an inefficient workflow:

- User must download file to view contents
- No quick preview for text files (logs, JSON, config)
- No image thumbnail preview
- Extra friction when browsing multiple files

## 3) Proposed Solution

Transform the OPFS browser into a **two-panel layout**:

```
┌─────────────────────────────────────────────────────────────┐
│ Header: OPFS File Browser (Emerald #059669)                │
├───────────────────┬───────────────────────────────────────────┤
│ File Tree (Left)  │ Preview Panel (Right)                    │
│                   │                                           │
│ 📁 databases/     │ 🔍 Preview: app.log                      │
│ 📁 storage/       │ ─────────────────────────────────       │
│ 📁 log/           │                                           │
│ 📄 app.log        │ 2024-01-15 18:01:22 [INFO]              │
│ 📄 main.sqlite3   │ Application started                       │
│ 📄 config.json    │                                           │
│                   │ 2024-01-15 18:02:45 [INFO]              │
│ [File tree with   │ Database connection established            │
│  tree lines]      │                                           │
│                   │ 2024-01-15 18:03:10 [WARN]              │
│                   │ High memory usage detected                │
│                   │                                           │
└───────────────────┴───────────────────────────────────────────┘
```

### Key Changes

1. **Two-Panel Split Layout**
   - Left panel: File tree navigation (existing FileTree component)
   - Right panel: File preview area (new FilePreview component)
   - Resizable divider between panels (reusing ResizeHandle from F-006)

2. **File Preview Component**
   - Shows selected file contents in the right panel
   - Supports text files (logs, JSON, config, etc.)
   - Supports image files (JPG, PNG, GIF, SVG, WebP)
   - Shows placeholder for unsupported file types (SQLite, binary)

3. **Panel Resizing**
   - Users can drag the divider to adjust panel widths
   - Left panel: 200px - 600px (default: 350px)
   - Right panel: Flexible remaining space

4. **Preserve All F-012 Features**
   - Tree lines (VSCode-style hierarchy)
   - Delete confirmation modal
   - Toast notifications
   - Enhanced metadata display (file type badges, timestamps)
   - Download and delete buttons on hover

## 4) User Stories

### Primary User Stories

1. **As a developer**, I want to preview log files in the OPFS browser so that I can quickly check application logs without downloading them.

2. **As a developer**, I want to preview images stored in OPFS so that I can verify visual assets without downloading them.

3. **As a developer**, I want to resize the panels so that I can see more of the file tree or more of the preview, depending on my current task.

4. **As a developer**, I want to keep using the existing features (tree lines, delete, metadata) so that my workflow is not disrupted.

### Secondary User Stories

5. **As a developer**, I want to see a loading state when previewing large files so that I know the system is working.

6. **As a developer**, I want to see an error message if preview fails so that I can understand what went wrong.

7. **As a developer**, I want to click on a file in the tree to select it for preview so that the interaction is intuitive.

8. **As a developer**, I want the selected file to be visually highlighted so that I know which file is being previewed.

## 5) Acceptance Criteria

### Functional Requirements

#### FR-OPFS-001: Two-Panel Layout

- **Given**: User navigates to `/opfs` route
- **When**: Page loads
- **Then**: Display two panels side by side (file tree left, preview right)
- **And**: Default split is 350px for left panel, remaining for right panel

#### FR-OPFS-002: Resizable Divider

- **Given**: User is on the OPFS browser page
- **When**: User drags the divider between panels
- **Then**: Panels resize smoothly (real-time, no lag)
- **And**: Left panel constrained between 200px - 600px
- **And**: Divider follows cursor horizontally
- **And**: Cursor changes to `col-resize` on hover

#### FR-OPFS-003: File Selection

- **Given**: User is on the OPFS browser page
- **When**: User clicks on a file in the tree (not a directory)
- **Then**: File becomes selected (visual highlight)
- **And**: File preview updates to show selected file contents
- **And**: Previous selection is cleared

#### FR-OPFS-004: Text File Preview

- **Given**: User selects a text file (.log, .txt, .json, .xml, .csv, .md, etc.)
- **When**: File contents are loaded
- **Then**: Display text in monospace font in the preview panel
- **And**: Show "Preview: {filename}" header
- **And**: Syntax highlighting for JSON files (if feasible)
- **And**: Preserve line breaks and formatting

#### FR-OPFS-005: Image File Preview

- **Given**: User selects an image file (.jpg, .png, .gif, .svg, .webp, etc.)
- **When**: Image data is loaded
- **Then**: Display image in the preview panel
- **And**: Show "Preview: {filename}" header
- **And**: Image scales to fit within panel (max-width: 100%, max-height: 100%)
- **And**: Maintain aspect ratio

#### FR-OPFS-006: SQLite Database Preview

- **Given**: User selects a SQLite database file (.sqlite, .sqlite3, .db)
- **When**: File is selected
- **Then**: Show placeholder message "SQLite database files cannot be previewed"
- **And**: Display download button to download the file
- **And**: Show file metadata (size, type, modified date)

#### FR-OPFS-007: Unsupported File Preview

- **Given**: User selects an unsupported file type (binary, etc.)
- **When**: File is selected
- **Then**: Show placeholder message "Preview not available for this file type"
- **And**: Display file metadata (size, type, modified date)
- **And**: Show download button

#### FR-OPFS-008: Empty State (No Selection)

- **Given**: User navigates to `/opfs` route
- **When**: No file is selected
- **Then**: Preview panel shows empty state
- **And**: Display message "Select a file to preview its contents"
- **And**: Show helpful icon or illustration

#### FR-OPFS-009: Loading State

- **Given**: User selects a large file
- **When**: File contents are being loaded
- **Then**: Preview panel shows loading spinner
- **And**: Display text "Loading preview..."
- **And**: Loading state replaces previous content

#### FR-OPFS-010: Error State

- **Given**: File preview fails to load
- **When**: Error occurs (network, permission, etc.)
- **Then**: Preview panel shows error message
- **And**: Display error details (if available)
- **And**: Show retry button to attempt reload
- **And**: Keep file selected

#### FR-OPFS-011: Preserve Tree Lines (F-012)

- **Given**: User is viewing the file tree
- **When**: Tree hierarchy is displayed
- **Then**: Show VSCode-style tree lines (from F-012)
- **And**: Hide lines when left panel < 200px (responsive behavior)

#### FR-OPFS-012: Preserve Delete Confirmation (F-012)

- **Given**: User clicks delete button on a file
- **When**: Delete modal opens
- **Then**: Show metadata grid (type, size, modified, path)
- **And**: Show warning message (enhanced for directories)
- **And**: Close on Escape key or backdrop click
- **And**: Confirm button with loading state

#### FR-OPFS-013: Preserve Toast Notifications (F-012)

- **Given**: User performs an action (delete, download)
- **When**: Action completes (success or failure)
- **Then**: Show toast notification (success: green, error: red)
- **And**: Auto-dismiss after 3-5 seconds
- **And**: Fixed position at top-right (z-index 60)

#### FR-OPFS-014: Preserve Metadata Display (F-012)

- **Given**: User hovers over a file in the tree
- **When**: Mouse enters file row
- **Then**: Show inline metadata (type badge, timestamp)
- **And**: Fade in with 150ms transition
- **And**: Fade out when mouse leaves

### Non-Functional Requirements

#### NFR-OPFS-001: Performance

- Preview panel must load text files within 1 second for files < 1MB
- Preview panel must load images within 2 seconds for images < 5MB
- Panel resizing must be smooth (60fps) without lag
- Tree navigation must remain responsive (no blocking UI)

#### NFR-OPFS-002: Responsiveness

- Layout must adapt to different DevTools panel sizes
- Minimum usable width: 800px (total)
- Left panel minimum: 200px
- Right panel minimum: 400px

#### NFR-OPFS-003: Accessibility

- Divider must be keyboard accessible (not initially required, document for future)
- Selected file must have visible focus indicator (not initially required)
- Preview panel must announce file changes to screen readers (future enhancement)

#### NFR-OPFS-004: Visual Design

- Header color: Emerald theme (#059669 from project theme)
- Divider: 1px gray-200, resizable handle
- Selected file: Emerald-50 background with emerald-600 text
- Hover states: Gray-100 background for interactive elements
- Consistent with F-007 (Uniform Theme Configuration)

#### NFR-OPFS-005: Code Quality

- TypeScript strict mode compliance
- TSDoc comments on all exported components
- Functional design (props-driven, minimal internal state)
- No `any` types
- ESLint compliance

## 6) Out of Scope

- **Direct file editing**: Users can only preview, not edit files
- **SQLite database inspection**: Preview shows placeholder only (use /openedDB route for database inspection)
- **Multiple file selection**: Only one file can be previewed at a time
- **Keyboard shortcuts for tree navigation**: Future enhancement
- **Search within file contents**: Future enhancement
- **File upload**: Future enhancement (use other routes for database operations)
- **Syntax highlighting for all text types**: JSON syntax highlighting if feasible, plain text otherwise

## 7) Dependencies

### Feature Dependencies

- **F-012** (OPFS Browser Enhancement): Must be complete
  - Provides: FileTree component, FileNode component, DeleteConfirmModal, Toast, MetadataPanel, TreeLines
  - Provides: Service layer functions (getOpfsFiles, downloadOpfsFile, deleteOpfsFile, deleteOpfsDirectory)
  - Provides: Enhanced metadata (fileType, itemCount, lastModified)

### Component Dependencies

- **F-006** (Resizable Vertical Dividers): Reuse ResizeHandle component
  - Provides: Draggable divider with visual feedback
  - Provides: Min/max width constraints
  - Provides: Cursor changes (col-resize)

### Technical Dependencies

- React 18+ (hooks, context)
- TypeScript (strict mode)
- Tailwind CSS 4 (emerald theme tokens)
- react-icons (FaFile, FaFolder, etc.)
- react-router-dom (hash routing for /opfs)

## 8) Implementation Notes

### Panel Resizing Strategy

Reuse `ResizeHandle` component from F-006:

```typescript
// Existing ResizeHandle interface
interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  onResize: (size: number) => void;
  minSize?: number;
  maxSize?: number;
}

// New usage for OPFS browser
<ResizeHandle
  direction="horizontal"
  onResize={setLeftPanelWidth}
  minSize={200}
  maxSize={600}
/>
```

### File Content Loading

Use existing service layer pattern:

```typescript
// New service function (to be added)
const getFileContent = async (
  path: string,
): Promise<
  ServiceResponse<{
    type: "text" | "image" | "binary";
    content: string | Blob;
  }>
> => {
  return inspectedWindowBridge.execute({
    func: async (filePath: string) => {
      // Get file handle
      const parts = filePath.split("/");
      let dir = await navigator.storage.getDirectory();
      for (const part of parts.slice(0, -1)) {
        dir = await dir.getDirectoryHandle(part);
      }
      const file = await dir.getFileHandle(parts[parts.length - 1]);

      // Read file content
      const fileData = await file.getFile();

      // Detect type and return content
      const type = detectFileType(fileData.type, file.name);
      if (type === "image") {
        return { type: "image", content: fileData };
      } else if (type === "text") {
        const text = await fileData.text();
        return { type: "text", content: text };
      } else {
        return { type: "binary", content: fileData };
      }
    },
    args: [path],
  });
};
```

### Component Structure

```
src/devtools/components/OPFSBrowser/
  OPFSGallery.tsx          # Main container (existing)
  FileTree.tsx             # File tree component (existing)
  FileNode.tsx             # Tree node component (existing)
  FilePreview.tsx          # NEW: File preview component
  TextPreview.tsx          # NEW: Text file preview
  ImagePreview.tsx         # NEW: Image file preview
  EmptyPreview.tsx         # NEW: Empty state placeholder
  UnsupportedPreview.tsx   # NEW: Unsupported file placeholder
```

### Layout Structure

```tsx
<div className="flex flex-col h-full">
  {/* Header (existing) */}
  <Header title="OPFS File Browser" />

  {/* Main Content (NEW: two-panel layout) */}
  <div className="flex flex-1 overflow-hidden">
    {/* Left Panel: File Tree */}
    <div style={{ width: leftPanelWidth }} className="flex flex-col">
      <FileTree
        onDownload={handleDownload}
        onDelete={handleDeleteClick}
        onSelect={handleFileSelect} // NEW
        selectedFile={selectedFile} // NEW
      />
    </div>

    {/* Divider */}
    <ResizeHandle
      direction="horizontal"
      onResize={setLeftPanelWidth}
      minSize={200}
      maxSize={600}
    />

    {/* Right Panel: Preview */}
    <div className="flex-1 flex flex-col overflow-hidden">
      <FilePreview file={selectedFile} onDownload={handleDownload} />
    </div>
  </div>
</div>
```

## 9) Success Criteria

### Feature Completion

- [ ] Two-panel layout implemented (file tree left, preview right)
- [ ] Resizable divider between panels (200px - 600px range)
- [ ] File selection updates preview panel
- [ ] Text file preview working (logs, JSON, config, etc.)
- [ ] Image file preview working (JPG, PNG, GIF, SVG, WebP)
- [ ] SQLite database placeholder (with download button)
- [ ] Unsupported file placeholder (with download button)
- [ ] Empty state when no file selected
- [ ] Loading state during file load
- [ ] Error state with retry button

### Feature Preservation

- [ ] Tree lines displayed (F-012)
- [ ] Delete confirmation modal working (F-012)
- [ ] Toast notifications working (F-012)
- [ ] Metadata display on hover (F-012)
- [ ] Download button working
- [ ] Delete button working

### Quality Standards

- [ ] TypeScript strict mode compliance
- [ ] ESLint passed with no new warnings
- [ ] TSDoc comments on all new components
- [ ] Type check passed
- [ ] Build passed
- [ ] Manual testing completed

## 10) Related Documents

- **HLD**: `agent-docs/03-architecture/01-hld.md` (Section: OPFS File Browser Architecture)
- **LLD**: `agent-docs/05-design/03-modules/opfs-browser.md` (Module: OPFS File Browser)
- **API Contract**: `agent-docs/05-design/01-contracts/01-api.md` (Module: OPFS File Browser)
- **Feature F-012**: `agent-docs/01-discovery/features/F-012-opfs-browser-enhancement.md`
- **Feature F-006**: `agent-docs/01-discovery/features/F-006-resizable-vertical-dividers.md`
- **Feature F-007**: `agent-docs/01-discovery/features/F-007-uniform-theme-configuration.md`

## 11) Open Questions

1. Should we add syntax highlighting for JSON files? (Deferred to design phase)
2. Should we support previewing very large files (>10MB)? (Deferred to design phase)
3. Should we add line numbers for text preview? (Deferred to design phase)
4. Should we support dark mode for preview panel? (Deferred to design phase)

## 12) Feasibility Analysis (Stage 2: S2:feasibilityAnalyst)

### Technical Options Assessment

#### Option A: Split-Panel Layout with File Preview (RECOMMENDED)

**Approach**: Transform OPFSGallery into two-panel layout using existing ResizeHandle component

- **Pros**:
  - Reuses F-006 ResizeHandle component (proven pattern)
  - Leverages all F-012 components (FileTree, FileNode, TreeLines, etc.)
  - Clean separation of concerns (navigation vs preview)
  - Consistent with existing codebase patterns
- **Cons**:
  - Requires new service layer function (getFileContent)
  - Adds 4 new components (FilePreview, TextPreview, ImagePreview, EmptyPreview, UnsupportedPreview)
  - Moderate complexity (8-12 hours estimated)
- **Risk**: Low
  - File content loading uses proven OPFS API patterns
  - ResizeHandle already tested in F-006
  - Text/image preview are standard web APIs

#### Option B: Modal-based File Preview

**Approach**: Keep single-panel layout, show preview in modal when file clicked

- **Pros**:
  - Simpler layout (no resize logic)
  - Less screen space impact
- **Cons**:
  - Worse UX (modal blocks tree navigation)
  - Cannot browse and preview simultaneously
  - Breaks two-panel mental model expected by users
- **Risk**: Medium
  - Modal management complexity
  - User acceptance risk (non-standard pattern)

#### Option C: Tab-based Preview (Separate Route)

**Approach**: Add preview as separate tab/route, show selected file details

- **Pros**:
  - Simpler state management (one view active at a time)
- **Cons**:
  - Poor UX (cannot see tree and preview together)
  - Requires route navigation for each file preview
  - Loses context of file tree
- **Risk**: High
  - User experience degradation
  - Increased navigation friction

### Recommendation: Option A (Split-Panel Layout)

**Rationale**:

1. **User Experience**: Two-panel layout is industry standard (VSCode, file managers, IDEs)
2. **Technical Feasibility**: All building blocks exist (ResizeHandle, FileTree, OPFS APIs)
3. **Code Reusability**: 90% of components already built in F-012
4. **Performance**: File content loading is fast (< 1s for < 1MB files)
5. **Extensibility**: Easy to add features later (syntax highlighting, search, etc.)

### Risk Assessment

| Risk                                     | Severity | Mitigation                                                                        |
| ---------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| **R1: File content loading performance** | Medium   | Implement file size limits (< 10MB), lazy loading, error boundaries               |
| **R2: Binary file detection**            | Low      | Use existing detectFileType() utility from F-012, fallback to unsupported preview |
| **R3: Image memory usage**               | Low      | Implement image size limits (< 5MB), responsive scaling                           |
| **R4: Panel resize smoothness**          | Low      | Reuse ResizeHandle from F-006 (proven 60fps performance)                          |
| **R5: Large text file rendering**        | Medium   | Implement virtual scrolling if needed, show warning for > 1MB files               |
| **R6: OPFS permission errors**           | Low      | Reuse existing error handling from downloadOpfsFile, show retry button            |

### Technical Feasibility Summary

**Feasible**: YES ✓

- All dependencies satisfied (F-012 complete, F-006 provides ResizeHandle)
- Browser APIs supported (OPFS File System Access, File/Blob APIs)
- Codebase patterns proven (similar complexity to F-012)
- Estimated effort: 8-12 hours (aligned with F-012)

**Technical Approach**:

1. Service Layer: Add `getFileContent(path)` function (uses OPFS getFileHandle)
2. Components: Create 5 preview components (FilePreview, TextPreview, ImagePreview, EmptyPreview, UnsupportedPreview)
3. Layout: Update OPFSGallery to use two-panel flex layout with ResizeHandle
4. State: Add selectedFile state to OPFSGallery (lifted from FileTree)
5. Types: Extend OpfsFileEntry with content field (optional, for preview)

**Performance Targets**:

- Text files < 1MB: Load in < 1 second
- Images < 5MB: Load in < 2 seconds
- Panel resizing: 60fps smooth (proven in F-006)

**Browser Compatibility**:

- Chrome 111+ (OPFS File System Access stable)
- Edge 111+ (same engine as Chrome)
- Firefox: Not supported (OPFS not available, show browser notice)

### Updated Status

- **Discovery**: Complete ✓
- **Feasibility**: Complete ✓ (Option A recommended, LOW risk)
- **Architecture**: Pending (Stage 3)
- **Design**: Pending (Stage 5)
- **Task Breakdown**: Pending (Stage 7)
- **Implementation**: Pending (Stage 8)

**Baseline Approach Confirmed**: Two-panel split layout with resizable divider, file content loading via OPFS API, text/image preview components.
