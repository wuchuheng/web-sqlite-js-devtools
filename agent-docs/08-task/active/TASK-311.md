<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-311.md

NOTES
- Functional-first design (utility functions + props-driven component)
- All functions > 5 lines need numbered three-phase comments
- Exported/public functions need TSDoc comments
-->

# TASK-311: Enhanced Metadata Display (F-012)

## 0) Meta

- **Task ID**: TASK-311
- **Feature**: F-012 - OPFS Browser Enhancement
- **Status**: Draft
- **Created**: 2026-01-15
- **Estimated**: 2 hours
- **Priority**: P1 (High) - Core Feature Completion
- **Dependencies**: TASK-308 (Service Layer - Delete Operations)

## 1) Purpose

Create utility functions and a MetadataPanel component to display enhanced metadata for OPFS files and directories, including file type detection with color-coded badges, timestamp formatting, and directory item counting. This provides users with richer information about their files at a glance.

## 2) Upstream Documents

- **Spec**: `agent-docs/00-control/00-spec.md`
- **Feature**: `agent-docs/01-discovery/features/F-012-opfs-browser-enhancement.md`
- **HLD**: `agent-docs/03-architecture/01-hld.md`
- **LLD**: `agent-docs/05-design/03-modules/opfs-browser-enhancement.md` (if exists)
- **Roadmap**: `agent-docs/07-taskManager/01-roadmap.md` (Phase 9, F-012)
- **Task Catalog**: `agent-docs/07-taskManager/02-task-catalog.md` (TASK-311)

## 3) Boundary

### Files

| Type   | Path                                                    | Purpose                           |
| ------ | ------------------------------------------------------- | --------------------------------- |
| CREATE | `src/devtools/components/OPFSBrowser/MetadataPanel.tsx` | Metadata display component        |
| CREATE | `src/devtools/utils/fileTypeDetection.ts`               | File type detection utilities     |
| CREATE | `src/devtools/utils/timestampFormatting.ts`             | Timestamp formatting utilities    |
| UPDATE | `src/devtools/components/OPFSBrowser/FileNode.tsx`      | Integrate MetadataPanel component |

### Out of Scope

- File content preview (separate feature)
- File editing (separate feature)
- Detailed file properties dialog (separate feature)
- File comparison (separate feature)

## 4) Implementation Design

### Utility Functions: `fileTypeDetection.ts`

#### File Type Detection

```typescript
/**
 * File type mapping for known extensions
 */
const FILE_TYPE_MAP: Record<string, string> = {
  // SQLite databases
  sqlite: "SQLite Database",
  db: "SQLite Database",
  sqlite3: "SQLite Database",

  // Data files
  json: "JSON Data",
  xml: "XML Data",
  csv: "CSV Data",
  yaml: "YAML Data",
  yml: "YAML Data",

  // Text files
  txt: "Text File",
  md: "Markdown",
  log: "Log File",

  // Image files
  png: "Image File",
  jpg: "Image File",
  jpeg: "Image File",
  gif: "Image File",
  svg: "SVG Image",
  webp: "Image File",

  // Audio files
  mp3: "Audio File",
  wav: "Audio File",
  ogg: "Audio File",

  // Video files
  mp4: "Video File",
  webm: "Video File",
  mov: "Video File",
};

/**
 * Badge color mapping for file types
 */
const BADGE_COLOR_MAP: Record<
  string,
  "blue" | "yellow" | "gray" | "purple" | "red" | "green"
> = {
  "SQLite Database": "blue",
  "JSON Data": "yellow",
  "XML Data": "yellow",
  "CSV Data": "yellow",
  "Text File": "gray",
  Markdown: "gray",
  "Log File": "gray",
  "Image File": "purple",
  "SVG Image": "purple",
  "Audio File": "green",
  "Video File": "red",
};

/**
 * Detect file type based on filename extension
 * @param filename - Name of the file
 * @returns File type display string
 *
 * @example
 * detectFileType('database.sqlite') // Returns: 'SQLite Database'
 * detectFileType('data.json') // Returns: 'JSON Data'
 * detectFileType('unknown.xyz') // Returns: 'XYZ File'
 */
export function detectFileType(filename: string): string {
  // 1. Extract extension from filename
  // 2. Look up in FILE_TYPE_MAP
  // 3. Return known type or generate from extension
  const ext = filename.split(".").pop()?.toLowerCase();

  if (!ext) {
    return "File";
  }

  return FILE_TYPE_MAP[ext] || `${ext.toUpperCase()} File`;
}

/**
 * Get badge color for file type
 * @param fileType - File type string
 * @returns Badge color name
 *
 * @example
 * getBadgeColor('SQLite Database') // Returns: 'blue'
 * getBadgeColor('JSON Data') // Returns: 'yellow'
 */
export function getBadgeColor(
  fileType: string,
): "blue" | "yellow" | "gray" | "purple" | "red" | "green" {
  return BADGE_COLOR_MAP[fileType] || "gray";
}
```

### Utility Functions: `timestampFormatting.ts`

```typescript
/**
 * Format timestamp for display
 * @param date - Date object or timestamp
 * @returns Formatted timestamp string (YYYY-MM-DD HH:mm)
 *
 * @example
 * formatTimestamp(new Date('2026-01-15T10:30:00')) // Returns: '2026-01-15 10:30'
 */
export function formatTimestamp(date: Date | string | number): string {
  // 1. Parse input to Date object
  // 2. Format to YYYY-MM-DD HH:mm
  // 3. Return formatted string

  const d = date instanceof Date ? date : new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param date - Date object or timestamp
 * @returns Relative time string
 *
 * @example
 * getRelativeTime(new Date(Date.now() - 3600000)) // Returns: '1 hour ago'
 */
export function getRelativeTime(date: Date | string | number): string {
  // 1. Parse input to Date object
  // 2. Calculate difference from now
  // 3. Return relative time string
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return formatTimestamp(d);
}
```

### Component: `MetadataPanel.tsx`

#### Props Interface

```typescript
interface MetadataPanelProps {
  /** File or directory entry */
  entry: OpfsFileEntry;
  /** Whether to show inline metadata (compact mode) */
  inline?: boolean;
  /** Whether to show full metadata (expanded mode) */
  expanded?: boolean;
}
```

#### Component Structure

```typescript
/**
 * Metadata display component for OPFS files and directories
 *
 * Shows file type badge, timestamp, and item count (for directories).
 * Supports inline (compact) and expanded display modes.
 *
 * @param props - MetadataPanelProps
 * @returns React component
 *
 * @example
 * <MetadataPanel entry={fileEntry} inline={true} />
 * <MetadataPanel entry={dirEntry} expanded={true} />
 */
export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  entry,
  inline = false,
  expanded = false,
}) => {
  // 1. Detect file type and badge color
  // 2. Format timestamp if available
  // 3. Calculate item count for directories
  // 4. Render inline or expanded view
};
```

#### Inline View Implementation

```typescript
import React from 'react';
import { detectFileType, getBadgeColor } from '../../utils/fileTypeDetection';
import { formatTimestamp } from '../../utils/timestampFormatting';

export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  entry,
  inline = false,
  expanded = false,
}) => {
  const fileType = entry.fileType || detectFileType(entry.name);
  const badgeColor = getBadgeColor(fileType);

  if (inline) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {/* File Type Badge */}
        {entry.type === 'file' && (
          <span
            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
              badgeColor === 'blue' ? 'bg-blue-100 text-blue-700' :
              badgeColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
              badgeColor === 'gray' ? 'bg-gray-100 text-gray-700' :
              badgeColor === 'purple' ? 'bg-purple-100 text-purple-700' :
              badgeColor === 'red' ? 'bg-red-100 text-red-700' :
              'bg-green-100 text-green-700'
            }`}
          >
            {fileType}
          </span>
        )}

        {/* Timestamp */}
        {entry.lastModified && (
          <span>{formatTimestamp(entry.lastModified)}</span>
        )}
      </div>
    );
  }

  if (expanded) {
    return (
      <div className="space-y-1 text-xs">
        {/* File Type Badge */}
        {entry.type === 'file' && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Type:</span>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                badgeColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                badgeColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                badgeColor === 'gray' ? 'bg-gray-100 text-gray-700' :
                badgeColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                badgeColor === 'red' ? 'bg-red-100 text-red-700' :
                'bg-green-100 text-green-700'
              }`}
            >
              {fileType}
            </span>
          </div>
        )}

        {/* Timestamp */}
        {entry.lastModified && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Modified:</span>
            <span className="text-gray-700">{formatTimestamp(entry.lastModified)}</span>
          </div>
        )}

        {/* Item Count (directories) */}
        {entry.type === 'directory' && entry.itemCount && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Contains:</span>
            <span className="text-gray-700">
              {entry.itemCount.files} {entry.itemCount.files === 1 ? 'file' : 'files'},
              {entry.itemCount.directories} {entry.itemCount.directories === 1 ? 'directory' : 'directories'}
            </span>
          </div>
        )}

        {/* Full Path */}
        <div className="flex items-start gap-2">
          <span className="text-gray-500">Path:</span>
          <span className="text-gray-700 font-mono break-all">{entry.path}</span>
        </div>
      </div>
    );
  }

  return null;
};
```

### Integration: `FileNode.tsx`

#### Update FileNode Component

```typescript
import { MetadataPanel } from './MetadataPanel';

interface FileNodeProps {
  entry: OpfsFileEntry;
  depth: number;
  onDelete?: (entry: OpfsFileEntry) => void;
}

export const FileNode: React.FC<FileNodeProps> = ({ entry, depth, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  return (
    <div
      className="group flex flex-col py-1 px-2 hover:bg-gray-50 rounded cursor-pointer"
      onMouseEnter={() => {
        setIsHovered(true);
        setShowMetadata(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMetadata(false);
      }}
    >
      {/* Primary Row: Icon + Name + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Icon */}
          <span className="text-gray-500">
            {entry.type === 'directory' ? '📁' : getFileIcon(entry.name)}
          </span>

          {/* Name */}
          <span className="text-sm text-gray-900">{entry.name}</span>

          {/* Size (files only) */}
          {entry.type === 'file' && (
            <span className="text-xs text-gray-500">{entry.sizeFormatted}</span>
          )}
        </div>

        {/* Delete Button */}
        {onDelete && isHovered && (
          <button
            onClick={() => onDelete(entry)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            aria-label={`Delete ${entry.name}`}
          >
            <IoMdTrash size={16} />
          </button>
        )}
      </div>

      {/* Metadata Row (shown on hover) */}
      {showMetadata && (
        <MetadataPanel entry={entry} inline={true} />
      )}
    </div>
  );
};
```

## 5) Functional Requirements

### FR-311-001: File Type Detection

**Requirement**: Detect file type based on extension and return human-readable name

**Known Types**:

- SQLite: `.sqlite`, `.db`, `.sqlite3` → "SQLite Database" (blue badge)
- JSON: `.json` → "JSON Data" (yellow badge)
- Text: `.txt`, `.md`, `.log` → "Text File" / "Markdown" / "Log File" (gray badge)
- Image: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg` → "Image File" / "SVG Image" (purple badge)
- Audio: `.mp3`, `.wav`, `.ogg` → "Audio File" (green badge)
- Video: `.mp4`, `.webm`, `.mov` → "Video File" (red badge)

**Unknown Extensions**:

- Return uppercase extension + " File" (e.g., "XYZ File")
- Default gray badge

### FR-311-002: Badge Color Mapping

**Requirement**: Map file types to appropriate badge colors

**Color Scheme**:

- Blue: SQLite databases
- Yellow: Data files (JSON, XML, CSV)
- Gray: Text files, unknown types
- Purple: Images
- Green: Audio files
- Red: Video files

### FR-311-003: Timestamp Formatting

**Requirement**: Format timestamps in human-readable format

**Format**:

- Primary: `YYYY-MM-DD HH:mm` (local time)
- Relative: "2 hours ago", "3 days ago" (optional)
- Color: gray-500 (secondary text)

### FR-311-004: Inline Metadata Display

**Requirement**: Show metadata inline on hover

**Display**:

- Default: Name + size (existing)
- Hover: Show type badge + timestamp
- Transition: Smooth fade-in/out (150ms)
- Position: Below primary row
- Visible only on group hover

### FR-311-005: Directory Metadata

**Requirement**: Show item count and path for directories

**Fields**:

- Item count: "X files, Y directories"
- Visible when directory expanded
- Updated on lazy load
- Full path on hover/click (monospace font)

### FR-311-006: Expanded Metadata View

**Requirement**: Show full metadata in expanded mode

**Fields**:

- Type badge (files only)
- Modified timestamp (files only)
- Item count (directories only)
- Full path (monospace)

## 6) Non-Functional Requirements

### NFR-311-001: Performance

- Type detection is O(1) (hash map lookup)
- Timestamp formatting is O(1)
- No expensive calculations on hover
- Smooth transitions (CSS transitions, no JS animation)

### NFR-311-002: User Experience

- Clear visual hierarchy (primary row > metadata row)
- Smooth fade-in/out (150ms transition)
- Compact inline display (doesn't break layout)
- Color-coded badges (quick visual recognition)

### NFR-311-003: Code Quality

- Pure utility functions (no side effects)
- Reusable component (can be used elsewhere)
- TypeScript strict mode
- TSDoc comments
- Consistent with project style

### NFR-311-004: Internationalization

- Timestamp formatting uses local time zone
- File names can contain any characters
- Unicode support for all languages

## 7) Testing Requirements

### Unit Tests

1. **File Type Detection**
   - Test known extensions (sqlite, json, txt, png)
   - Test unknown extensions
   - Test no extension
   - Test case insensitivity

2. **Badge Color Mapping**
   - Test known file types
   - Test unknown file types (returns gray)

3. **Timestamp Formatting**
   - Test recent dates
   - Test old dates
   - Test edge cases (just now, exactly 1 hour)

4. **MetadataPanel Component**
   - Test inline mode rendering
   - Test expanded mode rendering
   - Test file metadata display
   - Test directory metadata display

### Integration Tests

1. **FileNode Integration**
   - Hover over file node
   - Verify metadata appears
   - Move mouse away
   - Verify metadata disappears

2. **Various File Types**
   - Create files with different extensions
   - Verify correct badge colors
   - Verify correct type labels

3. **Directory Item Counts**
   - Create directory with files and subdirectories
   - Verify item count displays correctly
   - Verify count updates on lazy load

## 8) Definition of Done

- [x] Utility function `detectFileType()` implemented
- [x] Utility function `getBadgeColor()` implemented
- [x] Utility function `getBadgeColorClasses()` implemented (helper)
- [x] Utility function `formatTimestamp()` implemented
- [x] Utility function `getRelativeTime()` implemented (optional)
- [x] MetadataPanel component created
- [x] Inline view implemented
- [x] Expanded view implemented
- [x] Component integrated with FileNode.tsx
- [x] TSDoc comments added to all functions
- [x] ESLint passed with no new warnings
- [x] Build passed with no errors (pre-existing Input.tsx error unrelated)
- [ ] Manual testing completed (deferred to TASK-313 integration phase)
- [ ] LLD updated with implementation status

## 9) Implementation Phases

### Phase 1: Utility Functions (0.5 hour)

- Create fileTypeDetection.ts
- Implement detectFileType()
- Implement getBadgeColor()
- Add TSDoc comments
- Export functions

### Phase 2: Timestamp Utilities (0.25 hour)

- Create timestampFormatting.ts
- Implement formatTimestamp()
- Implement getRelativeTime() (optional)
- Add TSDoc comments
- Export functions

### Phase 3: MetadataPanel Component (0.5 hour)

- Create MetadataPanel.tsx
- Define Props interface
- Implement inline view
- Implement expanded view
- Add TSDoc comments

### Phase 4: FileNode Integration (0.5 hour)

- Update FileNode.tsx
- Add hover state
- Add metadata display
- Test hover behavior
- Test metadata accuracy

### Phase 5: Testing & Polish (0.25 hour)

- Test file type detection
- Test badge colors
- Test timestamp formatting
- Test hover transitions
- Fix any visual glitches

## 10) Risk Assessment

| Risk               | Probability | Impact | Mitigation                           |
| ------------------ | ----------- | ------ | ------------------------------------ |
| Performance issues | Low         | Low    | O(1) lookups, CSS transitions only   |
| Wrong file types   | Low         | Low    | Comprehensive extension mapping      |
| Layout breakage    | Low         | Medium | Compact inline display               |
| Accessibility      | Low         | Medium | Proper ARIA labels, keyboard support |

## 11) Open Questions

None - all resolved in upstream docs.

## 12) References

- Feature F-012 spec: `agent-docs/01-discovery/features/F-012-opfs-browser-enhancement.md`
- File type detection: Common file extensions
- Timestamp formatting: Date.toLocaleString() MDN
- FileNode component: `src/devtools/components/OPFSBrowser/FileNode.tsx`

## 13) Functional-First Design

This spec uses **functional-first design**:

- **Pure functions** - All utility functions are pure (no side effects)
- **Props-driven** - MetadataPanel has no internal state
- **Reusability** - Utility functions can be used anywhere
- **Type safety** - TypeScript strict mode with proper types

**Rationale**: Metadata display is a pure transformation of data. Utility functions are reusable and testable. Component is props-driven for simplicity.
