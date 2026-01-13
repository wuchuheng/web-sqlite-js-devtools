# F-001: Service Layer Expansion

> **Feature ID**: F-001
> **Status**: Discovery (Stage 1)
> **Created**: 2026-01-13
> **Priority**: High

## 1) Feature Summary

Complete the `@src/devtools/services` layer by implementing all remaining SQL communication operations defined in the API contracts. This ensures all database interactions flow through the service layer instead of direct `inspectedWindow.eval` calls in components.

**One-sentence description**: Implement all remaining database service functions in `databaseService.ts` to cover table schema, query execution, SQL execution, logs, migration/seed, and OPFS operations.

## 2) Business Value

### Why this feature matters

- **Architecture Alignment**: The current HLD specifies a layered architecture (Presentation → Service → Bridge), but only 2 of ~15 service functions are implemented
- **Maintainability**: Centralizes all database logic in one place instead of scattered across components
- **Testability**: Service layer functions can be unit tested independently of Chrome APIs
- **API Contract Compliance**: The existing API contracts define operations that have no service implementation yet

### Success criteria

1. All operations in `agent-docs/05-design/01-contracts/01-api.md` have corresponding service functions
2. Components import from `@/devtools/services/*` instead of `@/devtools/inspectedWindow`
3. Service layer handles all business logic (data normalization, error handling, fallback logic)
4. Bridge layer remains Chrome-API-only (no business logic)

## 3) Current State Analysis

### Existing Service Layer

**Location**: `src/devtools/services/databaseService.ts`

| Function               | Status         | Description                        |
| ---------------------- | -------------- | ---------------------------------- |
| `getDatabases()`       | ✅ Implemented | List all opened databases          |
| `getTableList(dbname)` | ✅ Implemented | Get tables for a specific database |

### Missing Service Functions

| API Channel          | Missing Service Function                               | Description                                |
| -------------------- | ------------------------------------------------------ | ------------------------------------------ |
| `GET_TABLE_SCHEMA`   | `getTableSchema(dbname, tableName)`                    | Get table columns, types, constraints, DDL |
| `QUERY_TABLE_DATA`   | `queryTableData(dbname, sql, limit, offset)`           | Execute SELECT with pagination             |
| `EXEC_SQL`           | `execSQL(dbname, sql, params?)`                        | Execute INSERT/UPDATE/DELETE/DDL           |
| `SUBSCRIBE_LOGS`     | `subscribeLogs(dbname)`                                | Subscribe to log events                    |
| `UNSUBSCRIBE_LOGS`   | `unsubscribeLogs(subscriptionId)`                      | Unsubscribe from log events                |
| `DEV_RELEASE`        | `devRelease(dbname, version, migrationSQL?, seedSQL?)` | Create dev version with migration/seed     |
| `DEV_ROLLBACK`       | `devRollback(dbname, toVersion)`                       | Rollback dev version                       |
| `GET_DB_VERSION`     | `getDbVersion(dbname)`                                 | Get current database version               |
| `GET_OPFS_FILES`     | `getOpfsFiles(path?, dbname?)`                         | List OPFS files                            |
| `DOWNLOAD_OPFS_FILE` | `downloadOpfsFile(path)`                               | Download OPFS file                         |

### Components Using Direct `inspectedWindow` Access

| Component                  | Current Import                                | Should Import From                    |
| -------------------------- | --------------------------------------------- | ------------------------------------- |
| `Sidebar/DatabaseList.tsx` | `@/devtools/inspectedWindow`                  | `@/devtools/services/databaseService` |
| `TableTab/TableList.tsx`   | `@/devtools/inspectedWindow`                  | `@/devtools/services/databaseService` |
| `hooks/useConnection.ts`   | Direct `chrome.devtools.inspectedWindow.eval` | Keep for heartbeat (not data access)  |

## 4) Requirements

### Functional Requirements

- [FR-1] Implement `getTableSchema()` service function
  - Input: `dbname: string, tableName: string`
  - Output: `ServiceResponse<{ columns: ColumnInfo[], ddl: string }>`
  - Logic: Query `PRAGMA table_info`, fallback to `sqlite_master`, construct DDL

- [FR-2] Implement `queryTableData()` service function
  - Input: `dbname: string, sql: string, limit: number, offset: number`
  - Output: `ServiceResponse<{ rows: Row[], total: number, columns: string[] }>`
  - Logic: Execute query, count total rows, apply pagination

- [FR-3] Implement `execSQL()` service function
  - Input: `dbname: string, sql: string, params?: SqlValue[] | Record<string, SqlValue>`
  - Output: `ServiceResponse<{ lastInsertRowid: number | bigint, changes: number | bigint }>`
  - Logic: Execute write operation, return affected rows info

- [FR-4] Implement `subscribeLogs()` and `unsubscribeLogs()` service functions
  - Use offscreen messaging channel for log streaming
  - Implement ring buffer (500 entries) in background service

- [FR-5] Implement `devRelease()`, `devRollback()`, `getDbVersion()` service functions
  - Support migration/seed playground with automatic rollback

- [FR-6] Implement `getOpfsFiles()` and `downloadOpfsFile()` service functions
  - Use `navigator.storage.getDirectory()` via inspected window eval

- [FR-7] Update components to import from service layer
  - Replace deprecated imports from `@/devtools/inspectedWindow`

### Non-Functional Requirements

- [NFR-1] Maintain backward compatibility during transition
- [NFR-2] Service functions must be unit testable (no Chrome APIs directly in service layer)
- [NFR-3] Bridge layer remains pure Chrome API wrapper
- [NFR-4] Error handling follows existing `ServiceResponse<T>` pattern

## 5) Out of Scope

- Modifying the web-sqlite-js library
- Changing the existing API contracts (implementing to spec)
- Chrome Extension manifest changes
- UI/UX redesign (component behavior stays the same)

## 6) Dependencies

- **Upstream**: `agent-docs/03-architecture/01-hld.md` (layered architecture pattern)
- **Upstream**: `agent-docs/05-design/01-contracts/01-api.md` (API contracts to implement)
- **Upstream**: `src/devtools/bridge/inspectedWindow.ts` (bridge layer for execution)
- **Downstream**: Will trigger Stage 3 HLD update (service layer expansion)
- **Downstream**: Will trigger Stage 5 LLD update (service module design)
- **Downstream**: Will trigger Stage 7 task catalog update (new tasks for implementation)

## 7) Risks

| Risk                                    | Impact | Mitigation                                                    |
| --------------------------------------- | ------ | ------------------------------------------------------------- |
| web-sqlite-js API undocumented behavior | Medium | Test with real databases, use fallback queries                |
| Offscreen log streaming complexity      | Medium | Implement ring buffer in background, defer streaming to later |
| OPFS API browser support                | Low    | Check availability, return clear error if unsupported         |

## 8) Acceptance Criteria

1. All 10 missing service functions are implemented in `databaseService.ts`
2. Each service function has proper TypeScript types matching API contracts
3. Components are updated to import from `@/devtools/services/databaseService`
4. Deprecated exports in `inspectedWindow.ts` are marked `@deprecated`
5. Service layer has unit tests (mocked bridge layer)
6. Documentation updated in `agent-docs/05-design/03-modules/devtools-panel.md`

## 9) Related Documents

- Parent: `agent-docs/01-discovery/02-requirements.md`
- API Contracts: `agent-docs/05-design/01-contracts/01-api.md`
- HLD: `agent-docs/03-architecture/01-hld.md`
- Existing Service: `src/devtools/services/databaseService.ts`
