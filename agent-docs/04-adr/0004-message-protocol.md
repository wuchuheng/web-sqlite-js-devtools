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
Accepted

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
We will use a **typed message protocol** with:

1. **Named channels** (defined in `src/messaging/channels.ts`):
   - `GET_DATABASES` - List opened databases
   - `GET_TABLE_LIST` - Get tables for a database
   - `QUERY_SQL` - Execute SELECT query
   - `EXEC_SQL` - Execute INSERT/UPDATE/DELETE
   - `SUBSCRIBE_LOGS` - Subscribe to log events
   - `UNSUBSCRIBE_LOGS` - Unsubscribe from logs
   - `GET_OPFS_FILES` - List OPFS files
   - `DOWNLOAD_OPFS_FILE` - Download OPFS file
   - `ICON_STATE` - Update popup icon
   - `HEARTBEAT` - Connection health check

2. **Standardized response format**:
   ```typescript
   type Response<T> = {
     success: boolean;
     data?: T;
     error?: string;
   }
   ```

3. **Map serialization**: Convert `Map<string, string>` to `Array<[key, value]>` before sending

4. **Event streaming**: Log events sent via separate `LOG_EVENT` message type

## Alternatives Considered
### Option 1: Typed Message Protocol (CHOSEN)
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

## Consequences
- **Positive**:
  - Type-safe communication between contexts
  - Clear debugging (channel names visible in Chrome DevTools)
  - Consistent error handling across all operations
  - Easy to add new channels (just add constant and handler)
  - Log streaming works alongside request/response
- **Negative**:
  - More boilerplate code (channel constants, handlers)
  - Map objects require manual conversion (Array → Map reconstruction)
  - Need to maintain sync between channel definitions and handlers
- **Risks**:
  - **R1**: Type definitions may become out of sync with implementation (mitigation: TypeScript, shared types file)
  - **R2**: Map→Array conversion may miss edge cases (mitigation: Spike S-001 will validate)
  - **R3**: Message size limits for large query results (mitigation: pagination limits query size to 100 rows)

## Implementation Notes
- Channels defined in: `src/messaging/channels.ts`
- Types defined in: `src/messaging/types.ts`
- Handlers in: `src/devtools/messaging/`, `src/background/messaging/`, `src/contentScript/messaging/`
