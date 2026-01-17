# TASK-339: Background Message Handler (F-019)

**Status**: In Progress
**Priority**: P1 (High)
**Boundary**: `src/background/index.ts`
**Estimated**: 0.2 hours
**Feature**: [F-019: Popup DevTools Status Indicator](../../01-discovery/features/F-019-popup-devtools-status.md)
**Dependencies**: TASK-337 (Message types), TASK-338 (getCurrentTabDatabaseStatus function)

---

## Context

This task updates the background message handler to respond to `GET_TAB_DATABASE_STATUS` messages from the popup. The popup sends this message on mount to determine whether to show the active or inactive icon.

## Current State

`src/background/index.ts` contains `chrome.runtime.onMessage` listener with handlers for:

- `ICON_STATE_MESSAGE` - Backward compatibility (deprecated)
- `DATABASE_LIST_MESSAGE` - Per-tab database tracking + DevTools forwarding
- `LOG_ENTRY_MESSAGE` - Forward to DevTools panel
- `"request"` - Wake up offscreen document

## Desired State

Add handler for `GET_TAB_DATABASE_STATUS` message that:

1. Calls `getCurrentTabDatabaseStatus()` function
2. Sends response via `sendResponse()`
3. Returns `true` for async response
4. Preserves all existing message handlers

## Implementation Plan

### 1. Import Required Types and Function

Add imports to `src/background/index.ts` (around line 11):

```typescript
import {
  initializeIconState,
  setIconState,
  updateIconForTab,
  handleDatabaseListMessage,
  cleanupTab,
  getCurrentTabDatabaseStatus, // ADD THIS
} from "./iconState";
import {
  ICON_STATE_MESSAGE,
  DATABASE_LIST_MESSAGE,
  LOG_ENTRY_MESSAGE,
  GET_TAB_DATABASE_STATUS, // ADD THIS
} from "@/shared/messages";
```

### 2. Add Message Handler

Update `chrome.runtime.onMessage.addListener()` callback signature to accept `sendResponse` parameter (around line 166):

```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
```

### 3. Add GET_TAB_DATABASE_STATUS Handler

Add handler inside the listener (after line 203, before the `"request"` handler):

```typescript
// F-019: Popup status query
if (message?.type === GET_TAB_DATABASE_STATUS) {
  console.log("[Background DEBUG] Handling GET_TAB_DATABASE_STATUS");
  getCurrentTabDatabaseStatus().then((status) => {
    sendResponse(status);
  });
  return true; // Async response
}
```

**Rationale**:

- Functional approach (no class constructs)
- Returns `true` for async response (required by Chrome extension API)
- Preserves all existing message handlers
- Consistent with existing handler patterns
- Uses async/await pattern for Promise-based function

## Functional-First Compliance

✓ **Functional handlers** - Pure function callbacks, no this/context
✓ **Async/await pattern** - Promise-based for Chrome APIs
✓ **No side effects** - Only calls getCurrentTabDatabaseStatus and sends response
✓ **Explicit return** - Returns `true` for async response

## Code Quality Checklist

- [ ] Import `getCurrentTabDatabaseStatus` from iconState
- [ ] Import `GET_TAB_DATABASE_STATUS` from messages
- [ ] Update listener signature to include `sendResponse` parameter
- [ ] Add GET_TAB_DATABASE_STATUS handler after LOG_ENTRY_MESSAGE handler
- [ ] Call `getCurrentTabDatabaseStatus()` and send response
- [ ] Return `true` for async response
- [ ] Preserve all existing message handlers
- [ ] TypeScript strict mode compliance
- [ ] ESLint passed (no new warnings)

## Testing Strategy

Manual verification:

1. Test popup in next task (TASK-340)
2. Verify response structure matches TabDatabaseStatusResponse
3. Verify existing handlers still work (ICON_STATE, DATABASE_LIST, LOG_ENTRY)

## Dependencies

- TASK-337: Message types must be complete (GET_TAB_DATABASE_STATUS constant)
- TASK-338: getCurrentTabDatabaseStatus function must exist

## Blockers

None (TASK-337 complete, TASK-338 complete)

## Rollback Strategy

If issues arise, revert changes to:

- Remove `getCurrentTabDatabaseStatus` import
- Remove `GET_TAB_DATABASE_STATUS` import
- Remove listener signature change
- Remove GET_TAB_DATABASE_STATUS handler block

## References

- Feature Spec: [F-019: Popup DevTools Status Indicator](../../01-discovery/features/F-019-popup-devtools-status.md)
- Design Contract: [API Contracts - Popup Status Query](../../05-design/01-contracts/01-api.md)
- HLD: [Section 21 - Popup Architecture](../../03-architecture/01-hld.md)
- Module LLD: [Background Service](../../05-design/03-modules/background-service.md)
