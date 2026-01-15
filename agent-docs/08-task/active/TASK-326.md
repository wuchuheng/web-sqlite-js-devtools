# TASK-326: Icon Imports and Helper Functions (F-015)

## Metadata

- **Task ID**: TASK-326
- **Feature**: F-015: OPFS Tree Visual Enhancements
- **Priority**: P0 (Blocker)
- **Estimated**: 1 hour
- **Status**: In Progress
- **Dependencies**: None
- **Boundary**: `src/devtools/components/OPFSBrowser/FileTree.tsx`

## Objective

Add icon imports and create helper functions to support file type-specific icons in the OPFS File Tree:

1. Add 6 icon imports from 4 react-icons libraries
2. Create `getFileExtension()` helper to extract file extension
3. Create `getFileIcon()` helper with switch statement for 6 file types
4. Add TSDoc comments with @example

## Boundary

- **Files to modify**: `src/devtools/components/OPFSBrowser/FileTree.tsx` (imports and helper functions)
- **Files to create**: None
- **Files to delete**: None
- **No changes to**: Service layer, types, other components

## Upstream Documentation

- Feature spec: `agent-docs/01-discovery/features/F-015-opfs-tree-enhancements.md`
- HLD Section 20: `agent-docs/03-architecture/01-hld.md`
- LLD Section 13: `agent-docs/05-design/03-modules/opfs-browser.md`
- Roadmap Phase 12: `agent-docs/07-taskManager/01-roadmap.md`

## Current State Analysis

**Current FileTree.tsx** (lines 1-7):

```tsx
import { useState, useCallback, useEffect, useRef } from "react";
import { FaFile, FaDownload } from "react-icons/fa";
import { IoMdTrash } from "react-icons/io";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";
import { TreeLines } from "./TreeLines";
```

**Icon Rendering** (lines 199-224):

```tsx
{
  /* Icon */
}
{
  isDirectory ? (
    isLoading ? (
      <div className="animate-spin h-3 w-3 border-2 border-yellow-600 border-t-transparent rounded-full" />
    ) : isExpanded ? (
      <svg
        className="w-3 h-3 text-yellow-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a2 2 0 100 4h8a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2zm2 10a2 2 0 100-4H8a2 2 0 000 4h8z"
        />
      </svg>
    ) : (
      <svg
        className="w-3 h-3 text-yellow-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a2 2 0 100 4h8a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2z" />
      </svg>
    )
  ) : (
    <FaFile className="text-gray-500" size={12} />
  );
}
```

## Implementation Plan

### Phase 1: Add Icon Imports (15 min)

1. Add `FaDatabase` import from `react-icons/fa6`
2. Add `FaRegFileImage`, `FaFolder`, `FaFolderOpen` imports from `react-icons/fa`
3. Add `TiDocumentText` import from `react-icons/ti`
4. Add `LuFileJson` import from `react-icons/lu`
5. Keep existing `FaFile` import (already present)
6. Verify no import errors

### Phase 2: Create getFileExtension Helper (15 min)

1. Add helper function after `getDirectoryCounts` (line ~44)
2. Extract file extension using `lastIndexOf('.')`
3. Return lowercase extension with dot
4. Add TSDoc comment with @example
5. Handle edge case (no extension returns empty string)

### Phase 3: Create getFileIcon Helper (30 min)

1. Add helper function after `getFileExtension`
2. Accept `entry: OpfsFileEntry` and `isExpanded: boolean` parameters
3. Return `ReactNode` for icon component
4. Implement switch statement for 6 file types:
   - `.sqlite3` → `FaDatabase` (purple-600)
   - Images (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`, `.ico`) → `FaRegFileImage` (purple-500)
   - `.txt` → `TiDocumentText` (gray-600)
   - `.json`, `.json5` → `LuFileJson` (yellow-600)
   - Directories → `FaFolderOpen` (yellow-500) or `FaFolder` (gray-600)
   - Unknown → `FaFile` (gray-500)
5. Add TSDoc comment with @example

### Phase 4: Testing (15 min)

- Visual test: Verify all 6 icon types render correctly
- Test .sqlite3 files show purple database icon
- Test image files show purple image icon
- Test .txt files show gray text icon
- Test .json files show yellow JSON icon
- Test directories show folder icons (open/closed states)
- Test unknown files show gray file icon
- ESLint verification
- Build verification

## Definition of Done

- [ ] Icon imports added to FileTree.tsx (6 icons from 4 libraries)
- [ ] getFileExtension() helper created with TSDoc
- [ ] getFileIcon() helper created with switch statement for 6 types
- [ ] TSDoc comments with @example for both helpers
- [ ] Icons render correctly for all 6 file types
- [ ] ESLint passed with no new warnings
- [ ] Build passed with no errors

## Functional-First Design

This task uses only functional React patterns:

- Pure helper functions (no side effects)
- Functional components with hooks
- No class components or OOP patterns
- Switch statement for icon selection (pattern matching)

## Code Quality Requirements

- Pure functions with single responsibility
- TSDoc comments with @example for helpers
- Type-safe with TypeScript interfaces
- Follow S8 quality rules (functional components, hooks)
- Three-phase comments for functions > 5 lines

## Helper Function Signatures

````typescript
/**
 * Get file extension from filename
 *
 * @param filename - File name to extract extension from
 * @returns File extension with dot (e.g., ".txt") or empty string
 *
 * @example
 * ```ts
 * const ext = getFileExtension("database.sqlite3"); // ".sqlite3"
 * const ext2 = getFileExtension("README"); // ""
 * ```
 */
const getFileExtension = (filename: string): string => {
  // Implementation
};

/**
 * Get icon component based on file type and expansion state
 *
 * @param entry - OpfsFileEntry to get icon for
 * @param isExpanded - Whether directory is expanded (for folder icons)
 * @returns ReactNode representing the icon
 *
 * @example
 * ```ts
 * const icon = getFileIcon(entry, true); // <FaFolderOpen />
 * const icon2 = getFileIcon(fileEntry, false); // <FaDatabase />
 * ```
 */
const getFileIcon = (entry: OpfsFileEntry, isExpanded: boolean): ReactNode => {
  // Implementation
};
````

## Icon Imports Specification

```typescript
import { FaDatabase } from "react-icons/fa6";
import { FaRegFileImage, FaFolder, FaFolderOpen, FaFile } from "react-icons/fa";
import { TiDocumentText } from "react-icons/ti";
import { LuFileJson } from "react-icons/lu";
```

## Icon Color Scheme

| File Type            | Icon           | Tailwind Color    | Hex Code |
| -------------------- | -------------- | ----------------- | -------- |
| Directories (closed) | FaFolder       | `text-gray-600`   | #4b5563  |
| Directories (open)   | FaFolderOpen   | `text-yellow-500` | #eab308  |
| SQLite Database      | FaDatabase     | `text-purple-600` | #9333ea  |
| Images               | FaRegFileImage | `text-purple-500` | #a855f7  |
| Text Files           | TiDocumentText | `text-gray-600`   | #4b5563  |
| JSON Files           | LuFileJson     | `text-yellow-600` | #ca8a04  |
| Unknown Files        | FaFile         | `text-gray-500`   | #6b7280  |

## File Extension Mapping

| Extension                                                | Icon                    | Size |
| -------------------------------------------------------- | ----------------------- | ---- |
| `.sqlite3`                                               | FaDatabase              | 14px |
| `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`, `.ico` | FaRegFileImage          | 12px |
| `.txt`                                                   | TiDocumentText          | 14px |
| `.json`, `.json5`                                        | LuFileJson              | 14px |
| Directories                                              | FaFolder / FaFolderOpen | 14px |
| Unknown                                                  | FaFile                  | 12px |

## Testing Strategy

Manual testing only (visual changes):

1. Test .sqlite3 files display purple database icon
2. Test image files display purple image icon
3. Test .txt files display gray text icon
4. Test .json/.json5 files display yellow JSON icon
5. Test closed directories show gray folder icon
6. Test open directories show yellow open folder icon
7. Test unknown file types show gray file icon
8. ESLint verification
9. Build verification

## Rollback Strategy

Instant rollback - revert import additions and helper functions if issues arise.
