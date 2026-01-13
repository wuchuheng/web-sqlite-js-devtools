<!--
TASK: TASK-202
TITLE: Keyboard Shortcuts
STATUS: In Progress [-]
-->

# Micro-Spec: TASK-202 - Keyboard Shortcuts

## 1) Overview

**Feature**: Global keyboard shortcuts for common DevTools panel actions.

**Maps to**: FR-107

**Boundary**:

- New hook: `src/devtools/hooks/useKeyboardShortcuts.ts`
- Modified: `src/devtools/DevTools.tsx` (root component)

## 2) Functional Requirements

| ID        | Requirement             | Acceptance Criteria                                                      |
| --------- | ----------------------- | ------------------------------------------------------------------------ |
| FR-107.1  | Global keyboard handler | Single event listener at DevTools root level                             |
| FR-107.2  | Query tab shortcuts     | Ctrl+Enter execute, Ctrl+L clear editor                                  |
| FR-107.3  | Navigation shortcuts    | Ctrl+1 Tables, Ctrl+2 Query, Ctrl+3 Migration, Ctrl+4 Seed, Ctrl+5 About |
| FR-107.4  | Sidebar toggle          | Ctrl+B toggle sidebar collapse                                           |
| FR-107.5  | History navigation      | Ctrl+H toggle history sidebar (Query tab only)                           |
| FR-107.6  | Refresh action          | Ctrl+R or F5 refresh current data                                        |
| FR-107.7  | Help modal              | Ctrl+/ or ? show keyboard shortcuts reference                            |
| FR-107.8  | Escape key              | Close modals, clear focus, cancel actions                                |
| FR-107.9  | Context awareness       | Shortcuts only active when relevant tab/route is active                  |
| FR-107.10 | Conflict prevention     | Don't trigger shortcuts when user is typing in input/textarea            |

## 3) Data Types

```typescript
/**
 * Keyboard shortcut definition
 */
interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;
  /** Display label (e.g., "Ctrl+Enter") */
  label: string;
  /** Key combination (e.g., "ctrl+enter") */
  combo: string;
  /** Description of what the shortcut does */
  description: string;
  /** Handler function to execute */
  handler: () => void;
  /** Route regex where shortcut is active (null = global) */
  activeRoute?: RegExp | null;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
}

/**
 * Shortcut category for help modal
 */
interface ShortcutCategory {
  /** Category name */
  name: string;
  /** Shortcuts in this category */
  shortcuts: KeyboardShortcut[];
}
```

## 4) Implementation Plan

### 4.1 New Hook: `useKeyboardShortcuts`

**File**: `src/devtools/hooks/useKeyboardShortcuts.ts`

**Interface**:

```typescript
interface UseKeyboardShortcutsResult {
  /** Whether help modal is open */
  isHelpOpen: boolean;
  /** Open help modal */
  openHelp: () => void;
  /** Close help modal */
  closeHelp: () => void;
  /** Register additional shortcut */
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  /** Unregister shortcut */
  unregisterShortcut: (id: string) => void;
}
```

**Functional implementation** (no classes, pure functions):

```typescript
/**
 * Parse key combo string into KeyboardEvent properties
 *
 * @param combo - Key combo string (e.g., "ctrl+enter", "shift+ctrl+1")
 * @returns Parsed key info
 */
function parseKeyCombo(combo: string): {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
} {
  // Split by +, normalize to lowercase
  // Parse modifiers and key
  // Return key info object
}

/**
 * Check if KeyboardEvent matches key combo
 *
 * @param event - Keyboard event
 * @param combo - Key combo string
 * @returns True if event matches combo
 */
function eventMatchesCombo(event: KeyboardEvent, combo: string): boolean {
  // Parse combo
  // Check event.ctrlKey, event.shiftKey, event.altKey, event.key
  // Return true if all match
}

/**
 * Check if element is editable (input, textarea, contenteditable)
 *
 * @param element - DOM element
 * @returns True if element is editable
 */
function isEditableElement(element: HTMLElement | null): boolean {
  // Check tagName, isContentEditable
  // Return true for input, textarea, [contenteditable=true]
}

/**
 * Check if shortcut is active for current route
 *
 * @param shortcut - Keyboard shortcut
 * @param currentPath - Current router path
 * @returns True if shortcut is active
 */
function isShortcutActive(
  shortcut: KeyboardShortcut,
  currentPath: string,
): boolean {
  // If activeRoute is null, always active
  // Otherwise, test path against regex
}
```

### 4.2 Shortcut Definitions

**Global Shortcuts** (active on all routes):

```typescript
const GLOBAL_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: "toggle-sidebar",
    label: "Ctrl+B",
    combo: "ctrl+b",
    description: "Toggle sidebar collapse",
    handler: () => {
      /* toggle sidebar state */
    },
    preventDefault: true,
  },
  {
    id: "show-help",
    label: "Ctrl+/",
    combo: "ctrl+/",
    description: "Show keyboard shortcuts",
    handler: () => {
      /* open help modal */
    },
    preventDefault: true,
  },
  {
    id: "escape",
    label: "Escape",
    combo: "escape",
    description: "Close modals / clear focus",
    handler: () => {
      /* close modal, blur active element */
    },
    preventDefault: false,
  },
];
```

**Query Tab Shortcuts** (active only on `/openedDB/:dbname/query`):

```typescript
const QUERY_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: "execute-query",
    label: "Ctrl+Enter",
    combo: "ctrl+enter",
    description: "Execute SQL query",
    handler: () => {
      /* trigger execute */
    },
    activeRoute: /^\/openedDB\/.+\/query/,
    preventDefault: true,
  },
  {
    id: "clear-editor",
    label: "Ctrl+L",
    combo: "ctrl+l",
    description: "Clear SQL editor",
    handler: () => {
      /* clear textarea */
    },
    activeRoute: /^\/openedDB\/.+\/query/,
    preventDefault: true,
  },
  {
    id: "toggle-history",
    label: "Ctrl+H",
    combo: "ctrl+h",
    description: "Toggle query history",
    handler: () => {
      /* toggle history sidebar */
    },
    activeRoute: /^\/openedDB\/.+\/query/,
    preventDefault: true,
  },
];
```

**Navigation Shortcuts** (active on database routes):

```typescript
const NAV_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: "nav-tables",
    label: "Ctrl+1",
    combo: "ctrl+1",
    description: "Go to Tables tab",
    handler: () => {
      /* navigate to /tables */
    },
    activeRoute: /^\/openedDB\/.+/,
    preventDefault: true,
  },
  {
    id: "nav-query",
    label: "Ctrl+2",
    combo: "ctrl+2",
    description: "Go to Query tab",
    handler: () => {
      /* navigate to /query */
    },
    activeRoute: /^\/openedDB\/.+/,
    preventDefault: true,
  },
  {
    id: "nav-migration",
    label: "Ctrl+3",
    combo: "ctrl+3",
    description: "Go to Migration tab",
    handler: () => {
      /* navigate to /migration */
    },
    activeRoute: /^\/openedDB\/.+/,
    preventDefault: true,
  },
  {
    id: "nav-seed",
    label: "Ctrl+4",
    combo: "ctrl+4",
    description: "Go to Seed tab",
    handler: () => {
      /* navigate to /seed */
    },
    activeRoute: /^\/openedDB\/.+/,
    preventDefault: true,
  },
  {
    id: "nav-about",
    label: "Ctrl+5",
    combo: "ctrl+5",
    description: "Go to About tab",
    handler: () => {
      /* navigate to /about */
    },
    activeRoute: /^\/openedDB\/.+/,
    preventDefault: true,
  },
];
```

### 4.3 Component Integration

**File**: `src/devtools/DevTools.tsx`

**Changes**:

1. Import `useKeyboardShortcuts` hook
2. Add help modal component
3. Register callbacks for sidebar toggle, navigation, etc.
4. Pass handler props to child components as needed

**Help Modal Component**:

```typescript
/**
 * Keyboard shortcuts help modal
 *
 * @remarks
 * - Displays all shortcuts grouped by category
 * - Shows key combos and descriptions
 * - Modal overlay with close button
 * - Closes on Escape or clicking outside
 */
export const KeyboardShortcutsHelp = () => {
  // Render modal with shortcut categories
  // Group: Global, Navigation, Query Tab
  // Format: Key combo | Description
};
```

### 4.4 Integration with Query Tab

**File**: `src/devtools/components/QueryTab/QueryTab.tsx`

**Changes**:

1. Remove existing Ctrl+Enter handler (will use global)
2. Accept `onExecute` prop from parent
3. Accept `onClear` prop from parent
4. Accept `onToggleHistory` prop from parent

This allows the global keyboard handler to trigger these actions.

## 5) State Management

### Shortcut State

```typescript
/**
 * Keyboard shortcuts state (managed in hook)
 */
interface KeyboardShortcutsState {
  /** Registered shortcuts map */
  shortcuts: Map<string, KeyboardShortcut>;
  /** Help modal open state */
  helpOpen: boolean;
  /** Sidebar collapse state (callback) */
  onToggleSidebar?: () => void;
  /** Navigation callback */
  onNavigate?: (path: string) => void;
}
```

## 6) UI/UX Specifications

### Help Modal Layout

```
┌────────────────────────────────────────┐
│ Keyboard Shortcuts           [✕]      │
├────────────────────────────────────────┤
│ Global Shortcuts                        │
│ Ctrl+B  Toggle sidebar                  │
│ Ctrl+/  Show this help                  │
│ Esc     Close modals                    │
├────────────────────────────────────────┤
│ Navigation                              │
│ Ctrl+1  Tables tab                      │
│ Ctrl+2  Query tab                       │
│ Ctrl+3  Migration tab                   │
│ Ctrl+4  Seed tab                        │
│ Ctrl+5  About tab                       │
├────────────────────────────────────────┤
│ Query Tab                               │
│ Ctrl+Enter  Execute query               │
│ Ctrl+L      Clear editor                │
│ Ctrl+H      Toggle history              │
└────────────────────────────────────────┘
```

**Styling** (Tailwind CSS):

- Modal overlay: `fixed inset-0 bg-black/50 flex items-center justify-center z-50`
- Modal content: `bg-white rounded-lg shadow-xl max-w-md w-full mx-4`
- Header: `px-4 py-3 border-b flex justify-between items-center`
- Shortcut row: `flex justify-between px-4 py-2 hover:bg-gray-50`
- Key combo: `font-mono text-sm bg-gray-100 px-2 py-1 rounded`

### Toast Notification (Optional)

When a shortcut triggers an action, show a brief toast:

```
┌─────────────────────────┐
│ Query executed ✓        │ ← 2 second toast
└─────────────────────────┘
```

## 7) Code Quality Rules

### Functional-First Design

- All shortcut handlers are pure functions
- Hook manages state only
- No classes used
- Event handlers are immutable

### Function Size Limits

- Parser functions: Max 10 lines
- Matcher functions: Max 10 lines
- Hook: Max 100 lines total

### Three-Phase Comments (for functions > 5 lines)

```typescript
/**
 * Handle keyboard event at document level
 *
 * 1. Check if event target is editable input/textarea
 * 2. Parse event key combo
 * 3. Find matching registered shortcut
 * 4. Check if shortcut is active for current route
 * 5. Execute handler if match found
 * 6. Prevent default if specified
 *
 * @param event - Keyboard event
 * @returns void
 */
function handleKeyDown(event: KeyboardEvent): void {
  // ... implementation
}
```

### TSDoc Requirements

- All exported functions must have TSDoc
- Include `@param` and `@returns` for all functions
- Include `@remarks` for non-obvious behavior

### Error Handling

- Wrap handler calls in try-catch
- Log errors to console (don't show to user)
- Never crash keyboard handler

## 8) Testing Strategy

### Manual Testing

1. Test each shortcut on its target route
2. Test shortcuts don't trigger when typing in inputs
3. Test help modal opens/closes correctly
4. Test Escape closes modals
5. Test navigation shortcuts change routes
6. Test query tab shortcuts trigger actions

### Edge Cases

- User holds down modifier keys
- Multiple keys pressed simultaneously
- Focus in iframe (should still work)
- Help modal open + another modal (Escape should close top)
- Shortcut conflicts with browser defaults (Ctrl+R, Ctrl+F)

## 9) Definition of Done

- [ ] Hook `useKeyboardShortcuts.ts` created with TSDoc comments
- [ ] Help modal component created
- [ ] Global shortcuts registered (Ctrl+B, Ctrl+/, Escape)
- [ ] Navigation shortcuts registered (Ctrl+1-5)
- [ ] Query tab shortcuts registered (Ctrl+Enter, Ctrl+L, Ctrl+H)
- [ ] Shortcuts respect route context
- [ ] Shortcuts don't trigger in editable inputs
- [ ] Help modal displays all shortcuts grouped by category
- [ ] QueryTab updated to use global shortcuts
- [ ] Build passes with no errors
- [ ] Manual testing checklist complete

## 10) Related Files

| File                                                | Change Type | Description                         |
| --------------------------------------------------- | ----------- | ----------------------------------- |
| `src/devtools/hooks/useKeyboardShortcuts.ts`        | NEW         | Global keyboard handler hook        |
| `src/devtools/components/KeyboardShortcutsHelp.tsx` | NEW         | Help modal component                |
| `src/devtools/DevTools.tsx`                         | MODIFY      | Add keyboard handler, help modal    |
| `src/devtools/components/QueryTab/QueryTab.tsx`     | MODIFY      | Remove local handlers, accept props |
