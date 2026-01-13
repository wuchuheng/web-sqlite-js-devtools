<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/features/feature.md

OUTPUT MAP (write to)
agent-docs/01-discovery/features/F-007-uniform-theme-configuration.md

NOTES
- Feature F-007: Uniform Theme Configuration
- Centralizes color palette in index.css using Tailwind v4 @theme
- Replaces hardcoded blue/gray/red with semantic theme tokens
- Based on Vue Office green theme (emerald)
-->

# Feature F-007: Uniform Theme Configuration

## 0) Meta

- **Feature ID**: F-007
- **Title**: Uniform Theme Configuration with Semantic Color Tokens
- **Status**: Pending Approval
- **Priority**: P2 (Medium) - Code quality & consistency
- **Created**: 2026-01-14
- **Requester**: User request for theme consistency
- **Dependencies**: None

## 1) Problem Statement

### Current Issue

The codebase has inconsistent theme configuration:

1. **Theme defined but not used**: `src/devtools/index.css` defines `--color-primary: #059669` (emerald-600) but NO components use it
2. **Hardcoded colors everywhere**: Components use direct Tailwind classes (`bg-blue-600`, `text-gray-700`, `border-red-200`) instead of theme tokens
3. **Inconsistent color palette**: Blue is used for primary (from default Tailwind), but the theme config defines green/emerald as primary
4. **No semantic color system**: Missing unified approach for colors like "primary", "secondary", "success", "error", "warning"
5. **Hard to maintain**: Changing the brand color requires finding/replacing hundreds of hardcoded color classes

### User Requirements

**From user request:**

- Use the green theme from the theme config (referenced from Vue Office website)
- Complete missing theme colors in `index.css` if needed
- Reference via Tailwind CSS classnames (not hardcoded colors)
- Full color system: primary, secondary, text, border, background, success, error, warning

## 2) Proposed Solution

### Architecture: Tailwind v4 @theme + CSS Variables

**Tailwind v4 native CSS variables:**

```css
@theme {
  --color-primary-50: #ecfdf5;
  --color-primary-100: #d1fae5;
  --color-primary-200: #a7f3d0;
  --color-primary-300: #6ee7b7;
  --color-primary-400: #34d399;
  --color-primary-500: #10b981;
  --color-primary-600: #059669;
  --color-primary-700: #047857;
  --color-primary-800: #065f46;
  --color-primary-900: #064e3b;
  --color-primary-950: #022c22;
}
```

**Components reference via class:**

```tsx
// Before (hardcoded blue)
<button className="bg-blue-600 text-white hover:bg-blue-700">Run Query</button>

// After (theme-based)
<button className="bg-primary-600 text-white hover:bg-primary-700">Run Query</button>
```

### Color Palette Design

**Based on Vue Office green theme (Emerald):**

| Token        | Usage                            | Value (Example)  |
| ------------ | -------------------------------- | ---------------- |
| `primary`    | Brand color, actions, links      | Emerald scale    |
| `secondary`  | Secondary actions, less emphasis | Slate/Gray scale |
| `success`    | Success states, confirmations    | Green/Emerald    |
| `error`      | Error states, destructive        | Red scale        |
| `warning`    | Warning states, caution          | Amber/Yellow     |
| `text`       | Text hierarchy                   | Gray scale       |
| `border`     | Borders, dividers                | Gray scale       |
| `background` | Backgrounds, surfaces            | White/Gray       |

## 3) Functional Requirements

### FR-THEME-001: Define Complete Color System in @theme

**Requirements:**

- Define primary color scale (50-950) using emerald palette
- Define secondary color scale (50-950) using slate/gray palette
- Define text color scale (50-900) for text hierarchy
- Define border color scale (100-500) for borders
- Define background color scale (50-900) for surfaces
- Define success color scale (green)
- Define error color scale (red)
- Define warning color scale (amber)

### FR-THEME-002: Tailwind Class References

**Requirements:**

- Components use `bg-primary-*`, `text-primary-*`, `border-primary-*` instead of `bg-blue-*`
- Components use `bg-secondary-*`, `text-secondary-*` instead of `bg-gray-*`
- Components use `bg-error-*`, `text-error-*` instead of `bg-red-*`
- All color references use theme tokens

### FR-THEME-003: Update All Components

**Files to update:**

- `src/devtools/components/DatabaseTabs/DatabaseTabHeader.tsx`
- `src/devtools/components/TablesTab/*.tsx`
- `src/devtools/components/QueryTab/*.tsx`
- `src/devtools/components/MigrationTab/MigrationTab.tsx`
- `src/devtools/components/SeedTab/SeedTab.tsx`
- `src/devtools/components/LogTab/*.tsx`
- `src/devtools/components/OPFSBrowser/*.tsx`
- `src/devtools/components/Sidebar/*.tsx`
- `src/devtools/DevTools.tsx`
- Any other components using hardcoded colors

### FR-THEME-004: Consistent Active States

**Requirements:**

- Active tabs: `bg-primary-50 text-primary-600 border-primary-600`
- Active links: `text-primary-600 hover:text-primary-700`
- Buttons: `bg-primary-600 hover:bg-primary-700`
- Loading spinners: `border-primary-600 border-t-transparent`

## 4) Non-Functional Requirements

### NFR-THEME-001: Tailwind v4 Compatibility

- Use Tailwind v4 `@theme` syntax (not `tailwind.config.js`)
- Use CSS custom properties (native to Tailwind v4)
- No JavaScript config for colors

### NFR-THEME-002: No Breaking Changes

- Preserve existing visual design
- Only change color values, not layout or behavior
- Components look identical after migration

### NFR-THEME-003: Code Quality

- No hardcoded color values (hex, rgb) in components
- All colors use Tailwind utility classes
- Consistent color naming across codebase

## 5) Out of Scope

- Dark/Light theme toggle (separate feature - TASK-203)
- Dynamic color switching (user preference)
- Color customization via UI
- Animation/transition changes

## 6) Success Criteria

### Acceptance Criteria

1. **Theme Configuration** (`src/devtools/index.css`)
   - [ ] Complete primary color scale (emerald 50-950)
   - [ ] Complete secondary color scale (slate 50-950)
   - [ ] Complete text color scale (gray 50-900)
   - [ ] Complete border color scale (gray 100-500)
   - [ ] Complete background color scale (gray 50-900)
   - [ ] Success color scale (green)
   - [ ] Error color scale (red)
   - [ ] Warning color scale (amber)

2. **Component Updates**
   - [ ] All `bg-blue-*` → `bg-primary-*`
   - [ ] All `text-blue-*` → `text-primary-*`
   - [ ] All `border-blue-*` → `border-primary-*`
   - [ ] All error states use `bg-error-*`, `text-error-*`
   - [ ] All warning states use `bg-warning-*`, `text-warning-*`

3. **Visual Verification**
   - [ ] Active tabs show green/emerald highlight
   - [ ] Buttons show green/emerald background
   - [ ] Links show green/emerald color
   - [ ] No visual regressions

4. **Build Verification**
   - [ ] `npm run build` passes
   - [ ] No Tailwind build errors
   - [ ] No TypeScript errors

## 7) Implementation Notes

### Theme Configuration Template

**File**: `src/devtools/index.css`

```css
@import "tailwindcss";

@theme {
  /* Primary - Emerald (Vue Office green theme) */
  --color-primary-50: #ecfdf5;
  --color-primary-100: #d1fae5;
  --color-primary-200: #a7f3d0;
  --color-primary-300: #6ee7b7;
  --color-primary-400: #34d399;
  --color-primary-500: #10b981;
  --color-primary-600: #059669;
  --color-primary-700: #047857;
  --color-primary-800: #065f46;
  --color-primary-900: #064e3b;
  --color-primary-950: #022c22;

  /* Secondary - Slate */
  --color-secondary-50: #f8fafc;
  --color-secondary-100: #f1f5f9;
  --color-secondary-200: #e2e8f0;
  --color-secondary-300: #cbd5e1;
  --color-secondary-400: #94a3b8;
  --color-secondary-500: #64748b;
  --color-secondary-600: #475569;
  --color-secondary-700: #334155;
  --color-secondary-800: #1e293b;
  --color-secondary-900: #0f172a;
  --color-secondary-950: #020617;

  /* Success - Green */
  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;

  /* Error - Red */
  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;

  /* Warning - Amber */
  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;

  /* Text - Gray (for content text) */
  --color-text-50: #f9fafb;
  --color-text-100: #f3f4f6;
  --color-text-200: #e5e7eb;
  --color-text-300: #d1d5db;
  --color-text-400: #9ca3af;
  --color-text-500: #6b7280;
  --color-text-600: #4b5563;
  --color-text-700: #374151;
  --color-text-800: #1f2937;
  --color-text-900: #111827;

  /* Border - Gray */
  --color-border-100: #f3f4f6;
  --color-border-200: #e5e7eb;
  --color-border-300: #d1d5db;
  --color-border-400: #9ca3af;
  --color-border-500: #6b7280;

  /* Background - Gray */
  --color-background-50: #f9fafb;
  --color-background-100: #f3f4f6;
  --color-background-200: #e5e7eb;
  --color-background-300: #d1d5db;
  --color-background-400: #9ca3af;
  --color-background-500: #6b7280;
}
```

### Component Update Examples

**Before:**

```tsx
<button className="bg-blue-600 text-white hover:bg-blue-700">Run Query</button>
```

**After:**

```tsx
<button className="bg-primary-600 text-white hover:bg-primary-700">
  Run Query
</button>
```

**Before (error):**

```tsx
<div className="bg-red-50 text-red-600 border border-red-200">{error}</div>
```

**After:**

```tsx
<div className="bg-error-50 text-error-600 border border-error-200">
  {error}
</div>
```

## 8) Dependencies

### Depends On

- None (standalone feature)

### Related Features

- TASK-203: Dark/Light Theme Toggle (future, will use this foundation)

## 9) Implementation Estimate

- **Theme configuration**: 1 hour
- **Component updates**: 3-4 hours (15+ files)
- **Testing & verification**: 1 hour
- **Total**: 5-6 hours (1 day)

---

**Feature Status**: Ready for Stage 3 (Architecture) review
**Next Steps**: Proceed to S3 (systemArchitect) for HLD updates, then S5 (contractDesigner) for LLD
