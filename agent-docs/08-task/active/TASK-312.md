<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-312.md

NOTES
- Functional-first design (props-driven, auto-dismiss)
- All functions > 5 lines need numbered three-phase comments
- Exported/public functions need TSDoc comments
-->

# TASK-312: Toast Notifications (F-012)

## 0) Meta

- **Task ID**: TASK-312
- **Feature**: F-012 - OPFS Browser Enhancement
- **Status**: Draft
- **Created**: 2026-01-15
- **Estimated**: 1 hour
- **Priority**: P1 (High) - Core Feature Completion
- **Dependencies**: None

## 1) Purpose

Create a reusable Toast notification component with success and error variants, auto-dismiss logic, and retry functionality for errors. This provides immediate user feedback for delete operations and improves the overall user experience of the OPFS browser.

## 2) Upstream Documents

- **Spec**: `agent-docs/00-control/00-spec.md`
- **Feature**: `agent-docs/01-discovery/features/F-012-opfs-browser-enhancement.md`
- **HLD**: `agent-docs/03-architecture/01-hld.md`
- **LLD**: `agent-docs/05-design/03-modules/opfs-browser-enhancement.md` (if exists)
- \*\*Roadmap`: `agent-docs/07-taskManager/01-roadmap.md` (Phase 9, F-012)
- **Task Catalog**: `agent-docs/07-taskManager/02-task-catalog.md` (TASK-312)

## 3) Boundary

### Files

| Type   | Path                                            | Purpose                      |
| ------ | ----------------------------------------------- | ---------------------------- |
| CREATE | `src/devtools/components/OPFSBrowser/Toast.tsx` | Toast notification component |

### Out of Scope

- Toast queue management (single toast at a time)
- Toast positioning options (fixed top-right only)
- Custom toast durations (hardcoded per variant)
- Rich HTML content in toasts (text only)

## 4) Implementation Design

### Component: `Toast.tsx`

#### Props Interface

```typescript
type ToastVariant = "success" | "error";

interface ToastProps {
  /** Whether the toast is visible */
  isVisible: boolean;
  /** Toast variant (success or error) */
  variant: ToastVariant;
  /** Title message */
  title: string;
  /** Detail message */
  message: string;
  /** Function called when toast is dismissed */
  onDismiss: () => void;
  /** Function called when retry button clicked (error only) */
  onRetry?: () => void;
  /** Item name being deleted (for message) */
  itemName?: string;
}
```

#### Component Structure

```typescript
/**
 * Toast notification component for success/error feedback
 *
 * Displays auto-dismissing notifications with optional retry button for errors.
 * Fixed position at top-right with slide-in animation.
 *
 * @param props - ToastProps
 * @returns React component or null
 *
 * @example
 * <Toast
 *   isVisible={true}
 *   variant="success"
 *   title="Deleted successfully"
 *   message="database.sqlite has been deleted."
 *   onDismiss={() => setShowToast(false)}
 *   itemName="database.sqlite"
 * />
 */
export const Toast: React.FC<ToastProps> = ({
  isVisible,
  variant,
  title,
  message,
  onDismiss,
  onRetry,
  itemName,
}) => {
  // 1. Auto-dismiss on mount (timeout based on variant)
  // 2. Render toast container with animation
  // 3. Render success or error variant
  // 4. Handle retry button (error only)
};
```

#### Toast Container

```typescript
import React, { useEffect } from 'react';
import { FaCheck, FaExclamationCircle } from 'react-icons/fa';

export const Toast: React.FC<ToastProps> = ({
  isVisible,
  variant,
  title,
  message,
  onDismiss,
  onRetry,
  itemName,
}) => {
  // Auto-dismiss after duration
  useEffect(() => {
    if (!isVisible) return;

    const duration = variant === 'success' ? 3000 : 5000;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, variant, onDismiss]);

  if (!isVisible) return null;

  const isSuccess = variant === 'success';
  const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
  const borderColor = isSuccess ? 'border-green-200' : 'border-red-200';
  const textColor = isSuccess ? 'text-green-700' : 'text-red-700';
  const Icon = isSuccess ? FaCheck : FaExclamationCircle;

  return (
    <div
      className={`fixed top-4 right-4 z-[60] max-w-md w-full ${bgColor} ${borderColor} ${textColor} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p className="text-sm font-semibold">{title}</p>

        {/* Message */}
        <p className="text-sm mt-1">{message}</p>

        {/* Retry Button (error only) */}
        {!isSuccess && onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Retry
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        aria-label="Close notification"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};
```

#### Animation CSS

Add to global CSS or Tailwind config:

```css
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
```

Or use Tailwind arbitrary values:

```typescript
className = "animate-[slide-in_0.3s_ease-out]";
```

### Integration: Parent Component

```typescript
import { useState } from 'react';
import { Toast } from './Toast';
import { databaseService } from '../../services/databaseService';

export const OPFSGallery: React.FC = () => {
  const [toast, setToast] = useState<{
    isVisible: boolean;
    variant: 'success' | 'error';
    title: string;
    message: string;
    itemName?: string;
  }>({
    isVisible: false,
    variant: 'success',
    title: '',
    message: '',
  });

  const [pendingDelete, setPendingDelete] = useState<OpfsFileEntry | null>(null);

  const handleDelete = async (entry: OpfsFileEntry) => {
    setPendingDelete(entry);

    try {
      if (entry.type === 'file') {
        await databaseService.deleteOpfsFile(entry.path);
      } else {
        await databaseService.deleteOpfsDirectory(entry.path);
      }

      // Show success toast
      setToast({
        isVisible: true,
        variant: 'success',
        title: 'Deleted successfully',
        message: `${entry.name} has been deleted.`,
        itemName: entry.name,
      });

      // Refresh tree
      refreshTree();
    } catch (error) {
      // Show error toast
      setToast({
        isVisible: true,
        variant: 'error',
        title: 'Delete failed',
        message: error instanceof Error ? error.message : 'An error occurred',
        itemName: entry.name,
      });
    } finally {
      setPendingDelete(null);
    }
  };

  const handleRetry = () => {
    if (pendingDelete) {
      handleDelete(pendingDelete);
    }
  };

  return (
    <div>
      {/* OPFS Browser Content */}
      <FileTree onDelete={handleDelete} />

      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        variant={toast.variant}
        title={toast.title}
        message={toast.message}
        itemName={toast.itemName}
        onDismiss={() => setToast({ ...toast, isVisible: false })}
        onRetry={toast.variant === 'error' ? handleRetry : undefined}
      />
    </div>
  );
};
```

## 5) Functional Requirements

### FR-312-001: Toast Container

**Requirement**: Render fixed-position toast container at top-right

**Implementation**:

- Position: `fixed top-4 right-4`
- Z-index: `z-[60]` (above modal)
- Max width: `max-w-md`
- Shadow: `shadow-lg`
- Border: `border rounded-lg`

### FR-312-002: Success Toast Variant

**Requirement**: Display success toast with green styling

**Visual Design**:

- Background: `bg-green-50`
- Border: `border-green-200`
- Text: `text-green-700`
- Icon: FaCheck (green-600)
- Title: "Deleted successfully"
- Message: "{itemName} has been deleted."
- Duration: 3 seconds (auto-dismiss)

### FR-312-003: Error Toast Variant

**Requirement**: Display error toast with red styling and retry button

**Visual Design**:

- Background: `bg-red-50`
- Border: `border-red-200`
- Text: `text-red-700`
- Icon: FaExclamationCircle (red-600)
- Title: "Delete failed"
- Message: Error message from service layer
- Duration: 5 seconds (auto-dismiss)
- Retry button: "Retry" (underline, opens modal)

### FR-312-004: Auto-Dismiss Logic

**Requirement**: Automatically dismiss toast after duration

**Implementation**:

- Use setTimeout with variant-specific duration
- Success: 3 seconds
- Error: 5 seconds
- Cleanup timeout on unmount
- Pause on hover (optional, not implemented)

### FR-312-005: Close Button

**Requirement**: Provide close button to manually dismiss toast

**Implementation**:

- X icon in top-right
- Gray color (text-gray-400 hover:text-gray-600)
- Triggers onDismiss callback
- ARIA label: "Close notification"

### FR-312-006: Accessibility

**Requirement**: Toast must be accessible to all users

**Features**:

- `role="alert"` attribute
- `aria-live="polite"` attribute
- `aria-atomic="true"` attribute
- Close button has `aria-label`
- Keyboard accessible (Tab to close button)
- Screen reader announces content

## 6) Non-Functional Requirements

### NFR-312-001: Performance

- Minimal DOM nodes (simple structure)
- CSS animations (GPU-accelerated)
- No memory leaks (timeout cleanup)
- Fast render (< 50ms)

### NFR-312-002: User Experience

- Smooth slide-in animation (300ms)
- Clear visual hierarchy (icon > title > message)
- High contrast colors (green/red on white)
- Easy to dismiss (button + auto-dismiss)

### NFR-312-003: Code Quality

- TypeScript strict mode
- No internal state (except auto-dismiss timeout)
- Proper cleanup (useEffect return)
- TSDoc comments
- Consistent with project style

### NFR-312-004: Browser Compatibility

- Works in all modern browsers
- Uses standard React patterns
- CSS animations work everywhere
- Graceful fallback for no animation support

## 7) Testing Requirements

### Unit Tests

1. **Success Toast Rendering**
   - Render with variant="success"
   - Verify green styling
   - Verify FaCheck icon
   - Verify title and message

2. **Error Toast Rendering**
   - Render with variant="error"
   - Verify red styling
   - Verify FaExclamationCircle icon
   - Verify retry button visible

3. **Auto-Dismiss**
   - Render with isVisible=true
   - Wait 3 seconds (success)
   - Verify onDismiss called
   - Cleanup timeout on unmount

4. **Close Button**
   - Click close button
   - Verify onDismiss called

5. **Retry Button**
   - Render error toast with onRetry
   - Click retry button
   - Verify onRetry called

### Integration Tests

1. **Delete Success Flow**
   - Trigger delete operation
   - Verify success toast appears
   - Verify auto-dismiss after 3 seconds

2. **Delete Error Flow**
   - Trigger delete operation (error)
   - Verify error toast appears
   - Click retry button
   - Verify delete re-tried

## 8) Definition of Done

- [x] Toast component created with proper TypeScript types
- [x] Success toast variant implemented
- [x] Error toast variant implemented
- [x] Auto-dismiss logic implemented
- [x] Close button implemented
- [x] Retry button implemented (error only)
- [x] Slide-in animation implemented
- [x] Accessibility features implemented
- [x] TSDoc comments added
- [x] ESLint passed with no new warnings
- [x] Build passed with no errors (pre-existing Input.tsx error unrelated)
- [ ] Manual testing completed (deferred to TASK-313 integration phase)
- [ ] LLD updated with implementation status

## 9) Implementation Phases

### Phase 1: Component Structure (0.25 hour)

- Create Toast.tsx file
- Define Props interface
- Create component skeleton
- Add TSDoc comments
- Export component

### Phase 2: Success Toast (0.15 hour)

- Implement success styling (green)
- Add FaCheck icon
- Add title and message
- Test visual appearance

### Phase 3: Error Toast (0.15 hour)

- Implement error styling (red)
- Add FaExclamationCircle icon
- Add retry button
- Test visual appearance

### Phase 4: Auto-Dismiss (0.15 hour)

- Implement useEffect with setTimeout
- Add variant-specific durations
- Add cleanup logic
- Test auto-dismiss

### Phase 5: Close Button (0.1 hour)

- Add X icon
- Add onClick handler
- Add ARIA label
- Test close functionality

### Phase 6: Animation & Polish (0.1 hour)

- Add slide-in animation
- Test animation smoothness
- Fix any visual glitches
- Test accessibility

## 10) Risk Assessment

| Risk              | Probability | Impact | Mitigation                 |
| ----------------- | ----------- | ------ | -------------------------- |
| Memory leaks      | Low         | Medium | Cleanup timeout on unmount |
| Animation issues  | Low         | Low    | Use CSS animations         |
| Accessibility     | Low         | Medium | Follow ARIA best practices |
| Z-index conflicts | Low         | Low    | Use high z-index (60)      |

## 11) Open Questions

None - all resolved in upstream docs.

## 12) References

- Feature F-012 spec: `agent-docs/01-discovery/features/F-012-opfs-browser-enhancement.md`
- Toast pattern: Common notification UI patterns
- ARIA alerts: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
- React icons: https://react-icons.github.io/react-icons/

## 13) Functional-First Design

This spec uses **functional-first design**:

- **Props-driven** - No internal state (except timeout)
- **Side-effect management** - Proper cleanup in useEffect
- **Reusability** - Can be used anywhere in the app
- **Type safety** - TypeScript strict mode with proper types

**Rationale**: Toast is a pure UI component that displays data and auto-dismisses. Parent component owns the state and business logic.
