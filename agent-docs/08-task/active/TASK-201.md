<!--
TASK: TASK-201
TITLE: Query History
STATUS: In Progress [-]
-->

# Micro-Spec: TASK-201 - Query History

## 1) Overview

**Feature**: Persist recently executed SQL queries for quick re-execution in the Query tab.

**Maps to**: FR-106

**Boundary**:

- New hook: `src/devtools/hooks/useQueryHistory.ts`
- Modified: `src/devtools/components/QueryTab/QueryTab.tsx`

## 2) Functional Requirements

| ID       | Requirement               | Acceptance Criteria                                                                    |
| -------- | ------------------------- | -------------------------------------------------------------------------------------- |
| FR-106.1 | Save queries on execution | Each successful query execution saves SQL + dbname + timestamp to chrome.storage.local |
| FR-106.2 | Persist across sessions   | Query history survives DevTools panel close/reopen                                     |
| FR-106.3 | Display history sidebar   | Show last 10 queries in a collapsible sidebar within Query tab                         |
| FR-106.4 | Click to re-execute       | Clicking a history item loads SQL into editor and auto-executes                        |
| FR-106.5 | Limit storage             | Keep maximum 50 queries per database (FIFO)                                            |
| FR-106.6 | Clear history             | User can clear history for current database                                            |
| FR-106.7 | Deduplicate               | Don't store consecutive duplicate queries                                              |

## 3) Data Types

```typescript
/**
 * Stored query history entry
 */
interface QueryHistoryEntry {
  /** SQL query string */
  sql: string;
  /** Database name (encoded) */
  dbname: string;
  /** ISO timestamp when query was executed */
  timestamp: string;
  /** Number of times this query was executed */
  executionCount: number;
}

/**
 * Storage key structure for chrome.storage.local
 */
const QUERY_HISTORY_KEY = "query_history";

/**
 * Storage structure: Map of dbname to QueryHistoryEntry[]
 * { dbname: QueryHistoryEntry[] }
 */
type QueryHistoryStorage = Record<string, QueryHistoryEntry[]>;
```

## 4) Implementation Plan

### 4.1 New Hook: `useQueryHistory`

**File**: `src/devtools/hooks/useQueryHistory.ts`

**Interface**:

```typescript
interface UseQueryHistoryResult {
  /** Ordered list of history entries (newest first) */
  history: QueryHistoryEntry[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Add query to history */
  addQuery: (sql: string, dbname: string) => Promise<void>;
  /** Remove specific entry from history */
  removeQuery: (timestamp: string) => Promise<void>;
  /** Clear all history for current database */
  clearHistory: () => Promise<void>;
  /** Load SQL into editor (callback) */
  loadQuery: (entry: QueryHistoryEntry) => void;
}
```

**Functional implementation** (no classes, pure functions):

```typescript
/**
 * Get query history for specific database from chrome.storage.local
 *
 * @param dbname - Encoded database name
 * @returns Promise<QueryHistoryEntry[]> - Sorted newest first
 */
async function getHistoryForDb(dbname: string): Promise<QueryHistoryEntry[]> {
  // 1. chrome.storage.local.get(QUERY_HISTORY_KEY)
  // 2. Parse QueryHistoryStorage
  // 3. Return array for dbname or empty array
}

/**
 * Save query history entry to chrome.storage.local
 *
 * @param entry - Query history entry to save
 * @returns Promise<void>
 */
async function saveHistoryEntry(entry: QueryHistoryEntry): Promise<void> {
  // 1. Get existing history for dbname
  // 2. Check for consecutive duplicate (same SQL + dbname, last entry)
  // 3. If duplicate, increment executionCount instead
  // 4. Otherwise, prepend to array
  // 5. Keep only last 50 entries (slice)
  // 6. chrome.storage.local.set({ [QUERY_HISTORY_KEY]: updated })
}

/**
 * Remove query entry from history
 *
 * @param dbname - Database name
 * @param timestamp - Entry timestamp (unique key)
 * @returns Promise<void>
 */
async function removeHistoryEntry(
  dbname: string,
  timestamp: string,
): Promise<void> {
  // 1. Get existing history
  // 2. Filter out entry with matching timestamp
  // 3. chrome.storage.local.set({ [QUERY_HISTORY_KEY]: filtered })
}

/**
 * Clear all history for a database
 *
 * @param dbname - Database name to clear
 * @returns Promise<void>
 */
async function clearHistoryForDb(dbname: string): Promise<void> {
  // 1. Get existing storage
  // 2. Delete dbname key
  // 3. chrome.storage.local.set({ [QUERY_HISTORY_KEY]: updated })
}
```

### 4.2 Component Integration

**File**: `src/devtools/components/QueryTab/QueryTab.tsx`

**Changes**:

1. Import `useQueryHistory` hook
2. Add state for `isHistoryOpen` (boolean)
3. Render collapsible history sidebar (left 20%, editor 80%)
4. Call `addQuery(sql, dbname)` after successful query execution
5. Display history items with SQL preview (truncate at 50 chars) + timestamp + execution count
6. Add "Clear History" button

**Layout**:

```
┌─────────────────────────────────────────────────────┐
│ Query Tab                           [History ▼]     │
├──────────────┬──────────────────────────────────────┤
│ History (10) │ SQL Editor                          │
│              │                                      │
│ • SELECT...  │ [textarea with SQL]                 │
│ • INSERT...  │                                      │
│ • UPDATE...  │ [Execute] [Export CSV] [Export JSON]│
│              │                                      │
│ [Clear All]  │ Results table...                    │
└──────────────┴──────────────────────────────────────┘
```

## 5) Chrome Storage Usage

### chrome.storage.local API

```typescript
// Read
const result = await chrome.storage.local.get(QUERY_HISTORY_KEY);
const storage: QueryHistoryStorage = result[QUERY_HISTORY_KEY] || {};

// Write
await chrome.storage.local.set({
  [QUERY_HISTORY_KEY]: {
    ...storage,
    [dbname]: updatedHistory,
  },
});

// Listen for changes (optional, for multi-panel sync)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[QUERY_HISTORY_KEY]) {
    // Reload history
  }
});
```

## 6) UI/UX Specifications

### History Item Display

```
┌────────────────────────────────┐
│ SELECT * FROM users LIMIT...   │
│ 2 min ago • executed 5 times   │
└────────────────────────────────┘
```

**Styling** (Tailwind CSS):

- Container: `hover:bg-gray-50 cursor-pointer p-2 rounded border-b`
- SQL: `text-sm font-mono truncate` (max 50 chars)
- Metadata: `text-xs text-gray-500`
- Active: `bg-blue-50 border-l-4 border-blue-500`

### Empty State

```
┌────────────────────────────────┐
│ No query history yet           │
│                                │
│ Execute queries to see them    │
│ appear here for quick access.  │
└────────────────────────────────┘
```

### Timestamp Formatting

```typescript
/**
 * Format timestamp as relative time
 *
 * @param isoTimestamp - ISO 8601 timestamp
 * @returns Relative time string (e.g., "2 min ago", "1 hour ago")
 */
function formatRelativeTime(isoTimestamp: string): string {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour ago`;
  return `${days} day ago`;
}
```

## 7) Code Quality Rules

### Functional-First Design

- All storage operations are pure functions (no classes)
- React hook manages state only
- No side effects in pure functions (except chrome.storage API calls)

### Function Size Limits

- Storage functions: Max 15 lines
- Format function: Max 10 lines
- Hook: Max 80 lines total

### Three-Phase Comments (for functions > 5 lines)

```typescript
/**
 * Save query history entry to chrome.storage.local
 *
 * 1. Fetch existing history for database
 * 2. Check for consecutive duplicate (last entry)
 * 3. Update array: prepend new or increment count
 * 4. Enforce 50 entry limit (FIFO)
 * 5. Persist to chrome.storage.local
 *
 * @param entry - Query history entry to save
 * @returns Promise<void>
 */
async function saveHistoryEntry(entry: QueryHistoryEntry): Promise<void> {
  // ... implementation
}
```

### TSDoc Requirements

- All exported functions must have TSDoc
- Include `@param` and `@returns` for all functions
- Include `@remarks` for non-obvious behavior

### Error Handling

- Wrap chrome.storage calls in try-catch
- Return error via hook state (not thrown)
- Display error inline in Query tab

## 8) Testing Strategy

### Manual Testing

1. Execute query → verify appears in history
2. Close/reopen DevTools → verify history persists
3. Execute same query twice → verify execution count increments
4. Execute 51 queries → verify only 50 stored
5. Click history item → verify SQL loads and executes
6. Clear history → verify all items removed

### Edge Cases

- Empty SQL (should not save)
- SQL with only whitespace (should not save)
- Very long SQL (> 1000 chars) → truncate in display
- Special characters in SQL (quotes, newlines) → escape properly
- Multiple databases → separate history per database

## 9) Definition of Done

- [ ] Hook `useQueryHistory.ts` created with TSDoc comments
- [ ] QueryTab component integrated with history sidebar
- [ ] History persists across DevTools sessions
- [ ] Maximum 50 entries per database enforced
- [ ] Consecutive duplicate detection working
- [ ] Clear history button functional
- [ ] Click-to-re-execute working
- [ ] Relative time formatting correct
- [ ] Build passes with no errors
- [ ] Manual testing checklist complete

## 10) Related Files

| File                                                  | Change Type | Description                                    |
| ----------------------------------------------------- | ----------- | ---------------------------------------------- |
| `src/devtools/hooks/useQueryHistory.ts`               | NEW         | Hook for query history management              |
| `src/devtools/components/QueryTab/QueryTab.tsx`       | MODIFY      | Add history sidebar and integration            |
| `src/devtools/components/QueryTab/HistorySidebar.tsx` | NEW         | History list component (extract from QueryTab) |
| `src/devtools/components/QueryTab/HistoryItem.tsx`    | NEW         | Individual history item component              |
| `src/devtools/components/QueryTab/index.tsx`          | MODIFY      | Export new components                          |
