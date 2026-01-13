<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/active/task-micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-05.3.md

NOTES
- Micro-Spec for TASK-05.3: Service Layer - Log Streaming Functions
- Spec-first implementation per S8 Worker guidelines
- Functional-first design (functions > classes)
-->

# TASK-05.3: Service Layer - Log Streaming Functions

## 0) Meta

- **Task ID**: TASK-05.3
- **Title**: Service Layer - Log Streaming Functions
- **Priority**: P0 (Blocker)
- **Status**: In Progress
- **Dependencies**: TASK-05.2 (SQL Execution Functions)
- **Feature**: F-001 Service Layer Expansion - Log Streaming Group
- **Maps to**: FR-026, FR-029, FR-030, ADR-0004, ADR-0005
- **Created**: 2026-01-13

## 1) Summary

Implement `subscribeLogs(dbname)` and `unsubscribeLogs(subscriptionId)` service functions for real-time log streaming from `window.__web_sqlite`.

Also implement `LogRingBuffer.ts` in the content script for efficient log buffering (500 entry circular buffer with batch sending).

## 2) Boundary

**Files to modify:**

- `src/devtools/services/databaseService.ts` - Add new types and functions
- `src/contentScript/subscriptions/LogRingBuffer.ts` - NEW FILE (ring buffer implementation)

**Files to read (context):**

- `src/devtools/bridge/inspectedWindow.ts` - Existing bridge layer
- `agent-docs/04-adr/0005-log-ring-buffer.md` - Ring buffer ADR

**Files NOT to modify:**

- No changes to bridge layer (use existing `inspectedWindowBridge.execute`)
- No changes to components (that's TASK-05.8)

## 3) Upstream Traceability

### HLD References

- Service Layer Architecture: `agent-docs/03-architecture/01-hld.md` (Section 8)
- Three-Layer Pattern: `agent-docs/03-architecture/01-hld.md` (Service Layer Functions)

### API Contract References

- `subscribeLogs`: `agent-docs/05-design/01-contracts/01-api.md` (Log Streaming Functions)
- Error codes: `agent-docs/05-design/01-contracts/03-errors.md`
- Events: `agent-docs/05-design/01-contracts/02-events.md` (LOG_ENTRY event)

### Module LLD References

- Database Service: `agent-docs/05-design/03-modules/database-service.md`
  - Section 4, Classes/Functions: `subscribeLogs`, `unsubscribeLogs`

### ADR References

- ADR-0004: Message Protocol for Cross-Context Communication
- ADR-0005: Ring Buffer for Log Streaming (500 Entry Limit)

## 4) Functional Design

### Type Definitions (Functional - no classes)

```typescript
/**
 * Log entry from db.onLog() callback
 */
export type LogEntry = {
  level: "info" | "debug" | "error";
  data: unknown;
  timestamp: number;
};

/**
 * Log subscription with callback and cleanup
 */
export type LogSubscription = {
  subscriptionId: string;
  dbname: string;
  callback: (entry: LogEntry) => void;
};

/**
 * Subscribe result with subscription ID
 */
export type SubscribeResult = {
  subscriptionId: string;
};
```

### Module State (Service Layer)

```typescript
// Internal subscription map for cleanup
// Map<subscriptionId, LogSubscription>
const subscriptions = new Map<string, LogSubscription>();
```

### Function: `subscribeLogs(dbname, callback)`

**Purpose**: Subscribe to log events for a database

**Signature**:

```typescript
export const subscribeLogs = async (
  dbname: string,
  callback: (entry: LogEntry) => void,
): Promise<ServiceResponse<SubscribeResult>>
```

**Algorithm** (functional, 3-phase):

1. **Phase 1: Validate and generate subscription ID**
   - Execute function that accesses `window.__web_sqlite.databases[dbname]`
   - Return error if database not found
   - Generate unique subscription ID: `sub_${Date.now()}_${Math.random()}`

2. **Phase 2: Create subscription and register callback**
   - Create subscription object with ID, dbname, and callback
   - Call `window.__web_sqlite.subscribeLogs(dbname, callback)`
   - Store subscription in internal Map for cleanup

3. **Phase 3: Return response**
   - On success: `{ success: true, data: { subscriptionId } }`
   - On error: `{ success: false, error: "..." }`

**Error Cases**:

- Database not found
- Logging not supported by database
- Subscription limit reached (e.g., too many active subscriptions)

### Function: `unsubscribeLogs(subscriptionId)`

**Purpose**: Unsubscribe from log events

**Signature**:

```typescript
export const unsubscribeLogs = async (
  subscriptionId: string,
): Promise<ServiceResponse<void>>
```

**Algorithm** (functional, 3-phase):

1. **Phase 1: Look up subscription**
   - Get subscription from internal Map
   - Return error if subscription not found

2. **Phase 2: Unsubscribe and cleanup**
   - Call `window.__web_sqlite.unsubscribeLogs(subscriptionId)`
   - Remove subscription from internal Map

3. **Phase 3: Return response**
   - On success: `{ success: true }`
   - On error: `{ success: false, error: "..." }`

**Error Cases**:

- Subscription not found
- Unsubscribe failed

### Module: LogRingBuffer (Content Script)

**Purpose**: Efficient log buffering with circular buffer (500 entries) and batch sending

**Location**: `src/contentScript/subscriptions/LogRingBuffer.ts`

**Type Definitions**:

```typescript
/**
 * Log entry in ring buffer
 */
export type BufferedLogEntry = {
  level: "info" | "debug" | "error";
  data: unknown;
  timestamp: number;
};

/**
 * Ring buffer configuration
 */
export type RingBufferConfig = {
  maxSize: number; // 500 entries
  batchSize: number; // 50 entries
  batchInterval: number; // 100ms
};

/**
 * Ring buffer state
 */
export type RingBufferState = {
  buffer: BufferedLogEntry[];
  head: number; // Write position
  count: number; // Current entry count
  timer: ReturnType<typeof setInterval> | null;
};
```

**Function: `createRingBuffer(config)`**

Creates a new ring buffer with circular overwrite behavior.

**Function: `ringBufferAdd(buffer, entry)`**

Adds entry to buffer, overwriting oldest if full. Returns boolean indicating if batch should be sent (when count reaches batchSize).

**Function: `ringBufferGetBatch(buffer)`**

Gets current batch (all entries or up to batchSize) and clears read positions.

**Function: `ringBufferDestroy(buffer)`**

Clears buffer and stops batch timer.

## 5) Implementation Notes

### Functional-First Rationale

This spec uses functional design because:

- State transformation is the core operation (subscribe/unsubscribe → Map update)
- Subscription management uses immutable Map operations
- Callback pattern is inherently functional (event → callback)
- Easier to test (mock bridge layer and subscription Map)
- Aligns with existing `databaseService` pattern

**EXCEPTION**: `LogRingBuffer` uses a module with internal state (buffer array, head index) because:

- Ring buffer requires mutable array operations for O(1) overwrite
- State is encapsulated within the module (not a class)
- Functional operations provided via exported functions

### Code Quality Requirements (S8 Rules)

1. **Function Documentation**: JSDoc on exported functions
2. **Three-Phase Comments**: For functions > 5 lines
   ```typescript
   /**
    * Subscribe to log events
    */
   export const subscribeLogs = async (...) => {
     // Phase 1: Validate and generate subscription ID
     // Phase 2: Create subscription and register callback
     // Phase 3: Return response
   }
   ```
3. **No Classes**: Use exported functions and types (except LogRingBuffer state encapsulation)
4. **Type Safety**: Strict TypeScript types for all inputs/outputs

### Bridge Layer Usage

Use existing `inspectedWindowBridge.execute`:

```typescript
return inspectedWindowBridge.execute({
  func: async (
    dbname: string,
    subscriptionId: string,
    callback: (entry: LogEntry) => void,
  ) => {
    // Code runs in inspected page MAIN world
    const api = window.__web_sqlite;
    const dbRecord = api?.databases[dbname];
    if (!dbRecord) {
      return { success: false, error: `Database not found: ${dbname}` };
    }
    // Subscribe to logs
    api.subscribeLogs(dbname, callback);
    return { success: true, data: { subscriptionId } };
  },
  args: [dbname, subscriptionId, callback],
});
```

### Subscription Callback Handling

**Note**: Since `inspectedWindowBridge.execute` runs code in the inspected page context, the callback must be:

1. Serialized as a string or
2. Passed as a function reference via `args`

The actual implementation needs to handle the callback mechanism appropriately. Options:

- Use `chrome.runtime.sendMessage` to send logs from inspected page to DevTools panel
- Use a message channel to stream log entries back to the service layer

### LogRingBuffer Integration

The `LogRingBuffer` module is used by the content script to buffer log entries before sending them to the DevTools panel. The service layer functions `subscribeLogs` and `unsubscribeLogs` interact with this buffer:

1. `subscribeLogs`: Starts buffering logs for the database
2. `unsubscribeLogs`: Stops buffering and clears the buffer

## 6) Definition of Done

### Service Layer

- [ ] Type `LogEntry` added and exported
- [ ] Type `LogSubscription` added and exported
- [ ] Type `SubscribeResult` added and exported
- [ ] Internal `subscriptions` Map declared
- [ ] Function `subscribeLogs` implemented with JSDoc
- [ ] Function `unsubscribeLogs` implemented with JSDoc
- [ ] Functions added to `databaseService` export object

### LogRingBuffer Module

- [ ] File `src/contentScript/subscriptions/LogRingBuffer.ts` created
- [ ] Type `BufferedLogEntry` exported
- [ ] Type `RingBufferConfig` exported
- [ ] Type `RingBufferState` exported
- [ ] Function `createRingBuffer` implemented with JSDoc
- [ ] Function `ringBufferAdd` implemented with JSDoc
- [ ] Function `ringBufferGetBatch` implemented with JSDoc
- [ ] Function `ringBufferDestroy` implemented with JSDoc
- [ ] Module exports frozen object

### General

- [ ] TypeScript compiles without errors
- [ ] Code follows functional design (no classes except state encapsulation)
- [ ] Three-phase comments in functions > 5 lines

## 7) Testing Notes (Unit & Integration Tests)

Unit tests to be added in separate task (referenced in TASK-12):

### Service Layer Tests

- Mock `inspectedWindowBridge.execute` to return test data
- Test `subscribeLogs` generates unique subscription IDs
- Test `subscribeLogs` stores subscription in Map
- Test `unsubscribeLogs` removes subscription from Map
- Test `subscribeLogs` error handling (database not found)
- Test `unsubscribeLogs` error handling (subscription not found)

### LogRingBuffer Tests

- Test buffer creation with default config
- Test adding entries to buffer
- Test circular overwrite when buffer is full
- Test batch extraction clears read entries
- Test buffer destruction clears timer

### Integration Tests

- Test end-to-end log streaming with real web-sqlite-js database
- Test subscription cleanup on component unmount
- Test multiple subscriptions to different databases

## 8) References

- API Contract: `agent-docs/05-design/01-contracts/01-api.md`
- Module LLD: `agent-docs/05-design/03-modules/database-service.md`
- Error Standards: `agent-docs/05-design/01-contracts/03-errors.md`
- Events: `agent-docs/05-design/01-contracts/02-events.md`
- ADR-0004: Message Protocol
- ADR-0005: Ring Buffer for Log Streaming
