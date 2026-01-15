# TASK-315: File Preview Component Structure (F-013)

## Overview

**Task ID**: TASK-315
**Feature**: F-013 - OPFS Browser Two-Panel Layout with File Preview
**Priority**: P1 (High)
**Estimated Time**: 2 hours
**Status**: Completed (2026-01-15)

## Description

Create `FilePreview.tsx` main container component that manages file content loading, state management (loading, error, content), and delegates to appropriate preview components based on file type (TextPreview, ImagePreview, UnsupportedPreview).

## Dependencies

- **TASK-314** (Service Layer - File Content Loading) - Must be complete
- **databaseService.getFileContent()** - Service function

## Boundaries

**File Created**: `src/devtools/components/OPFSBrowser/FilePreview.tsx`
**Lines Added**: ~210 lines (component + interfaces + TSDoc + hooks)

## Technical Approach

### 1. Component Interface

```typescript
interface FilePreviewProps {
  file: OpfsFileEntry | null;
}

interface FilePreviewState {
  loading: boolean;
  error: string | null;
  content: {
    type: "text" | "image" | "binary";
    data: string | Blob;
    metadata: {
      size: number;
      lastModified: Date;
      mimeType: string;
    };
  } | null;
}
```

### 2. State Management

Use `useState` for:

- `loading`: Boolean to show loading spinner
- `error`: String | null to show error state
- `content`: ContentData | null to store loaded file content

### 3. useEffect Hook

```typescript
useEffect(() => {
  if (!file) return;

  const loadContent = async () => {
    setLoading(true);
    setError(null);

    const response = await databaseService.getFileContent(file.path);

    if (response.success) {
      setContent(response.data);
    } else {
      setError(response.error || "Failed to load file content");
    }

    setLoading(false);
  };

  loadContent();
}, [file]);
```

### 4. Conditional Rendering

- **No file selected**: Return `<EmptyPreview />`
- **Loading**: Return loading spinner (emerald theme)
- **Error**: Return error component with retry button
- **Text file**: Return `<TextPreview file={file} content={content.data as string} metadata={content.metadata} />`
- **Image file**: Return `<ImagePreview file={file} content={content.data as Blob} metadata={content.metadata} />`
- **Binary file**: Return `<UnsupportedPreview file={file} metadata={content.metadata} />`

## Definition of Done

- [x] Create `FilePreview.tsx` main container component
- [x] Define FilePreviewProps interface (file: OpfsFileEntry | null)
- [x] Define FilePreviewState interface (loading, error, content)
- [x] Define ContentData interface (type: 'text' | 'image' | 'binary', data, metadata)
- [x] Implement state management: loading (boolean), error (string | null), content (ContentData | null)
- [x] Add useEffect hook for file content loading (triggered when file prop changes)
- [x] Call databaseService.getFileContent(file.path) in useEffect
- [x] Handle loading state (set loading true before call, false after)
- [x] Handle error state (set error message if response.success is false)
- [x] Handle success state (set content if response.success is true)
- [x] Implement conditional rendering based on file state:
  - [x] Return `<EmptyPreview />` if file is null
  - [x] Return loading spinner if loading is true (emerald theme spinner)
  - [x] Return error component if error is not null (with retry button)
  - [x] Delegate to `<TextPreview />` if content.type is 'text'
  - [x] Delegate to `<ImagePreview />` if content.type is 'image'
  - [x] Delegate to `<UnsupportedPreview />` if content.type is 'binary'
- [x] Add loading spinner component (emerald-600 animate-spin)
- [x] Add error state component (FiAlertCircle icon, retry button, emerald theme)
- [x] TSDoc comments on component and all interfaces
- [x] Export component and types
- [x] Type check passed with no errors (pre-existing Input.tsx error unrelated to this change)
- [x] ESLint passed with no new warnings

## Testing Checklist

- [ ] Test empty state (file is null)
- [ ] Test loading state (file selected, content loading)
- [ ] Test error state (file not found, permission denied)
- [ ] Test text preview delegation (text file selected)
- [ ] Test image preview delegation (image file selected)
- [ ] Test binary preview delegation (SQLite file selected)
- [ ] Test state transitions (empty -> loading -> loaded/error)
- [ ] Test retry button (click retry, reloads content)

## Related Documents

- **Feature Spec**: [F-013: OPFS Browser Two-Panel Layout](agent-docs/01-discovery/features/F-013-opfs-two-panel-preview.md)
- **HLD**: [Section 18.7 - Preview Component Architecture](agent-docs/03-architecture/01-hld.md#187-preview-component-architecture)
- **LLD**: [Section 11 - FilePreview Component](agent-docs/05-design/03-modules/opfs-browser.md#filepreview-component-container-f-013-new)
- **Roadmap**: [Phase 10 - TASK-315](agent-docs/07-taskManager/01-roadmap.md#task-315-file-preview-component-structure-f-013)

## Notes

- Props-driven design (no internal state beyond loading/error/content)
- Reuses state management pattern from existing components
- Emerald theme for loading spinner (consistent with project theme)
- Similar complexity to Toast component (F-012)
