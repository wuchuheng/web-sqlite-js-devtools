# TASK-02: Sidebar UI & Navigation

## 1. Task Metadata

- **Task ID**: TASK-02
- **Title**: Sidebar UI & Navigation
- **Priority**: P0 (Blocker)
- **Dependencies**: TASK-01 (completed)
- **Status**: In Progress
- **Last Updated**: 2026-01-13

## 2. Requirements Mapping

| FR ID  | Requirement                                             | Implementation                       |
| ------ | ------------------------------------------------------- | ------------------------------------ |
| FR-006 | Sidebar menu (20% width, collapsible) with app branding | Sidebar component with width state   |
| FR-007 | Sidebar menu item: "Opened DB" with FaDatabase icon     | DatabaseList navigation item         |
| FR-008 | Database list as nested items under "Opened DB"         | DatabaseList with nested items       |
| FR-010 | Sidebar menu item: "OPFS" with FaFile icon              | OPFSLink navigation item             |
| FR-012 | Sidebar collapse toggle (FaAngleRight/FaAngleLeft)      | CollapseToggle in SidebarHeader      |
| FR-014 | Empty state notice for route `/`                        | EmptyState component                 |
| FR-042 | Empty state when no database detected                   | EmptyState with helpful instructions |
| FR-044 | Sidebar always expanded on DevTools open                | Default state: expanded              |

## 3. Functional Design

### 3.1 Architecture Note

**Design Philosophy**: This task uses **functional components** with React hooks for state management. No classes, no Redux/mobx. Local state via `useState`, layout via flexbox, styling via Tailwind CSS utility classes.

### 3.2 Component Structure

```
src/devtools/
├── components/
│   ├── Sidebar/
│   │   ├── Sidebar.tsx           # Main sidebar container
│   │   ├── SidebarHeader.tsx     # App branding + collapse toggle
│   │   ├── DatabaseList.tsx      # "Opened DB" navigation item (stub for TASK-05)
│   │   └── OPFSLink.tsx          # "OPFS" navigation link
│   └── EmptyState/
│       └── EmptyState.tsx        # Empty state notice
```

### 3.3 Component Specifications

#### Sidebar.tsx

**Purpose**: Main sidebar container with collapse state management.

**Props**: None

**State**: `isCollapsed` (boolean, default: `false`)

**Behavior**:

- Width: `w-1/5` when expanded, `w-auto` when collapsed
- Height: `h-full`
- Background: `bg-gray-50` (light), `bg-gray-900` (dark - future)
- Border: right border `border-r border-gray-200`
- Flex column layout for header, nav items, and collapse toggle
- Persists collapse state to `chrome.storage.local` (for future task consistency)

**Layout**:

```
┌─────────────────┐
│ SidebarHeader   │
├─────────────────┤
│ DatabaseList    │
│ OPFSLink        │
├─────────────────┤
│ CollapseToggle  │
└─────────────────┘
```

**Stub Implementation Note**: DatabaseList is a stub component in this task (actual database fetching happens in TASK-05).

#### SidebarHeader.tsx

**Purpose**: Displays app branding (SiSqlite icon + "Web Sqlite" text) and collapse toggle button.

**Props**:

- `isCollapsed: boolean`
- `onToggle: () => void`

**Behavior**:

- Flex row with space-between
- SiSqlite icon from `react-icons/si`
- "Web Sqlite" text hidden when collapsed
- Collapse button with FaAngleRight (expanded) or FaAngleLeft (collapsed)
- Padding: `p-4`
- Hover effect on collapse button

#### DatabaseList.tsx (Stub)

**Purpose**: Navigation item for "Opened DB" section.

**Props**: None

**Behavior**:

- Displays FaDatabase icon (react-icons/fa)
- Text: "Opened DB"
- Click navigates to `/` (temporary, will be `/openedDB` in TASK-05)
- Active state styling: `bg-blue-50 text-blue-600` when on route `/`
- Hover: `hover:bg-gray-100`
- Padding: `px-4 py-2`
- Cursor pointer

**Stub Note**: This component does not fetch actual databases yet. It's a placeholder for navigation structure.

#### OPFSLink.tsx

**Purpose**: Navigation link to OPFS file browser.

**Props**: None

**Behavior**:

- Displays FaFile icon (react-icons/fa)
- Text: "OPFS"
- Click navigates to `/opfs`
- Active state styling: `bg-blue-50 text-blue-600` when on route `/opfs`
- Hover: `hover:bg-gray-100`
- Padding: `px-4 py-2`
- Cursor pointer
- Uses React Router's `Link` component for hash routing

#### EmptyState.tsx

**Purpose**: Helpful instructions when no route is selected.

**Props**: None

**Behavior**:

- Centered content with flex column
- SiSqlite icon (large, `text-6xl`)
- Title: "Web Sqlite DevTools"
- Description: "Select a database or browse OPFS files to get started"
- Instructions list:
  - "Open a page that uses web-sqlite-js"
  - "Click on a database in the sidebar to view tables"
  - "Browse OPFS files using the OPFS link"
- Text color: `text-gray-600` for description, `text-gray-400` for instructions
- Padding: `p-8`

## 4. Dependencies

### 4.1 New Dependencies

```json
{
  "react-icons": "^5.0.1"
}
```

Install: `npm install react-icons`

### 4.2 Existing Dependencies Used

- `react` (useState)
- `react-router-dom` (Link, useLocation)
- `tailwindcss` (utility classes)

## 5. Implementation Steps

### Step 1: Install react-icons

```bash
npm install react-icons
```

### Step 2: Create Sidebar components

1. Create `src/devtools/components/Sidebar/Sidebar.tsx`
2. Create `src/devtools/components/Sidebar/SidebarHeader.tsx`
3. Create `src/devtools/components/Sidebar/DatabaseList.tsx` (stub)
4. Create `src/devtools/components/Sidebar/OPFSLink.tsx`

### Step 3: Create EmptyState component

1. Create `src/devtools/components/EmptyState/EmptyState.tsx`

### Step 4: Update DevTools.tsx

1. Import Sidebar and EmptyState components
2. Update layout to flex container with sidebar and main content
3. Replace root route content with EmptyState
4. Keep database and OPFS routes as placeholders

### Step 5: Create barrel exports (optional)

1. Create `src/devtools/components/Sidebar/index.ts`
2. Create `src/devtools/components/EmptyState/index.ts`

## 6. Code Quality Requirements (S8)

### 6.1 Functional Design Rules

- All components are functional components (no classes)
- State management via `useState` hook only
- Props are readonly (no prop mutation)
- Use React Router hooks for navigation (`useLocation` for active state)

### 6.2 Comment Requirements

**Functions > 5 lines**: Use numbered three-phase comment format:

```typescript
/**
 * 1. Check if current route matches the link's path
 * 2. Return appropriate CSS classes for active state
 * 3. Provide default styling for non-active state
 */
const getActiveClass = (isActive: boolean): string =>
  isActive ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100";
```

**Exported components**: Add TSDoc comment:

```typescript
/**
 * Sidebar navigation component for Web Sqlite DevTools
 *
 * @remarks
 * Provides collapsible sidebar with navigation items for databases and OPFS browser.
 * Collapse state persists to chrome.storage.local for consistency across DevTools sessions.
 *
 * @returns JSX.Element - Sidebar component
 */
export const Sidebar: React.FC = () => { ... }
```

### 6.3 Function Limits

- Max function body: 50 lines (extract if exceeded)
- Max component file: 200 lines (split if exceeded)
- Max nesting: 4 levels (extract component if exceeded)

### 6.4 Extraction Thresholds

- Extract logic component at 30+ lines
- Extract custom hook at 20+ lines of hook logic
- Extract utility function at 15+ lines

## 7. Testing Plan

### 7.1 Manual Testing Checklist

- [ ] Sidebar displays on DevTools panel open
- [ ] Sidebar shows "Web Sqlite" with SiSqlite icon
- [ ] Collapse toggle switches between FaAngleRight/FaAngleLeft
- [ ] Sidebar width changes from 20% to icon-only when collapsed
- [ ] "Opened DB" menu item displays with FaDatabase icon
- [ ] "OPFS" menu item displays with FaFile icon
- [ ] Clicking "OPFS" navigates to /opfs route
- [ ] Active state styling applies to current route
- [ ] EmptyState displays on root route (/)
- [ ] EmptyState shows helpful instructions
- [ ] Hover effects work on navigation items

### 7.2 Edge Cases

- [ ] Sidebar collapsed state on small panels (minimum width)
- [ ] EmptyState text wrapping on narrow panels
- [ ] Icon visibility on collapsed sidebar

## 8. Definition of Done

- [ ] react-icons installed and available
- [ ] All Sidebar components created (Sidebar, SidebarHeader, DatabaseList, OPFSLink)
- [ ] EmptyState component created
- [ ] DevTools.tsx updated with new layout
- [ ] All navigation items display correct icons
- [ ] Collapse toggle functionality working
- [ ] Active state styling applied to current route
- [ ] EmptyState displays on root route
- [ ] No TypeScript errors
- [ ] No console errors on DevTools panel open
- [ ] Tailwind CSS classes applied correctly
- [ ] Manual testing checklist passed

## 9. Output Artifacts

### New Files

- `src/devtools/components/Sidebar/Sidebar.tsx`
- `src/devtools/components/Sidebar/SidebarHeader.tsx`
- `src/devtools/components/Sidebar/DatabaseList.tsx`
- `src/devtools/components/Sidebar/OPFSLink.tsx`
- `src/devtools/components/Sidebar/index.ts` (optional barrel)
- `src/devtools/components/EmptyState/EmptyState.tsx`
- `src/devtools/components/EmptyState/index.ts` (optional barrel)

### Modified Files

- `src/devtools/DevTools.tsx`
- `package.json` (react-icons dependency)
- `package-lock.json`

### Documentation Updates (Post-Implementation)

- `agent-docs/00-control/00-spec.md` (status update)
- `agent-docs/00-control/01-status.md` (move TASK-02 to Done)
- `agent-docs/07-taskManager/02-task-catalog.md` (mark TASK-02 complete)
