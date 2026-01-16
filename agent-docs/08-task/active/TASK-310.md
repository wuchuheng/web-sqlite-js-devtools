<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-310.md

NOTES
- Functional-first design (props-driven, no internal state)
- All functions > 5 lines need numbered three-phase comments
- Exported/public functions need TSDoc comments
-->

# TASK-310: Delete Confirmation Modal (F-012)

## 0) Meta

- **Task ID**: TASK-310
- **Feature**: F-012 - OPFS Browser Enhancement
- **Status**: Draft
- **Created**: 2026-01-15
- **Estimated**: 2 hours
- **Priority**: P1 (High) - Core Feature Completion
- **Dependencies**: TASK-308 (Service Layer - Delete Operations)

## 1) Purpose

Create a reusable DeleteConfirmModal component that displays metadata for the item to be deleted, shows appropriate warning messages, and provides confirm/cancel actions. This prevents accidental data loss by requiring explicit user confirmation before deleting files or directories from OPFS.

## 2) Upstream Documents

- **Spec**: `agent-docs/00-control/00-spec.md`
- **Feature**: `agent-docs/01-discovery/features/F-012-opfs-browser-enhancement.md`
- **HLD**: `agent-docs/03-architecture/01-hld.md`
- **LLD**: `agent-docs/05-design/03-modules/opfs-browser-enhancement.md` (if exists)
- **Roadmap**: `agent-docs/07-taskManager/01-roadmap.md` (Phase 9, F-012)
- **Task Catalog**: `agent-docs/07-taskManager/02-task-catalog.md` (TASK-310)

## 3) Boundary

### Files

| Type   | Path                                                         | Purpose                   |
| ------ | ------------------------------------------------------------ | ------------------------- |
| CREATE | `src/devtools/components/OPFSBrowser/DeleteConfirmModal.tsx` | Delete confirmation modal |

### Out of Scope

- Bulk delete confirmation (single item only)
- Undo/redo functionality (separate feature)
- Delete history (separate feature)
- Trash/recycle bin (separate feature)

## 4) Implementation Design

### Component: `DeleteConfirmModal.tsx`

#### Props Interface

```typescript
interface DeleteConfirmModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** File or directory entry to delete */
  entry: OpfsFileEntry | null;
  /** Function called when user confirms deletion */
  onConfirm: () => Promise<void>;
  /** Function called when user cancels or closes modal */
  onCancel: () => void;
  /** Whether delete operation is in progress */
  isDeleting?: boolean;
}
```

#### Component Structure

```typescript
/**
 * Delete confirmation modal for OPFS files and directories
 *
 * Displays item metadata, warning message, and confirm/cancel buttons.
 * Prevents accidental data loss by requiring explicit user confirmation.
 *
 * @param props - DeleteConfirmModalProps
 * @returns React component
 *
 * @example
 * <DeleteConfirmModal
 *   isOpen={isModalOpen}
 *   entry={selectedEntry}
 *   onConfirm={handleDelete}
 *   onCancel={closeModal}
 *   isDeleting={isDeleting}
 * />
 */
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  entry,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  // 1. Handle backdrop click and Escape key
  // 2. Render modal structure (backdrop + container)
  // 3. Render metadata display grid
  // 4. Render warning text (enhanced for directories)
  // 5. Render confirm/cancel buttons with loading state
};
```

#### Modal Structure

```typescript
import React, { useEffect } from 'react';
import { IoMdTrash } from 'react-icons/io';

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  entry,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen || !entry) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onCancel();
    }
  };

  const handleConfirm = async () => {
    await onConfirm();
    // Parent component responsible for closing modal after successful delete
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-50"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Delete confirmation"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        {/* See sections below */}
      </div>
    </div>
  );
};
```

#### Metadata Display Grid

```typescript
<div className="space-y-4">
  {/* Title */}
  <h2 className="text-xl font-semibold text-gray-900">
    Delete {entry.name}?
  </h2>

  {/* Metadata Grid */}
  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
    {/* Type Badge */}
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-600">Type</span>
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          entry.type === 'file'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}
      >
        {entry.type === 'file' ? 'File' : 'Directory'}
      </span>
    </div>

    {/* Size */}
    {entry.type === 'file' && (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Size</span>
        <span className="text-sm text-gray-900 font-mono">
          {entry.sizeFormatted}
        </span>
      </div>
    )}

    {/* File Type */}
    {entry.fileType && (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">File Type</span>
        <span className="text-sm text-gray-900">{entry.fileType}</span>
      </div>
    )}

    {/* Last Modified */}
    {entry.lastModified && (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Modified</span>
        <span className="text-sm text-gray-900">
          {entry.lastModified.toLocaleString()}
        </span>
      </div>
    )}

    {/* Item Count (for directories) */}
    {entry.type === 'directory' && entry.itemCount && (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Contains</span>
        <span className="text-sm text-gray-900">
          {entry.itemCount.files} {entry.itemCount.files === 1 ? 'file' : 'files'},
          {entry.itemCount.directories} {entry.itemCount.directories === 1 ? 'directory' : 'directories'}
        </span>
      </div>
    )}

    {/* Path */}
    <div className="pt-2 border-t border-gray-200">
      <span className="text-xs font-medium text-gray-500 block mb-1">
        Full Path
      </span>
      <span className="text-xs text-gray-700 font-mono break-all">
        {entry.path}
      </span>
    </div>
  </div>

  {/* Warning Text */}
  {/* See section below */}

  {/* Buttons */}
  {/* See section below */}
</div>
```

#### Warning Text

```typescript
{/* Warning Message */}
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <p className="text-sm text-red-800 font-medium">
    This action cannot be undone.
  </p>

  {/* Enhanced warning for directories */}
  {entry.type === 'directory' && entry.itemCount && (
    <p className="text-sm text-red-700 mt-2">
      Delete directory and all contents ({entry.itemCount.files + entry.itemCount.directories} items)?
    </p>
  )}
</div>
```

#### Confirm/Cancel Buttons

```typescript
{/* Buttons */}
<div className="flex justify-end gap-3 mt-6">
  {/* Cancel Button */}
  <button
    type="button"
    onClick={onCancel}
    disabled={isDeleting}
    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Cancel
  </button>

  {/* Delete Button */}
  <button
    type="button"
    onClick={handleConfirm}
    disabled={isDeleting}
    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
  >
    {isDeleting ? (
      <>
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          {/* Loading spinner */}
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Deleting...
      </>
    ) : (
      <>
        <IoMdTrash size={16} />
        Delete
      </>
    )}
  </button>
</div>
```

## 5) Functional Requirements

### FR-310-001: Modal Structure

**Requirement**: Render modal with backdrop and centered container

**Implementation**:

- Backdrop: `bg-gray-900 bg-opacity-50`
- Container: `bg-white rounded-lg shadow-xl max-w-md`
- Centered with flexbox
- Close on: Cancel button, backdrop click, Escape key
- Block close with backdrop click during delete (isDeleting = true)

### FR-310-002: Metadata Display

**Requirement**: Display all relevant metadata for the item

**Fields to Display**:

1. **Type Badge**: File (blue) or Directory (yellow)
2. **Size**: Formatted size (e.g., "1.2 MB") - files only
3. **File Type**: "SQLite Database", "JSON Data", etc. - files only
4. **Modified**: Last modified timestamp - files only
5. **Contains**: Item count (files + directories) - directories only
6. **Full Path**: Complete OPFS path (monospace font)

**Layout**: Grid with key-value pairs, gray-50 background

### FR-310-003: Warning Text

**Requirement**: Display clear warning about permanent deletion

**Base Warning**:

- Text: "This action cannot be undone."
- Style: Red text on red-50 background with red-200 border

**Enhanced Warning for Directories**:

- Additional text: "Delete directory and all contents (X items)?"
- Show item count from `entry.itemCount`
- More prominent warning for recursive delete

### FR-310-004: Confirm/Cancel Buttons

**Requirement**: Provide clear actions with appropriate styling

**Cancel Button**:

- Gray secondary button
- Text: "Cancel"
- Disabled during delete (isDeleting = true)
- Closes modal

**Delete Button**:

- Red danger button
- Icon: IoMdTrash
- Text: "Delete" / "Deleting..." (loading state)
- Disabled during delete (isDeleting = true)
- Loading spinner when isDeleting = true
- Triggers onConfirm callback

### FR-310-005: Loading State

**Requirement**: Show loading state during deletion

**Implementation**:

- Disable both buttons when isDeleting = true
- Show loading spinner on Delete button
- Change text to "Deleting..."
- Prevent closing modal during delete
- Parent component responsible for closing modal after success/error

### FR-310-006: Accessibility

**Requirement**: Modal must be accessible to all users

**Features**:

- `role="dialog"` attribute
- `aria-modal="true"` attribute
- `aria-label="Delete confirmation"` attribute
- Focus trap (Tab cycles within modal)
- Escape key closes modal
- Keyboard navigation works
- Screen reader announcements
- High contrast colors for warnings

## 6) Non-Functional Requirements

### NFR-310-001: Performance

- Modal opens instantly (< 100ms)
- No lag on button clicks
- Smooth animations (fade in/out)
- No re-renders during deletion

### NFR-310-002: User Experience

- Clear visual hierarchy (title > metadata > warning > buttons)
- High contrast warnings (red on white)
- Large click targets (buttons > 36px height)
- Loading feedback for async operations
- Prevents accidental deletion (requires explicit confirm)

### NFR-310-003: Code Quality

- TypeScript strict mode
- No internal state (props-driven)
- Proper error handling
- TSDoc comments
- Consistent with project style

### NFR-310-004: Browser Compatibility

- Works in all modern browsers
- Uses standard React patterns
- No vendor-specific APIs
- Graceful fallback for older browsers

## 7) Testing Requirements

### Unit Tests

1. **Modal Rendering**
   - Render with isOpen = true
   - Verify backdrop renders
   - Verify container renders
   - Verify metadata displays correctly

2. **File Metadata Display**
   - Pass file entry with all fields
   - Verify size displayed
   - Verify fileType displayed
   - Verify lastModified displayed
   - Verify type badge is blue

3. **Directory Metadata Display**
   - Pass directory entry with itemCount
   - Verify item count displayed
   - Verify warning shows item count
   - Verify type badge is yellow

4. **Button Interactions**
   - Click Cancel button
   - Verify onCancel called
   - Click Delete button
   - Verify onConfirm called

5. **Loading State**
   - Render with isDeleting = true
   - Verify buttons disabled
   - Verify loading spinner shows
   - Verify backdrop click doesn't close

6. **Accessibility**
   - Verify role="dialog" attribute
   - Verify aria-modal="true" attribute
   - Verify Escape key closes modal
   - Verify focus trap works

### Integration Tests

1. **Delete Flow**
   - Open modal
   - Click Delete button
   - Verify onConfirm called
   - Verify modal stays open during delete
   - Verify parent closes modal after success

2. **Cancel Flow**
   - Open modal
   - Click backdrop
   - Verify onCancel called
   - Verify modal closes

## 8) Definition of Done

- [ ] DeleteConfirmModal component created with proper TypeScript types
- [ ] Modal structure implemented (backdrop + container)
- [ ] Metadata display grid implemented
- [ ] Warning text implemented (base + enhanced for directories)
- [ ] Confirm/cancel buttons implemented
- [ ] Loading state implemented
- [ ] Accessibility features implemented
- [ ] Close on: Cancel button, backdrop click, Escape key
- [ ] TSDoc comments added
- [ ] ESLint passed with no new warnings
- [ ] Build passed with no errors
- [ ] Manual testing completed
- [ ] LLD updated with implementation status

## 9) Implementation Phases

### Phase 1: Component Structure (0.5 hour)

- Create DeleteConfirmModal.tsx file
- Define Props interface
- Create component skeleton
- Add TSDoc comments
- Export component

### Phase 2: Modal Layout (0.25 hour)

- Implement backdrop
- Implement centered container
- Add role and ARIA attributes
- Test modal positioning

### Phase 3: Metadata Display (0.5 hour)

- Implement metadata grid layout
- Add type badge (color-coded)
- Add file-specific fields (size, type, modified)
- Add directory-specific fields (item count)
- Add full path display (monospace)

### Phase 4: Warning Text (0.25 hour)

- Implement base warning
- Implement enhanced warning for directories
- Add red styling
- Test warning clarity

### Phase 5: Buttons & Loading (0.25 hour)

- Implement Cancel button
- Implement Delete button with icon
- Add loading state
- Disable buttons during delete
- Test button interactions

### Phase 6: Accessibility & Polish (0.25 hour)

- Add Escape key handler
- Implement focus trap
- Add backdrop click handler
- Test keyboard navigation
- Test screen reader compatibility

## 10) Risk Assessment

| Risk                 | Probability | Impact | Mitigation                      |
| -------------------- | ----------- | ------ | ------------------------------- |
| Accidental delete    | Low         | High   | Explicit confirmation required  |
| Modal doesn't close  | Low         | Medium | Multiple close methods          |
| Accessibility issues | Low         | Medium | Follow ARIA best practices      |
| Performance issues   | Low         | Low    | Simple component, minimal state |

## 11) Open Questions

None - all resolved in upstream docs.

## 12) References

- Feature F-012 spec: `agent-docs/01-discovery/features/F-012-opfs-browser-enhancement.md`
- Modal pattern: React modal best practices
- ARIA guidelines: https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
- OPFS service layer: `src/devtools/services/databaseService.ts`

## 13) Functional-First Design

This spec uses **functional-first design**:

- **Props-driven** - No internal state, all control from parent
- **Side-effect free** - Only callbacks, no direct mutations
- **Accessibility first** - Full keyboard and screen reader support
- **Type safety** - TypeScript strict mode with proper types

**Rationale**: Modal is a pure UI component that displays data and triggers callbacks. Parent component owns the state and business logic.
