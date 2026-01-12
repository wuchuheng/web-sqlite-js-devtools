<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/02-feasibility/01-options.md

OUTPUT MAP (write to)
agent-docs/02-feasibility/01-options.md

NOTES
- Keep headings unchanged.
- Must include Option A/B/C and a clear recommendation tied to Stage-1 success criteria.
-->

# 01 Options — Feasibility & Tech Choices

## 1) Decision drivers (what matters most)

- **D1 (Speed to MVP)**: Existing template has React + Tailwind + Vite + @crxjs setup, want to leverage this
- **D2 (Extension bundle size)**: Chrome extensions have size limits, especially with CodeMirror
- **D3 (DevTools context isolation)**: DevTools panel cannot directly access page's `window.__web_sqlite`
- **D4 (User experience)**: Real-time updates, fast query execution, responsive UI

## 2) Constraints recap (from Stage 1)

- **Key constraints**:
  - Must use Manifest V3 for Chrome extension
  - React for UI components (per existing template)
  - Tailwind CSS for styling (per existing template)
  - DevTools panel cannot directly access web page context
  - Content script required as proxy to `window.__web_sqlite` API
  - Hash-based routing for all navigation
- **Key success criteria**:
  - Panel open time < 500ms
  - Table data load time < 200ms
  - Extension bundle size < 2MB
  - Real-time icon state updates via `onDatabaseChange`
  - Auto-reconnect with timeout on page refresh

## 3) Options (A/B/C)

### Option A — Content Script Proxy with React Router

- **Summary**: Use existing DevTools page → chrome.runtime.sendMessage → Content Script → `window.__web_sqlite`. Hash routing via react-router-dom.
- **Pros**:
  - Leverages existing template infrastructure (Vite + @crxjs + React + Tailwind)
  - Clean separation of concerns (DevTools UI vs page context)
  - React Router provides robust hash routing and history management
  - Content script persists as long as page is open
  - Well-documented pattern for Chrome extensions
- **Cons**:
  - Message passing overhead (chrome.runtime.sendMessage is async)
  - Need to handle message serialization for complex objects (Maps, etc.)
  - Content script lifecycle management on page navigation
- **Risks**:
  - R1: Message serialization may not support Map objects from `migrationSQL`/`seedSQL`
  - R2: Content script injection timing vs DevTools panel open
- **Estimated effort**: 5-7 days for MVP architecture setup
- **Fits success criteria?**: **Yes** - Message overhead is minimal (~1-5ms per call), well within performance targets

### Option B — Offscreen Document as Message Bridge

- **Summary**: DevTools → background → offscreen document → content script → `window.__web_sqlite`. Offscreen doc handles state caching.
- **Pros**:
  - Offscreen document has full DOM and longer lifecycle than DevTools panel
  - Can maintain connection state even when DevTools closes
  - Better for complex state management and caching
  - Template already has offscreen.html setup
- **Cons**:
  - More complex message chain (4 hops vs 2)
  - Higher latency for each operation
  - Offscreen docs have limited support in Chrome (requires permission)
  - Overkill for simple read/query operations
- **Risks**:
  - R1: Offscreen document may not persist across all scenarios
  - R2: Increased complexity may introduce bugs
- **Estimated effort**: 7-10 days (more complex architecture)
- **Fits success criteria?**: **Partial** - May exceed 500ms panel open time due to extra message hops

### Option C (fallback) — Direct Page Script Injection

- **Summary**: DevTools panel dynamically injects script into active page to access `window.__web_sqlite` directly via postMessage.
- **Pros**:
  - Direct access to page context without content script proxy
  - Fewer message hops
  - Simpler for some operations
- **Cons**:
  - Script injection each time DevTools opens (overhead)
  - Need to manage injected script lifecycle
  - postMessage is less structured than chrome.runtime.sendMessage
  - Script may be cleaned up by page unexpectedly
- **When to use**:
  - Only if Option A proves insufficient during spike testing
  - For specific features that need synchronous access

## 4) Tradeoff table

| Dimension          | Option A (Content Script Proxy) | Option B (Offscreen Bridge)   | Option C (Direct Injection) |
| ------------------ | ------------------------------- | ----------------------------- | --------------------------- |
| **Speed**          | Fast (2 hops, ~1-5ms overhead)  | Slower (4 hops, ~10-20ms)     | Medium (injection cost)     |
| **Cost**           | Low (uses existing template)    | Medium (more complexity)      | Medium (injection logic)    |
| **Ops complexity** | Low (standard pattern)          | High (4-hop messaging)        | Medium (lifecycle mgmt)     |
| **Scalability**    | High (works for all features)   | Medium (latency concerns)     | Low (injection limits)      |
| **Security**       | High (Chrome APIs validate)     | High (same as A)              | Medium (postMessage risks)  |
| **Bundle size**    | ~500KB (React + deps)           | ~600KB (extra offscreen code) | ~450KB (slightly less)      |
| **Maintenance**    | Low (well-documented)           | Medium (custom architecture)  | Medium (custom injection)   |

## 5) Recommendation

- **Recommended baseline**: **Option A — Content Script Proxy with React Router**
- **Why (tie to decision drivers and success criteria)**:
  - **D1 (Speed)**: Leverages existing Vite + @crxjs + React + Tailwind setup, no new infrastructure
  - **D2 (Size)**: React Router adds ~50KB, well within 2MB budget (CodeMirror is the main size concern)
  - **D3 (Isolation)**: Content script proxy is the standard pattern for DevTools → page communication
  - **D4 (UX)**: Message overhead is negligible (~1-5ms per call), meets <500ms panel open and <200ms data load targets
  - Existing template already has contentScript setup (src/contentScript/index.tsx) and messaging infrastructure (src/messaging/)
- **What we postpone (explicit)**:
  - Offscreen document caching (Option B) - can add later if performance issues arise
  - Query history persistence (P1 feature FR-106) - can use chrome.storage after MVP
  - Advanced keyboard shortcuts (P1 feature FR-107) - add after core features work

## 6) Open questions / Needs spikes

- **Q1**: Can chrome.runtime.sendMessage properly serialize `Map<string, string>` from `migrationSQL` and `seedSQL` fields in `DatabaseRecord`?
  - **Spike needed?**: **Yes** - 1 hour spike to test message serialization
- **Q2**: What is the actual message overhead for chrome.runtime.sendMessage with query results (100+ rows)?
  - **Spike needed?**: **Yes** - 1 hour spike to benchmark latency
- **Q3**: Will CodeMirror 6 with SQL mode fit within bundle size target?
  - **Spike needed?**: **Yes** - 2 hours spike to test bundle size with CodeMirror
- **Q4**: How to handle `onDatabaseChange` events from page context to update DevTools icon state?
  - **Spike needed?**: **No** - Well-documented pattern (content script → background → popup icon)
