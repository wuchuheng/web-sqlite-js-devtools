<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/01-discovery/features/feature.md

OUTPUT MAP (write to)
agent-docs/01-discovery/features/F-004-ddl-syntax-highlight-copy.md

NOTES
- Feature F-004: DDL Syntax Highlight & Copy Button
- Enhances DDL view with SQL syntax highlighting and copy functionality
-->

# Feature F-004: DDL Syntax Highlight & Copy Button

## 0) Meta

- **Feature ID**: F-004
- **Title**: DDL Syntax Highlight & Copy Button
- **Status**: Pending Approval
- **Priority**: P2 (Medium) - UX enhancement for DDL viewing
- **Created**: 2026-01-14
- **Requester**: User feedback on DDL display usability
- **Dependencies**: F-003 (Schema Panel Enhancement)

## 1) Problem Statement

### Current Issue

The current DDL view in the SchemaPanel has limitations:

1. **Plain text display**: DDL SQL is shown as simple green text on dark background, no syntax highlighting
2. **No copy functionality**: Users must manually select and copy SQL text
3. **Poor readability**: Keywords, identifiers, strings are not visually distinguished

### User Requirements

When viewing DDL in the SchemaPanel DDL tab, the user wants:

1. **SQL syntax highlighting**: Keywords, strings, identifiers should be color-coded for readability
2. **Copy button**: Icon button (`MdOutlineContentCopy`) in the right top corner of DDL section
3. **Success feedback**: After successful copy, icon changes to green checkmark (`FaCheck`) and persists until next click
4. **Light theme**: Use light background with colored syntax (not dark theme)
5. **Error handling**: If copy fails, show inline error message near the button position

## 2) Proposed Solution

### Architecture Changes

**Current DDL View:**

```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ 🔄 Table │ DDL             │ │
│ ├─────────────────────────────┤ │
│ │ CREATE TABLE users (        │ │  <- Plain green text
│ │   id INTEGER PRIMARY KEY,   │ │
│ │   name TEXT                 │ │
│ │ );                          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Target DDL View:**

```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ 🔄 Table │ DDL         [📋] │ │  <- Copy button
│ ├─────────────────────────────┤ │
│ │ CREATE TABLE users (        │ │  <- Syntax highlighted
│ │   id INTEGER PRIMARY KEY,   │ │     (keywords: blue)
│ │   name TEXT                 │ │     (strings: green)
│ │ );                          │ │     (identifiers: black)
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

After copy:

```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ 🔄 Table │ DDL         [✓] │ │  <- Green checkmark
│ ├─────────────────────────────┤ │
│ │ CREATE TABLE users (        │ │
│ │   id INTEGER PRIMARY KEY,   │ │
│ │   name TEXT                 │ │
│ │ );                          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Technology Stack

1. **Syntax Highlighting**: `react-syntax-highlighter` with Prism.js
   - Package: `react-syntax-highlighter`
   - Light theme: `prism` (default light theme)
   - Language: SQL
   - Lightweight: ~18.8KB minified
   - Excellent SQL keyword support

2. **Icons**: React Icons
   - Copy: `react-icons/md` → `MdOutlineContentCopy`
   - Success: `react-icons/fa` → `FaCheck`

3. **Clipboard API**: `navigator.clipboard.writeText()`

### Component Changes

#### Modified: `SchemaDDLView.tsx`

```typescript
interface SchemaDDLViewProps {
  ddl: string;
}

export const SchemaDDLView = ({ ddl }: SchemaDDLViewProps) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ddl);
      setCopied(true);
      setError(null);
    } catch (err) {
      setError("Failed to copy");
      setCopied(false);
    }
  };

  // Reset copied state on next click
  const handleClick = () => {
    if (copied) {
      setCopied(false);
    } else {
      handleCopy();
    }
  };

  return (
    <div className="px-4 py-3">
      {/* Header with copy button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1" />
        <button
          onClick={handleClick}
          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
          title={copied ? "Copied!" : "Copy DDL"}
        >
          {copied ? (
            <FaCheck className="text-green-600" size={14} />
          ) : (
            <MdOutlineContentCopy size={14} />
          )}
        </button>
      </div>

      {/* Inline error message */}
      {error && (
        <div className="text-red-600 text-xs mb-2 text-right">{error}</div>
      )}

      {/* Syntax highlighted DDL */}
      <SyntaxHighlighter
        language="sql"
        style={prism}
        customStyle={{
          background: '#f9fafb',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '12px',
        }}
      >
        {ddl || "-- No DDL available --"}
      </SyntaxHighlighter>
    </div>
  );
};
```

## 3) Functional Requirements

### FR-001: SQL Syntax Highlighting

- **Given**: User opens DDL tab in SchemaPanel
- **When**: DDL SQL is displayed
- **Then**:
  - SQL keywords (CREATE, TABLE, INTEGER, PRIMARY KEY, etc.) are highlighted in blue/purple
  - String literals are highlighted in green/orange
  - Identifiers are displayed in default color
  - Light theme background is used (not dark)
  - Code is properly formatted with preserved whitespace

### FR-002: Copy Button Placement

- **Given**: User is viewing DDL tab
- **When**: User looks at the DDL section header
- **Then**:
  - Copy icon button (`MdOutlineContentCopy`) is visible in the right top corner
  - Button is aligned with the tab buttons (Table / DDL)
  - Button has hover effect (darker gray)
  - Tooltip shows "Copy DDL" on hover

### FR-003: Copy Functionality

- **Given**: User clicks the copy button
- **When**: Click action is triggered
- **Then**:
  - SQL DDL text is copied to clipboard
  - Icon changes to green checkmark (`FaCheck`)
  - Tooltip changes to "Copied!"
  - Checkmark persists until next click
  - No inline error is shown

### FR-004: Reset on Next Click

- **Given**: User has successfully copied DDL (checkmark visible)
- **When**: User clicks the button again
- **Then**:
  - Checkmark reverts to copy icon
  - DDL is copied again (or clipboard API is called)
  - State resets to "not copied"

### FR-005: Error Handling

- **Given**: User clicks copy button but clipboard API is unavailable
- **When**: Copy operation fails
- **Then**:
  - Red inline error message appears below button: "Failed to copy"
  - Icon remains as copy icon (does not change to checkmark)
  - Error message is right-aligned near button position
  - Error clears on next successful copy or user can try again

## 4) Non-Functional Requirements

### NFR-001: Performance

- Syntax highlighting should not block rendering
- Component should mount within 100ms
- Copy operation should complete within 200ms

### NFR-002: Bundle Size

- `react-syntax-highlighter` package: ~18.8KB minified
- Total bundle increase should be < 50KB after tree-shaking

### NFR-003: Accessibility

- Copy button should have proper ARIA labels
- Keyboard should be able to activate copy button (Tab + Enter)
- Color contrast should meet WCAG AA standards

### NFR-004: Browser Compatibility

- Clipboard API: Chrome 66+, Edge 79+, Firefox 63+
- Graceful degradation: Show inline error if not supported
- Syntax highlighting: Works in all modern browsers

## 5) Acceptance Criteria

### AC-001: Syntax Highlighting

- [ ] DDL is displayed with SQL syntax highlighting (light theme)
- [ ] Keywords are color-coded (CREATE, TABLE, SELECT, etc.)
- [ ] Code is readable with proper contrast
- [ ] Whitespace and formatting are preserved
- [ ] Empty DDL shows "-- No DDL available --" message

### AC-002: Copy Button

- [ ] Copy icon button is visible in right top corner of DDL section
- [ ] Button is properly aligned with tab buttons
- [ ] Hover effect is applied
- [ ] Tooltip shows "Copy DDL" before click

### AC-003: Copy Success

- [ ] Clicking copy button copies DDL text to clipboard
- [ ] Icon changes to green checkmark after successful copy
- [ ] Tooltip changes to "Copied!" after successful copy
- [ ] Pasting from clipboard shows correct DDL text

### AC-004: Checkmark Persistence

- [ ] Checkmark remains visible until button is clicked again
- [ ] Clicking again resets icon to copy icon
- [ ] Second click copies DDL again

### AC-005: Error Handling

- [ ] If clipboard API fails, inline error appears: "Failed to copy"
- [ ] Error is red text, right-aligned below button
- [ ] Icon does not change to checkmark on error
- [ ] User can retry by clicking again

### AC-006: Dependencies

- [ ] `react-syntax-highlighter` package is installed
- [ ] `react-icons/md` and `react-icons/fa` are available
- [ ] TypeScript types are properly imported

## 6) Dependencies

### External Dependencies

- `react-syntax-highlighter`: ^15.5.0
- `react-icons`: ^5.0.0 (already installed)

### Internal Dependencies

- F-003: Schema Panel Enhancement (must be completed first)
- Component: `SchemaDDLView.tsx` (will be modified)
- Component: `SchemaPanel.tsx` (no changes needed)

### Blocking Issues

- None identified

## 7) Risks

### R1: Clipboard API Permissions

- **Risk**: Some browsers may block clipboard access without user gesture
- **Mitigation**: Copy is triggered by explicit click event (user gesture)
- **Fallback**: Show inline error if clipboard API is unavailable

### R2: Bundle Size Increase

- **Risk**: Adding syntax highlighter increases bundle size
- **Mitigation**: Use lightweight Prism.js variant (~18.8KB)
- **Acceptable**: Total increase < 50KB, well under 2MB limit

### R3: Theme Consistency

- **Risk**: Light theme DDL may not match other dark theme components
- **Mitigation**: User explicitly requested light theme
- **Future**: Could add theme toggle if requested

## 8) Open Questions

- [Q1] Should we add a "Copy with formatting" option that includes line numbers?
  - **Answer**: No, user only requested plain SQL text copy

- [Q2] Should syntax highlighting support other SQL dialects (PostgreSQL, MySQL)?
  - **Answer**: SQLite syntax is sufficient for current use case

- [Q3] Should we add keyboard shortcut for copy (Ctrl+C when DDL tab is focused)?
  - **Answer**: Not in current scope, could be added later if requested

## 9) Implementation Notes

### Package Installation

```bash
npm install react-syntax-highlighter @types/react-syntax-highlighter
```

### Import Statement

```typescript
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MdOutlineContentCopy } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
```

### CSS Styling Notes

- Light theme background: `#f9fafb` (gray-50)
- Copy button hover: `hover:text-gray-800`
- Success color: `text-green-600`
- Error color: `text-red-600`
- Font size: `text-xs` (12px) matching existing components

## 10) Testing Strategy

### Unit Tests

- [ ] Test copy functionality with mock clipboard API
- [ ] Test error handling when clipboard API throws
- [ ] Test state transition (copied → not copied)

### Integration Tests

- [ ] Test DDL renders with syntax highlighting
- [ ] Test copy button copies correct text
- [ ] Test error message displays on failure

### Manual Testing

- [ ] Verify syntax highlighting colors are readable
- [ ] Verify paste from clipboard works correctly
- [ ] Verify checkmark persists until next click
- [ ] Verify error displays in unsupported browsers

---

**Feature Status**: Ready for Stage 3 (Architecture) review
**Next Steps**: Update HLD with DDL copy state management, then proceed to LLD
