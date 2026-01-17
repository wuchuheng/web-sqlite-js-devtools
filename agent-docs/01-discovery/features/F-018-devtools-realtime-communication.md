# Feature F-018: DevTools Real-time Communication

**Version**: 1.0.0
**Created**: 2026-01-17
**Status**: Discovery
**Priority**: P1 (High)
**Release**: v1.3.1

---

## 1) Executive Summary

### Feature Description

Refactor communication between DevTools panel and content script to enable real-time updates for:

1. **Auto-refreshing database list** on `/openedDB` route when databases are opened/closed
2. **Real-time log streaming** from content script (MAIN world) to DevTools panel with database identification

### Problem Statement

Currently, the DevTools panel uses `inspectedWindow.eval` to fetch data from the page context, but there's no mechanism for:

- The DevTools panel to receive real-time updates when the database list changes
- Content script to forward log events from `window.__web_sqlite` to the DevTools panel with database context

The background worker already tracks `databaseMap` (per-tab, per-frame database state), but the DevTools panel doesn't subscribe to these updates.

### Proposed Solution

Extend the existing `CrossWorldChannel` and message infrastructure to:

1. Forward `DATABASE_LIST_MESSAGE` from background worker to DevTools panel for real-time database list updates
2. Forward `LOG_ENTRY_MESSAGE` from content script (MAIN world) through the message chain: Content Script → Relay → Background → DevTools Panel
3. Include database name in log entries for filtering

### Success Criteria

- Database list on `/openedDB` route auto-refreshes when databases are opened/closed
- Log page (`/openedDB/:dbname/logs`) displays real-time log entries with database identification
- Log entries include database name for filtering: `{ database: string, level: string, message: any }`
- No polling required - pure event-driven architecture

---

## 2) Functional Requirements

### FR-RT-001: Real-time Database List Updates

**Priority**: P1 (Must Have)

The DevTools panel SHALL receive real-time updates when the database list changes for the inspected tab.

**Requirements**:

1. Content script sends `DATABASE_LIST_MESSAGE` when databases are opened/closed (already implemented)
2. Background worker forwards `DATABASE_LIST_MESSAGE` to DevTools panel via `chrome.runtime.sendMessage`
3. DevTools panel subscribes to `chrome.runtime.onMessage` for database list updates
4. DevTools panel updates local state when database list message is received
5. OpenedDBList component refetches or updates its database list when message received

**Acceptance Criteria**:

- When user opens a database in the page, the `/openedDB` list updates automatically
- When user closes a database in the page, the `/openedDB` list updates automatically
- No manual refresh button click required
- Works across all frames (top-level and iframes)

### FR-RT-002: Log Event Forwarding with Database Identification

**Priority**: P1 (Must Have)

The content script SHALL subscribe to `db.onLog()` events and forward them to the DevTools panel with database identification.

**Requirements**:

1. Content script (MAIN world) subscribes to `db.onLog()` for all opened databases
2. Log entries are wrapped with database name: `{ database: string, level: string, message: any }`
3. Content script forwards enriched log entries via `CrossWorldChannel.send(LOG_ENTRY_MESSAGE, enrichedEntry)`
4. Relay script (ISOLATED world) forwards to background worker
5. Background worker forwards to DevTools panel
6. DevTools panel filters and displays logs based on current route `:dbname`

**Acceptance Criteria**:

- Log entries include `database` field identifying which database generated the log
- Log page (`/openedDB/:dbname/logs`) only displays logs for the specified database
- Multiple database logs are streamed concurrently to the DevTools panel
- Log filtering by level (all/info/debug/error) still works with enriched entries

### FR-RT-003: Subscription Management per Database

**Priority**: P1 (Must Have)

The content script SHALL manage log subscriptions per database and cleanup when databases are closed.

**Requirements**:

1. Content script tracks active log subscriptions per database
2. When database is opened, subscribe to its logs
3. When database is closed, unsubscribe from its logs
4. Unsubscribed databases stop sending log entries to DevTools panel

**Acceptance Criteria**:

- Opening a database starts log streaming for that database
- Closing a database stops log streaming for that database
- No memory leaks from dangling subscriptions

### FR-RT-004: Message Protocol Extensions

**Priority**: P1 (Must Have)

The message protocol SHALL support DevTools panel as a message recipient.

**Requirements**:

1. Add `DEVTOOLS_PANEL` as a valid message recipient in the protocol
2. Background worker distinguishes between DevTools panel messages and content script messages
3. Message sender identification includes tab ID and frame ID

**Acceptance Criteria**:

- DevTools panel receives messages intended for it
- Background worker can route messages to specific DevTools panel instances
- Multiple DevTools panels (for different tabs) receive correct messages

---

## 3) Non-Functional Requirements

### NFR-RT-001: Performance

- Message forwarding SHALL add < 10ms latency to log entries
- Database list updates SHALL propagate within 100ms of database open/close
- No polling - pure event-driven architecture

### NFR-RT-002: Reliability

- Message delivery SHALL be best-effort (lost messages acceptable for logs)
- Database list state SHALL be eventually consistent
- System SHALL recover from DevTools panel closure/reopening

### NFR-RT-003: Maintainability

- Reuse existing `CrossWorldChannel` abstraction
- Follow existing message protocol patterns
- Minimal changes to existing codebase

### NFR-RT-004: Compatibility

- Chrome DevTools API constraints (panel messaging limitations)
- Compatible with existing dual-world content script architecture
- No breaking changes to existing APIs

---

## 4) Technical Context

### Existing Architecture

```
Page (web-sqlite-js)
  ↓
Content Script (MAIN world) - monitors window.__web_sqlite
  ↓ (window.postMessage)
Content Script (ISOLATED world/relay) - forwards via CrossWorldChannel
  ↓ (chrome.runtime.sendMessage)
Background Worker - tracks databaseMap per tab
  ↓ (chrome.runtime.sendMessage)
DevTools Panel - NOT YET RECEIVING MESSAGES
```

### Proposed Changes

1. **Background Worker → DevTools Panel**: Add message forwarding for database list updates
2. **Content Script → DevTools Panel**: Add log streaming with database identification
3. **DevTools Panel**: Add chrome.runtime.onMessage listener for real-time updates

### API Analysis (web-sqlite-js)

From `dev-tool-README.md`:

- `window.__web_sqlite.databases[dbname].db.onLog(callback)` - Subscribe to log events
- `window.__web_sqlite.onDatabaseChange(callback)` - Subscribe to database open/close events

### Message Types (Existing)

```typescript
DATABASE_LIST_MESSAGE = "database-list";
ICON_STATE_MESSAGE = "icon-state";
LOG_ENTRY_MESSAGE = "LOG_ENTRY";
```

---

## 5) Design Considerations

### Message Flow Architecture

#### Database List Updates

```
Page: db.openDB("test.sqlite3")
  ↓
Content Script: WebSqliteMonitor detects change
  ↓
CrossWorldChannel.send(DATABASE_LIST_MESSAGE, { databases: ["test.sqlite3"] })
  ↓
Relay Script: chrome.runtime.sendMessage
  ↓
Background Worker: update databaseMap
  ↓ (NEW)
Background Worker: chrome.runtime.sendMessage to DevTools panel
  ↓
DevTools Panel: Update database list state
```

#### Log Streaming

```
Page: db.onLog(callback) fires
  ↓
Content Script: Subscribe to all db.onLog events
  ↓
Wrap entry: { database: "test.sqlite3", level: "info", message: {...} }
  ↓
CrossWorldChannel.send(LOG_ENTRY_MESSAGE, wrappedEntry)
  ↓
Relay Script: chrome.runtime.sendMessage
  ↓
Background Worker: Forward to DevTools panel
  ↓
DevTools Panel: Filter by current route :dbname, display
```

### State Management

- **DevTools Panel**: Add React state for real-time database list updates
- **Log Subscription**: Extend `useLogSubscription` hook to receive chrome.runtime.onMessage events
- **Filtering**: Filter logs by `entry.database === params.dbname`

### Edge Cases

1. **DevTools panel closed**: Messages should be queued or discarded (best-effort)
2. **Multiple DevTools panels**: Each panel receives messages for its tab only
3. **Rapid database open/close**: Debounce or handle race conditions
4. **Large log volumes**: Ring buffer limits (500 entries) already implemented

---

## 6) Dependencies

### Internal Dependencies

- **F-017**: Dual-world content script architecture (CrossWorldChannel, WebSqliteMonitor) - COMPLETE
- **F-009**: Log tab UI component - COMPLETE
- **F-008**: OpenedDBList component - COMPLETE
- **F-001**: Service layer (databaseService) - COMPLETE

### External Dependencies

- **Chrome Extension API**: chrome.runtime.sendMessage, chrome.runtime.onMessage
- **web-sqlite-js**: window.\_\_web_sqlite API (db.onLog, onDatabaseChange)

### Blocked By

- None (all dependencies met)

### Blocks

- **F-019**: Real-time query result updates (future feature)
- **F-020**: Real-time schema change notifications (future feature)

---

## 7: Risks and Mitigation

| Risk                                       | Impact | Likelihood | Mitigation                                    |
| ------------------------------------------ | ------ | ---------- | --------------------------------------------- |
| DevTools panel message delivery unreliable | High   | Medium     | Best-effort delivery, eventual consistency    |
| Message forwarding adds latency            | Medium | Low        | Direct forwarding, minimal processing         |
| Memory leaks from log subscriptions        | High   | Low        | Proper cleanup on database close              |
| Multiple panels receiving wrong messages   | High   | Low        | Tab-based routing in background worker        |
| Breaking existing functionality            | High   | Low        | Comprehensive testing, backward compatibility |

---

## 8) Open Questions

1. **Q**: Should DevTools panel acknowledge receipt of database list updates?
   **A**: No, best-effort delivery is acceptable. Panel can refetch on demand if needed.

2. **Q**: How to handle log streaming when DevTools panel is closed?
   **A**: Content script can pause forwarding when no active DevTools panel is detected.

3. **Q**: Should log streaming be enabled by default or opt-in?
   **A**: Enabled by default when log page is mounted, disabled when unmounted.

---

## 9) Success Metrics

- **Functional**: Database list updates automatically within 100ms of database open/close
- **Functional**: Log entries display in real-time with correct database filtering
- **Performance**: Message forwarding latency < 10ms (measured via console.timestamp)
- **Quality**: No memory leaks after 100 database open/close cycles
- **Quality**: No memory leaks after 1000 log entries streamed

---

## 10) Definition of Done

- [ ] DevTools panel receives DATABASE_LIST_MESSAGE from background worker
- [ ] OpenedDBList component updates state on message receipt
- [ ] Content script subscribes to db.onLog for all databases
- [ ] Log entries include database name field
- [ ] Log page filters entries by current route :dbname
- [ ] Subscription cleanup on database close
- [ ] No polling in DevTools panel (event-driven only)
- [ ] Integration testing: Database list auto-refreshes
- [ ] Integration testing: Logs stream in real-time
- [ ] Documentation updated: HLD dataflow, message types, module LLD
- [ ] ADR created for DevTools panel messaging pattern

---

## 11) Out of Scope

- Real-time query result updates (separate feature F-019)
- Real-time schema change notifications (separate feature F-020)
- Message persistence (logs are ephemeral, ring-buffer only)
- Cross-tab database monitoring (DevTools panel only sees inspected tab)
- Log entry buffering when DevTools panel closed (not required)

---

**Maintainer**: S1: Iteration Lead
**Status**: Discovery Complete - Ready for Feasibility Analysis (S2)
