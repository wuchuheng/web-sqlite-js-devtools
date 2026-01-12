<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/04-adr/0000-template.md

OUTPUT MAP (write to)
agent-docs/04-adr/0001-content-script-proxy.md

NOTES
- Keep headings unchanged.
- Use this for ANY significant decision (DB choice, Framework, Auth, etc.).
-->

# ADR-0001: Content Script Proxy Pattern for window.\_\_web_sqlite Access

## Status

Superseded (2026-01-13) — replaced by DevTools `inspectedWindow.eval`

## Context

- **Issue**: Chrome DevTools panel runs in an isolated context and cannot directly access the web page's `window` object, including `window.__web_sqlite` global namespace provided by web-sqlite-js.
- **Constraints**:
  - Manifest V3 security model isolates extension contexts
  - DevTools panel has no direct DOM access to the inspected page
  - Content scripts run in the page context and can access `window.__web_sqlite`
  - All cross-context communication must use Chrome Extension messaging APIs
- **Why decide now**: This is the foundational architecture pattern that all other features depend on (query execution, log streaming, OPFS access).

## Decision

We will use **DevTools `chrome.devtools.inspectedWindow.eval`** to access `window.__web_sqlite` directly from the DevTools panel.

The content script proxy is removed for database/table access. The content script remains only for icon state updates.

## Alternatives Considered

### Option 1: Content Script Proxy (NO LONGER USED)

- **Pros**:
  - Leverages existing Chrome Extension security model
  - Content script persists as long as the page is open
  - Well-documented pattern for DevTools extensions
  - Clean separation of concerns (UI vs page access)
  - Message overhead is minimal (~1-5ms per call)
- **Cons**:
  - Cannot serialize Map objects directly (need Array conversion)
  - Additional message hop (panel → background → content script)
  - Need to handle content script lifecycle

### Option 2: Offscreen Document Bridge

- **Pros**:
  - Offscreen doc has longer lifecycle than DevTools panel
  - Can maintain connection state when DevTools closes
- **Cons**:
  - More complex message chain (4 hops vs 2)
  - Higher latency for each operation
  - Overkill for simple read/query operations
  - Offscreen docs have limited Chrome support

### Option 3: Dynamic Script Injection

### Option 4: DevTools `inspectedWindow.eval` (CHOSEN)

- **Pros**:
  - Direct access to `window.__web_sqlite` without proxy hops
  - No channel routing or Map serialization
  - Simpler DevTools-side implementation
- **Cons**:
  - Only available when DevTools is open
  - DevTools eval error handling required

- **Pros**:
  - Direct access to page context
  - Fewer message hops
- **Cons**:
  - Script injection overhead each time DevTools opens
  - Complex lifecycle management
  - postMessage is less structured than chrome.runtime.sendMessage
  - Script may be cleaned up unexpectedly

## Consequences

- **Positive**:
  - Simplifies data access (no proxy hops)
  - Removes channel routing and Map serialization
  - DevTools panel logic is more direct and debuggable
- **Negative**:
  - DevTools must be open to access data
  - DevTools eval failures must be handled per request
- **Risks**:
  - **R1**: Eval exceptions on pages with strict CSP or missing globals (mitigation: defensive checks + user-facing errors)
  - **R2**: Reduced visibility when DevTools is closed (mitigation: limit to DevTools UX scope)
