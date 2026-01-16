# TASK-316: Text Preview Implementation (F-013)

## Overview

**Task ID**: TASK-316
**Feature**: F-013 - OPFS Browser Two-Panel Layout with File Preview
**Priority**: P1 (High)
**Estimated Time**: 1.5 hours
**Status**: Completed (2026-01-15)

## Description

Create `TextPreview.tsx` component to display text file contents in monospace font with line breaks preserved. Show "Preview: {filename}" header with emerald theme and display metadata (size, modified date).

## Dependencies

- **TASK-315** (File Preview Component Structure) - Must be complete
- **FilePreview component** - Parent component

## Boundaries

**File Created**: `src/devtools/components/OPFSBrowser/TextPreview.tsx`
**Lines Added**: ~120 lines (component + interfaces + TSDoc + styling + formatFileSize helper)

## Technical Approach

### 1. Component Interface

```typescript
interface TextPreviewProps {
  file: OpfsFileEntry;
  content: string;
  metadata: {
    size: number;
    lastModified: Date;
    mimeType: string;
  };
}
```

### 2. Layout Structure

```tsx
<div className="flex flex-col h-full">
  {/* Header */}
  <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2">
    <h3 className="text-emerald-700 font-semibold">Preview: {file.name}</h3>
    <div className="text-xs text-gray-600 mt-1">
      {formatFileSize(metadata.size)} • {formatTimestamp(metadata.lastModified)}
    </div>
  </div>

  {/* Content */}
  <div className="flex-1 overflow-auto p-4">
    <pre className="font-mono text-sm whitespace-pre-wrap">{content}</pre>
  </div>
</div>
```

### 3. Styling

**Header** (Emerald Theme):

- `bg-emerald-50 border-b border-emerald-200 px-4 py-2`
- Title: `text-emerald-700 font-semibold`
- Metadata: `text-xs text-gray-600 mt-1`

**Content**:

- Container: `flex-1 overflow-auto p-4`
- Pre tag: `font-mono text-sm whitespace-pre-wrap`

### 4. Metadata Display

- File size: Use `formatFileSize()` utility function (e.g., "1.2 MB")
- Modified date: Use `formatTimestamp()` utility function (e.g., "2024-01-15 18:01")
- Display format: "{size} • {timestamp}"

### 5. Large File Handling

- Show warning message if file size > 1MB (in header)
- Files > 10MB blocked in service layer (TASK-314)
- No virtual scrolling needed for files < 1MB (use standard `<pre>` tag)

## Definition of Done

- [x] Create `TextPreview.tsx` component
- [x] Define TextPreviewProps interface (file: OpfsFileEntry, content: string, metadata: ContentMetadata)
- [x] Define ContentMetadata interface (size: number, lastModified: Date, mimeType: string)
- [x] Implement header component with emerald theme (bg-emerald-50 border-b border-emerald-200)
- [x] Display "Preview: {filename}" title in header (text-emerald-700 font-semibold)
- [x] Display metadata in header (formatFileSize(metadata.size), formatTimestamp(metadata.lastModified))
- [x] Implement content area with flex-1 and overflow-auto
- [x] Display text content in `<pre>` tag (font-mono text-sm)
- [x] Preserve line breaks and formatting (whitespace-pre-wrap CSS class)
- [x] Handle large text files (> 1MB): Show warning message in header
- [x] Handle very large text files (> 10MB): Blocked in service layer, show error state
- [x] Optional: JSON syntax highlighting if feasible (use react-syntax-highlighter or plain text) - Deferred to future enhancement
- [x] TSDoc comments on component and interfaces
- [x] Export component and types
- [x] Type check passed with no errors (pre-existing Input.tsx error unrelated to this change)
- [x] ESLint passed with no new warnings

## Testing Checklist

- [ ] Test with .log file (monospace font, line breaks preserved)
- [ ] Test with .txt file (monospace font, line breaks preserved)
- [ ] Test with .json file (monospace font, optional syntax highlighting)
- [ ] Test with .xml file (monospace font, line breaks preserved)
- [ ] Test with .csv file (monospace font, line breaks preserved)
- [ ] Test with .md file (monospace font, line breaks preserved)
- [ ] Test metadata display (size, timestamp formatted correctly)
- [ ] Test large file warning (> 1MB file shows warning)
- [ ] Test overflow scrolling (long content scrolls, doesn't break layout)

## Related Documents

- **Feature Spec**: [F-013: OPFS Browser Two-Panel Layout](agent-docs/01-discovery/features/F-013-opfs-two-panel-preview.md)
- **HLD**: [Section 18.7 - TextPreview Component](agent-docs/03-architecture/01-hld.md#187-preview-component-architecture)
- **LLD**: [Section 11 - TextPreview Component](agent-docs/05-design/03-modules/opfs-browser.md#textpreview-component-f-013-new)
- **Roadmap**: [Phase 10 - TASK-316](agent-docs/07-taskManager/01-roadmap.md#task-316-text-preview-implementation-f-013)

## Notes

- Monospace font essential for log files and code files
- `whitespace-pre-wrap` preserves line breaks and formatting
- Emerald theme consistent with project theme (F-007)
- Similar complexity to MetadataPanel component (F-012)
- Optional JSON syntax highlighting (deferred if time constrained)
