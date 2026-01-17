# TASK-340: Popup Component Rewrite (F-019)

**Status**: In Progress
**Priority**: P1 (High)
**Boundary**: `src/popup/Popup.tsx`
**Estimated**: 0.6 hours
**Feature**: [F-019: Popup DevTools Status Indicator](../../01-discovery/features/F-019-popup-devtools-status.md)
**Dependencies**: TASK-337 (Message types), TASK-338 (getCurrentTabDatabaseStatus), TASK-339 (Message handler)

---

## Context

This task rewrites the popup component to show the DevTools status indicator. The current implementation is a template counter application. The new implementation will display the app logo (active/inactive) with hover status text.

## Current State

`src/popup/Popup.tsx` contains:

- Template counter application with add/minus buttons
- chrome.storage.sync for persistence
- Unrelated to extension functionality

## Desired State

Replace with DevTools status indicator:

- Logo (64×64px) that changes based on database state
- Status text on hover: "DevTools Active" or "No databases detected"
- Loading spinner on mount
- ARIA labels for accessibility

## Implementation Plan

### Complete Rewrite of `src/popup/Popup.tsx`

````typescript
import { useState, useEffect } from "react";
import "./Popup.css";

const ACTIVE_ICON = "img/logo-48.png";
const INACTIVE_ICON = "img/logo-48-inactive.png";

/**
 * Popup component displaying DevTools status indicator
 *
 * @remarks
 * Shows the app logo (active or inactive) based on current tab's database state.
 * Hovering over the logo reveals a status text tooltip.
 *
 * @example
 * ```tsx
 * <Popup />
 * // Renders logo + status text on hover
 * ```
 */
export const Popup = () => {
  // 1. Track database state for current tab
  // 2. Track hover state for status text visibility
  const [hasDatabase, setHasDatabase] = useState<boolean | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  // 1. Query background for current tab's database status on mount
  // 2. Update hasDatabase state with response
  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "GET_TAB_DATABASE_STATUS" },
      (response) => {
        if (response) {
          setHasDatabase(response.hasDatabase);
        }
      }
    );
  }, []);

  const handleMouseEnter = () => setShowStatus(true);
  const handleMouseLeave = () => setShowStatus(false);

  // 1. Show loading spinner while querying
  // 2. Show active/inactive icon based on state
  // 3. Show status text on hover
  if (hasDatabase === null) {
    return (
      <main className="popup-container">
        <div className="loading-spinner" />
      </main>
    );
  }

  const iconSrc = hasDatabase ? ACTIVE_ICON : INACTIVE_ICON;
  const statusText = hasDatabase ? "DevTools Active" : "No databases detected";

  return (
    <main
      className="popup-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={iconSrc}
        alt="Web SQLite DevTools"
        className="popup-logo"
        title={statusText}
      />
      {showStatus && (
        <div className="popup-status" role="status" aria-live="polite">
          {statusText}
        </div>
      )}
    </main>
  );
};

export default Popup;
````

**Rationale**:

- Functional component (no class constructs)
- Three-phase comments for useEffect
- TSDoc with @example for component documentation
- Clean state management with useState hooks
- Proper event handlers for hover states
- ARIA attributes for accessibility (role="status", aria-live="polite")
- Native title attribute as fallback tooltip

## Functional-First Compliance

✓ **Functional component** - Pure function component, no this/context
✓ **React hooks** - useState, useEffect for state management
✓ **No side effects** - Only queries background on mount and updates state
✓ **Explicit event handlers** - handleMouseEnter/handleMouseLeave functions

## Code Quality Checklist

- [ ] Complete rewrite of `src/popup/Popup.tsx` (remove template counter)
- [ ] Add `hasDatabase` state: `useState<boolean | null>(null)`
- [ ] Add `showStatus` state: `useState<boolean>(false)`
- [ ] Implement `useEffect` to query background on mount
- [ ] Implement `handleMouseEnter()`: `setShowStatus(true)`
- [ ] Implement `handleMouseLeave()`: `setShowStatus(false)`
- [ ] Render logo based on state (ACTIVE_ICON or INACTIVE_ICON)
- [ ] Render status text on hover
- [ ] Add loading spinner state
- [ ] Add ARIA labels (role="status", aria-live="polite")
- [ ] Add title attribute to icon
- [ ] Add TSDoc with @example
- [ ] Three-phase comments for useEffect
- [ ] TypeScript strict mode compliance
- [ ] ESLint passed (no new warnings)

## Testing Strategy

Manual verification:

1. Open popup on page with databases → shows active icon
2. Open popup on page without databases → shows inactive icon
3. Hover over logo → status text appears
4. Mouse leaves logo → status text disappears
5. Loading state shows briefly on mount

## Dependencies

- TASK-337: Message types (GET_TAB_DATABASE_STATUS)
- TASK-338: getCurrentTabDatabaseStatus function
- TASK-339: Background message handler

## Blockers

None (TASK-337, TASK-338, TASK-339 complete)

## Rollback Strategy

If issues arise, revert `src/popup/Popup.tsx` to previous implementation (46 lines).

## References

- Feature Spec: [F-019: Popup DevTools Status Indicator](../../01-discovery/features/F-019-popup-devtools-status.md)
- Design Contract: [API Contracts - Popup Status Query](../../05-design/01-contracts/01-api.md)
- HLD: [Section 21 - Popup Architecture](../../03-architecture/01-hld.md)
