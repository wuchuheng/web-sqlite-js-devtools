<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/04-adr/0000-template.md

OUTPUT MAP (write to)
agent-docs/04-adr/0006-auto-reconnect-strategy.md

NOTES
- Keep headings unchanged.
- Use this for ANY significant decision (DB choice, Framework, Auth, etc.).
-->

# ADR-0006: Auto-Reconnect with Exponential Backoff for Page Refresh Handling

## Status

Accepted

## Context

- **Issue**: When user refreshes the web page, the content script is destroyed and reloaded, but the DevTools panel remains open. The panel loses connection to `window.__web_sqlite` and needs to reconnect.
- **Constraints**:
  - Content script reload is asynchronous (timing unknown)
  - Panel cannot detect page refresh directly (isolated context)
  - Need to avoid flooding messages during reconnect attempts
  - User should see loading state, not errors
  - NFR-041 requires auto-reconnect with timeout
- **Why decide now**: Page refresh handling is critical for UX; reconnection strategy affects panel state management.

## Decision

We will use **heartbeat-based detection with exponential backoff reconnection**:

**Detection:**

- Panel sends heartbeat every 5 seconds via `HEARTBEAT` channel
- Content script responds immediately
- Panel declares timeout after 15 seconds without response (3 missed heartbeats)

**Reconnection:**

- On timeout, panel enters "Reconnecting" state
- Retry attempts at: 1s, 2s, 4s, 8s, 15s, 15s, 15s... (exponential then fixed)
- Show loading state with spinner
- After 3 failed retries (or 30s total), show error state with "Retry" button

**User Actions:**

- User can click "Retry" button to immediately attempt reconnection
- Panel automatically reconnects when user navigates (hash change)
- On successful reconnect, restore previous route state

## Alternatives Considered

### Option 1: Heartbeat + Exponential Backoff (CHOSEN)

- **Pros**:
  - Robust detection of connection loss
  - Automatic recovery without user intervention
  - Exponential backoff reduces message flood
  - Loading state provides good UX
  - Manual retry available if auto-reconnect fails
- **Cons**:
  - Heartbeat messages add overhead (1 per 5s)
  - 15s timeout may feel slow
  - Reconnection delay up to 30s

### Option 2: Polling with Fixed Interval

- **Pros**:
  - Simpler implementation
  - Predictable retry timing
- **Cons**:
  - Wastes resources (polls even when connected)
  - Can cause message flood
  - No backoff strategy

### Option 3: chrome.tabs.onUpdated Listener

- **Pros**:
  - Direct notification of page refresh
- **Cons**:
  - Requires `tabs` permission
  - May not fire in all scenarios (e.g., in-page navigation)
  - Cannot detect content script readiness directly

### Option 4: No Auto-Reconnect (Manual Only)

- **Pros**:
  - Simplest implementation
  - No overhead
- **Cons**:
  - Poor UX (user sees errors after refresh)
  - Violates NFR-041 requirement

## Consequences

- **Positive**:
  - Automatic recovery from page refresh
  - Graceful degradation (shows error if cannot reconnect)
  - User can manually retry if needed
  - Exponential backoff prevents message flooding
  - Heartbeat provides ongoing connection health monitoring
- **Negative**:
  - Heartbeat overhead (~1 message per 5s when panel open)
  - Up to 30s delay before showing error
  - Additional complexity in connection state management
- **Risks**:
  - **R1**: 15s timeout may be too long for some users (mitigation: loading state indicates activity, manual retry available)
  - **R2**: Content script may take longer than 30s to initialize (mitigation: rare case, manual retry always available)
  - **R3**: Multiple tabs open with same extension could cause heartbeat confusion (mitigation: heartbeats are tab-scoped via chrome.tabs.sendMessage)

## Implementation Notes

- Heartbeat interval: 5000ms
- Timeout threshold: 15000ms (3 missed heartbeats)
- Retry delays: [1000, 2000, 4000, 8000, 15000, 15000, ...]
- Max retries before error: 3 (or 30s total)
- Connection states: `Connected` | `Connecting` | `Reconnecting` | `Disconnected`
