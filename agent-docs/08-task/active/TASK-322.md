# TASK-322: File Tree Enhancements - File Counts (F-014)

## Metadata

- **Task ID**: TASK-322
- **Feature**: F-014: OPFS UI Visual Redesign
- **Priority**: P1 (High)
- **Estimated**: 1.5 hours
- **Status**: In Progress
- **Dependencies**: F-012 ✅ (FileTree must exist)
- **Boundary**: `src/devtools/components/OPFSBrowser/FileTree.tsx`, `src/devtools/components/OPFSBrowser/FileNode.tsx`

## Objective

Add file/directory count display to folder nodes in the FileTree:

1. Add `getDirectoryCounts(entry)` helper function to calculate counts
2. Display counts in FileNode.tsx for directories only (e.g., "3 files 2 dirs", "120 files")
3. Style counts as `text-xs text-gray-500 ml-2`

## Boundary

- **Files to modify**: `src/devtools/components/OPFSBrowser/FileTree.tsx`, `src/devtools/components/OPFSBrowser/FileNode.tsx`
- **Files to create**: None
- **Files to delete**: None
- **No changes to**: Service layer, types, other components

## Upstream Documentation

- Feature spec: `agent-docs/01-discovery/features/F-014-opfs-ui-redesign.md`
- HLD Section 19: `agent-docs/03-architecture/01-hld.md`
- LLD Section 12: `agent-docs/05-design/03-modules/opfs-browser.md`
- Roadmap Phase 11: `agent-docs/07-taskManager/01-roadmap.md`

## Current State Analysis

**Current FileTree.tsx** (FileTreeItem component, lines 37-140):

- No count calculation or display
- Only shows entry names with icons

**Current FileNode.tsx** (lines 35-140):

- Renders file/directory name
- No count display

## Implementation Plan

### Phase 1: Add getDirectoryCounts Helper (30 min)

1. Add function to FileTree.tsx or separate utility
2. Accept `OpfsFileEntry` as parameter
3. Return empty string for files
4. Calculate file count from `entry.children` (filter by `type === 'file'`)
5. Calculate directory count from `entry.children` (filter by `type === 'directory'`)
6. Return formatted string: "3 files", "2 dirs", or "3 files 2 dirs"

### Phase 2: Pass Counts to FileNode (20 min)

1. Update FileTreeItemProps to include optional `fileCounts` prop
2. Calculate counts in FileTreeItem when children are loaded
3. Pass counts to FileNode component

### Phase 3: Display Counts in FileNode (30 min)

1. Update FileNodeProps to accept optional `fileCounts` prop
2. Display count span next to directory name
3. Style: `text-xs text-gray-500 ml-2`
4. Only display for directories (not files)
5. Handle empty directories (show "0 files" or nothing)

### Phase 4: Testing (10 min)

- Test counts display correctly for various directory sizes
- Test empty directories
- Test directories with only files, only dirs, or both
- Test that counts update after delete operations

## Definition of Done

- [x] getDirectoryCounts helper function added to FileTree.tsx
- [x] Helper uses entry.itemCount for file/directory counts
- [x] Returns formatted string ("3 files", "2 dirs", or "3 files 2 dirs")
- [x] Counts displayed in FileTreeItem component for directories
- [x] Styled as `text-xs text-gray-500 ml-2`
- [x] Only displays for directories (not files)
- [x] Empty directories handled correctly
- [x] ESLint passed with no new warnings
- [x] TypeScript compilation successful (pre-existing errors in other files unrelated to this task)

## Functional-First Design

This task uses only functional React patterns:

- Pure function for count calculation (no side effects)
- Functional components with props
- No class components or OOP patterns
- Conditional rendering based on entry.type

## Code Quality Requirements

- Pure function with single responsibility
- TSDoc comments with @example
- Type-safe with TypeScript interface
- Follow S8 quality rules (functional components, hooks)

## Helper Function Signature

````typescript
/**
 * Get directory counts for display
 *
 * @param entry - OpfsFileEntry to calculate counts for
 * @returns Formatted count string (e.g., "3 files 2 dirs") or empty string for files
 *
 * @example
 * ```ts
 * const counts = getDirectoryCounts(entry); // "3 files 2 dirs"
 * ```
 */
const getDirectoryCounts = (entry: OpfsFileEntry): string => {
  if (entry.type !== "directory") return "";

  const children = entry.children ?? [];
  const fileCount = children.filter((c) => c.type === "file").length;
  const dirCount = children.filter((c) => c.type === "directory").length;

  if (dirCount === 0) return `${fileCount} files`;
  if (fileCount === 0) return `${dirCount} dirs`;
  return `${fileCount} files ${dirCount} dirs`;
};
````

## Component Interface Updates

```typescript
// FileTreeItemProps - Add optional fileCounts
interface FileTreeItemProps {
  entry: OpfsFileEntry;
  level: number;
  onDownload: (_path: string, name: string) => Promise<void>;
  onDelete?: (entry: OpfsFileEntry) => void;
  onFileSelect?: (entry: OpfsFileEntry) => void;
  selectedFile?: OpfsFileEntry | null;
  keyPrefix: string;
  showLines: boolean;
  isLast?: boolean;
  fileCounts?: string; // NEW - TASK-322
}

// FileNodeProps - Add optional fileCounts
interface FileNodeProps {
  entry: OpfsFileEntry;
  level?: number;
  onDownload: (_path: string, name: string) => Promise<void>;
  onDelete?: (entry: OpfsFileEntry) => void;
  fileCounts?: string; // NEW - TASK-322
}
```

## Styling Specifications

| Element     | Tailwind Classes             | Color             |
| ----------- | ---------------------------- | ----------------- |
| Count Text  | `text-xs text-gray-500 ml-2` | Gray-500 on white |
| Empty Count | Hidden (no display)          | N/A               |

## File Count Formats

| Scenario             | Format                | Example          |
| -------------------- | --------------------- | ---------------- |
| Files only           | "{N} files"           | "3 files"        |
| Directories only     | "{N} dirs"            | "2 dirs"         |
| Mixed                | "{N} files {M} dirs"  | "3 files 2 dirs" |
| Empty directory      | "0 files" (or hidden) | "0 files"        |
| File (not directory) | Empty string          | N/A              |

## Testing Strategy

Manual testing only (visual changes):

1. Expand directory with files and subdirectories - verify counts
2. Expand empty directory - verify "0 files" or nothing
3. Delete file from directory - verify count updates
4. Test various directory sizes (small, large)

## Rollback Strategy

Instant rollback - revert function changes if issues arise.
