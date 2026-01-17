# TASK-337: Message Type Definition (F-019)

**Status**: In Progress
**Priority**: P1 (High)
**Boundary**: `src/shared/messages.ts`
**Estimated**: 0.2 hours
**Feature**: [F-019: Popup DevTools Status Indicator](../../01-discovery/features/F-019-popup-devtools-status.md)

---

## Context

This task adds the message type definition for popup-to-background communication. The popup needs to query the background worker for the current tab's database status to display the appropriate active/inactive icon.

## Current State

`src/shared/messages.ts` contains message types for:

- `ICON_STATE_MESSAGE` - Icon state updates from content script
- `DATABASE_LIST_MESSAGE` - Database list updates from content script
- `LOG_ENTRY_MESSAGE` - Log entries forwarded to DevTools panel

## Desired State

Add new message types for popup status query:

- `GET_TAB_DATABASE_STATUS` - Popup query for current tab's database status
- `GetTabDatabaseStatusMessage` - Request interface
- `TabDatabaseStatusResponse` - Response interface

## Implementation Plan

### 1. Add Message Constant

Add to `src/shared/messages.ts` after line 6:

```typescript
export const GET_TAB_DATABASE_STATUS = "get-tab-database-status";
```

**Rationale**: Follows existing pattern of message identifier constants. Using kebab-case for consistency with other message types.

### 2. Add Request Interface

Add to `src/shared/messages.ts` after the new constant:

````typescript
/**
 * Message sent from popup to background worker to query current tab's database status.
 *
 * @remarks
 * Used by popup component on mount to determine whether to show active or inactive icon.
 * Response includes {@link TabDatabaseStatusResponse}.
 *
 * @example
 * ```typescript
 * chrome.runtime.sendMessage(
 *   { type: GET_TAB_DATABASE_STATUS },
 *   (response: TabDatabaseStatusResponse) => {
 *     console.log(response.hasDatabase);
 *   }
 * );
 * ```
 */
export interface GetTabDatabaseStatusMessage {
  type: typeof GET_TAB_DATABASE_STATUS;
}
````

**Rationale**:

- Functional interface (no class construct)
- TSDoc with remarks and example for API documentation
- Uses `typeof` reference to constant for type safety
- Follows existing pattern from `DatabaseListMessage` and `LogEntryMessage`

### 3. Add Response Interface

Add to `src/shared/messages.ts` after `GetTabDatabaseStatusMessage`:

````typescript
/**
 * Response from background worker with current tab's database status.
 *
 * @remarks
 * Indicates whether the current tab has any opened databases.
 * The `databaseCount` field is optional and provided for future use.
 *
 * @example
 * ```typescript
 * // Active state (databases exist)
 * { hasDatabase: true, databaseCount: 3 }
 *
 * // Inactive state (no databases)
 * { hasDatabase: false }
 * ```
 */
export interface TabDatabaseStatusResponse {
  /** True if current tab has databases opened */
  hasDatabase: boolean;
  /** Number of databases (optional, for future use) */
  databaseCount?: number;
}
````

**Rationale**:

- Functional interface (no class construct)
- TSDoc with remarks and examples
- Optional `databaseCount` for extensibility
- Clear boolean flag for UI state determination

### 4. Export New Types

Ensure all new exports are added to the module (already done by `export` keyword).

## Functional-First Compliance

✓ **All constructs are functional** - No classes or OOP patterns used
✓ **Explicit interfaces** - TypeScript interfaces for type safety
✓ **No implicit side effects** - Constants and interfaces only
✓ **No rationale needed** - Standard functional TypeScript

## Code Quality Checklist

- [ ] Add `GET_TAB_DATABASE_STATUS` constant after line 6
- [ ] Add `GetTabDatabaseStatusMessage` interface with TSDoc
- [ ] Add `TabDatabaseStatusResponse` interface with TSDoc
- [ ] Export all new types (using `export` keyword)
- [ ] TypeScript strict mode compliance
- [ ] ESLint passed (no new warnings)

## Testing Strategy

Manual verification:

1. Check that constants are exported (import from `@shared/messages`)
2. Verify TypeScript types compile correctly
3. Run ESLint to ensure no new warnings

## Dependencies

None - This task has no dependencies and can be completed immediately.

## Blockers

None

## Rollback Strategy

If issues arise, revert changes to `src/shared/messages.ts` (3 lines added).

## References

- Feature Spec: [F-019: Popup DevTools Status Indicator](../../01-discovery/features/F-019-popup-devtools-status.md)
- Design Contract: [API Contracts - Popup Status Query](../../05-design/01-contracts/01-api.md)
- HLD: [Section 21 - Popup Architecture](../../03-architecture/01-hld.md)
