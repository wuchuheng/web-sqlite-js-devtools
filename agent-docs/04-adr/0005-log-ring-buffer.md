<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/04-adr/0000-template.md

OUTPUT MAP (write to)
agent-docs/04-adr/0005-log-ring-buffer.md

NOTES
- Keep headings unchanged.
- Use this for ANY significant decision (DB choice, Framework, Auth, etc.).
-->

# ADR-0005: Ring Buffer for Log Streaming (500 Entry Limit)

## Status

Accepted

## Context

- **Issue**: Log tab needs to display real-time logs from `db.onLog()` subscription. Unbounded log retention would cause memory leaks in long DevTools sessions.
- **Constraints**:
  - `db.onLog()` can fire frequently (every query, transaction, etc.)
  - DevTools panel may stay open for hours
  - Memory usage target is <50MB for the extension
  - Need to balance log retention with memory concerns
  - User should be able to see recent logs for debugging
- **Why decide now**: Log streaming is a core feature (FR-029, FR-030); memory management strategy affects implementation.

## Decision

We will use a **ring buffer (circular buffer)** with a fixed size of **500 log entries** in the content script.

Design:

- Content script maintains ring buffer for each subscribed database
- New logs overwrite oldest entries when buffer is full
- Logs batch-sent to DevTools panel every 100ms or when buffer reaches 50 entries
- Panel displays all received logs (no additional buffering)
- Filter by level (info/debug/error) and fields (sql/action/event) on the panel side

## Alternatives Considered

### Option 1: Ring Buffer - 500 entries (CHOSEN)

- **Pros**:
  - Fixed memory footprint (O(1) space)
  - No memory leaks (oldest entries auto-evicted)
  - Sufficient history for debugging recent queries
  - Simple implementation
  - Batch sending reduces message overhead
- **Cons**:
  - Older logs not visible (evicted)
  - User may miss important logs if buffer wraps too quickly
  - Fixed limit may not suit all use cases

### Option 2: Unlimited Log Retention

- **Pros**:
  - Full log history available
  - No missed logs
- **Cons**:
  - Memory leak guaranteed (logs accumulate indefinitely)
  - Would exceed 50MB memory target quickly
  - Could cause DevTools to crash

### Option 3: Time-Based Retention (e.g., 5 minutes)

- **Pros**:
  - Adaptive based on log frequency
  - Guarantees recent logs visible
- **Cons**:
  - More complex implementation
  - Less predictable memory usage
  - May still use too much memory if logs are frequent

### Option 4: 1000 Entry Limit

- **Pros**:
  - More history than 500
- **Cons**:
  - Uses 2x memory
  - 500 is sufficient for debugging (typically <50 queries per session)

## Consequences

- **Positive**:
  - Predictable memory usage (~500KB for log buffer)
  - No memory leaks from log accumulation
  - Sufficient history for debugging (covers ~50-100 typical queries)
  - Simple implementation (array with modulo index)
  - Batch sending reduces chrome.runtime.sendMessage overhead
- **Negative**:
  - Users may miss logs if buffer wraps faster than they can review
  - No way to increase limit without code change
  - Older context lost when debugging complex issues
- **Risks**:
  - **R1**: 500 entries may not be enough for heavy debugging sessions (mitigation: users can filter by level/field to reduce noise)
  - **R2**: Frequent logs (e.g., polling queries) may wrap buffer quickly (mitigation: filter options in Log tab)
  - **R3**: Batch sending may delay log visibility (mitigation: 100ms max delay, acceptable for debugging)

## Implementation Notes

- Ring buffer implementation: `src/contentScript/subscriptions/LogRingBuffer.ts`
- Batch interval: 100ms or 50 entries (whichever comes first)
- Log entry format: `{ level: "info"|"debug"|"error", data: unknown, timestamp: number }`
