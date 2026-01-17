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

- **D1 (Development Speed)**: Leverage existing CrossWorldChannel and message infrastructure from F-017
- **D2 (Reliability)**: Message delivery should work reliably for database list updates
- **D3 (Simplicity)**: Minimal new abstractions, reuse existing patterns
- **D4 (Compatibility)**: Work within Chrome Extension API constraints for DevTools panels

## 2) Constraints recap (from Stage 1)

- **Key constraints**:
  - Chrome DevTools panels cannot directly access content script context
  - DevTools panels have limited messaging options (chrome.runtime.sendMessage only)
  - Must reuse existing CrossWorldChannel from F-017
  - Log streaming must include database identification
  - No polling allowed (event-driven only)

- **Key success criteria**:
  - Database list auto-refreshes within 100ms of database open/close
  - Log entries display in real-time with database filtering
  - Message forwarding latency < 10ms
  - No memory leaks from subscriptions

## 3) Options (A/B/C)

### Option A — Extend Existing chrome.runtime.sendMessage (RECOMMENDED)

- **Summary**: Use existing chrome.runtime.sendMessage for background → DevTools panel communication. DevTools panel subscribes to chrome.runtime.onMessage for real-time updates. Content script uses existing CrossWorldChannel for log streaming.

- **Architecture**:

  ```
  Content Script (MAIN) → CrossWorldChannel → Relay (ISOLATED) → chrome.runtime.sendMessage
    → Background Worker → chrome.runtime.sendMessage → DevTools Panel
  ```

- **Pros**:
  - Zero new infrastructure (reuses F-017 CrossWorldChannel)
  - Consistent with existing message protocol
  - Simple implementation (~100-150 lines)
  - Fire-and-forget semantics acceptable for logs
  - Tab-based routing already implemented in background worker

- **Cons**:
  - Message delivery not guaranteed (best-effort)
  - DevTools panel must be open to receive messages
  - No built-in delivery confirmation

- **Risks**:
  - Low: chrome.runtime.sendMessage is well-documented and stable
  - Low: Existing databaseMap provides source of truth
  - Medium: DevTools panel may miss messages if closed (acceptable for logs)

- **Estimated effort**: 4-6 hours
  - Background worker message forwarding: 1-2 hours
  - DevTools panel message listener: 1-2 hours
  - Log subscription in content script: 2 hours
  - Integration testing: 1 hour

- **Fits success criteria?** Yes
  - chrome.runtime.sendMessage latency is typically < 5ms
  - Existing databaseMap ensures eventual consistency
  - CrossWorldChannel already handles MAIN → ISOLATED communication

### Option B — chrome.runtime.Port with Persistent Connections

- **Summary**: Create persistent port connections between background worker and DevTools panel using chrome.runtime.connect. Messages sent via port.postMessage for reliable delivery.

- **Architecture**:

  ```
  DevTools Panel: chrome.runtime.connect({name: "devtools-panel"})
  Background Worker: Maintain Map<tabId, chrome.runtime.Port>
  Content Script → Background → Port.postMessage → DevTools Panel
  ```

- **Pros**:
  - Persistent connection ensures DevTools panel is reachable
  - Port.onDisconnect signals panel closure
  - Slightly more reliable message delivery
  - Connection state is explicit

- **Cons**:
  - More complex (connection lifecycle management)
  - Need to handle port disconnection/reconnection
  - Background worker must track active ports per tab
  - Additional ~50 lines for connection management

- **Risks**:
  - Medium: Port lifecycle adds complexity
  - Low: Well-documented Chrome API
  - Low: Connection errors can be handled gracefully

- **Estimated effort**: 6-8 hours
  - Port connection management: 2-3 hours
  - Message routing via ports: 2 hours
  - Disconnection handling: 1-2 hours
  - Testing: 1 hour

- **Fits success criteria?** Yes
  - Port delivery is still asynchronous (similar latency to sendMessage)
  - Persistent connection doesn't significantly improve reliability
  - Overkill for best-effort log streaming

### Option C (fallback) — Polling via inspectedWindow.eval

- **Summary**: Fallback to polling if message-based approach fails. DevTools panel periodically calls chrome.devtools.inspectedWindow.eval to check database list and logs.

- **When to use**: Only if Options A and B prove infeasible (unlikely)

- **Summary**:
  - DevTools panel polls database list every 1-2 seconds
  - Logs fetched via periodic eval calls
  - Simple but violates NFR-RT-001 (no polling requirement)

- **Pros**:
  - Guaranteed to work (eval always succeeds)
  - No new message infrastructure needed
  - Works even if message forwarding has bugs

- **Cons**:
  - Violates "no polling" requirement from Stage 1
  - Higher latency (polling interval)
  - Unnecessary CPU usage
  - Poor user experience (delayed updates)

- **Risks**:
  - High: Does not meet success criteria
  - Medium: Performance impact from frequent eval calls

- **Estimated effort**: 2-3 hours (but not recommended)

- **Fits success criteria?** No
  - Polling violates NFR-RT-001 (no polling requirement)
  - Latency equals polling interval (not real-time)

## 4) Tradeoff table

| Dimension          | Option A (sendMessage) | Option B (Port)             | Option C (Polling)     |
| ------------------ | ---------------------- | --------------------------- | ---------------------- |
| **Speed**          | Fastest (4-6h)         | Medium (6-8h)               | Fast (2-3h)            |
| **Cost**           | Low (reuse existing)   | Medium (new infrastructure) | Low (but violates NFR) |
| **Ops complexity** | Low (fire-and-forget)  | Medium (connection mgmt)    | Low (simple loop)      |
| **Scalability**    | High (event-driven)    | High (persistent)           | Low (polling overhead) |
| **Security**       | High (Chrome API)      | High (Chrome API)           | Medium (eval risks)    |
| **Latency**        | < 10ms                 | < 10ms                      | Polling interval       |
| **Reliability**    | Medium (best-effort)   | Medium-High (persistent)    | High (always works)    |

## 5) Recommendation

- **Recommended baseline**: Option A — Extend Existing chrome.runtime.sendMessage

- **Why (tie to decision drivers and success criteria)**:
  1. **D1 (Speed)**: Reuses 100% of existing CrossWorldChannel infrastructure from F-017, minimizing new code
  2. **D2 (Reliability)**: chrome.runtime.sendMessage is production-tested; databaseMap provides source of truth for recovery
  3. **D3 (Simplicity)**: Fire-and-forget semantics match log streaming use case; no connection lifecycle to manage
  4. **D4 (Compatibility)**: Uses standard Chrome Extension API; works within DevTools panel constraints
  5. Meets all success criteria: < 10ms latency, event-driven, no polling

- **What we postpone (explicit)**:
  - Persistent connections (Option B) postponed unless message loss becomes a measurable problem
  - Message delivery guarantees postponed (logs are ephemeral, acceptable to miss some entries)
  - Cross-tab monitoring (out of scope per Stage 1)

## 6) Open questions / Needs spikes

- **Q1**: Will chrome.runtime.sendMessage from background worker reach DevTools panel reliably?
  - **Spike needed?**: No — Chrome API documentation confirms this is supported
  - **Validation**: Quick test (15 min) to confirm DevTools panel receives chrome.runtime.onMessage from background

- **Q2**: Should we enable log streaming only when log page is mounted?
  - **Spike needed?**: No — Standard React pattern (useEffect mount/unmount)
  - **Validation**: Document in LLD, no spike needed

- **Q3**: How to handle rapid database open/close cycles?
  - **Spike needed?**: No — Existing databaseMap handles deduplication via Map<tabId, Set<dbname>>
  - **Validation**: Verified in F-017 implementation

---

**Maintainer**: S2: Feasibility Analyst
**Status**: Draft — Ready for Review
