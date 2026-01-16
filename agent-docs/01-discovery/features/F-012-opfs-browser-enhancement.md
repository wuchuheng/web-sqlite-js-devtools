<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/features/feature.md

OUTPUT MAP (write to)
agent-docs/01-discovery/features/F-012-opfs-browser-enhancement.md

NOTES
- Feature F-012: OPFS File Browser Enhancement
- Adds guided tree lines, delete operations, and metadata display to OPFS browser
-->

# Feature F-012: OPFS File Browser Enhancement

## 0) Meta

- **Feature ID**: F-012
- **Title**: OPFS File Browser Enhancement - Tree Lines, Delete, Metadata
- **Status**: Pending
- **Priority**: P1 (High) - Core Feature Completion
- **Created**: 2026-01-15
- **Completed**: TBD
- **Requester**: User request via `/s1-iterationLead` referencing TODO.md

## 1) Problem Statement

### Current Implementation

The OPFS File Browser (`/opfs` route) currently has **basic functionality**:

1. **File Tree Display**: Shows OPFS files and directories with lazy loading
2. **Download Operation**: Users can download files to their local machine
3. **Simple Indentation**: Uses basic padding for hierarchy (16px per level)
4. **Basic Metadata**: Shows file size in human-readable format (KB, MB, GB)
5. **Expand/Collapse**: Directories can be expanded to load children on-demand

### Gaps Identified (from TODO.md)

Based on the TODO.md file and user requirements, the following features are **missing**:

1. **Guided Tree Lines**: No visual hierarchy connecting parent/child nodes
   - Current: Simple indentation only
   - Needed: Vertical and horizontal guide lines (classic tree view style)

2. **Delete Operation**: Cannot delete files or directories from OPFS
   - Current: Read-only browser with download only
   - Needed: Delete files and directories with confirmation

3. **Enhanced Metadata**: Limited file/directory information displayed
   - Current: Only file size (for files)
   - Needed: Last modified date, file type, full path, item count (directories)

### User Impact

- **Visual Clarity**: Without guided tree lines, deep directory structures are harder to navigate
- **Workflow Efficiency**: Users cannot clean up OPFS without switching to browser DevTools or console
- **Information Discovery**: Users must download files to inspect detailed metadata

## 2) Proposed Solution

### Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    OPFS Browser Enhancement                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Visual Enhancements                                    │  │
│  │  ├── Guided Tree Lines (vertical/horizontal connectors)│  │
│  │  ├── Hover Background Highlighting                     │  │
│  │  └── Smooth Expand/Collapse Animations                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Operations                                              │  │
│  │  ├── Download (existing - unchanged)                    │  │
│  │  ├── Delete (NEW - files and directories)               │  │
│  │  └── Refresh (existing - unchanged)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Metadata Display                                        │  │
│  │  ├── File Size (existing - unchanged)                   │  │
│  │  ├── Last Modified (NEW)                                │  │
│  │  ├── File Type/Extension (NEW)                          │  │
│  │  └── Full Path (NEW - shown on hover/click)             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Guided Tree Lines Design

The classic tree view pattern with guide lines:

```
┌── Root Directory/
│   ├── Subdirectory 1/
│   │   ├── File 1.txt
│   │   └── File 2.txt
│   ├── Subdirectory 2/
│   │   └── Nested/
│   │       └── Deep File.db
│   └── File 3.txt
```

**Implementation Strategy**:

- Use CSS borders on container `divs` to create vertical lines
- Use CSS `::before` pseudo-elements for horizontal connectors
- Conditional rendering: Show connectors only for non-root items
- Responsive: Hide lines when sidebar is collapsed (< 200px width)

**CSS Implementation**:

```css
/* Vertical line container */
.tree-node-children {
  position: relative;
}

/* Vertical guide line */
.tree-node-children::before {
  content: "";
  position: absolute;
  left: 12px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #e5e7eb; /* gray-200 */
}

/* Horizontal connector */
.tree-node-item::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 50%;
  width: 12px;
  height: 1px;
  background: #e5e7eb;
}

/* Last child adjustment */
.tree-node-item:last-child::before {
  /* Extend horizontal line from vertical */
}
```

### Delete Operation Design

**Delete Flow**:

```
┌──────────────────┐
│  User clicks     │
│  delete icon     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Show confirm    │ → Modal dialog with:
│  dialog          │ → • "Delete {name}?"
└────────┬─────────┘ → • "This action cannot be undone."
         │             → • File size, type metadata
         │             → • Confirm / Cancel buttons
         ▼
┌──────────────────┐
│  User confirms   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Call service    │ → databaseService.deleteOpfsFile(path)
│  deleteOpfsFile  │ → Or databaseService.deleteOpfsDirectory(path)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│  Delete success  │     │  Delete failed   │
│  • Remove from   │     │  • Show error    │
│    tree state    │     │    message       │
│  • Show toast    │     │  • Keep item in  │
│    confirmation  │     │    tree          │
└──────────────────┘     └──────────────────┘
```

**Delete Confirmation Modal**:

- **Title**: "Delete {item_name}?"
- **Metadata Display**:
  - Type: File / Directory
  - Size: {size_formatted}
  - Path: {full_path}
- **Warning Text**: "This action cannot be undone."
- **Actions**:
  - Cancel (secondary button)
  - Delete (danger button, red)

**Service Layer Function** (NEW):

```typescript
// databaseService.ts
deleteOpfsFile(path: string): Promise<ServiceResponse<void>>
deleteOpfsDirectory(path: string): Promise<ServiceResponse<void>>
```

### Enhanced Metadata Design

**Metadata Panel** (shown on hover/click):

| Field     | Display Format        | Example                           |
| --------- | --------------------- | --------------------------------- |
| Name      | Bold, primary text    | `database.sqlite`                 |
| Type      | Badge, color-coded    | `SQLite Database`                 |
| Size      | Secondary text, right | `1.2 MB`                          |
| Modified  | Tertiary text         | `2025-01-15 14:30`                |
| Full Path | Monospace, small      | `/data/databases/database.sqlite` |

**File Type Detection**:

- SQLite databases: `.sqlite`, `.db`, `.sqlite3` → "SQLite Database"
- JSON files: `.json` → "JSON Data"
- Text files: `.txt`, `.md` → "Text File"
- Images: `.png`, `.jpg`, `.svg` → "Image File"
- Unknown: Use extension or "File"

**Metadata Display Modes**:

1. **Inline Mode** (default): Name + size (current behavior)
2. **Hover Mode**: Show additional metadata on hover
3. **Detail Mode**: Show full metadata panel in sidebar

## 3) Functional Requirements

### FR-OPFS-001: Guided Tree Lines

**Display**:

- Vertical lines connect parent directories to all children
- Horizontal lines connect each item to the vertical line
- Lines render for nested items (depth > 0)
- Root items (depth = 0) have no vertical line

**Styling**:

- Line color: `gray-200` (#e5e7eb)
- Line width: 1px solid
- Smooth transitions on expand/collapse

**Responsive**:

- Hide tree lines when sidebar collapsed (< 200px)
- Adjust line position based on indentation level (16px per level)

**Accessibility**:

- Lines are decorative, no ARIA attributes needed
- Hierarchical relationship conveyed via nesting and indentation

### FR-OPFS-002: Delete Operation - Files

**Trigger**:

- Delete icon button in file row (right side, after download button)
- Icon: `IoMdTrash` (react-icons/io)
- Visible on hover (group-hover pattern)

**Confirmation**:

- Modal dialog with file metadata
- Warning message: "This action cannot be undone."
- Two buttons: Cancel (secondary), Delete (danger, red)

**Execution**:

- Call `databaseService.deleteOpfsFile(path)`
- Remove file from tree state on success
- Show toast notification on success
- Show inline error on failure

**Service Function**:

```typescript
deleteOpfsFile(path: string): Promise<ServiceResponse<void>>
```

### FR-OPFS-003: Delete Operation - Directories

**Trigger**:

- Delete icon button in directory row (right side, after chevron)
- Same icon and visibility pattern as files

**Confirmation**:

- Enhanced warning: "Delete directory and all contents?"
- Show item count: "Contains {file_count} files, {dir_count} subdirectories"
- Two buttons: Cancel (secondary), Delete (danger, red)

**Execution**:

- Call `databaseService.deleteOpfsDirectory(path)`
- Recursive delete via OPFS API
- Remove directory from tree state on success
- Show toast notification on success
- Show inline error on failure

**Service Function**:

```typescript
deleteOpfsDirectory(path: string): Promise<ServiceResponse<void>>
```

### FR-OPFS-004: Enhanced Metadata - Files

**Display Fields**:

- **Name**: File name (existing, unchanged)
- **Size**: Human-readable size (existing, unchanged)
- **Type**: File type badge (NEW)
  - SQLite Database: Blue badge
  - JSON Data: Yellow badge
  - Text File: Gray badge
  - Image File: Purple badge
  - Other: Default gray badge
- **Modified**: Last modified timestamp (NEW)
  - Format: `YYYY-MM-DD HH:mm` (local time)
  - Color: `gray-500` (secondary text)
- **Extension**: File extension shown in badge (NEW)

**Display Mode**:

- Default: Name + size inline
- Hover: Show type badge and modified timestamp
- Detail panel (optional): Full metadata with path

### FR-OPFS-005: Enhanced Metadata - Directories

**Display Fields**:

- **Name**: Directory name (existing, unchanged)
- **Item Count**: File and subdirectory counts (NEW)
  - Format: `{file_count} files, {dir_count} dirs`
  - Visible when expanded
  - Updated on lazy load
- **Modified**: Last modified timestamp (NEW)
  - Same format as files
- **Full Path**: Complete OPFS path (NEW)
  - Visible on hover/click
  - Monospace font

### FR-OPFS-006: Delete Confirmation Modal

**Component**: `DeleteConfirmModal` (NEW)

**Props**:

```typescript
interface DeleteConfirmModalProps {
  item: OpfsFileEntry;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}
```

**Content**:

- Title: "Delete {item.name}?"
- Type badge: File / Directory
- Metadata grid:
  - Size: {size_formatted}
  - Type: {file_type}
  - Modified: {last_modified}
  - Path: {full_path}
- Warning text (red): "This action cannot be undone."
- Buttons:
  - Cancel: Gray secondary button
  - Delete: Red danger button with trash icon

**Behavior**:

- Modal backdrop: `bg-gray-900 bg-opacity-50`
- Close on: Cancel button, backdrop click, Escape key
- Delete button: Loading state during deletion

### FR-OPFS-007: Toast Notifications

**Success Toast**:

- Title: "Deleted successfully"
- Message: "{item_name} has been deleted."
- Icon: Green checkmark
- Duration: 3 seconds (auto-dismiss)

**Error Toast**:

- Title: "Delete failed"
- Message: {error_message}
- Icon: Red error icon
- Duration: 5 seconds (auto-dismiss)
- Action: "Retry" button (reopens modal)

**Toast Position**: Top-right corner (fixed)

## 4) Non-Functional Requirements

### NFR-OPFS-001: Performance

- Tree line rendering should not impact scroll performance
- Lazy loading should remain unaffected (< 500ms for directory load)
- Metadata fetching should be batched (not per-file requests)
- Delete operation should complete in < 2 seconds for typical files

### NFR-OPFS-002: Accessibility

- Delete buttons have `aria-label="Delete {filename}"`
- Modal has `role="dialog"` and `aria-modal="true"`
- Focus trap in modal (Tab cycles within modal)
- Escape key closes modal
- Keyboard navigation: Tree items navigable with arrow keys

### NFR-OPFS-003: Visual Consistency

- Tree lines match VSCode file tree style (industry standard)
- Delete icons use consistent `IoMdTrash` from react-icons/io
- Toast notifications match existing notification style (if any)
- Modal styling matches existing modals in the extension

### NFR-OPFS-004: Browser Compatibility

- OPFS API detection: Graceful degradation if not supported
- CSS `::before` pseudo-elements: Supported in all modern browsers
- File metadata: Last modified date requires OPFS getFile() support

## 5) Out of Scope

- File upload to OPFS (separate feature)
- File rename operation (can be added later)
- File content preview (separate feature)
- Directory creation (can be added later)
- Drag-and-drop file operations
- Batch delete (multiple selection)
- File search/filter
- OPFS quota usage display

## 6) Dependencies

### Blocks

- None

### Depends On

- **F-001**: Service Layer Expansion (databaseService.ts)
  - Requires `deleteOpfsFile(path)` function
  - Requires `deleteOpfsDirectory(path)` function
  - Requires metadata fetching in `getOpfsFiles()`

### Related Features

- **F-008**: Opened Database List Route (both browse storage)
- **F-010**: Database Refresh Coordination (may share refresh patterns)

## 7) Success Criteria

### Acceptance Criteria

1. **Tree Lines Display**
   - [ ] Vertical lines connect parent to all children
   - [ ] Horizontal lines connect each child to vertical line
   - [ ] Lines render correctly for nested directories (depth > 0)
   - [ ] Lines hide when sidebar collapsed (< 200px)
   - [ ] Lines match VSCode file tree style

2. **Delete Operation - Files**
   - [ ] Delete icon visible on file row hover
   - [ ] Clicking delete opens confirmation modal
   - [ ] Modal shows file metadata (name, size, type, path)
   - [ ] Confirming delete removes file from tree
   - [ ] Success toast shown after deletion
   - [ ] Error toast shown on failure

3. **Delete Operation - Directories**
   - [ ] Delete icon visible on directory row hover
   - [ ] Confirmation shows item count (files, subdirectories)
   - [ ] Recursive delete removes directory and contents
   - [ ] Success toast shown after deletion
   - [ ] Error toast shown on failure

4. **Enhanced Metadata - Files**
   - [ ] File type badge shown on hover (SQLite, JSON, etc.)
   - [ ] Last modified timestamp shown on hover
   - [ ] File extension shown in type badge
   - [ ] Metadata displays correctly for all file types

5. **Enhanced Metadata - Directories**
   - [ ] Item count shown when directory expanded
   - [ ] Last modified timestamp shown on hover
   - [ ] Full path shown on hover/click

6. **Delete Confirmation Modal**
   - [ ] Modal opens on delete button click
   - [ ] Modal shows all item metadata
   - [ ] Warning text displayed clearly
   - [ ] Cancel button closes modal
   - [ ] Delete button shows loading state
   - [ ] Modal closes on backdrop click or Escape key

7. **Service Layer Functions**
   - [ ] `deleteOpfsFile(path)` implemented in databaseService.ts
   - [ ] `deleteOpfsDirectory(path)` implemented in databaseService.ts
   - [ ] Both functions return `ServiceResponse<void>`
   - [ ] Error handling for OPFS API failures
   - [ ] Recursive delete for directories

8. **Integration**
   - [ ] OPFS browser route (`/opfs`) works with all enhancements
   - [ ] No regression in existing download functionality
   - [ ] No regression in existing lazy loading
   - [ ] Build passes without errors
   - [ ] ESLint passes without new warnings

## 8) Implementation Notes

### Files to Create

1. **src/devtools/components/OPFSBrowser/DeleteConfirmModal.tsx**
   - Delete confirmation modal component
   - Metadata display grid
   - Confirm/cancel buttons with loading states

2. **src/devtools/components/OPFSBrowser/TreeLines.tsx**
   - Reusable tree line connectors
   - Vertical and horizontal guide lines
   - Responsive visibility toggle

3. **src/devtools/components/OPFSBrowser/MetadataPanel.tsx**
   - Enhanced metadata display
   - File type badges
   - Timestamp formatting

4. **src/devtools/components/OPFSBrowser/Toast.tsx**
   - Toast notification component
   - Success and error variants
   - Auto-dismiss with timer

### Files to Modify

1. **src/devtools/services/databaseService.ts**
   - Add `deleteOpfsFile(path)` function
   - Add `deleteOpfsDirectory(path)` function
   - Update `OpfsFileEntry` type to include metadata fields
   - Add metadata fetching in `getOpfsFiles()`

2. **src/devtools/components/OPFSBrowser/FileTree.tsx**
   - Add tree line connectors
   - Add delete button to FileTreeItem
   - Add metadata display on hover
   - Integrate DeleteConfirmModal

3. **src/devtools/components/OPFSBrowser/FileNode.tsx**
   - Update to display enhanced metadata
   - Add file type badges
   - Add delete button

4. **src/devtools/components/OPFSBrowser/OPFSGallery.tsx**
   - Add toast container
   - Handle delete confirmations
   - Refresh tree after successful delete

### Type Definitions

```typescript
// Enhanced OpfsFileEntry type
interface OpfsFileEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number; // bytes
  sizeFormatted: string; // e.g., "1.2 MB"
  lastModified?: Date; // NEW
  fileType?: string; // NEW: "SQLite Database", "JSON Data", etc.
  itemCount?: {
    files: number; // NEW: for directories
    directories: number; // NEW: for directories
  };
}

// Delete operation types
interface DeleteOpfsResult {
  success: boolean;
  deletedPath: string;
  itemCount?: number; // For directories
}
```

### Service Layer Implementation

```typescript
// databaseService.ts - NEW FUNCTIONS

/**
 * Delete a file from OPFS
 * @param path - Full path to the file
 * @returns ServiceResponse<void>
 */
deleteOpfsFile: async (path: string) => {
  try {
    const script = `
      (async () => {
        const root = await navigator.storage.getDirectory();
        const pathParts = '${path}'.split('/').filter(Boolean);
        let dir = root;

        for (let i = 0; i < pathParts.length - 1; i++) {
          dir = await dir.getDirectoryHandle(pathParts[i]);
        }

        const filename = pathParts[pathParts.length - 1];
        await dir.removeEntry(filename);

        return { success: true };
      })()
    `;

    return await inspectedWindowBridge.execute(script);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Delete a directory and all contents from OPFS
 * @param path - Full path to the directory
 * @returns ServiceResponse<{ itemCount: number }>
 */
deleteOpfsDirectory: async (path: string) => {
  try {
    const script = `
      (async () => {
        const root = await navigator.storage.getDirectory();
        const pathParts = '${path}'.split('/').filter(Boolean);
        let dir = root;

        for (let i = 0; i < pathParts.length - 1; i++) {
          dir = await dir.getDirectoryHandle(pathParts[i]);
        }

        const dirname = pathParts[pathParts.length - 1];
        const targetDir = await dir.getDirectoryHandle(dirname);

        // Count items before delete
        let itemCount = 0;
        for await (const _ of targetDir.values()) {
          itemCount++;
        }

        // Delete recursively
        await dir.removeEntry(dirname, { recursive: true });

        return { success: true, data: { itemCount } };
      })()
    `;

    return await inspectedWindowBridge.execute(script);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
```

### Icon Integration

- **Delete**: `IoMdTrash` (react-icons/io) - Delete button
- **Warning**: `FaExclamationTriangle` (react-icons/fa) - Modal warning
- **Success**: `FaCheck` (react-icons/fa) - Toast success
- **Error**: `FaExclamationCircle` (react-icons/fa) - Toast error

### Theme Colors

- **Tree Lines**: `border-gray-200` (#e5e7eb)
- **Delete Button**: `text-red-500 hover:text-red-600`
- **Danger Button**: `bg-red-600 hover:bg-red-700 text-white`
- **Success Toast**: `bg-green-50 border-green-200 text-green-700`
- **Error Toast**: `bg-red-50 border-red-200 text-red-700`
- **Type Badges**:
  - SQLite Database: `bg-blue-100 text-blue-700`
  - JSON Data: `bg-yellow-100 text-yellow-700`
  - Text File: `bg-gray-100 text-gray-700`
  - Image File: `bg-purple-100 text-purple-700`

## 9) Effort Estimation

- **Estimated Time**: 8-12 hours
- **Complexity**: Medium (multiple interconnected features)
- **Risk**: Medium (delete operations are destructive)

### Time Breakdown

1. **Service Layer Functions** (1.5 hours)
   - Implement `deleteOpfsFile(path)` in databaseService.ts
   - Implement `deleteOpfsDirectory(path)` in databaseService.ts
   - Update `OpfsFileEntry` type with metadata fields
   - Add metadata fetching to `getOpfsFiles()`
   - Error handling and testing

2. **Guided Tree Lines** (2 hours)
   - Create TreeLines.tsx component
   - CSS styling for vertical/horizontal connectors
   - Responsive hiding for collapsed sidebar
   - Integration with FileTree.tsx
   - Testing with various nesting depths

3. **Delete Confirmation Modal** (2 hours)
   - Create DeleteConfirmModal.tsx component
   - Metadata display grid layout
   - Confirm/cancel button logic
   - Loading state handling
   - Accessibility (focus trap, ARIA)

4. **Enhanced Metadata Display** (2 hours)
   - Create MetadataPanel.tsx component
   - File type detection and badges
   - Timestamp formatting utilities
   - Hover/click interaction
   - Directory item counting

5. **Toast Notifications** (1 hour)
   - Create Toast.tsx component
   - Success and error variants
   - Auto-dismiss logic
   - Position styling (top-right)
   - Integration with delete operations

6. **Integration & Testing** (1.5 hours)
   - Integrate all components with FileTree.tsx
   - Update OPFSGallery.tsx for toast handling
   - Test delete operations (files and directories)
   - Test metadata display for all file types
   - Test tree line rendering at various depths
   - ESLint and build verification

7. **Documentation** (1 hour)
   - Update HLD.md with new components
   - Update API contract with delete functions
   - Update opfs-browser.md module documentation
   - Update feature spec with completion status

### Risk Assessment

| Risk                    | Probability | Impact | Mitigation                                    |
| ----------------------- | ----------- | ------ | --------------------------------------------- |
| Data loss from delete   | Low         | High   | Confirmation modal, warning text              |
| OPFS API compatibility  | Low         | Medium | Graceful degradation, error messages          |
| Tree line performance   | Low         | Low    | CSS-only implementation, no JS layout         |
| Metadata fetching delay | Medium      | Low    | Lazy load, show loading indicator             |
| Modal accessibility     | Low         | Medium | Focus trap, ARIA attributes, keyboard support |

## 10) Open Questions

1. **Should deleted items go to a trash bin, or be permanently deleted?**
   - **Decision**: Permanently deleted (OPFS has no trash concept)
   - **Rationale**: Simplicity, matches browser DevTools behavior

2. **Should we support batch delete (multiple selection)?**
   - **Decision**: Out of scope for this feature
   - **Rationale**: Adds significant complexity, can be separate feature

3. **Should metadata be fetched eagerly or on-demand?**
   - **Decision**: On-demand (fetch when directory expanded)
   - **Rationale**: Better performance, reduces initial load time

4. **Should tree lines be customizable (color, width)?**
   - **Decision**: No (hardcode VSCode-style lines)
   - **Rationale**: Simplicity, follows established pattern

5. **Should we show a warning before deleting directories with many files?**
   - **Decision**: Yes (enhanced warning with item count)
   - **Rationale**: Prevents accidental data loss

## 11) References

- OPFS API: https://developer.mozilla.org/en-US/docs/Web/API/Origin_Private_File_System
- React Icons (IoMdTrash): https://react-icons.github.io/react-icons/icons/io/
- VSCode File Tree: https://code.visualstudio.com/docs/getstarted/userinterface
- Modal Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
- Toast Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/alert/

## 12) Related TODO Items

The following TODO.md items are addressed by this feature:

```
[ ] feat: Implement OPFS preview feature.                          ← PARTIAL (already exists)
- [ ] feat: Add a file tree view for OPFS files and directories.   ← COMPLETE (already exists)
- [ ] feat: Implement lazy loading for directory contents in the file tree view. ← COMPLETE (already exists)
- [ ] feat: display the dotted line to draw the hierarchy relationship between files and directories. ← THIS FEATURE
- [ ] feat: Add collapsible functionality for directories in the file tree view with the expand/collapse icon from react-icons. ← COMPLETE (already exists)

[ ] feat: Add file operations ( delete, download) for OPFS files and directories. ← PARTIAL (download exists, delete added by THIS FEATURE)
```

**Completion Status**:

- File tree view: ✓ Already implemented
- Lazy loading: ✓ Already implemented
- Guided tree lines: ✗ **Added by F-012**
- Collapsible directories: ✓ Already implemented
- Download operation: ✓ Already implemented
- Delete operation: ✗ **Added by F-012**
- Enhanced metadata: ✗ **Added by F-012**
