import { useCallback, useEffect, useState } from "react";

/**
 * Query history entry stored in chrome.storage.local
 */
export interface QueryHistoryEntry {
  /** SQL query string */
  sql: string;
  /** Database name (encoded) */
  dbname: string;
  /** ISO timestamp when query was executed */
  timestamp: string;
  /** Number of times this query was executed */
  executionCount: number;
}

/**
 * Result type for useQueryHistory hook
 */
interface UseQueryHistoryResult {
  /** Ordered list of history entries (newest first) */
  history: QueryHistoryEntry[];
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Add query to history */
  addQuery: (_sql: string, dbname: string) => Promise<void>;
  /** Remove specific entry from history */
  removeQuery: (timestamp: string) => Promise<void>;
  /** Clear all history for current database */
  clearHistory: () => Promise<void>;
}

/**
 * Storage key for query history in chrome.storage.local
 */
const QUERY_HISTORY_KEY = "query_history";

/**
 * Storage structure: Map of dbname to QueryHistoryEntry[]
 */
type QueryHistoryStorage = Record<string, QueryHistoryEntry[]>;

/**
 * 1. Get existing history from chrome.storage.local
 * 2. Parse and return history array for specific database
 * 3. Return empty array if no history exists
 *
 * @param dbname - Encoded database name
 * @returns Promise<QueryHistoryEntry[]> - Sorted newest first
 */
async function getHistoryForDb(dbname: string): Promise<QueryHistoryEntry[]> {
  const result = await chrome.storage.local.get(QUERY_HISTORY_KEY);
  const storage: QueryHistoryStorage = result[QUERY_HISTORY_KEY] || {};
  return storage[dbname] || [];
}

/**
 * 1. Fetch existing history for database
 * 2. Check for consecutive duplicate (last entry matches SQL)
 * 3. If duplicate, increment executionCount and move to top
 * 4. Otherwise, prepend new entry with count=1
 * 5. Enforce 50 entry limit (slice from end)
 * 6. Persist updated storage to chrome.storage.local
 *
 * @param entry - Query history entry to save
 * @returns Promise<void>
 */
async function saveHistoryEntry(entry: QueryHistoryEntry): Promise<void> {
  const { sql, dbname, timestamp } = entry;

  // 1. Get existing history for database
  const existing = await getHistoryForDb(dbname);

  // 2. Check for consecutive duplicate (last entry)
  const lastEntry = existing[0];
  if (lastEntry && lastEntry.sql === sql) {
    // 3. Increment count and update timestamp
    const updated: QueryHistoryEntry = {
      ...lastEntry,
      timestamp,
      executionCount: lastEntry.executionCount + 1,
    };

    const updatedHistory = [updated, ...existing.slice(1)];

    await chrome.storage.local.set({
      [QUERY_HISTORY_KEY]: {
        [dbname]: updatedHistory,
      },
    });
    return;
  }

  // 4. Prepend new entry
  const newHistory = [entry, ...existing];

  // 5. Keep only last 50 entries
  const limitedHistory = newHistory.slice(0, 50);

  // 6. Persist to storage
  const result = await chrome.storage.local.get(QUERY_HISTORY_KEY);
  const storage: QueryHistoryStorage = result[QUERY_HISTORY_KEY] || {};

  await chrome.storage.local.set({
    [QUERY_HISTORY_KEY]: {
      ...storage,
      [dbname]: limitedHistory,
    },
  });
}

/**
 * 1. Get existing history for database
 * 2. Filter out entry with matching timestamp
 * 3. Persist filtered array to chrome.storage.local
 *
 * @param dbname - Database name
 * @param timestamp - Entry timestamp (unique key)
 * @returns Promise<void>
 */
async function removeHistoryEntry(
  _dbname: string,
  timestamp: string,
): Promise<void> {
  const existing = await getHistoryForDb(dbname);

  // 2. Filter out entry
  const filtered = existing.filter((entry) => entry.timestamp !== timestamp);

  // 3. Persist to storage
  const result = await chrome.storage.local.get(QUERY_HISTORY_KEY);
  const storage: QueryHistoryStorage = result[QUERY_HISTORY_KEY] || {};

  if (filtered.length === 0) {
    // Remove database key if empty
    delete storage[dbname];
  } else {
    storage[dbname] = filtered;
  }

  await chrome.storage.local.set({
    [QUERY_HISTORY_KEY]: storage,
  });
}

/**
 * 1. Get existing storage from chrome.storage.local
 * 2. Delete database key from storage
 * 3. Persist updated storage
 *
 * @param dbname - Database name to clear
 * @returns Promise<void>
 */
async function clearHistoryForDb(dbname: string): Promise<void> {
  const result = await chrome.storage.local.get(QUERY_HISTORY_KEY);
  const storage: QueryHistoryStorage = result[QUERY_HISTORY_KEY] || {};

  // 2. Delete database key
  delete storage[dbname];

  // 3. Persist updated storage
  await chrome.storage.local.set({
    [QUERY_HISTORY_KEY]: storage,
  });
}

/**
 * Format timestamp as relative time string
 *
 * @param isoTimestamp - ISO 8601 timestamp
 * @returns Relative time string (e.g., "2 min ago", "1 hour ago")
 */
export function formatRelativeTime(isoTimestamp: string): string {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

/**
 * Hook for managing query history persistence
 *
 * @remarks
 * - Loads history for specific database on mount
 * - Saves queries to chrome.storage.local
 * - Listens for storage changes (multi-panel sync)
 * - Auto-loads history when database changes
 *
 * @param dbname - Encoded database name
 * @returns History state and control functions
 */
export const useQueryHistory = (dbname: string): UseQueryHistoryResult => {
  const [history, setHistory] = useState<QueryHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load history for database from storage
   */
  const loadHistory = useCallback(async () => {
    if (!dbname) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const entries = await getHistoryForDb(dbname);
      setHistory(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [dbname]);

  /**
   * Add query to history
   */
  const addQuery = useCallback(
    async (_sql: string, dbName: string) => {
      // Skip empty or whitespace-only queries
      const trimmed = sql.trim();
      if (!trimmed) {
        return;
      }

      setError(null);

      try {
        const entry: QueryHistoryEntry = {
          sql: trimmed,
          dbname: dbName,
          timestamp: new Date().toISOString(),
          executionCount: 1,
        };

        await saveHistoryEntry(entry);

        // Reload history if for current database
        if (dbName === dbname) {
          await loadHistory();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [dbname, loadHistory],
  );

  /**
   * Remove specific entry from history
   */
  const removeQuery = useCallback(
    async (timestamp: string) => {
      setError(null);

      try {
        await removeHistoryEntry(dbname, timestamp);
        await loadHistory();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [dbname, loadHistory],
  );

  /**
   * Clear all history for current database
   */
  const clearHistory = useCallback(async () => {
    setError(null);

    try {
      await clearHistoryForDb(dbname);
      setHistory([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [dbname]);

  /**
   * Load history on mount and when database changes
   */
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /**
   * Listen for storage changes from other panels
   */
  useEffect(() => {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === "local" && changes[QUERY_HISTORY_KEY]) {
        loadHistory();
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [loadHistory]);

  return {
    history,
    isLoading,
    error,
    addQuery,
    removeQuery,
    clearHistory,
  };
};
