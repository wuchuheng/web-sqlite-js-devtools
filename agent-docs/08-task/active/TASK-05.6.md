<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/active/task-micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-05.6.md

NOTES
- Micro-Spec for TASK-05.6: Component Migration - Table Browser Components
- Spec-first implementation per S8 Worker guidelines
- Migration task: move components from deprecated inspectedWindow imports to direct databaseService imports
-->

# TASK-05.6: Component Migration - Table Browser Components

## 0) Meta

- **Task ID**: TASK-05.6
- **Title**: Component Migration - Table Browser Components
- **Priority**: P0 (Blocker)
- **Status**: In Progress
- **Dependencies**: TASK-05.1 (Service Layer Table Schema Functions)
- **Feature**: F-001 Service Layer Expansion - Component Migration
- **Maps to**: F-001, FR-007
- **Created**: 2026-01-13

## 1) Summary

Migrate `DatabaseList.tsx` and `TableList.tsx` components from using deprecated `inspectedWindow` imports to direct `databaseService` imports. This completes the service layer integration for table browser components.

## 2) Boundary

**Files to modify:**

- `src/devtools/components/Sidebar/DatabaseList.tsx` - Update imports to use `databaseService.getDatabases()`
- `src/devtools/components/TableTab/TableList.tsx` - Update imports to use `databaseService.getTableList()`
- `src/devtools/hooks/useInspectedWindowRequest.ts` - Update type import to use `ServiceResponse<T>` instead of deprecated alias

**Files to read (context):**

- `src/devtools/services/databaseService.ts` - Service layer functions
- `src/devtools/inspectedWindow.ts` - Current deprecated aliases (verify no changes needed)

**Files NOT to modify:**

- No changes to `inspectedWindow.ts` (deprecated aliases already exist)
- No changes to `databaseService.ts` (functions already implemented in TASK-05.1, TASK-05)
- No changes to `DatabaseView.tsx` (no direct API calls, only renders TableList)

## 3) Upstream Traceability

### HLD References

- Service Layer Architecture: `agent-docs/03-architecture/01-hld.md` (Section 8)
- Three-Layer Pattern: `agent-docs/03-architecture/01-hld.md` (Service Layer Functions)

### API Contract References

- Service Layer API: `agent-docs/05-design/01-contracts/01-api.md` (Databases & Tables)
- Message Types: `agent-docs/05-design/02-schema/01-message-types.md` (ServiceResponse<T>)

### Module LLD References

- DevTools Panel: `agent-docs/05-design/03-modules/devtools-panel.md` (Service Layer Integration)
- Database Service: `agent-docs/05-design/03-modules/database-service.md`

## 4) Functional Design

### Migration Pattern

The migration follows a consistent pattern:

1. **Remove deprecated import** from `@/devtools/inspectedWindow`
2. **Add direct import** from `@/devtools/services/databaseService`
3. **Update function call** to use `databaseService.functionName()` pattern
4. **Handle ServiceResponse<T> envelope** (already handled by `useInspectedWindowRequest`)

### Component 1: DatabaseList.tsx

**Current state:**

```typescript
import {
  getDatabasesFromInspectedWindow,
  type DatabaseSummary,
} from "@/devtools/inspectedWindow";

// Usage:
const { data: databases } = useInspectedWindowRequest<DatabaseSummary[]>(
  () => getDatabasesFromInspectedWindow(),
  [],
  [],
);
```

**Target state:**

```typescript
import {
  databaseService,
  type DatabaseSummary,
  type ServiceResponse,
} from "@/devtools/services/databaseService";

// Usage:
const { data: databases } = useInspectedWindowRequest<DatabaseSummary[]>(
  () => databaseService.getDatabases(),
  [],
  [],
);
```

### Component 2: TableList.tsx

**Current state:**

```typescript
import { getTableListFromInspectedWindow } from "@/devtools/inspectedWindow";

// Usage:
const { data: tables } = useInspectedWindowRequest<string[]>(
  () => getTableListFromInspectedWindow(dbname),
  [dbname],
  [],
);
```

**Target state:**

```typescript
import {
  databaseService,
  type ServiceResponse,
} from "@/devtools/services/databaseService";

// Usage:
const { data: tables } = useInspectedWindowRequest<string[]>(
  () => databaseService.getTableList(dbname),
  [dbname],
  [],
);
```

### Hook Update: useInspectedWindowRequest.ts

**Current state:**

```typescript
import type { InspectedWindowResponse } from "@/devtools/inspectedWindow";

export const useInspectedWindowRequest = <T>(
  request: () => Promise<InspectedWindowResponse<T>>,
  // ...
)
```

**Target state:**

```typescript
import type { ServiceResponse } from "@/devtools/services/databaseService";

export const useInspectedWindowRequest = <T>(
  request: () => Promise<ServiceResponse<T>>,
  // ...
)
```

**Rationale:** The hook is not specific to inspected window - it's a general async request handler for service operations. Renaming the type parameter clarifies it works with any service layer function.

## 5) Implementation Notes

### Why This Migration Is Safe

1. **Deprecated aliases already exist** in `inspectedWindow.ts`:
   - `getDatabasesFromInspectedWindow` → `databaseService.getDatabases`
   - `getTableListFromInspectedWindow` → `databaseService.getTableList`
   - `InspectedWindowResponse<T>` → `ServiceResponse<T>`

2. **Return types are identical**: Both functions return `ServiceResponse<T>` (the deprecated alias was just `InspectedWindowResponse<T>`)

3. **Hook compatibility**: The `useInspectedWindowRequest` hook already handles `success/data/error` envelope correctly

4. **No behavior change**: This is a pure import refactor with no functional changes

### Type Compatibility

The `useInspectedWindowRequest` hook expects:

- `success: boolean` - Checked to determine if request succeeded
- `data?: T` - Extracted and stored in state
- `error?: string` - Thrown as Error if not successful

This exactly matches `ServiceResponse<T>` from the service layer:

```typescript
export type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

### Testing Strategy

After migration:

1. **Build verification**: `npm run build` should pass without TypeScript errors
2. **Manual testing**: Open DevTools panel and verify:
   - Database list loads correctly
   - Clicking a database shows table list
   - Loading/error states display properly

## 6) Definition of Done

### Component Migrations

- [ ] `DatabaseList.tsx` imports `databaseService` and `DatabaseSummary` from `@/devtools/services/databaseService`
- [ ] `DatabaseList.tsx` calls `databaseService.getDatabases()`
- [ ] `TableList.tsx` imports `databaseService` from `@/devtools/services/databaseService`
- [ ] `TableList.tsx` calls `databaseService.getTableList(dbname)`
- [ ] `useInspectedWindowRequest.ts` imports `ServiceResponse` from databaseService

### Verification

- [ ] TypeScript compiles without errors
- [ ] No remaining imports of deprecated functions from `@/devtools/inspectedWindow` in migrated components
- [ ] Deprecated aliases remain in `inspectedWindow.ts` for backward compatibility
- [ ] Build succeeds: `npm run build`

### Documentation

- [ ] Update status.md with TASK-05.6 completion
- [ ] Update task catalog to mark TASK-05.6 as `[x]`

## 7) Testing Notes

### Manual Testing (Load & Verify)

1. **Database List Loading:**
   - Open DevTools panel on a page with `window.__web_sqlite`
   - Verify database list appears under "Opened DB"
   - Check that loading state shows "Loading databases..."
   - Verify error state displays if API unavailable

2. **Table List Loading:**
   - Click on a database in the sidebar
   - Verify table list loads in the left panel
   - Check that loading state shows "Loading tables..."
   - Verify error state displays if database not found

3. **UI Consistency:**
   - Verify styling matches before migration
   - Check that collapse/expand works
   - Verify active states highlight correctly

### Edge Cases to Verify

- Empty database list (no databases opened)
- Empty table list (database with no tables)
- Network error handling (API unavailable)
- Database name encoding/decoding

## 8) References

- Service Layer API: `agent-docs/05-design/01-contracts/01-api.md`
- Module LLD (DevTools Panel): `agent-docs/05-design/03-modules/devtools-panel.md`
- Module LLD (Database Service): `agent-docs/05-design/03-modules/database-service.md`
- Message Types: `agent-docs/05-design/02-schema/01-message-types.md`
