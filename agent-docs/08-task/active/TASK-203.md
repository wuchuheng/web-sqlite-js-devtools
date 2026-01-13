# TASK-203: Dark/Light Theme Toggle

## 0) Meta

- **Task ID**: TASK-203
- **Title**: Dark/Light Theme Toggle
- **Status**: In Progress ([-] locked)
- **Priority**: P2
- **Estimated**: 8 hours (2-3 days)
- **Started**: 2026-01-14
- **Dependencies**: None

## 1) Objective

Add a dark/light theme toggle to the DevTools extension. Users can switch between light and dark themes. Theme preference persists across DevTools sessions using chrome.storage.

## 2) Current State

No theme system exists. Extension currently uses a light theme (default Tailwind colors).

## 3) Implementation Plan

### Phase 1: Create Theme Context & Provider (3 hours)

**New File**: `src/devtools/contexts/ThemeContext.tsx`

**1.1 Define Theme Type** (5 min)

```tsx
export type Theme = "light" | "dark";
```

**1.2 Create ThemeContext** (30 min)

```tsx
interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
```

**1.3 Create useTheme Hook** (15 min)

```tsx
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
```

**1.4 Create ThemeProvider Component** (2 hours)

- State: `theme` (default: "light")
- Load from chrome.storage on mount
- Toggle function: switch between "light" and "dark"
- Save to chrome.storage on change
- Apply `dark` class to document.documentElement when dark

### Phase 2: Add Theme Toggle Button (2 hours)

**File**: `src/devtools/components/ThemeToggle/ThemeToggle.tsx`

**2.1 Create ThemeToggle Component** (1.5 hours)

```tsx
import { useTheme } from "@/devtools/contexts/ThemeContext";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-1.5 text-gray-600 hover:text-gray-700 rounded transition-colors"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? <MdDarkMode size={16} /> : <MdLightMode size={16} />}
    </button>
  );
};
```

**2.2 Add to DevTools Header** (30 min)

- Import ThemeToggle
- Add to header with other controls
- Position near keyboard shortcuts button

### Phase 3: Apply Dark Theme Styles (3 hours)

**3.1 Add Tailwind Dark Mode Config** (30 min)

- Update `tailwind.config.js` to use `class` strategy
- Add dark class to document in ThemeProvider

**3.2 Update Component Styles** (2.5 hours)

**Files to update:**

1. **Sidebar** (`src/devtools/components/Sidebar/`)
   - `bg-white` → `dark:bg-gray-900`
   - `border-gray-200` → `dark:border-gray-700`
   - `text-gray-600` → `dark:text-gray-300`
   - `hover:bg-gray-100` → `dark:hover:bg-gray-800`

2. **TablesTab** (`src/devtools/components/TablesTab/`)
   - `bg-white` → `dark:bg-gray-900`
   - `border-gray-200` → `dark:border-gray-700`
   - `text-gray-500` → `dark:text-gray-400`
   - `text-gray-700` → `dark:text-gray-200`
   - `bg-blue-50` → `dark:bg-blue-900`
   - `bg-blue-600` → `dark:bg-blue-500`

3. **TableDetail** (`src/devtools/components/TablesTab/TableDetail.tsx`)
   - `bg-white` → `dark:bg-gray-900`
   - `border-gray-200` → `dark:border-gray-700`
   - `text-gray-500` → `dark:text-gray-400`
   - Header: adjust colors

4. **SchemaPanel** (`src/devtools/components/TablesTab/SchemaPanel.tsx`)
   - `bg-white` → `dark:bg-gray-900`
   - `border-gray-200` → `dark:border-gray-700`
   - `text-gray-500` → `dark:text-gray-400`
   - `text-gray-700` → `dark:text-gray-200`

5. **QueryTab** - Update styles if time permits
6. **LogTab** - Update styles if time permits

### Phase 4: Testing (1 hour)

**4.1 Manual Testing** (45 min)

- Toggle button switches themes
- Theme persists across DevTools close/reopen
- Dark mode colors look correct
- All components updated
- No visual glitches during toggle

**4.2 Build Verification** (15 min)

- Run `npm run build`
- Fix any errors

## 4) Code Quality Rules

**Functional-First**:

- Use functional components with hooks
- Use `useCallback` for event handlers
- Use `useEffect` for chrome.storage operations

**Three-Phase Comments**:

- Functions > 5 lines must have numbered three-phase comments

**TSDoc for Exported Functions**:

```tsx
/**
 * Theme provider for dark/light theme
 *
 * @remarks
 * - Manages theme state (light/dark)
 * - Persists to chrome.storage
 * - Applies dark class to document
 *
 * @param props - Component props with children
 * @returns Theme provider JSX element
 */
```

## 5) Functional Requirements Coverage

| FR               | Description       | Implementation                                          |
| ---------------- | ----------------- | ------------------------------------------------------- |
| **FR-THEME-001** | Toggle button     | ThemeToggle component with MdDarkMode/MdLightMode icons |
| **FR-THEME-002** | State management  | ThemeContext with theme state and toggle function       |
| **FR-THEME-003** | Persistence       | chrome.storage.local for theme preference               |
| **FR-THEME-004** | Dark mode styles  | Tailwind dark: prefix on all components                 |
| **FR-THEME-005** | Light mode styles | Default Tailwind classes (no prefix)                    |

## 6) Files Changed

### New Files

- `src/devtools/contexts/ThemeContext.tsx` (NEW)
- `src/devtools/components/ThemeToggle/ThemeToggle.tsx` (NEW)

### Modified Files

- `src/devtools/DevTools.tsx` (add ThemeProvider, ThemeToggle)
- `tailwind.config.js` (enable class-based dark mode)
- `src/devtools/components/Sidebar/Sidebar.tsx` (add dark mode classes)
- `src/devtools/components/TablesTab/TablesTab.tsx` (add dark mode classes)
- `src/devtools/components/TablesTab/TableDetail.tsx` (add dark mode classes)
- `src/devtools/components/TablesTab/OpenedTableTabs.tsx` (add dark mode classes)
- `src/devtools/components/TablesTab/SchemaPanel.tsx` (add dark mode classes)

### Files Deleted (N/A)

- None

## 7) Build Verification

**After implementation, run:**

```bash
npm run build
```

**Expected:** No errors, successful build

## 8) Acceptance Criteria

- [ ] **Theme Context & Provider** (3 hours)
  - [ ] Create ThemeContext.tsx
  - [ ] Define Theme type ("light" | "dark")
  - [ ] Create ThemeContextValue interface
  - [ ] Create useTheme hook
  - [ ] Create ThemeProvider component
  - [ ] Load theme from chrome.storage on mount
  - [ ] Save theme to chrome.storage on change
  - [ ] Apply dark class to document.documentElement

- [ ] **Theme Toggle Button** (2 hours)
  - [ ] Create ThemeToggle.tsx component
  - [ ] Use MdDarkMode/MdLightMode icons
  - [ ] Add to DevTools header
  - [ ] Toggle button works correctly

- [ ] **Dark Mode Styles** (3 hours)
  - [ ] Update tailwind.config.js for class-based dark mode
  - [ ] Update Sidebar styles
  - [ ] Update TablesTab styles
  - [ ] Update TableDetail styles
  - [ ] Update OpenedTableTabs styles
  - [ ] Update SchemaPanel styles

- [ ] **Testing** (1 hour)
  - [ ] Toggle button switches themes
  - [ ] Theme persists across DevTools sessions
  - [ ] Dark mode colors look correct
  - [ ] No visual glitches during toggle

- [ ] Build passed with no errors

## 9) Exceptions

**Chrome Extension Context**:

- Use chrome.storage.local (not localStorage)
- Theme state is per-extension, not per-page

**Performance**:

- Theme toggles should be instant (no lag)
- Use CSS transitions for smooth color changes

## 10) Notes

- **Default theme**: Light
- **Storage key**: "theme" in chrome.storage.local
- **Dark mode strategy**: Tailwind class-based (not media query)
- **Icon library**: react-icons/md (MdDarkMode, MdLightMode)
- **Position**: Add theme toggle near keyboard shortcuts button
