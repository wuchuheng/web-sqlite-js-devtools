<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/04-adr/0000-template.md

OUTPUT MAP (write to)
agent-docs/04-adr/0002-react-router-hash.md

NOTES
- Keep headings unchanged.
- Use this for ANY significant decision (DB choice, Framework, Auth, etc.).
-->

# ADR-0002: React Router HashRouter for Navigation

## Status
Accepted

## Context
- **Issue**: DevTools panel requires navigation between different views (database list, table browser, query editor, OPFS browser) while running in Chrome's isolated DevTools context.
- **Constraints**:
  - DevTools panel URL is `chrome-extension://<id>/devtools.html`
  - Cannot modify server-side routing (no server in Chrome extension)
  - Navigation state should be bookmarkable within the DevTools session
  - Need to support 6 tabs per database plus OPFS view
- **Why decide now**: Routing architecture affects component structure and state management throughout the application.

## Decision
We will use **react-router-dom v6 with HashRouter** for all navigation within the DevTools panel.

Route structure:
- `/` - Empty state / default
- `/openedDB/:dbname` - Database overview with 6 tabs
- `/openedDB/:dbname/:tableName` - Specific table view
- `/opfs` - OPFS file browser

## Alternatives Considered
### Option 1: React Router HashRouter (CHOSEN)
- **Pros**:
  - Standard, well-documented routing library
  - Hash-based routing works in Chrome extension context
  - Supports nested routes and route parameters
  - Browser history back/forward buttons work naturally
  - Easy to implement active state styling
  - Large community and ecosystem
- **Cons**:
  - Adds ~50KB to bundle size
  - Hash URLs look less clean (e.g., `#/openedDB/dbname`)
  - Overkill for very simple navigation

### Option 2: State-Based Routing (Custom)
- **Pros**:
  - No additional dependency
  - Full control over routing logic
  - Smaller bundle size
- **Cons**:
  - Need to implement route matching, active states, browser history
  - More maintenance burden
  - No standard patterns to follow
  - Harder to implement nested routes

### Option 3: URL Search Parameters
- **Pros**:
  - Native browser API
  - No additional dependency
- **Cons**:
  - Less semantic for hierarchical navigation
  - Harder to implement nested views
  - No built-in route matching

## Consequences
- **Positive**:
  - Declarative route configuration with JSX
  - Easy to implement active state styling for sidebar
  - Browser back/forward navigation works automatically
  - Can use `useParams()` hook for database/table names
  - Future-proof for adding more routes
- **Negative**:
  - Additional dependency increases bundle size by ~50KB
  - Hash URLs in DevTools console (minor UX concern)
- **Risks**:
  - **R1**: Hash routing may conflict with existing DevTools URL patterns (mitigation: unlikely, isolated context)
  - **R2**: Large react-router bundle may impact extension size (mitigation: well within 2MB budget)
