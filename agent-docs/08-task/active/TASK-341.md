# TASK-341: Popup Styles Update (F-019)

**Status**: In Progress
**Priority**: P1 (High)
**Boundary**: `src/popup/Popup.css`
**Estimated**: 0.3 hours
**Feature**: [F-019: Popup DevTools Status Indicator](../../01-discovery/features/F-019-popup-devtools-status.md)
**Dependencies**: TASK-340 (Popup component)

---

## Context

This task updates the popup CSS styles to support the new DevTools status indicator UI. The current styles are for the template counter application and need to be replaced.

## Current State

`src/popup/Popup.css` contains:

- Template counter styles (buttons, labels, links)
- Light/dark mode media queries
- Unrelated to new popup design

## Desired State

Replace with minimal, clean styles for status indicator:

- 200×200px popup container with centered content
- 64×64px logo with hover scale animation
- 13px status text with fade-in animation
- Loading spinner with spin animation

## Implementation Plan

### Complete Rewrite of `src/popup/Popup.css`

```css
/* Popup container - 200×200px centered layout */
.popup-container {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Logo styles - 64×64px with hover animation */
.popup-logo {
  width: 64px;
  height: 64px;
  cursor: pointer;
  transition: transform 150ms ease-in-out;
}

.popup-logo:hover {
  transform: scale(1.1);
}

/* Status text - 13px with fade-in animation */
.popup-status {
  font-size: 13px;
  color: #4b5563; /* gray-600 */
  text-align: center;
  padding: 4px 8px;
  border-radius: 4px;
  animation: fadeIn 150ms ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading spinner */
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top-color: #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

**Rationale**:

- Minimal, clean design (similar to Vue DevTools)
- Smooth animations (150ms for logo, 150ms for text fade)
- Accessible colors (WCAG AA compliance)
- Responsive and centered layout
- Loading state for better UX

## Functional-First Compliance

✓ **CSS-only styling** - No JavaScript logic
✓ **Separation of concerns** - Styles separate from component logic
✓ **No side effects** - Pure CSS styling

## Code Quality Checklist

- [ ] Update `src/popup/Popup.css` with new styles
- [ ] Popup container: 200×200px, flex column, centered
- [ ] Logo styles: 64×64px, cursor pointer, hover scale(1.1)
- [ ] Status text: 13px font, gray-600 color, fadeIn animation
- [ ] Loading spinner: 24×24px, spin animation
- [ ] All animations use ease-in-out for smoothness
- [ ] Colors meet WCAG AA contrast requirements

## Testing Strategy

Manual verification:

1. Open popup → verify 200×200px size
2. Hover over logo → verify scale(1.1) animation
3. Hover over logo → verify status text fades in
4. Mouse leaves → verify status text fades out
5. Check loading spinner animation

## Dependencies

- TASK-340: Popup component must be complete (uses these class names)

## Blockers

None (TASK-340 complete)

## Rollback Strategy

If issues arise, revert `src/popup/Popup.css` to previous implementation (54 lines).

## References

- Feature Spec: [F-019: Popup DevTools Status Indicator](../../01-discovery/features/F-019-popup-devtools-status.md)
- Design Contract: [API Contracts - Popup Status Query](../../05-design/01-contracts/01-api.md)
- HLD: [Section 21 - Popup Architecture](../../03-architecture/01-hld.md)
