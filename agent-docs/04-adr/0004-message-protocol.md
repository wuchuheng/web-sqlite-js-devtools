<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/04-adr/0000-template.md

OUTPUT MAP (write to)
agent-docs/04-adr/0004-message-protocol.md

NOTES
- Keep headings unchanged.
- Use this for ANY significant decision (DB choice, Framework, Auth, etc.).
-->

# ADR-0004: Message Protocol for Cross-Context Communication

## Status

Superseded (2026-01-13) — direct inspected window eval replaces channel protocol

## Context

- **Issue**: Need a standardized protocol for communication between DevTools panel, background service worker, and content script.
- **Constraints**:
  - Chrome Extension messaging uses `chrome.runtime.sendMessage` (async)
  - Messages must be serializable (structured clone algorithm)
  - Map objects cannot be serialized directly
  - Need request/response pattern for queries
  - Need streaming pattern for log events
- **Why decide now**: Message protocol is the contract between all extension contexts; changes require updates across multiple files.

## Decision

We will **avoid channel-based messaging** for DevTools data access and use
`chrome.devtools.inspectedWindow.eval` directly in the panel.

Minimal runtime messaging remains only for:

- Icon state updates (content script → background)
- Offscreen log storage (internal only)

1. **Standardized response format** (used for eval results):

   ```typescript
   type Response<T> = {
     success: boolean;
     data?: T;
     error?: string;
   };
   ```

2. **Direct evaluation**: DevTools panel queries `window.__web_sqlite` via eval

## Alternatives Considered

### Option 1: Typed Message Protocol (NO LONGER USED)

- **Pros**:
  - Type-safe with TypeScript
  - Clear contract between contexts
  - Easy to debug (channel names in logs)
  - Standardized error handling
  - Supports both request/response and event streaming
- **Cons**:
  - More boilerplate than dynamic messaging
  - Need to maintain channel constants
  - Map→Array conversion required

### Option 2: Dynamic RPC-style

- **Pros**:
  - Less boilerplate
  - Can call functions directly by name
- **Cons**:
  - Less type-safe
  - Harder to debug
  - No standard error format
  - Security concerns (arbitrary function execution)

### Option 3: WebSocket-style duplex channel

- **Pros**:
  - Real-time bidirectional communication
- **Cons**:
  - Overkill for request/response pattern
  - Chrome messaging is already duplex
  - More complex state management

### Option 4: DevTools `inspectedWindow.eval` (CHOSEN)

- **Pros**:
  - Removes channel boilerplate for data access
  - Simple, direct access to `window.__web_sqlite`
- **Cons**:
  - DevTools-only availability
  - Eval errors must be handled per request

## Consequences

- **Positive**:
  - Fewer moving parts for DevTools data access
  - No channel routing or Map serialization
- **Negative**:
  - Limited to DevTools panel lifecycle
- **Risks**:
  - **R1**: Eval failures on restricted pages (mitigation: defensive checks + user messaging)

## Implementation Notes

- DevTools helpers in: `src/devtools/inspectedWindow.ts`
- Shared icon message ID: `src/shared/messages.ts`
