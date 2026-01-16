# TASK-321: Preview Header Component (F-014)

## Metadata

- **Task ID**: TASK-321
- **Feature**: F-014: OPFS UI Visual Redesign
- **Priority**: P0 (Blocker)
- **Estimated**: 1 hour
- **Status**: Completed
- **Completed**: 2026-01-16
- **Dependencies**: F-013 ✅ (FilePreview must exist)
- **Boundary**: `src/devtools/components/OPFSBrowser/PreviewHeader.tsx`, `src/devtools/components/OPFSBrowser/FilePreview.tsx`

## Objective

Create a new `PreviewHeader.tsx` component with green header bar for the preview panel:

1. Green background (#4CAF50) with white text
2. Display "Preview: [filename]" title
3. Add "started" status badge (white background, green text, rounded)
4. Integrate into FilePreview.tsx above preview content

## Boundary

- **Files to create**: `src/devtools/components/OPFSBrowser/PreviewHeader.tsx`
- **Files to modify**: `src/devtools/components/OPFSBrowser/FilePreview.tsx`
- **Files to delete**: None
- **No changes to**: Service layer, types, other components

## Upstream Documentation

- Feature spec: `agent-docs/01-discovery/features/F-014-opfs-ui-redesign.md`
- HLD Section 19: `agent-docs/03-architecture/01-hld.md`
- LLD Section 12: `agent-docs/05-design/03-modules/opfs-browser.md`
- Roadmap Phase 11: `agent-docs/07-taskManager/01-roadmap.md`

## Current State Analysis

**Current FilePreview.tsx** (lines 100-135):

```tsx
// 6. Delegate to appropriate preview component based on file type
switch (data.type) {
  case "text":
    return (
      <TextPreview
        file={file}
        content={data.content as string}
        metadata={data.metadata}
      />
    );
  case "image":
    return (
      <ImagePreview
        file={file}
        content={data.content as Blob}
        metadata={data.metadata}
      />
    );
  case "binary":
    return <UnsupportedPreview file={file} metadata={data.metadata} />;
  default:
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">Unknown file type</p>
      </div>
    );
}
```

**Missing**: No header bar above preview content.

## Implementation Plan

### Phase 1: Create PreviewHeader Component (30 min)

1. Create `src/devtools/components/OPFSBrowser/PreviewHeader.tsx` file
2. Define interface: `fileName: string`, `showStatus?: boolean`, `statusText?: string`
3. Implement green header container: `px-4 py-3 bg-green-600 text-white flex items-center justify-between`
4. Display "Preview: {fileName}" title with `text-sm font-medium`
5. Add status badge (conditional): `px-2 py-1 bg-white text-green-600 text-xs font-medium rounded`
6. Add TSDoc comments with @example
7. Export component

### Phase 2: Integrate into FilePreview (20 min)

1. Import PreviewHeader in FilePreview.tsx
2. Add header above each preview type (text, image, unsupported)
3. Pass `file.name` as fileName prop
4. Set `showStatus={true}` and `statusText="started"`
5. Wrap each preview type with header

### Phase 3: Update FilePreview Structure (5 min)

```tsx
// BEFORE
case "text":
  return <TextPreview file={file} content={data.content as string} metadata={data.metadata} />;

// AFTER
case "text":
  return (
    <>
      <PreviewHeader fileName={file.name} showStatus={true} statusText="started" />
      <TextPreview file={file} content={data.content as string} metadata={data.metadata} />
    </>
  );
```

### Phase 4: Testing (5 min)

- Test header displays correctly for text files
- Test header displays correctly for images
- Test header displays correctly for binary files
- Test status badge visibility and styling
- ESLint verification
- Build verification

## Definition of Done

- [x] PreviewHeader.tsx component created with TSDoc comments
- [x] Green header container (bg-green-600, text-white, px-4 py-3)
- [x] "Preview: {fileName}" title displays correctly
- [x] Status badge displays (white bg, green text, rounded)
- [x] Integrated into FilePreview.tsx for all preview types
- [x] ESLint passed with no new warnings
- [x] TypeScript type check passed
- [x] Visual inspection matches prototype screenshot

## Functional-First Design

This task uses only functional React patterns:

- Functional component with TypeScript interface
- No class components or OOP patterns
- Conditional rendering for status badge
- Props destructuring with default values

## Code Quality Requirements

- TSDoc comments with @example
- TypeScript interface for props
- Default values for optional props
- Functional component (React.FC)
- Follow S8 quality rules (functional components, hooks)

## Component Interface

```typescript
interface PreviewHeaderProps {
  /** Name of the file being previewed */
  fileName: string;
  /** Whether to show the status badge (default: true) */
  showStatus?: boolean;
  /** Text to display in status badge (default: "started") */
  statusText?: string;
}
```

## Styling Specifications

| Element      | Tailwind Classes                                                      | Color           |
| ------------ | --------------------------------------------------------------------- | --------------- |
| Container    | `px-4 py-3 bg-green-600 text-white flex items-center justify-between` | Green (#4CAF50) |
| Title        | `text-sm font-medium`                                                 | White           |
| Status Badge | `px-2 py-1 bg-white text-green-600 text-xs font-medium rounded`       | White on Green  |

## Testing Strategy

Manual testing only (visual changes):

1. Select a text file - verify green header with "Preview: [filename]"
2. Select an image file - verify green header displays
3. Select a binary file - verify green header displays
4. Verify status badge is white with green text
5. Verify all existing functionality works

## Rollback Strategy

Instant rollback - revert file changes if issues arise.
