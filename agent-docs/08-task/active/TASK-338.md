# TASK-338: Background Status Query Function (F-019)

**Status**: In Progress
**Priority**: P1 (High)
**Boundary**: `src/background/iconState/index.ts`
**Estimated**: 0.3 hours
**Feature**: [F-019: Popup DevTools Status Indicator](../../01-discovery/features/F-019-popup-devtools-status.md)
**Dependencies**: TASK-337 (Message types), F-017 (databaseMap infrastructure)

---

## Context

This task adds a function to query the current tab's database status. The popup component needs to query the background worker on mount to determine whether to show the active or inactive icon.

## Current State

`src/background/iconState/index.ts` contains:

- `databaseMap` - Map<tabId, FrameDatabases[]> tracking databases per tab
- `updateIconForTab(tabId)` - Updates icon based on database state
- `tabHasDatabases(tabId)` - Internal helper to check if tab has databases

## Desired State

Add exported `getCurrentTabDatabaseStatus()` function that:

1. Queries the current active tab ID
2. Looks up the tab in `databaseMap`
3. Returns `{ hasDatabase: boolean, databaseCount?: number }`

## Implementation Plan

### Add `getCurrentTabDatabaseStatus()` Function

Add to `src/background/iconState/index.ts` after `cleanupTab()` function (around line 190):

````typescript
/**
 * Get database status for current tab
 *
 * @remarks
 * Used by popup component to determine whether to show active or inactive icon.
 * Queries the current active tab and checks if it has any databases in the databaseMap.
 *
 * @example
 * ```typescript
 * const status = await getCurrentTabDatabaseStatus();
 * if (status.hasDatabase) {
 *   console.log(`Found ${status.databaseCount} databases`);
 * }
 * ```
 *
 * @returns Promise resolving to status object
 */
export const getCurrentTabDatabaseStatus = async (): Promise<{
  hasDatabase: boolean;
  databaseCount?: number;
}> => {
  // 1. Query current active tab ID
  // 2. Look up tab in databaseMap
  // 3. Return status with database count
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];

      // Handle case when activeTab is undefined
      if (!activeTab?.id) {
        resolve({ hasDatabase: false });
        return;
      }

      const frames = databaseMap.get(activeTab.id) || [];
      const databaseCount = frames.reduce(
        (sum, frame) => sum + frame.databases.length,
        0,
      );

      resolve({
        hasDatabase: databaseCount > 0,
        databaseCount,
      });
    });
  });
};
````

**Rationale**:

- Functional approach (no class constructs)
- Three-phase comments for the main logic block
- TSDoc with @example for API documentation
- Reuses existing `databaseMap` from F-017
- Handles edge case (activeTab undefined)
- Returns Promise for async chrome.tabs.query API
- Provides databaseCount for future extensibility

## Functional-First Compliance

✓ **Functional function** - Pure arrow function, no this/context
✓ **Promise-based** - Async/await pattern for Chrome APIs
✓ **No side effects** - Read-only query to databaseMap
✓ **Explicit error handling** - Handles undefined activeTab

## Code Quality Checklist

- [ ] Add `getCurrentTabDatabaseStatus()` function after line 190
- [ ] Use three-phase comments for main logic block
- [ ] Add TSDoc with @example
- [ ] Handle case when activeTab is undefined
- [ ] Return Promise with correct type signature
- [ ] Reuse existing databaseMap (don't create new state)
- [ ] TypeScript strict mode compliance
- [ ] ESLint passed (no new warnings)

## Testing Strategy

Manual verification:

1. Import function in background/index.ts
2. Test with popup (next task)
3. Verify response structure matches TabDatabaseStatusResponse

## Dependencies

- TASK-337: Message types must be complete
- F-017: databaseMap infrastructure must exist

## Blockers

None (TASK-337 complete, F-017 infrastructure exists)

## Rollback Strategy

If issues arise, remove the `getCurrentTabDatabaseStatus()` function from `src/background/iconState/index.ts` (35 lines).

## References

- Feature Spec: [F-019: Popup DevTools Status Indicator](../../01-discovery/features/F-019-popup-devtools-status.md)
- Design Contract: [API Contracts - Popup Status Query](../../05-design/01-contracts/01-api.md)
- HLD: [Section 21 - Popup Architecture](../../03-architecture/01-hld.md)
- Module LLD: [Background Service](../../05-design/03-modules/background-service.md)
