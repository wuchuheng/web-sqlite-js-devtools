<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/features/feature.md

OUTPUT MAP (write to)
agent-docs/01-discovery/features/F-015-opfs-tree-enhancements.md

NOTES
- Feature F-015: OPFS Tree Visual Enhancements
- Based on user feedback comparing current vs prototype screenshots
-->

# Feature F-015: OPFS Tree Visual Enhancements

## 0) Meta

- **Feature ID**: F-015
- **Title**: OPFS Tree Visual Enhancements - Default Expand, Dotted Lines, File Type Icons
- **Status**: Complete
- **Priority**: P1 (High) - User Experience
- **Created**: 2026-01-16
- **Completed**: 2026-01-16
- **Requester**: User request via `/s1-iterationLead` with screenshot comparison
- **Source Screenshots**:
  - Current: `screenshots/image.png`
  - Expected: `screenshots/opfs-product.png`

## 1) Problem Statement

### Current Implementation (screenshots/image.png)

The OPFS File Tree currently has:

1. **Collapsed by default**: Directory nodes start collapsed, requiring user to expand
2. **Solid tree lines**: Uses solid gray lines for hierarchy connections (via `TreeLines` component)
3. **Generic file icons**: Uses `FaFile` for all files, `FaFolder`/`FaFolderOpen` for directories
4. **No file type differentiation**: All files appear the same regardless of extension

### Gaps Identified (from user requirements)

Comparing current implementation to expected design (screenshots/opfs-product.png):

1. **Default Expansion**: Folders should be expanded by default (not collapsed)
   - Current: `useState(false)` for `isExpanded`
   - Expected: Root directories expand on load, showing first-level children

2. **Dotted Tree Lines**: Tree connection lines should use dotted/dashed style
   - Current: Solid `border-gray-200` lines
   - Expected: Dotted lines (e.g., `border-dotted`, `border-dashed`)

3. **File Type Icons**: Different icons based on file extension
   - Current: All files use `FaFile` icon
   - Expected: Type-specific icons for better visual recognition

### User Impact

- **Discoverability**: Collapsed folders hide content structure, requiring extra clicks
- **Visual Hierarchy**: Solid lines are too prominent; dotted lines provide subtle guidance
- **File Recognition**: Users cannot identify file types at a glance without reading names

## 2) Proposed Solution

### Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                  OPFS Tree Visual Enhancements                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Expansion State                                        │  │
│  │  ├── Root directories: expanded by default              │  │
│  │  ├── Child directories: lazy-loaded as before           │  │
│  │  └── Preserve expand/collapse state during navigation   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tree Line Styling                                      │  │
│  │  ├── Update TreeLines component: dotted border style   │  │
│  │  ├── Use Tailwind: border-dotted or border-dashed      │  │
│  │  └── Color: gray-300 (lighter than solid lines)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  File Type Icons                                        │  │
│  │  ├── .sqlite3 files: FaDatabase (react-icons/fa6)      │  │
│  │  ├── Images (.png, .jpg, .webp): FaRegFileImage (fa)   │  │
│  │  ├── Text (.txt): TiDocumentText (react-icons/ti)      │  │
│  │  ├── JSON (.json, .json5): LuFileJson (react-icons/lu) │  │
│  │  ├── Directories: FaFolder (closed), FaFolderOpen (open)│  │
│  │  └── Unknown files: FaFile (fallback)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### 2.1 Expansion State Changes

**Current Behavior**:

```tsx
const [isExpanded, setIsExpanded] = useState(false);
```

**New Behavior**:

```tsx
// Root-level directories (level 0) expand by default
const [isExpanded, setIsExpanded] = useState(level === 0);

// OR: Auto-expand root directories on mount
useEffect(() => {
  if (level === 0 && !hasLoaded && !isLoading) {
    loadChildren();
  }
}, [level, hasLoaded, isLoading]);
```

**Rationale**:

- Root directories are the main entry points
- Users expect to see immediate content structure
- Child directories remain lazy-loaded for performance

### 2.2 Tree Line Styling Changes

**Current Implementation** (`TreeLines.tsx`):

```tsx
className = "absolute top-0 left-0 w-px bg-gray-200";
// Border solid, gray-200 color
```

**New Implementation**:

```tsx
className = "absolute top-0 left-0 w-px border-l border-dotted border-gray-300";
// Border dotted, lighter gray-300 color
```

**Styling Options**:

- `border-dotted`: Dotted line (•••••)
- `border-dashed`: Dashed line (-----)
- `border-gray-300`: Lighter than current gray-200

### 2.3 File Type Icon Mapping

| File Extension                                           | Icon Component   | Library           | Import                                             |
| -------------------------------------------------------- | ---------------- | ----------------- | -------------------------------------------------- |
| `.sqlite3`                                               | `FaDatabase`     | `react-icons/fa6` | `import { FaDatabase } from "react-icons/fa6";`    |
| `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`, `.ico` | `FaRegFileImage` | `react-icons/fa`  | `import { FaRegFileImage } from "react-icons/fa";` |
| `.txt`                                                   | `TiDocumentText` | `react-icons/ti`  | `import { TiDocumentText } from "react-icons/ti";` |
| `.json`, `.json5`                                        | `LuFileJson`     | `react-icons/lu`  | `import { LuFileJson } from "react-icons/lu";`     |
| Directories (closed)                                     | `FaFolder`       | `react-icons/fa`  | `import { FaFolder } from "react-icons/fa";`       |
| Directories (open)                                       | `FaFolderOpen`   | `react-icons/fa`  | `import { FaFolderOpen } from "react-icons/fa";`   |
| Unknown/Other                                            | `FaFile`         | `react-icons/fa`  | `import { FaFile } from "react-icons/fa";`         |

**Icon Selection Helper Function**:

```tsx
const getFileIcon = (entry: OpfsFileEntry, isExpanded: boolean): ReactNode => {
  if (entry.type === "directory") {
    return isExpanded ? <FaFolderOpen /> : <FaFolder />;
  }

  const ext = getFileExtension(entry.name);

  switch (ext) {
    case ".sqlite3":
      return <FaDatabase className="text-purple-600" />;
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".webp":
    case ".gif":
    case ".svg":
    case ".ico":
      return <FaRegFileImage className="text-purple-500" />;
    case ".txt":
      return <TiDocumentText className="text-gray-600" />;
    case ".json":
    case ".json5":
      return <LuFileJson className="text-yellow-600" />;
    default:
      return <FaFile className="text-gray-500" />;
  }
};

const getFileExtension = (filename: string): string => {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.substring(idx).toLowerCase();
};
```

### 2.4 Component Updates Required

**Files to Modify**:

1. **`src/devtools/components/OPFSBrowser/FileTree.tsx`**
   - Add icon imports (FaDatabase, FaRegFileImage, TiDocumentText, LuFileJson, FaFolder, FaFolderOpen)
   - Add `getFileIcon` helper function
   - Update `isExpanded` initial state for root directories
   - Add `useEffect` for auto-loading root children
   - Update icon rendering in JSX

2. **`src/devtools/components/OPFSBrowser/TreeLines.tsx`**
   - Update border style from solid to dotted/dashed
   - Update color from gray-200 to gray-300

### 2.5 Icon Color Scheme

| Icon Type            | Tailwind Color    | Hex Code |
| -------------------- | ----------------- | -------- |
| SQLite Database      | `text-purple-600` | #9333ea  |
| Images               | `text-purple-500` | #a855f7  |
| Text Files           | `text-gray-600`   | #4b5563  |
| JSON Files           | `text-yellow-600` | #ca8a04  |
| Directories (closed) | `text-gray-600`   | #4b5563  |
| Directories (open)   | `text-yellow-500` | #eab308  |
| Unknown Files        | `text-gray-500`   | #6b7280  |

**Rationale**: Colors provide additional visual cues while maintaining accessibility (gray-scale variants for high contrast).

## 3) Functional Requirements

### FR-OPFS-TREE-001: Default Root Expansion

- **Description**: Root-level directories (level 0) should be expanded by default
- **Priority**: P1 (Must Have)
- **Acceptance Criteria**:
  - When FileTree loads, root directories automatically load children
  - Root directories show in expanded state (folder open icon)
  - Child directories remain collapsed (lazy-load on demand)
  - Expansion state persists during user interaction

### FR-OPFS-TREE-002: Dotted Tree Lines

- **Description**: Tree hierarchy lines should use dotted/dashed style
- **Priority**: P1 (Must Have)
- **Acceptance Criteria**:
  - TreeLines component uses `border-dotted` or `border-dashed`
  - Line color is lighter (`gray-300` vs current `gray-200`)
  - Dotted lines appear on all hierarchy levels
  - Responsive hiding (sidebar collapse) still works

### FR-OPFS-TREE-003: SQLite Database Icons

- **Description**: `.sqlite3` files display database icon
- **Priority**: P1 (Must Have)
- **Acceptance Criteria**:
  - Files ending with `.sqlite3` show `FaDatabase` icon
  - Icon color is purple (`text-purple-600`)
  - Icon size matches other file icons (12-14px)

### FR-OPFS-TREE-004: Image File Icons

- **Description**: Image files display image icon
- **Priority**: P1 (Must Have)
- **Acceptance Criteria**:
  - Files with extensions `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`, `.ico` show `FaRegFileImage` icon
  - Icon color is purple (`text-purple-500`)
  - Regular (outline) style, not filled

### FR-OPFS-TREE-005: Text File Icons

- **Description**: Text files display document icon
- **Priority**: P1 (Must Have)
- **Acceptance Criteria**:
  - Files with `.txt` extension show `TiDocumentText` icon
  - Icon color is gray (`text-gray-600`)

### FR-OPFS-TREE-006: JSON File Icons

- **Description**: JSON files display JSON icon
- **Priority**: P1 (Must Have)
- **Acceptance Criteria**:
  - Files with `.json` or `.json5` extensions show `LuFileJson` icon
  - Icon color is yellow (`text-yellow-600`)

### FR-OPFS-TREE-007: Directory Icons

- **Description**: Directories show folder icons with open/closed states
- **Priority**: P1 (Must Have)
- **Acceptance Criteria**:
  - Collapsed directories show `FaFolder` icon (gray-600)
  - Expanded directories show `FaFolderOpen` icon (yellow-500)
  - Icons match expansion state visually

### FR-OPFS-TREE-008: Fallback File Icon

- **Description**: Unknown file types use generic file icon
- **Priority**: P2 (Should Have)
- **Acceptance Criteria**:
  - Files with unrecognized extensions show `FaFile` icon
  - Icon color is gray (`text-gray-500`)

## 4) Non-Functional Requirements

### NFR-OPFS-TREE-001: Performance

- Auto-expanding root directories should not significantly impact initial load time
- Lazy-loading for child directories must be preserved
- Icon rendering should not cause flicker or layout shift

### NFR-OPFS-TREE-002: Accessibility

- All icons must have appropriate ARIA labels
- Color contrast ratios must meet WCAG AA standards
- Keyboard navigation must work with new icon states

### NFR-OPFS-TREE-003: Browser Compatibility

- Icons must render correctly in Chrome 90+
- Dotted borders must be supported (CSS `border-style: dotted`)

### NFR-OPFS-TREE-004: Code Quality

- Follow S8 quality rules (functional components, hooks)
- TSDoc comments for helper functions
- Type-safe icon mapping

## 5) Dependencies

| ID    | Feature                       | Status      | Required For                             |
| ----- | ----------------------------- | ----------- | ---------------------------------------- |
| F-012 | OPFS File Browser Enhancement | ✅ Complete | Base tree structure, TreeLines component |
| F-014 | OPFS UI Visual Redesign       | ✅ Complete | Green color theme, existing icon imports |

## 6) Implementation Scope

### In Scope

- Default expansion for root-level directories
- Dotted tree line styling
- File type icon mapping for 6 file types
- Icon color coding
- Helper functions for icon selection

### Out of Scope

- Custom file type mappings (user-configurable)
- Recursive expansion (expand all)
- Icon animations
- File preview based on type (already in F-013)

## 7) Success Criteria

1. ✅ Root directories are expanded by default on load
2. ✅ Tree lines use dotted/dashed styling
3. ✅ All 6 file types display correct icons
4. ✅ Unknown file types display fallback icon
5. ✅ Icon colors provide visual differentiation
6. ✅ No performance regression on load time
7. ✅ ESLint passes with no new warnings
8. ✅ TypeScript compilation succeeds

## 8) Risks & Mitigations

| Risk                     | Impact           | Probability | Mitigation                                 |
| ------------------------ | ---------------- | ----------- | ------------------------------------------ |
| Missing icon libraries   | Build failure    | Low         | Verify all imports exist in react-icons    |
| Performance regression   | Poor UX          | Low         | Lazy-load child directories only           |
| Icon inconsistency       | Visual confusion | Low         | Use helper function for all icon selection |
| Dotted lines not visible | Usability issue  | Low         | Test on different screen resolutions       |

## 9. Open Questions

1. **Expansion Depth**: Should we expand only root (level 0) or also second level (level 1)?
   - **Recommendation**: Root only, to balance discoverability with performance

2. **Dotted vs Dashed**: Which border style for tree lines?
   - **Recommendation**: `border-dotted` (matches classic tree view aesthetic)

3. **Icon Size**: Should different file types have different icon sizes?
   - **Recommendation**: No, keep consistent 12-14px for all icons

4. **Color Scheme**: Should we use the purple/yellow scheme or stick to emerald theme?
   - **Recommendation**: Purple/yellow for file types adds variety; emerald reserved for UI state

## 10. User Stories

### US-OPFS-TREE-001

**As a** developer debugging my PWA,
**I want** the OPFS file tree to show expanded folders by default,
**So that** I can immediately see the directory structure without extra clicks.

### US-OPFS-TREE-002

**As a** developer browsing OPFS files,
**I want** subtle dotted lines connecting folders,
**So that** I can follow the hierarchy without visual clutter.

### US-OPFS-TREE-003

**As a** developer looking at my file tree,
**I want** different icons for different file types,
**So that** I can quickly identify SQLite databases, images, and config files.
