# TASK-314: Service Layer - File Content Loading (F-013)

## Overview

**Task ID**: TASK-314
**Feature**: F-013 - OPFS Browser Two-Panel Layout with File Preview
**Priority**: P1 (High)
**Estimated Time**: 2 hours
**Status**: Completed (2026-01-15)

## Description

Add `getFileContent(path)` service function to `databaseService.ts` to enable file content loading for the preview panel. This function will read file contents from OPFS, detect file type (text/image/binary), enforce file size limits, and return metadata.

## Dependencies

- **F-012** (OPFS Browser Enhancement) - Must be complete
- **OPFS File System Access API** - Browser support required

## Boundaries

**File Modified**: `src/devtools/services/databaseService.ts`
**Lines Added**: ~180 lines (function + TSDoc + three-phase comments)

## Technical Approach

### 1. Function Signature

```typescript
/**
 * Get file content from OPFS for preview
 * @param path - Full path to the file
 * @returns ServiceResponse with file content, type, and metadata
 */
getFileContent: async (
  path: string
): Promise<ServiceResponse<{
  type: 'text' | 'image' | 'binary';
  content: string | Blob;
  metadata: {
    size: number;
    lastModified: Date;
    mimeType: string;
  };
}>>
```

### 2. File Type Detection

**Text Files**:

- MIME type starts with `text/`
- Extensions: `.log`, `.txt`, `.md`, `.csv`, `.xml`, `.json`, `.yaml`, `.yml`

**Image Files**:

- MIME type starts with `image/`

**Binary Files**:

- Everything else (SQLite, executables, etc.)

### 3. File Size Limits

- Text files: Warn if > 1MB, block if > 10MB
- Images: Block if > 5MB
- Binary files: No preview (show placeholder)

### 4. Implementation Steps

1. Navigate to parent directory using `getDirectoryHandle()`
2. Retrieve file handle using `getFileHandle(filename)`
3. Get file object using `getFile()`
4. Detect file type based on MIME type and extension
5. Read content based on type:
   - Text: Use `file.text()` to get string
   - Image/Binary: Return file object as Blob
6. Return metadata (size, lastModified, mimeType)
7. Handle errors (file not found, permission denied, encoding errors)

## Definition of Done

- [x] Add `getFileContent(path)` function to databaseService.ts
- [x] Implement file type detection logic (text/image/binary based on MIME type and extension)
- [x] Text file detection: MIME starts with `text/`, extensions: `.log`, `.txt`, `.md`, `.csv`, `.xml`, `.json`, `.yaml`, `.yml`
- [x] Image file detection: MIME starts with `image/`
- [x] Binary file detection: Everything else (SQLite, executables, etc.)
- [x] Read file content: Use `file.text()` for text files, return `File` object as Blob for images/binary
- [x] Enforce file size limits: Warn if text > 1MB, block if text > 10MB, block if image > 5MB
- [x] Return metadata: size (number), lastModified (Date), mimeType (string)
- [x] Error handling: File not found, permission denied, file too large, encoding errors, OPFS not supported
- [x] Three-phase comments for function (numbered 1, 2, 3...)
- [x] TSDoc comments on exported function
- [x] Export function via databaseService object
- [x] Type check passed with no new errors (pre-existing Input.tsx error unrelated to this change)
- [x] ESLint passed with no new warnings (databaseService.ts clean)

## Testing Checklist

- [ ] Test text file loading (.log, .txt, .json, .xml, .csv, .md)
- [ ] Test image file loading (.jpg, .png, .gif, .svg, .webp)
- [ ] Test binary file detection (SQLite database)
- [ ] Test file not found error
- [ ] Test permission denied error
- [ ] Test file size limits (> 10MB text, > 5MB image)
- [ ] Test metadata returned correctly (size, lastModified, mimeType)

## Related Documents

- **Feature Spec**: [F-013: OPFS Browser Two-Panel Layout](agent-docs/01-discovery/features/F-013-opfs-two-panel-preview.md)
- **API Contract**: [01-api.md - getFileContent](agent-docs/05-design/01-contracts/01-api.md)
- **HLD**: [Section 18 - OPFS Browser Two-Panel Architecture](agent-docs/03-architecture/01-hld.md#18-opfs-browser-two-panel-layout-architecture-f-013)
- **LLD**: [Section 11 - Two-Panel Layout with File Preview](agent-docs/05-design/03-modules/opfs-browser.md#11-two-panel-layout-with-file-preview-f-013)
- **Roadmap**: [Phase 10 - OPFS Browser Two-Panel Layout](agent-docs/07-taskManager/01-roadmap.md#phase-10-opfs-browser-two-panel-layout-days-18-20)

## Notes

- Reuses OPFS API patterns from `downloadOpfsFile` function
- Similar complexity to `downloadOpfsFile` (2 hours estimate)
- No breaking changes (additive only)
- TypeScript strict mode compliance required
