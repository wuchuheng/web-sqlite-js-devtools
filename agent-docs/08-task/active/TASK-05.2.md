<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/active/task-micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-05.2.md

NOTES
- Micro-Spec for TASK-05.2: Service Layer - SQL Execution Functions
- Spec-first implementation per S8 Worker guidelines
- Functional-first design (functions > classes)
-->

# TASK-05.2: Service Layer - SQL Execution Functions

## 0) Meta

- **Task ID**: TASK-05.2
- **Title**: Service Layer - SQL Execution Functions
- **Priority**: P0 (Blocker)
- **Status**: In Progress
- **Dependencies**: TASK-05.1 (Table Schema Functions)
- **Feature**: F-001 Service Layer Expansion - Query Execution Group
- **Maps to**: FR-024, FR-025, FR-026, FR-027
- **Created**: 2026-01-13

## 1) Summary

Implement `execSQL(dbname, sql, params?)` service function for executing INSERT/UPDATE/DELETE/DDL with optional parameters.

This function extends the existing `databaseService` in `src/devtools/services/databaseService.ts`.

## 2) Boundary

**Files to modify:**

- `src/devtools/services/databaseService.ts` - Add new types and function

**Files to read (context):**

- `src/devtools/bridge/inspectedWindow.ts` - Existing bridge layer

**Files NOT to modify:**

- No changes to bridge layer (use existing `inspectedWindowBridge.execute`)
- No changes to components (that's TASK-05.7)

## 3) Upstream Traceability

### HLD References

- Service Layer Architecture: `agent-docs/03-architecture/01-hld.md` (Section 8)
- Three-Layer Pattern: `agent-docs/03-architecture/01-hld.md` (Service Layer Functions)

### API Contract References

- `execSQL`: `agent-docs/05-design/01-contracts/01-api.md` (Schema & Data Inspection)
- Error codes: `agent-docs/05-design/01-contracts/03-errors.md`

### Module LLD References

- Database Service: `agent-docs/05-design/03-modules/database-service.md`
  - Section 4, Classes/Functions: `execSQL`

## 4) Functional Design

### Type Definitions (Functional - no classes)

```typescript
/**
 * SQL value types compatible with SQLite
 */
export type SqlValue =
  | null
  | number
  | string
  | boolean
  | bigint
  | Uint8Array
  | ArrayBuffer;

/**
 * SQL parameters - positional array or named object
 */
export type SQLParams = SqlValue[] | Record<string, SqlValue>;

/**
 * Execution result from write operations
 */
export type ExecResult = {
  lastInsertRowid: number | bigint;
  changes: number | bigint;
};
```

### Function: `execSQL(dbname, sql, params?)`

**Purpose**: Execute INSERT/UPDATE/DELETE/DDL with optional parameters

**Signature**:

```typescript
export const execSQL = async (
  dbname: string,
  sql: string,
  params?: SQLParams,
): Promise<ServiceResponse<ExecResult>>
```

**Algorithm** (functional, 3-phase):

1. **Phase 1: Validate and fetch database**
   - Execute function that accesses `window.__web_sqlite.databases[dbname]`
   - Return error if database not found

2. **Phase 2: Execute SQL with parameters**
   - Use `db.exec(sql, params)` for parameterized execution
   - Support both positional (`[]`) and named (`{}`) parameters
   - Extract `lastInsertRowid` and `changes` from result

3. **Phase 3: Return response**
   - On success: `{ success: true, data: { lastInsertRowid, changes } }`
   - On error: `{ success: false, error: "..." }`

**Error Cases**:

- Database not found
- SQL syntax errors
- Constraint violations
- Parameter count mismatch

## 5) Implementation Notes

### Functional-First Rationale

This spec uses functional design because:

- State transformation is the core operation (SQL + params → Result)
- No need for instance state or lifecycle management
- Functions are pure (same input → same output for a given DB state)
- Easier to test (mock bridge layer)
- Aligns with existing `databaseService` pattern

### Code Quality Requirements (S8 Rules)

1. **Function Documentation**: JSDoc on exported functions
2. **Three-Phase Comments**: For functions > 5 lines
   ```typescript
   /**
    * Execute SQL with parameters
    */
   export const execSQL = async (...) => {
     // Phase 1: Validate database
     // Phase 2: Execute SQL
     // Phase 3: Return response
   }
   ```
3. **No Classes**: Use exported functions and types
4. **Type Safety**: Strict TypeScript types for all inputs/outputs

### Bridge Layer Usage

Use existing `inspectedWindowBridge.execute`:

```typescript
return inspectedWindowBridge.execute({
  func: async (dbname: string, sql: string, params?: SQLParams) => {
    // Code runs in inspected page MAIN world
  },
  args: [dbname, sql, params],
});
```

### Parameter Handling

- **Positional parameters** (`SqlValue[]`): `?` placeholders in SQL
  - Example: `db.exec("INSERT INTO users (name) VALUES (?)", ["Alice"])`
- **Named parameters** (`Record<string, SqlValue>`): `:name` placeholders in SQL
  - Example: `db.exec("INSERT INTO users (name) VALUES (:name)", { name: "Alice" })`

## 6) Definition of Done

- [ ] Type `SqlValue` added and exported
- [ ] Type `SQLParams` added and exported
- [ ] Type `ExecResult` added and exported
- [ ] Function `execSQL` implemented with JSDoc
- [ ] Function added to `databaseService` export object
- [ ] TypeScript compiles without errors
- [ ] Code follows functional design (no classes)
- [ ] Three-phase comments in function

## 7) Testing Notes (Unit Tests)

Unit tests to be added in separate task (referenced in TASK-12):

- Mock `inspectedWindowBridge.execute` to return test data
- Test `execSQL` with positional parameters
- Test `execSQL` with named parameters
- Test `execSQL` without parameters
- Test error handling (constraint violations, syntax errors)

## 8) References

- API Contract: `agent-docs/05-design/01-contracts/01-api.md`
- Module LLD: `agent-docs/05-design/03-modules/database-service.md`
- Error Standards: `agent-docs/05-design/01-contracts/03-errors.md`
