/**
 * useDatabaseList Hook (F-018)
 *
 * @remarks
 * Real-time database list updates via chrome.runtime.onMessage.
 * Listens for DATABASE_LIST_MESSAGE from background worker.
 * Filters messages by tabId to ensure correct panel receives updates.
 */

import { useState, useEffect } from "react";
import { DATABASE_LIST_MESSAGE } from "@/shared/messages";
import { databaseService } from "@/devtools/services/databaseService";

/**
 * Hook return type
 */
interface UseDatabaseListReturn {
  /** List of database names */
  databases: string[];
  /** Loading state (true until first message received) */
  isLoading: boolean;
}

/**
 * Real-time database list updates (F-018)
 *
 * @remarks
 * 1. Fetches initial database list on mount
 * 2. Listens for DATABASE_LIST_MESSAGE from background worker
 * 3. Filters by tabId to ensure messages are for current tab
 * 4. Updates databases state when messages arrive
 *
 * @returns Database list and loading state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { databases, isLoading } = useDatabaseList();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   return <DatabaseList databases={databases} />;
 * }
 * ```
 */
export const useDatabaseList = (): UseDatabaseListReturn => {
  const [databases, setDatabases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current tab ID - may be undefined on initial load
    let tabId = chrome.devtools.inspectedWindow.tabId;

    /**
     * 1. Fetch initial database list on mount
     * 2. Set loading to false after fetch
     */
    const fetchInitialData = async () => {
      // Wait for tabId to be available before fetching
      if (!tabId) {
        tabId = chrome.devtools.inspectedWindow.tabId;
        if (!tabId) {
          console.warn(
            "[useDatabaseList] tabId not available yet, skipping initial fetch",
          );
          setIsLoading(false);
          return;
        }
      }

      try {
        const response = await databaseService.getDatabases();
        if (response.success && response.data) {
          setDatabases(response.data.map((db) => db.name));
        }
      } catch (error) {
        console.error(
          "[useDatabaseList] Failed to fetch initial databases:",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure DevTools context is ready
    const timeoutId = setTimeout(fetchInitialData, 100);

    /**
     * 1. Listen for DATABASE_LIST_MESSAGE from background worker
     * 2. Filter by tabId to ensure message is for current tab
     * 3. Update databases state when message received
     */
    const messageListener = (message: unknown) => {
      const msg = message as
        | {
            type: typeof DATABASE_LIST_MESSAGE;
            tabId: number;
            databases: string[];
          }
        | undefined;

      if (msg?.type === DATABASE_LIST_MESSAGE && msg.tabId === tabId) {
        setDatabases(msg.databases);
        setIsLoading(false);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    /**
     * Cleanup: Remove message listener and timeout on unmount
     */
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      clearTimeout(timeoutId);
    };
  }, []);

  return { databases, isLoading };
};
