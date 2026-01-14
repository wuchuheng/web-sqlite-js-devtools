<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-308.md

NOTES
- Functional-first design (npm scripts, config files)
- All functions > 5 lines need numbered three-phase comments
- Exported/public functions need TSDoc comments
-->

# TASK-308: Service Layer - Delete Operations (F-012)

## 0) Meta

- **Task ID**: TASK-308
- **Feature**: F-012 - OPFS Browser Enhancement
- **Status**: Draft
- **Created**: 2026-01-15
- **Estimated**: 1.5 hours
- **Priority**: P1 (High) - Core Feature Completion
- **Dependencies**: TASK-05.5 (OPFS File Browser Functions)

## 1) Purpose

Add delete operations to the service layer for OPFS files and directories, enabling users to remove items from the Origin Private File System through the DevTools extension. This includes recursive directory deletion, metadata fetching (last modified, file type, item counts), and proper error handling.

## 2) Upstream Documents

- **Spec**: `agent-docs/00-control/00-spec.md`
- **Feature**: `agent-docs/01-discovery/features/F-012-opfs-browser-enhancement.md`
- **HLD**: `agent-docs/03-architecture/01-hld.md`
- **LLD**: `agent-docs/05-design/03-modules/opfs-browser-enhancement.md` (if exists)
- **Roadmap**: `agent-docs/07-taskManager/01-roadmap.md` (Phase 9, F-012)
- **Task Catalog**: `agent-docs/07-taskManager/02-task-catalog.md` (TASK-308)

## 3) Boundary

### Files

| Type   | Path                                       | Purpose                            |
| ------ | ------------------------------------------ | ---------------------------------- |
| UPDATE | `src/devtools/services/databaseService.ts` | Add delete functions, update types |
| UPDATE | `src/devtools/bridge/inspectedWindow.ts`   | Bridge layer for OPFS operations   |

### Out of Scope

- File upload to OPFS (separate feature)
- File rename operation (separate feature)
- Batch delete (multiple selection)
- Undo/redo for delete operations
- Trash/recycle bin

## 4) Implementation Design

### Service Layer: `databaseService.ts`

#### Update `OpfsFileEntry` Type

```typescript
interface OpfsFileEntry {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number; // bytes
  sizeFormatted: string; // e.g., "1.2 MB"
  lastModified?: Date; // NEW: Last modified timestamp
  fileType?: string; // NEW: "SQLite Database", "JSON Data", etc.
  itemCount?: {
    // NEW: For directories
    files: number;
    directories: number;
  };
}
```

#### Add `deleteOpfsFile` Function

```typescript
/**
 * Delete a file from OPFS
 * @param path - Full path to the file (e.g., "/data/database.sqlite")
 * @returns ServiceResponse<void>
 *
 * @example
 * const result = await databaseService.deleteOpfsFile("/data/test.db");
 * if (result.success) {
 *   console.log("File deleted successfully");
 * } else {
 *   console.error("Delete failed:", result.error);
 * }
 */
deleteOpfsFile: async (path: string) => {
  // 1. Validate input
  // 2. Navigate to file path in OPFS
  // 3. Delete file using removeEntry
  // 4. Return result
};
```

**Implementation**:

```typescript
deleteOpfsFile: async (path: string): Promise<ServiceResponse<void>> => {
  try {
    const script = `
      (async () => {
        const root = await navigator.storage.getDirectory();
        const pathParts = '${path}'.split('/').filter(Boolean);
        let dir = root;

        // Navigate to parent directory
        for (let i = 0; i < pathParts.length - 1; i++) {
          dir = await dir.getDirectoryHandle(pathParts[i]);
        }

        // Delete file
        const filename = pathParts[pathParts.length - 1];
        await dir.removeEntry(filename);

        return { success: true };
      })()
    `;

    return await inspectedWindowBridge.execute(script);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
```

#### Add `deleteOpfsDirectory` Function

```typescript
/**
 * Delete a directory and all contents from OPFS
 * @param path - Full path to the directory (e.g., "/data/backup")
 * @returns ServiceResponse<{ itemCount: number }> - Number of items deleted
 *
 * @example
 * const result = await databaseService.deleteOpfsDirectory("/data/old");
 * if (result.success) {
 *   console.log(`Deleted ${result.data.itemCount} items`);
 * }
 */
deleteOpfsDirectory: async (path: string) => {
  // 1. Validate input
  // 2. Navigate to directory path in OPFS
  // 3. Count items before delete
  // 4. Delete recursively using removeEntry
  // 5. Return result with item count
};
```

**Implementation**:

```typescript
deleteOpfsDirectory: async (
  path: string,
): Promise<ServiceResponse<{ itemCount: number }>> => {
  try {
    const script = `
      (async () => {
        const root = await navigator.storage.getDirectory();
        const pathParts = '${path}'.split('/').filter(Boolean);
        let dir = root;

        // Navigate to parent directory
        for (let i = 0; i < pathParts.length - 1; i++) {
          dir = await dir.getDirectoryHandle(pathParts[i]);
        }

        const dirname = pathParts[pathParts.length - 1];
        const targetDir = await dir.getDirectoryHandle(dirname);

        // Count items before delete
        let itemCount = 0;
        for await (const _ of targetDir.values()) {
          itemCount++;
        }

        // Delete recursively
        await dir.removeEntry(dirname, { recursive: true });

        return { success: true, data: { itemCount } };
      })()
    `;

    return await inspectedWindowBridge.execute(script);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
```

#### Update `getOpfsFiles` to Fetch Metadata

```typescript
// Update existing getOpfsFiles function to fetch metadata
getOpfsFiles: async (
  path?: string,
  dbname?: string,
): Promise<ServiceResponse<OpfsFileEntry[]>> => {
  try {
    const script = `
      (async () => {
        const root = await navigator.storage.getDirectory();
        // ... existing navigation logic ...

        const entries = [];
        for await (const [name, handle] of dir) {
          const entryPath = currentPath + '/' + name;

          if (handle.kind === 'file') {
            const file = await handle.getFile();
            entries.push({
              name,
              path: entryPath,
              type: 'file',
              size: file.size,
              sizeFormatted: formatSize(file.size),
              lastModified: new Date(file.lastModified), // NEW
              fileType: detectFileType(name), // NEW
            });
          } else {
            // Count items in directory
            let fileCount = 0;
            let dirCount = 0;
            for await (const [, childHandle] of handle) {
              if (childHandle.kind === 'file') fileCount++;
              else dirCount++;
            }

            entries.push({
              name,
              path: entryPath,
              type: 'directory',
              size: 0,
              sizeFormatted: '-',
              itemCount: { files: fileCount, directories: dirCount }, // NEW
            });
          }
        }

        return { success: true, data: entries };
      })()
    `;

    return await inspectedWindowBridge.execute(script);
  } catch (error) {
    return { success: false, error: String(error) };
  }
};
```

### Helper Functions

```typescript
/**
 * Detect file type based on extension
 * @param filename - Name of the file
 * @returns File type display string
 */
function detectFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "sqlite":
    case "db":
    case "sqlite3":
      return "SQLite Database";
    case "json":
      return "JSON Data";
    case "txt":
    case "md":
      return "Text File";
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
      return "Image File";
    default:
      return ext ? `${ext.toUpperCase()} File` : "File";
  }
}
```

## 5) Functional Requirements

### FR-308-001: Delete File Function

**Input**:

- `path: string` - Full path to the file in OPFS

**Processing**:

1. Validate path is not empty
2. Navigate to parent directory in OPFS
3. Extract filename from path
4. Call `removeEntry(filename)` to delete file
5. Return success response

**Output**:

- `ServiceResponse<void>` on success
- `ServiceResponse<never>` with error on failure

**Error Handling**:

- File not found: Return error with message "File not found: {path}"
- Permission denied: Return error with message "Permission denied"
- OPFS not supported: Return error with message "OPFS not supported"

### FR-308-002: Delete Directory Function

**Input**:

- `path: string` - Full path to the directory in OPFS

**Processing**:

1. Validate path is not empty
2. Navigate to parent directory in OPFS
3. Extract directory name from path
4. Open directory handle to count items
5. Count all files and subdirectories
6. Call `removeEntry(dirname, { recursive: true })` to delete
7. Return success response with item count

**Output**:

- `ServiceResponse<{ itemCount: number }>` on success
- `ServiceResponse<never>` with error on failure

**Error Handling**:

- Directory not found: Return error with message "Directory not found: {path}"
- Permission denied: Return error with message "Permission denied"
- OPFS not supported: Return error with message "OPFS not supported"

### FR-308-003: Type System Updates

**Types to Update**:

1. `OpfsFileEntry` interface
   - Add `lastModified?: Date`
   - Add `fileType?: string`
   - Add `itemCount?: { files: number; directories: number }`

2. Service function signatures
   - `deleteOpfsFile(path: string): Promise<ServiceResponse<void>>`
   - `deleteOpfsDirectory(path: string): Promise<ServiceResponse<{ itemCount: number }>>`

### FR-308-004: Metadata Fetching

**Metadata to Fetch**:

1. Last modified timestamp from `file.lastModified`
2. File type from extension detection
3. Item counts for directories (files and subdirectories)

**Helper Functions**:

- `detectFileType(filename: string): string`
- `formatTimestamp(date: Date): string`

### FR-308-005: JSDoc Comments

**Documentation Requirements**:

- All public functions must have TSDoc comments
- Include `@param` tags for all parameters
- Include `@returns` tags for return types
- Include `@example` tags for usage examples
- Document error conditions

### FR-308-006: TypeScript Compliance

**Type Safety**:

- Use strict TypeScript types
- No `any` types allowed
- Proper null checks
- Type assertions only when necessary
- Generic types for ServiceResponse

## 6) Non-Functional Requirements

### NFR-308-001: Performance

- Delete operation should complete in < 2 seconds for typical files (< 10MB)
- Metadata fetching should not block UI
- Large directories (> 1000 items) may take longer, show loading indicator

### NFR-308-002: Error Handling

- All errors caught and returned in ServiceResponse
- Never throw exceptions from service layer
- Meaningful error messages for users
- Log errors to console for debugging

### NFR-308-003: Code Quality

- Follow existing code style
- ESLint compliant
- Prettier formatted
- No console.log in production code
- Use constants for magic strings/numbers

### NFR-308-004: Testing

- Unit tests with mocked bridge layer
- Test success cases (file, directory)
- Test error cases (not found, permission denied)
- Test edge cases (empty path, root directory)
- Test metadata fetching

## 7) Testing Requirements

### Unit Tests

1. **deleteOpfsFile Success**
   - Mock bridge.execute to return success
   - Call with valid file path
   - Verify success response returned

2. **deleteOpfsFile Errors**
   - Mock bridge.execute to throw error
   - Verify error response returned
   - Verify error message is meaningful

3. **deleteOpfsDirectory Success**
   - Mock bridge.execute to return success with item count
   - Call with valid directory path
   - Verify success response with item count

4. **deleteOpfsDirectory Errors**
   - Mock bridge.execute to throw error
   - Verify error response returned

5. **Metadata Fetching**
   - Mock file object with lastModified
   - Verify lastModified included in response
   - Verify fileType detected correctly

6. **File Type Detection**
   - Test known extensions (sqlite, json, txt, png)
   - Test unknown extension
   - Test no extension

### Integration Tests

1. **End-to-End Delete Flow**
   - Call deleteOpfsFile with real OPFS
   - Verify file removed from OPFS
   - Verify can't access file after delete

2. **Recursive Directory Delete**
   - Create directory with files and subdirectories
   - Call deleteOpfsDirectory
   - Verify all items removed

## 8) Definition of Done

- [ ] `deleteOpfsFile(path)` implemented in databaseService.ts
- [ ] `deleteOpfsDirectory(path)` implemented in databaseService.ts
- [ ] `OpfsFileEntry` type updated with metadata fields
- [ ] `getOpfsFiles()` updated to fetch metadata
- [ ] Helper function `detectFileType()` implemented
- [ ] All functions have TSDoc comments
- [ ] TypeScript strict mode compliance verified
- [ ] Unit tests written and passing
- [ ] ESLint passed with no new warnings
- [ ] Build passed with no errors
- [ ] Manual testing completed
- [ ] LLD updated with implementation status

## 9) Implementation Phases

### Phase 1: Type System Updates (0.25 hour)

- Update `OpfsFileEntry` interface with new fields
- Add TypeScript types for delete functions
- Export types properly

### Phase 2: Implement deleteOpfsFile (0.25 hour)

- Write function with TSDoc comments
- Implement navigation logic
- Implement delete logic
- Add error handling

### Phase 3: Implement deleteOpfsDirectory (0.25 hour)

- Write function with TSDoc comments
- Implement navigation logic
- Implement item counting
- Implement recursive delete
- Add error handling

### Phase 4: Update getOpfsFiles (0.25 hour)

- Add metadata fetching logic
- Implement lastModified extraction
- Implement fileType detection
- Implement item counting for directories

### Phase 5: Helper Functions (0.25 hour)

- Implement `detectFileType()` function
- Implement `formatTimestamp()` function
- Add utility function tests

### Phase 6: Testing & Validation (0.25 hour)

- Write unit tests for delete functions
- Write unit tests for helper functions
- Test error handling
- Test metadata fetching

## 10) Risk Assessment

| Risk               | Probability | Impact | Mitigation                        |
| ------------------ | ----------- | ------ | --------------------------------- |
| Data loss          | Medium      | High   | Confirmation modal in UI layer    |
| OPFS API changes   | Low         | Medium | Use standard OPFS API             |
| Performance issues | Low         | Low    | Large ops are async, non-blocking |
| Type errors        | Low         | Low    | TypeScript strict mode            |

## 11) Open Questions

None - all resolved in upstream docs.

## 12) References

- Feature F-012 spec: `agent-docs/01-discovery/features/F-012-opfs-browser-enhancement.md`
- OPFS API: https://developer.mozilla.org/en-US/docs/Web/API/Origin_Private_File_System
- Service layer pattern: `src/devtools/services/databaseService.ts`

## 13) Functional-First Design

This spec uses **functional-first design**:

- **Service functions** - Pure functions with clear inputs/outputs
- **No side effects** - All state changes happen in OPFS, not in service layer
- **Error handling** - Return ServiceResponse envelope, never throw
- **Type safety** - TypeScript strict mode with proper types

**Rationale**: Service layer is a pure functional interface to OPFS operations. UI layer handles state, side effects, and user interactions.
