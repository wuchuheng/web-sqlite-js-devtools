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

Accepted

## Context

- **Issue**: Chrome DevTools panel runs in an isolated context and cannot directly access the web page's `window` object, including `window.__web_sqlite` global namespace provided by web-sqlite-js.
- **Constraints**:
  - Manifest V3 security model isolates extension contexts
  - DevTools panel has no direct DOM access to the inspected page
  - Content scripts run in the page context and can access `window.__web_sqlite`
  - All cross-context communication must use Chrome Extension messaging APIs
- **Why decide now**: This is the foundational architecture pattern that all other features depend on (query execution, log streaming, OPFS access).

## Decision

We will use the **Content Script Proxy Pattern**: DevTools Panel → Background Service Worker → Content Script → `window.__web_sqlite`.

The content script acts as a proxy, forwarding requests from the DevTools panel to the web-sqlite-js API and returning responses.

## Alternatives Considered

### Option 1: Content Script Proxy (CHOSEN)

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
  - Standard, maintainable pattern for Chrome DevTools extensions
  - Clear separation: Panel handles UI, Content Script handles API access
  - Background service worker can manage icon state and routing
  - Performance meets NFRs (<500ms panel open, <200ms query execution)
- **Negative**:
  - Map objects from `DatabaseRecord` must be converted to Arrays for message passing
  - Two-hop message latency (panel → background → content script)
  - Need to implement heartbeat/reconnect logic for content script lifecycle
- **Risks**:
  - **R1**: Content script may not be injected when DevTools opens (mitigation: retry with timeout)
  - **R2**: Page refresh disrupts connection (mitigation: auto-reconnect with exponential backoff - ADR-0006)
  - **R3**: Message serialization limitations (mitigation: Array conversion for Maps, structured clone compatible types)
