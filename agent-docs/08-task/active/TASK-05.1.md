<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/active/task-micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-05.1.md

NOTES
- Micro-Spec for TASK-05.1: Service Layer - Table Schema Functions
- Spec-first implementation per S8 Worker guidelines
- Functional-first design (functions > classes)
-->

# TASK-05.1: Service Layer - Table Schema Functions

## 0) Meta

- **Task ID**: TASK-05.1
- **Title**: Service Layer - Table Schema Functions
- **Priority**: P0 (Blocker)
- **Status**: In Progress
- **Dependencies**: TASK-05 (Database List & Table Browser)
- **Feature**: F-001 Service Layer Expansion - Schema Inspection Group
- **Maps to**: FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-043
- **Created**: 2026-01-13

## 1) Summary

Implement two service layer functions for schema inspection and data querying:

1. `getTableSchema(dbname, tableName)` - Get table columns, types, constraints, and DDL
2. `queryTableData(dbname, sql, limit, offset)` - Execute SELECT with pagination

These functions extend the existing `databaseService` in `src/devtools/services/databaseService.ts`.

## 2) Boundary

**Files to modify:**

- `src/devtools/services/databaseService.ts` - Add new types and functions

**Files to read (context):**

- `src/devtools/bridge/inspectedWindow.ts` - Existing bridge layer

**Files NOT to modify:**

- No changes to bridge layer (use existing `inspectedWindowBridge.execute`)
- No changes to components (that's TASK-05.6)

## 3) Upstream Traceability

### HLD References

- Service Layer Architecture: `agent-docs/03-architecture/01-hld.md` (Section 8)
- Three-Layer Pattern: `agent-docs/03-architecture/01-hld.md` (Service Layer Functions)

### API Contract References

- `getTableSchema`: `agent-docs/05-design/01-contracts/01-api.md` (Schema & Data Inspection)
- `queryTableData`: `agent-docs/05-design/01-contracts/01-api.md` (Schema & Data Inspection)
- Error codes: `agent-docs/05-design/01-contracts/03-errors.md`

### Module LLD References

- Database Service: `agent-docs/05-design/03-modules/database-service.md`
  - Section 4, Classes/Functions: `getTableSchema`, `queryTableData`

## 4) Functional Design

### Type Definitions (Functional - no classes)

```typescript
/**
 * Column information from PRAGMA table_info
 */
export type ColumnInfo = {
  cid: number; // Column ID (0-indexed)
  name: string; // Column name
  type: string; // Declared type (INTEGER, TEXT, etc.)
  notnull: number; // 1 if NOT NULL, 0 otherwise
  dflt_value: any; // Default value (null if none)
  pk: number; // 1 if PRIMARY KEY, 0 otherwise
};

/**
 * Table schema with columns and DDL
 */
export type TableSchema = {
  columns: ColumnInfo[];
  ddl: string; // Complete CREATE TABLE SQL
};

/**
 * Query result with pagination metadata
 */
export type QueryResult = {
  rows: Array<Record<string, any>>; // Row data
  total: number; // Total row count (for pagination)
  columns: string[]; // Column names from first row
};
```

### Function: `getTableSchema(dbname, tableName)`

**Purpose**: Get table schema including columns and DDL

**Signature**:

```typescript
export const getTableSchema = async (
  dbname: string,
  tableName: string,
): Promise<ServiceResponse<TableSchema>>
```

**Algorithm** (functional, 3-phase):

1. **Phase 1: Validate and fetch database**
   - Execute function that accesses `window.__web_sqlite.databases[dbname]`
   - Return error if database not found

2. **Phase 2: Query schema information**
   - Execute `PRAGMA table_info(tableName)` to get column details
   - Execute `SELECT sql FROM sqlite_master WHERE type='table' AND name=?` for DDL
   - Normalize column info to `ColumnInfo[]` format

3. **Phase 3: Return response**
   - On success: `{ success: true, data: { columns: [...], ddl: "..." } }`
   - On error: `{ success: false, error: "..." }`

**Error Cases**:

- Database not found
- Table not found
- SQL query errors

### Function: `queryTableData(dbname, sql, limit, offset)`

**Purpose**: Execute SELECT query with pagination

**Signature**:

```typescript
export const queryTableData = async (
  dbname: string,
  sql: string,
  limit: number,
  offset: number,
): Promise<ServiceResponse<QueryResult>>
```

**Algorithm** (functional, 3-phase):

1. **Phase 1: Validate and wrap SQL**
   - Access `window.__web_sqlite.databases[dbname]`
   - Wrap user SQL: `SELECT * FROM (${sql}) LIMIT ? OFFSET ?`

2. **Phase 2: Execute queries**
   - Execute count query: `SELECT COUNT(*) FROM (${sql})`
   - Execute data query with pagination
   - Extract column names from first row keys

3. **Phase 3: Return response**
   - On success: `{ success: true, data: { rows: [...], total: N, columns: [...] } }`
   - On empty: `{ success: true, data: { rows: [], total: 0, columns: [] } }`
   - On error: `{ success: false, error: "..." }`

**Error Cases**:

- SQL syntax errors
- Database not found
- Query execution errors

## 5) Implementation Notes

### Functional-First Rationale

This spec uses functional design because:

- State transformation is the core operation (SQL → Result)
- No need for instance state or lifecycle management
- Functions are pure (same input → same output for a given DB state)
- Easier to test (mock bridge layer)
- Aligns with existing `databaseService` pattern

### Code Quality Requirements (S8 Rules)

1. **Function Documentation**: JSDoc on exported functions
2. **Three-Phase Comments**: For functions > 5 lines
   ```typescript
   /**
    * Get table schema
    */
   export const getTableSchema = async (...) => {
     // Phase 1: Validate database
     // Phase 2: Query schema
     // Phase 3: Return response
   }
   ```
3. **No Classes**: Use exported functions and types
4. **Type Safety**: Strict TypeScript types for all inputs/outputs

### Bridge Layer Usage

Use existing `inspectedWindowBridge.execute`:

```typescript
return inspectedWindowBridge.execute({
  func: async (dbname: string, tableName: string) => {
    // Code runs in inspected page MAIN world
  },
  args: [dbname, tableName],
});
```

## 6) Definition of Done

- [ ] Type `ColumnInfo` added and exported
- [ ] Type `TableSchema` added and exported
- [ ] Type `QueryResult` added and exported
- [ ] Function `getTableSchema` implemented with JSDoc
- [ ] Function `queryTableData` implemented with JSDoc
- [ ] Both functions added to `databaseService` export object
- [ ] TypeScript compiles without errors
- [ ] Code follows functional design (no classes)
- [ ] Three-phase comments in functions > 5 lines

## 7) Testing Notes (Unit Tests)

Unit tests to be added in separate task (referenced in TASK-12):

- Mock `inspectedWindowBridge.execute` to return test data
- Test `getTableSchema` with valid/invalid table
- Test `queryTableData` with pagination
- Test error handling paths

## 8) References

- API Contract: `agent-docs/05-design/01-contracts/01-api.md`
- Module LLD: `agent-docs/05-design/03-modules/database-service.md`
- Error Standards: `agent-docs/05-design/01-contracts/03-errors.md`
