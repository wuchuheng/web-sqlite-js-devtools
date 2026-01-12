<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/04-adr/0000-template.md

OUTPUT MAP (write to)
agent-docs/04-adr/0003-codemirror-sql-editor.md

NOTES
- Keep headings unchanged.
- Use this for ANY significant decision (DB choice, Framework, Auth, etc.).
-->

# ADR-0003: CodeMirror 6 for SQL Editor

## Status

Accepted (pending Spike S-003 validation)

## Context

- **Issue**: Need a code editor for SQL query execution and migration/seed script editing in Query, Migration, and Seed tabs.
- **Constraints**:
  - Must support SQL syntax highlighting
  - Must auto-match Chrome DevTools theme (light/dark)
  - Must support keyboard shortcuts (Ctrl+Enter for execute)
  - Extension bundle size target is <2MB
  - Existing template uses Vite + React (tree-shaking available)
- **Why decide now**: SQL editor is core functionality used in 3 of 6 tabs (Query, Migration, Seed).

## Decision

We will use **CodeMirror 6** with `@codemirror/lang-sql` for the SQL editor.

Features:

- SQL syntax highlighting
- Auto-indentation
- Bracket matching
- Ctrl+Enter keyboard shortcut for execution
- Theme detection (match Chrome DevTools)

## Alternatives Considered

### Option 1: CodeMirror 6 (CHOSEN)

- **Pros**:
  - First-class SQL support via `@codemirror/lang-sql`
  - Modular architecture (tree-shakeable)
  - Lightweight (~200KB for SQL mode)
  - Excellent React integration (`@uiw/react-codemirror`)
  - Active maintenance and community
  - Supports custom themes
- **Cons**:
  - Need to validate bundle size (Spike S-003)
  - Additional dependencies
- **Risks**: Bundle size may exceed targets (mitigation: spike will validate)

### Option 2: Monaco Editor

- **Pros**:
  - Full VS Code editor capabilities
  - Excellent SQL support
- **Cons**:
  - Very large bundle (~2MB+ alone)
  - Would exceed extension size budget
  - Overkill for simple SQL editing

### Option 3: Simple Textarea with Prism.js

- **Pros**:
  - Very lightweight (~50KB)
  - Syntax highlighting only
- **Cons**:
  - No code editing features (auto-indent, bracket matching)
  - No built-in keyboard shortcuts
  - Poor user experience for writing SQL
  - Would need custom Ctrl+Enter handling

### Option 4: Ace Editor

- **Pros**:
  - Established editor with SQL mode
- **Cons**:
  - Less modular than CodeMirror 6
  - Larger bundle size
  - Less active maintenance

## Consequences

- **Positive**:
  - Professional SQL editing experience
  - Auto-matching Chrome DevTools theme
  - Built-in keyboard shortcut support
  - Extensible for future features (autocomplete, formatting)
- **Negative**:
  - Increases bundle size by ~200KB (pending spike validation)
  - Adds dependency on 5+ packages (@codemirror/\*, @uiw/react-codemirror)
- **Risks**:
  - **R1**: Bundle size may exceed 2MB limit (mitigation: Spike S-003 will measure; fallback to textarea if needed)
  - **R2**: Theme detection may not work perfectly (mitigation: fallback to light theme, document limitation)

## Validation Required

- **Spike S-003**: Build test extension with CodeMirror 6 + SQL mode, measure unpacked bundle size
  - **Pass**: Bundle <2MB → Proceed with CodeMirror 6
  - **Fail**: Bundle >2MB → Consider alternatives (Ace, or textarea + Prism.js)
