/**
 * useLogStreaming Hook (F-018)
 *
 * @remarks
 * Real-time log streaming via chrome.runtime.onMessage.
 * Listens for LOG_ENTRY_MESSAGE from background worker.
 * Filters by tabId and database name for correct panel.
 */

import { useState, useEffect } from "react";
import { LOG_ENTRY_MESSAGE } from "@/shared/messages";

/**
 * Enriched log entry with database identification (F-018)
 */
export interface LogEntry {
  /** Database name that generated this log */
  database: string;
  /** Log level */
  level: "info" | "debug" | "error" | "warn";
  /** Log message content */
  message: unknown;
  /** Unix timestamp in milliseconds */
  timestamp: number;
}

/**
 * Hook return type
 */
interface UseLogStreamingReturn {
  /** List of log entries for the specified database */
  logs: LogEntry[];
  /** Loading state (true until first message received) */
  isLoading: boolean;
}

/**
 * Real-time log streaming for a specific database (F-018)
 *
 * @param dbname - Database name to filter logs for
 * @returns Log entries and loading state
 *
 * @remarks
 * 1. Listens for LOG_ENTRY_MESSAGE from background worker
 * 2. Filters by tabId to ensure message is for current tab
 * 3. Filters by database name to show only relevant logs
 * 4. Appends matching entries to logs state
 * 5. Clears logs when dbname changes
 *
 * @example
 * ```tsx
 * function LogView({ dbname }: { dbname: string }) {
 *   const { logs, isLoading } = useLogStreaming(dbname);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   return <LogList logs={logs} />;
 * }
 * ```
 */
export const useLogStreaming = (dbname: string): UseLogStreamingReturn => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current tab ID
    const tabId = chrome.devtools.inspectedWindow.tabId;

    // Clear logs when dbname changes
    setLogs([]);
    setIsLoading(true);

    /**
     * 1. Listen for LOG_ENTRY_MESSAGE from background worker
     * 2. Filter by tabId to ensure message is for current tab
     * 3. Filter by database name
     * 4. Append matching entry to logs state
     */
    const messageListener = (message: unknown) => {
      const msg = message as
        | {
            type: typeof LOG_ENTRY_MESSAGE;
            tabId: number;
            database: string;
            level: string;
            message: unknown;
            timestamp: number;
          }
        | undefined;

      if (
        msg?.type === LOG_ENTRY_MESSAGE
        && msg.tabId === tabId
        && msg.database === dbname
      ) {
        setLogs((prev) => [
          ...prev,
          {
            database: msg.database,
            level: msg.level as LogEntry["level"],
            message: msg.message,
            timestamp: msg.timestamp,
          },
        ]);
        setIsLoading(false);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    /**
     * Cleanup: Remove message listener on unmount or dbname change
     */
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [dbname]);

  return { logs, isLoading };
};
