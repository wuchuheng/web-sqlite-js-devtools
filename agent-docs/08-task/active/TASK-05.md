# TASK-05: Database List & Table Browser

## 1. Task Metadata

- **Task ID**: TASK-05
- **Title**: Database List & Table Browser
- **Priority**: P0 (Blocker)
- **Dependencies**: TASK-03, TASK-02 (completed)
- **Status**: In Progress
- **Last Updated**: 2026-01-13

## 2. Requirements Mapping

| FR ID  | Requirement                                    | Implementation                                  |
| ------ | ---------------------------------------------- | ----------------------------------------------- |
| FR-001 | List opened databases                          | inspectedWindow eval + Sidebar DatabaseList     |
| FR-008 | Display database list in sidebar               | DatabaseList with nested DB links               |
| FR-009 | Table list available per database              | inspectedWindow eval + TableList component      |
| FR-016 | Navigate to database view on selection         | /openedDB/:dbname route + Link navigation       |
| FR-017 | Table list sorted and visually active on click | Alphabetical sort + active styling in TableList |

## 3. Functional Design

### 3.1 Architecture Note

**Design Philosophy**: Use DevTools `chrome.devtools.inspectedWindow.eval` to access `window.__web_sqlite` directly. Remove channel-based routing for database/table listing. All logic remains functional (no classes), with explicit error handling and small, composable functions.

### 3.2 Data Flow

```
DevTools Panel
  -> inspectedWindow.eval(window.__web_sqlite)
  -> db.query("PRAGMA table_list")
  -> filter + sort
  -> Response<T>
```

### 3.3 Component Structure

```
src/devtools/
  DevTools.tsx                      # Route database view to TableList
  inspectedWindow.ts               # inspectedWindow eval helpers
  hooks/
    useInspectedWindowRequest.ts   # Shared request state hook
  utils/
    databaseNames.ts               # Route/dbname helpers
  components/
    Sidebar/
      DatabaseList.tsx             # Render databases, nested under "Opened DB"
    TableTab/
      TableList.tsx                # Render tables, active selection
      DatabaseView.tsx             # Wrapper for /openedDB/:dbname route
```

### 3.4 Functional-First Check

- **No classes** are introduced in this task.
- All logic is implemented as functions and React functional components.

## 4. Component Specifications

### 4.1 Inspected Window Helpers

**File**: `src/devtools/inspectedWindow.ts`

**Purpose**: Execute `chrome.devtools.inspectedWindow.eval` to read databases and tables.

**Additions**:

```typescript
export const getDatabasesFromInspectedWindow = async () => {
  // eval -> Array.from(window.__web_sqlite.databases.keys())
};

export const getTableListFromInspectedWindow = async (dbname: string) => {
  // eval -> db.query("PRAGMA table_list") with sqlite_master fallback
};
```

### 4.2 useInspectedWindowRequest Hook

**File**: `src/devtools/hooks/useInspectedWindowRequest.ts`

**Purpose**: Shared hook for loading/empty/error UI states with reload support.

```typescript
export const useInspectedWindowRequest = <T>(
  request: () => Promise<InspectedWindowResponse<T>>,
  deps: readonly unknown[],
  initialData: T,
) => {
  // handle loading + error + reload
};
```

### 4.4 Sidebar DatabaseList

**File**: `src/devtools/components/Sidebar/DatabaseList.tsx`

**Behavior**:

- Fetch database list on mount via `getDatabasesFromInspectedWindow` + `useInspectedWindowRequest`.
- Render "Opened DB" label with nested DB items (indented).
- Each DB item links to `/openedDB/:dbname`.
- Active state when current route matches selected database.
- Show loading, empty, and error states.

### 4.5 TableList Component + Database View

**Files**:

- `src/devtools/components/TableTab/TableList.tsx`
- `src/devtools/components/TableTab/DatabaseView.tsx`
- `src/devtools/DevTools.tsx` (route swap)

**Behavior**:

- TableList fetches tables via `getTableListFromInspectedWindow(dbname)`.
- Tables are displayed in alphabetical order (already sorted in response).
- Clicking a table sets active styling (local selection state).
- DatabaseView renders TableList and a placeholder panel for table content (TASK-06).

## 5. Acceptance Criteria

- inspectedWindow eval uses PRAGMA queries and returns alphabetically sorted tables.
- Sidebar DatabaseList shows open DBs nested under "Opened DB".
- Clicking a DB navigates to `/openedDB/:dbname`.
- TableList renders sorted tables with active state styling on selection.

## 6. Risks / Open Questions

- DevTools eval is only available while DevTools is open; no background access.
- web-sqlite-js PRAGMA table_list result shape needs verification; fallback to `sqlite_master` may be required if unsupported.
