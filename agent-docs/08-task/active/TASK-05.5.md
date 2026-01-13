<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/active/task-micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-05.5.md

NOTES
- Micro-Spec for TASK-05.5: Service Layer - OPFS File Browser Functions
- Spec-first implementation per S8 Worker guidelines
- Functional-first design (functions > classes)
-->

# TASK-05.5: Service Layer - OPFS File Browser Functions

## 0) Meta

- **Task ID**: TASK-05.5
- **Title**: Service Layer - OPFS File Browser Functions
- **Priority**: P1
- **Status**: In Progress
- **Dependencies**: TASK-05.2 (SQL Execution Functions)
- **Feature**: F-001 Service Layer Expansion - OPFS Group
- **Maps to**: FR-010, FR-011, FR-027, FR-028, FR-036, FR-037, FR-038
- **Created**: 2026-01-13

## 1) Summary

Implement `getOpfsFiles` and `downloadOpfsFile` service functions for browsing and downloading Origin Private File System (OPFS) files directly in the DevTools panel.

## 2) Boundary

**Files to modify:**

- `src/devtools/services/databaseService.ts` - Add new types and functions

**Files to read (context):**

- `src/devtools/bridge/inspectedWindow.ts` - Existing bridge layer

**Files NOT to modify:**

- No changes to bridge layer (use existing `inspectedWindowBridge.execute`)
- No changes to components (that's TASK-10)

## 3) Upstream Traceability

### HLD References

- Service Layer Architecture: `agent-docs/03-architecture/01-hld.md` (Section 8)
- Three-Layer Pattern: `agent-docs/03-architecture/01-hld.md` (Service Layer Functions)

### API Contract References

- OPFS functions: `agent-docs/05-design/01-contracts/01-api.md` (OPFS File Browser)
- Error codes: `agent-docs/05-design/01-contracts/03-errors.md`

### Module LLD References

- Database Service: `agent-docs/05-design/03-modules/database-service.md`
  - Section 4, Classes/Functions: `getOpfsFiles`, `downloadOpfsFile`

## 4) Functional Design

### Type Definitions (Functional - no classes)

```typescript
/**
 * OPFS file entry with metadata
 */
export type OpfsFileEntry = {
  name: string; // File or directory name
  path: string; // Full path from root
  type: "file" | "directory"; // Entry type
  size: number; // File size in bytes (0 for directories)
  sizeFormatted: string; // Human-readable size (e.g., "1.5 KB")
  lastModified?: number; // Timestamp (optional, browser support varies)
};

/**
 * OPFS download result with blob URL
 */
export type OpfsDownloadResult = {
  blobUrl: string; // Object URL for download
  filename: string; // Extracted filename
};
```

### Function: `getOpfsFiles(path?, dbname?)`

**Purpose**: List OPFS files with lazy loading

**Signature**:

```typescript
export const getOpfsFiles = async (
  path?: string,
  dbname?: string,
): Promise<ServiceResponse<OpfsFileEntry[]>>
```

**Algorithm** (functional, 3-phase):

1. **Phase 1: Access OPFS root and navigate to path**
   - Call `navigator.storage.getDirectory()` in inspected page
   - Return error if OPFS not supported
   - Navigate to `path` using `getDirectoryHandle()` (defaults to root)

2. **Phase 2: List directory contents and filter**
   - Iterate directory with `for await of` on `values()`
   - Filter by `dbname` if provided (match database-specific files)
   - Collect file/directory metadata

3. **Phase 3: Format and return entries**
   - Convert file sizes to human-readable format (KB, MB, GB)
   - Return flat list of `OpfsFileEntry[]`
   - Return empty array if directory is empty

**Error Cases**:

- OPFS not supported (browser missing `navigator.storage.getDirectory`)
- Path not found (directory doesn't exist)
- Permission denied (access denied to directory)

### Function: `downloadOpfsFile(path)`

**Purpose**: Download OPFS file to user's machine

**Signature**:

```typescript
export const downloadOpfsFile = async (
  path: string,
): Promise<ServiceResponse<OpfsDownloadResult>>
```

**Algorithm** (functional, 3-phase):

1. **Phase 1: Resolve file handle from path**
   - Split path into segments
   - Navigate from root to parent directory
   - Get file handle using `getFileHandle()`

2. **Phase 2: Read file and create blob URL**
   - Read file contents into `ArrayBuffer` using `getFile()`
   - Create `Blob` from `ArrayBuffer`
   - Create object URL: `URL.createObjectURL(blob)`

3. **Phase 3: Return response with cleanup responsibility**
   - Extract filename from last path segment
   - Return `{ blobUrl, filename }`
   - Document that caller must call `URL.revokeObjectURL(blobUrl)` after use

**Error Cases**:

- File not found (path doesn't exist)
- Path points to directory (not a file)
- Read failed (I/O error)
- OPFS not supported

### Helper Function: `formatFileSize(bytes)`

**Purpose**: Convert bytes to human-readable format

**Signature**:

```typescript
const formatFileSize = (bytes: number): string
```

**Algorithm**:

- If bytes < 1024: return `${bytes} B`
- If bytes < 1024 \* 1024: return `${(bytes / 1024).toFixed(1)} KB`
- If bytes < 1024 _ 1024 _ 1024: return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
- Otherwise: return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`

## 5) Implementation Notes

### Functional-First Rationale

This spec uses functional design because:

- File system operations are inherently functional (path → entries)
- No need for instance state or lifecycle management
- Functions are pure (same input → same output for given OPFS state)
- Easier to test (mock bridge layer)
- Aligns with existing `databaseService` pattern

### Code Quality Requirements (S8 Rules)

1. **Function Documentation**: JSDoc on exported functions
2. **Three-Phase Comments**: For functions > 5 lines
   ```typescript
   /**
    * List OPFS files with lazy loading
    */
   export const getOpfsFiles = async (...) => {
     // Phase 1: Access OPFS root and navigate to path
     // Phase 2: List directory contents and filter
     // Phase 3: Format and return entries
   }
   ```
3. **No Classes**: Use exported functions and types
4. **Type Safety**: Strict TypeScript types for all inputs/outputs

### Bridge Layer Usage

Use existing `inspectedWindowBridge.execute`:

```typescript
return inspectedWindowBridge.execute({
  func: async (pathArg?: string, dbnameArg?: string) => {
    // Code runs in inspected page MAIN world
    // Access navigator.storage.getDirectory() directly
    const root = await navigator.storage.getDirectory();
    // Navigate and list files...
  },
  args: [path, dbname],
});
```

### OPFS API Integration

The Origin Private File System API provides:

- `navigator.storage.getDirectory()` - Access OPFS root
- `directoryHandle.getDirectoryHandle(name)` - Navigate to subdirectory
- `directoryHandle.values()` - Async iterator for entries
- `fileHandle.getFile()` - Read file contents

**Browser Support**: Chrome 86+, Edge 86+, Opera 72+

### Blob URL Cleanup

**IMPORTANT**: The caller is responsible for cleanup:

```typescript
const result = await databaseService.downloadOpfsFile(path);
if (result.success) {
  // Use blobUrl for download
  // Later: URL.revokeObjectURL(result.data.blobUrl);
}
```

This is documented in JSDoc comments.

### Path Handling

- **Root path**: Empty string `""` or undefined defaults to OPFS root
- **Nested paths**: Use forward slashes: `"database/file.sqlite"`
- **Database filtering**: When `dbname` is provided, filter entries matching pattern: `*dbname*`

## 6) Definition of Done

### Service Layer

- [ ] Type `OpfsFileEntry` added and exported
- [ ] Type `OpfsDownloadResult` added and exported
- [ ] Helper function `formatFileSize` implemented
- [ ] Function `getOpfsFiles` implemented with JSDoc
- [ ] Function `downloadOpfsFile` implemented with JSDoc
- [ ] Functions added to `databaseService` export object
- [ ] JSDoc documents caller responsibility for blob URL cleanup

### General

- [ ] TypeScript compiles without errors
- [ ] Code follows functional design (no classes)
- [ ] Three-phase comments in functions > 5 lines

## 7) Testing Notes (Unit Tests)

Unit tests to be added in separate task (referenced in TASK-12):

### Service Layer Tests

- Mock `inspectedWindowBridge.execute` to simulate OPFS operations
- Test `getOpfsFiles` with root path (empty/undefined)
- Test `getOpfsFiles` with nested path
- Test `getOpfsFiles` with dbname filter
- Test `getOpfsFiles` returns empty array for empty directory
- Test `getOpfsFiles` error handling (OPFS not supported, path not found)
- Test `formatFileSize` with various byte sizes
- Test `downloadOpfsFile` creates blob URL
- Test `downloadOpfsFile` error handling (file not found, directory path)

### Integration Tests

- Test end-to-end OPFS file listing with real browser OPFS
- Test file download with blob URL creation and cleanup

## 8) References

- API Contract: `agent-docs/05-design/01-contracts/01-api.md`
- Module LLD: `agent-docs/05-design/03-modules/database-service.md`
- Error Standards: `agent-docs/05-design/01-contracts/03-errors.md`
- OPFS API: https://developer.mozilla.org/en-US/docs/Web/API/Origin_Private_File_System
