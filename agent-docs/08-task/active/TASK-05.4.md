<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/active/task-micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-05.4.md

NOTES
- Micro-Spec for TASK-05.4: Service Layer - Migration & Versioning Functions
- Spec-first implementation per S8 Worker guidelines
- Functional-first design (functions > classes)
-->

# TASK-05.4: Service Layer - Migration & Versioning Functions

## 0) Meta

- **Task ID**: TASK-05.4
- **Title**: Service Layer - Migration & Versioning Functions
- **Priority**: P1
- **Status**: In Progress
- **Dependencies**: TASK-05.2 (SQL Execution Functions)
- **Feature**: F-001 Service Layer Expansion - Migration Group
- **Maps to**: FR-031, FR-032, FR-033, FR-034
- **Created**: 2026-01-13

## 1) Summary

Implement `devRelease`, `devRollback`, and `getDbVersion` service functions for migration testing and version tracking using the `db.devTool` API from web-sqlite-js.

## 2) Boundary

**Files to modify:**

- `src/devtools/services/databaseService.ts` - Add new types and functions

**Files to read (context):**

- `src/devtools/bridge/inspectedWindow.ts` - Existing bridge layer
- `src/types/DB.ts` - DBInterface, DevTool, ReleaseConfig, DatabaseRecord types

**Files NOT to modify:**

- No changes to bridge layer (use existing `inspectedWindowBridge.execute`)
- No changes to components (that's TASK-101, TASK-102)

## 3) Upstream Traceability

### HLD References

- Service Layer Architecture: `agent-docs/03-architecture/01-hld.md` (Section 8)
- Three-Layer Pattern: `agent-docs/03-architecture/01-hld.md` (Service Layer Functions)

### API Contract References

- Migration functions: `agent-docs/05-design/01-contracts/01-api.md` (Migration & Versioning)
- Error codes: `agent-docs/05-design/01-contracts/03-errors.md`

### Module LLD References

- Database Service: `agent-docs/05-design/03-modules/database-service.md`
  - Section 4, Classes/Functions: `devRelease`, `devRollback`, `getDbVersion`

## 4) Functional Design

### Type Definitions (Functional - no classes)

```typescript
/**
 * Re-export ReleaseConfig from DB types for convenience
 */
export type { ReleaseConfig } from "../../types/DB";

/**
 * Dev release result with dev version identifier
 */
export type DevReleaseResult = {
  devVersion: string;
};

/**
 * Rollback result with current version
 */
export type RollbackResult = {
  currentVersion: string;
};

/**
 * Database version result
 */
export type DbVersionResult = {
  version: string;
};
```

### Function: `devRelease(dbname, version, migrationSQL?, seedSQL?)`

**Purpose**: Create dev version with migration/seed SQL for testing

**Signature**:

```typescript
export const devRelease = async (
  dbname: string,
  version: string,
  migrationSQL?: string,
  seedSQL?: string,
): Promise<ServiceResponse<DevReleaseResult>>
```

**Algorithm** (functional, 3-phase):

1. **Phase 1: Validate database exists**
   - Execute function that accesses `window.__web_sqlite.databases[dbname]`
   - Return error if database not found

2. **Phase 2: Create dev release using db.devTool.release()**
   - Build `ReleaseConfig` object with version, migrationSQL, seedSQL
   - Call `db.devTool.release(config)`
   - Extract dev version identifier from result

3. **Phase 3: Return response**
   - On success: `{ success: true, data: { devVersion: string } }`
   - On error: `{ success: false, error: "..." }`

**Error Cases**:

- Database not found
- Dev version already exists
- SQL errors from migration/seed

### Function: `devRollback(dbname, toVersion)`

**Purpose**: Rollback dev version to original or specific version

**Signature**:

```typescript
export const devRollback = async (
  dbname: string,
  toVersion: string,
): Promise<ServiceResponse<RollbackResult>>
```

**Algorithm** (functional, 3-phase):

1. **Phase 1: Validate database exists**
   - Execute function that accesses `window.__web_sqlite.databases[dbname]`
   - Return error if database not found

2. **Phase 2: Rollback using db.devTool.rollback()**
   - Call `db.devTool.rollback(version)`
   - Extract current version from result

3. **Phase 3: Return response**
   - On success: `{ success: true, data: { currentVersion: string } }`
   - On error: `{ success: false, error: "..." }`

**Error Cases**:

- Database not found
- Dev version not found
- Backup not available
- Version locked (below latest release)

### Function: `getDbVersion(dbname)`

**Purpose**: Get current database version

**Signature**:

```typescript
export const getDbVersion = async (
  dbname: string,
): Promise<ServiceResponse<DbVersionResult>>
```

**Algorithm** (functional, 3-phase):

1. **Phase 1: Validate database exists**
   - Execute function that accesses `window.__web_sqlite.databases[dbname]`
   - Return error if database not found

2. **Phase 2: Query version**
   - Query `PRAGMA user_version` for SQLite version
   - Fallback to web-sqlite-js version tracking via DatabaseRecord

3. **Phase 3: Return response**
   - On success: `{ success: true, data: { version: string } }`
   - Return "0.0.0" if no version set
   - On error: `{ success: false, error: "..." }`

**Error Cases**:

- Database not found
- Version query fails

## 5) Implementation Notes

### Functional-First Rationale

This spec uses functional design because:

- State transformation is the core operation (dbname + version → devVersion)
- No need for instance state or lifecycle management
- Functions are pure (same input → same output for a given DB state)
- Easier to test (mock bridge layer)
- Aligns with existing `databaseService` pattern

### Code Quality Requirements (S8 Rules)

1. **Function Documentation**: JSDoc on exported functions
2. **Three-Phase Comments**: For functions > 5 lines
   ```typescript
   /**
    * Create dev release with migration and seed SQL
    */
   export const devRelease = async (...) => {
     // Phase 1: Validate database exists
     // Phase 2: Create dev release using db.devTool.release()
     // Phase 3: Return response
   }
   ```
3. **No Classes**: Use exported functions and types
4. **Type Safety**: Strict TypeScript types for all inputs/outputs

### Bridge Layer Usage

Use existing `inspectedWindowBridge.execute`:

```typescript
return inspectedWindowBridge.execute({
  func: async (
    databaseName: string,
    version: string,
    migrationSQL?: string,
    seedSQL?: string,
  ) => {
    // Code runs in inspected page MAIN world
    const api = window.__web_sqlite;
    const dbRecord = api?.databases[databaseName];
    if (!dbRecord?.db) {
      return { success: false, error: `Database not found: ${databaseName}` };
    }
    const db = dbRecord.db as DBInterface;
    // Use db.devTool.release() or db.devTool.rollback()
  },
  args: [dbname, version, migrationSQL, seedSQL],
});
```

### DevTool API Integration

The web-sqlite-js `DevTool` interface provides:

- `release(input: ReleaseConfig): Promise<void>` - Creates dev version
- `rollback(version: string): Promise<void>` - Rolls back to version

The `ReleaseConfig` type:

```typescript
type ReleaseConfig = {
  version: string;
  migrationSQL: string;
  seedSQL?: string | null;
};
```

### Version Tracking

SQLite has built-in version tracking via `PRAGMA user_version`:

- Returns integer value (not semantic version)
- web-sqlite-js extends this with semantic version tracking
- Fallback to `DatabaseRecord` migrationSQL/seedSQL Maps for version info

## 6) Definition of Done

### Service Layer

- [ ] Type `ReleaseConfig` re-exported from DB types
- [ ] Type `DevReleaseResult` added and exported
- [ ] Type `RollbackResult` added and exported
- [ ] Type `DbVersionResult` added and exported
- [ ] Function `devRelease` implemented with JSDoc
- [ ] Function `devRollback` implemented with JSDoc
- [ ] Function `getDbVersion` implemented with JSDoc
- [ ] Functions added to `databaseService` export object

### General

- [ ] TypeScript compiles without errors
- [ ] Code follows functional design (no classes)
- [ ] Three-phase comments in functions > 5 lines

## 7) Testing Notes (Unit Tests)

Unit tests to be added in separate task (referenced in TASK-12):

### Service Layer Tests

- Mock `inspectedWindowBridge.execute` to return test data
- Test `devRelease` creates dev version with migration SQL
- Test `devRelease` creates dev version with seed SQL
- Test `devRollback` rolls back to specific version
- Test `getDbVersion` returns SQLite user_version
- Test `getDbVersion` returns "0.0.0" when no version set
- Test error handling for database not found
- Test error handling for dev version already exists

### Integration Tests

- Test end-to-end dev release with real web-sqlite-js database
- Test rollback restores original database state
- Test version tracking after migration

## 8) References

- API Contract: `agent-docs/05-design/01-contracts/01-api.md`
- Module LLD: `agent-docs/05-design/03-modules/database-service.md`
- Error Standards: `agent-docs/05-design/01-contracts/03-errors.md`
- DB Types: `src/types/DB.ts`
