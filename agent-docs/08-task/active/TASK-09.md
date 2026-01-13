<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/08-task/active/task-micro-spec.md

OUTPUT MAP (write to)
agent-docs/08-task/active/TASK-09.md

NOTES
- Micro-Spec for TASK-09: Log Streaming & Ring Buffer
- Spec-first implementation per S8 Worker guidelines
- LogRingBuffer already implemented in TASK-05.3, service layer functions complete
- This task focuses on UI components and messaging integration
-->

# TASK-09: Log Streaming & Ring Buffer UI

## 0) Meta

- **Task ID**: TASK-09
- **Title**: Log Streaming & Ring Buffer UI
- **Priority**: P0 (Blocker)
- **Status**: In Progress
- **Dependencies**: TASK-03 (Content Script Proxy), TASK-05.3 (Log Streaming Functions)
- **Maps to**: FR-026, FR-029, FR-030, ADR-0004, ADR-0005
- **Created**: 2026-01-13

## 1) Summary

Implement log viewer UI components that display real-time log entries from web-sqlite-js. The LogRingBuffer is already implemented in TASK-05.3, and service layer functions (subscribeLogs/unsubscribeLogs) are complete. This task focuses on:

1. LogList component with color-coded log levels (info/debug/error)
2. LogFilter component for filtering by level and field type
3. Message listener in DevTools panel to receive log entries
4. Route integration for Log tab

## 2) Boundary

**Files to create:**

- `src/devtools/components/LogTab/LogList.tsx` - Log entries list with color coding
- `src/devtools/components/LogTab/LogFilter.tsx` - Filter controls
- `src/devtools/components/LogTab/LogView.tsx` - Main log view integrating filter + list
- `src/devtools/hooks/useLogSubscription.ts` - Hook for managing log subscriptions

**Files to modify:**

- `src/devtools/DevTools.tsx` - Add log route and message listener
- `src/devtools/components/Sidebar/Sidebar.tsx` - Add Log link (optional, can defer)

**Files to read (context):**

- `src/contentScript/subscriptions/LogRingBuffer.ts` - Ring buffer implementation (already complete)
- `src/devtools/services/databaseService.ts` - subscribeLogs/unsubscribeLogs functions

**Files NOT to modify:**

- No changes to LogRingBuffer (already complete in TASK-05.3)
- No changes to service layer (already complete)

## 3) Upstream Traceability

### HLD References

- DevTools Panel Architecture: `agent-docs/03-architecture/01-hld.md` (Section 6)
- Message Protocol: `agent-docs/04-adr/0004-message-protocol.md`
- Ring Buffer Pattern: `agent-docs/04-adr/0005-log-ring-buffer.md`

### API Contract References

- Service Layer API: `agent-docs/05-design/01-contracts/01-api.md` (Log Streaming)
- Message Types: `agent-docs/05-design/02-schema/01-message-types.md`

### Module LLD References

- DevTools Panel: `agent-docs/05-design/03-modules/devtools-panel.md`

### Functional Requirements

- **FR-026**: Real-time log streaming from web-sqlite-js
- **FR-029**: Color-coded log levels (info/debug/error)
- **FR-030**: Filter logs by level and field type

## 4) Functional Design

### Log Entry Data Flow

```
web-sqlite-js db.onLog()
       ↓
Content Script: LogRingBuffer (500 entry circular buffer)
       ↓
chrome.runtime.sendMessage (batch every 100ms or 50 entries)
       ↓
DevTools Panel: useLogSubscription hook
       ↓
LogList: Display entries
```

### Message Protocol

The content script sends log entries via `chrome.runtime.sendMessage`:

```typescript
// Message sent from content script
{
  type: "LOG_ENTRY",
  subscriptionId: string,
  entry: {
    level: "info" | "debug" | "error",
    data: unknown,  // Can be { type: "sql", sql: string } or { type: "action", ... }
    timestamp: number
  }
}
```

### Component 1: useLogSubscription Hook

**Purpose**: Manage log subscription and receive entries via chrome.runtime.onMessage

**Signature:**

```typescript
interface UseLogSubscriptionResult {
  entries: BufferedLogEntry[];
  isSubscribed: boolean;
  error: string | null;
  subscribe: (dbname: string) => Promise<void>;
  unsubscribe: () => Promise<void>;
}

export const useLogSubscription = (): UseLogSubscriptionResult
```

**Algorithm:**

1. **State Management**:
   - `entries`: Array of log entries (limited to 500 for display)
   - `subscriptionId`: Current subscription ID
   - `isSubscribed`: Boolean flag

2. **Subscribe Function**:
   - Call `databaseService.subscribeLogs(dbname, callback)`
   - The callback is NOT used (entries come via chrome.runtime.onMessage)
   - Store subscription ID for cleanup

3. **Message Listener**:
   - Listen for `LOG_ENTRY` messages from content script
   - Filter by subscriptionId
   - Add entries to state (limit to 500, oldest first)

4. **Unsubscribe Function**:
   - Call `databaseService.unsubscribeLogs(subscriptionId)`
   - Clear subscription ID
   - Clear entries

5. **Cleanup on Unmount**:
   - Unsubscribe if active

```typescript
export const useLogSubscription = () => {
  const [entries, setEntries] = useState<BufferedLogEntry[]>([]);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to logs
  const subscribe = async (dbname: string) => {
    const result = await databaseService.subscribeLogs(dbname, () => {});
    if (result.success) {
      setSubscriptionId(result.data?.subscriptionId ?? null);
      setEntries([]);
      setError(null);
    } else {
      setError(result.error ?? "Failed to subscribe");
    }
  };

  // Unsubscribe from logs
  const unsubscribe = async () => {
    if (subscriptionId) {
      await databaseService.unsubscribeLogs(subscriptionId);
      setSubscriptionId(null);
      setEntries([]);
    }
  };

  // Listen for log entries from content script
  useEffect(() => {
    const listener = (message: unknown) => {
      const msg = message as {
        type?: string;
        subscriptionId?: string;
        entry?: BufferedLogEntry;
      };
      if (
        msg.type === "LOG_ENTRY"
        && msg.subscriptionId === subscriptionId
        && msg.entry
      ) {
        setEntries((prev) => {
          const newEntries = [...prev, msg.entry];
          // Keep only last 500 entries
          return newEntries.slice(-500);
        });
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [subscriptionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionId) {
        unsubscribe();
      }
    };
  }, [subscriptionId]);

  return {
    entries,
    isSubscribed: !!subscriptionId,
    error,
    subscribe,
    unsubscribe,
  };
};
```

### Component 2: LogList.tsx

**Purpose**: Display log entries with color coding

**Props Interface:**

```typescript
interface LogListProps {
  entries: BufferedLogEntry[];
  levelFilter?: "all" | "info" | "debug" | "error";
}
```

**Styling:**

- Info: blue text
- Debug: gray text
- Error: red text with light red background

```tsx
<div className="font-mono text-xs overflow-auto flex-1">
  {entries.length === 0 ? (
    <div className="p-4 text-gray-500">
      No logs yet. Subscribe to a database to see logs.
    </div>
  ) : (
    entries.map((entry, index) => (
      <div
        key={index}
        className={`
          border-b border-gray-100 px-4 py-2
          ${entry.level === "error" ? "bg-red-50" : ""}
        `}
      >
        <span
          className={`
          ${entry.level === "info" ? "text-blue-600" : ""}
          ${entry.level === "debug" ? "text-gray-500" : ""}
          ${entry.level === "error" ? "text-red-600 font-semibold" : ""}
        `}
        >
          [{entry.level.toUpperCase()}]
        </span>
        <span className="text-gray-400 ml-2">
          {new Date(entry.timestamp).toLocaleTimeString()}
        </span>
        <pre className="mt-1 whitespace-pre-wrap break-all">
          {JSON.stringify(entry.data, null, 2)}
        </pre>
      </div>
    ))
  )}
</div>
```

### Component 3: LogFilter.tsx

**Purpose**: Filter controls for log level

**Props Interface:**

```typescript
interface LogFilterProps {
  levelFilter: "all" | "info" | "debug" | "error";
  onLevelChange: (level: "all" | "info" | "debug" | "error") => void;
  entryCount: number;
  filteredCount: number;
}
```

```tsx
<div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200">
  <label className="text-sm font-medium text-gray-700">Filter:</label>

  <div className="flex gap-2">
    {(["all", "info", "debug", "error"] as const).map((level) => (
      <button
        key={level}
        type="button"
        onClick={() => onLevelChange(level)}
        className={`
          px-3 py-1 text-sm rounded
          ${
            levelFilter === level
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
        `}
      >
        {level === "all"
          ? "All"
          : level.charAt(0).toUpperCase() + level.slice(1)}
      </button>
    ))}
  </div>

  <div className="ml-auto text-sm text-gray-500">
    Showing {filteredCount} of {entryCount} entries
  </div>
</div>
```

### Component 4: LogView.tsx

**Purpose**: Main log view integrating filter and list

**Props Interface:**

```typescript
interface LogViewProps {
  dbname: string;
}
```

```tsx
export const LogView = ({ dbname }: LogViewProps) => {
  const { entries, isSubscribed, error, subscribe, unsubscribe } =
    useLogSubscription();
  const [levelFilter, setLevelFilter] = useState<
    "all" | "info" | "debug" | "error"
  >("all");

  // Auto-subscribe on mount
  useEffect(() => {
    subscribe(dbname);
    return () => {
      unsubscribe();
    };
  }, [dbname]);

  const filteredEntries = entries.filter(
    (entry) => levelFilter === "all" || entry.level === levelFilter,
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700">Logs: {dbname}</h2>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <LogFilter
        levelFilter={levelFilter}
        onLevelChange={setLevelFilter}
        entryCount={entries.length}
        filteredCount={filteredEntries.length}
      />

      <LogList entries={filteredEntries} levelFilter={levelFilter} />
    </div>
  );
};
```

### Integration: DevTools.tsx

**Add log route:**

```tsx
import { LogView } from "./components/LogTab/LogView";

// In Routes section:
<Route path="/logs/:dbname" element={<LogView />} />;
```

**Update Sidebar to include Log link** (optional, can defer to TASK-11):

When a database is selected, show a "Logs" link in the sidebar that navigates to `/logs/{dbname}`.

## 5) Implementation Notes

### Message Listener Setup

The content script already sends messages via `chrome.runtime.sendMessage` in the `subscribeLogs` function. The DevTools panel needs to listen for these messages:

```typescript
chrome.runtime.onMessage.addListener((message) => {
  if (
    message.type === "LOG_ENTRY"
    && message.subscriptionId === currentSubscriptionId
  ) {
    // Add entry to state
  }
});
```

### Subscription Cleanup

Important to unsubscribe when component unmounts or database changes to prevent memory leaks:

```typescript
useEffect(() => {
  return () => {
    if (subscriptionId) {
      databaseService.unsubscribeLogs(subscriptionId);
    }
  };
}, [subscriptionId]);
```

### Entry Limit

Keep only the last 500 entries in display state to match the ring buffer size:

```typescript
setEntries((prev) => {
  const newEntries = [...prev, newEntry];
  return newEntries.slice(-500);
});
```

### Timestamp Formatting

Convert timestamp to readable format:

```typescript
new Date(entry.timestamp).toLocaleTimeString();
// Output: "2:30:45 PM"
```

### Data Display

Log entry data can be any shape from web-sqlite-js. Use JSON.stringify for safe display:

```tsx
<pre>{JSON.stringify(entry.data, null, 2)}</pre>
```

## 6) Definition of Done

### Components Created

- [ ] `useLogSubscription.ts` hook - Manage subscription and receive entries
- [ ] `LogList.tsx` - Display log entries with color coding
- [ ] `LogFilter.tsx` - Filter controls
- [ ] `LogView.tsx` - Main log view component

### Integration

- [ ] Log route added to DevTools.tsx
- [ ] Message listener setup in useLogSubscription hook
- [ ] Sidebar updates to show Logs link (optional)

### Functionality

- [ ] Subscribe to logs for a database
- [ ] Receive log entries in real-time
- [ ] Display entries with color coding (info=blue, debug=gray, error=red)
- [ ] Filter by level
- [ ] Unsubscribe on unmount/database change
- [ ] Entry limit (500) enforced

### Code Quality

- [ ] TypeScript compiles without errors
- [ ] Tailwind CSS classes used consistently
- [ ] Components follow existing patterns

## 7) Testing Notes

### Manual Testing

1. **Subscription:**
   - Navigate to `/logs/{dbname}` for a database
   - Verify auto-subscription happens
   - Trigger some queries in the inspected page
   - Verify logs appear

2. **Real-time Updates:**
   - Keep log tab open
   - Run queries in inspected page
   - Verify new entries appear without refresh

3. **Filtering:**
   - Click level filter buttons
   - Verify only matching entries show
   - Check entry count updates

4. **Cleanup:**
   - Navigate away from log tab
   - Verify unsubscribe is called
   - Check no memory leaks (repeat subscription/unsubscribe)

### Edge Cases

- Empty log list (no entries yet)
- Rapid entries (test buffer overflow handling)
- Database with no log activity
- Subscription failure (error handling)

## 8) References

- Service Layer API: `agent-docs/05-design/01-contracts/01-api.md`
- Module LLD (DevTools Panel): `agent-docs/05-design/03-modules/devtools-panel.md`
- ADR-0004: Message Protocol
- ADR-0005: Log Ring Buffer
