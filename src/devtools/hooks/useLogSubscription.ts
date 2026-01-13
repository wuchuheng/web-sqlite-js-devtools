import { useCallback, useEffect, useState } from "react";
import { databaseService } from "@/devtools/services/databaseService";
import type { BufferedLogEntry } from "@/contentScript/subscriptions/LogRingBuffer";

/**
 * Log subscription hook result
 */
interface UseLogSubscriptionResult {
  entries: BufferedLogEntry[];
  isSubscribed: boolean;
  error: string | null;
  subscribe: (dbname: string) => Promise<void>;
  unsubscribe: () => Promise<void>;
}

/**
 * Message from content script containing log entry
 */
interface LogEntryMessage {
  type: "LOG_ENTRY";
  subscriptionId: string;
  entry: BufferedLogEntry;
}

/**
 * Hook for managing log subscriptions and receiving entries via chrome.runtime.onMessage
 *
 * @remarks
 * - Subscribes to logs using databaseService.subscribeLogs()
 * - Listens for LOG_ENTRY messages from content script
 * - Maintains entries state limited to 500 (matches ring buffer size)
 * - Auto-unsubscribes on unmount
 *
 * @returns Subscription state and control functions
 */
export const useLogSubscription = (): UseLogSubscriptionResult => {
  const [entries, setEntries] = useState<BufferedLogEntry[]>([]);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Subscribe to logs for a database
   */
  const subscribe = useCallback(
    async (dbname: string) => {
      try {
        // Unsubscribe from previous subscription if any
        if (subscriptionId) {
          await databaseService.unsubscribeLogs(subscriptionId);
        }

        const result = await databaseService.subscribeLogs(dbname, () => {
          // Callback is not used - entries come via chrome.runtime.onMessage
        });

        if (result.success && result.data) {
          setSubscriptionId(result.data.subscriptionId);
          setEntries([]);
          setError(null);
        } else {
          setError(result.error ?? "Failed to subscribe to logs");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [subscriptionId],
  );

  /**
   * Unsubscribe from logs
   */
  const unsubscribe = useCallback(async () => {
    if (subscriptionId) {
      try {
        await databaseService.unsubscribeLogs(subscriptionId);
        setSubscriptionId(null);
        setEntries([]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  }, [subscriptionId]);

  /**
   * Listen for log entries from content script
   */
  useEffect(() => {
    const listener = (message: unknown) => {
      const msg = message as Partial<LogEntryMessage>;

      // Type guard: ensure msg has all required properties
      if (
        msg.type === "LOG_ENTRY"
        && msg.subscriptionId === subscriptionId
        && msg.entry !== undefined
      ) {
        // At this point, msg.entry is guaranteed to be BufferedLogEntry
        const entry: BufferedLogEntry = msg.entry;
        setEntries((prev) => {
          const newEntries = [...prev, entry];
          // Keep only last 500 entries to match ring buffer size
          return newEntries.slice(-500);
        });
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, [subscriptionId]);

  /**
   * Cleanup on unmount - unsubscribe if active
   */
  useEffect(
    () => () => {
      if (subscriptionId) {
        // Fire and forget - we can't await in cleanup
        void databaseService.unsubscribeLogs(subscriptionId);
      }
    },
    [subscriptionId],
  );

  return {
    entries,
    isSubscribed: !!subscriptionId,
    error,
    subscribe,
    unsubscribe,
  };
};
