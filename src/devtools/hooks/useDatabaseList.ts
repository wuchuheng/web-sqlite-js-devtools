/**
 * useDatabaseList Hook (F-018)
 *
 * @remarks
 * Real-time database list updates via chrome.runtime.onMessage.
 * Listens for DATABASE_LIST_MESSAGE from background worker.
 * Filters messages by tabId to ensure correct panel receives updates.
 */

import { useState, useEffect, useRef } from "react";
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
  const tabIdRef = useRef<number | null>(null);
  const initialFetchStartedRef = useRef(false);

  useEffect(() => {
    const resolveTabId = () => {
      const currentTabId = chrome.devtools?.inspectedWindow?.tabId;
      if (typeof currentTabId === "number" && currentTabId > 0) {
        tabIdRef.current = currentTabId;
        return true;
      }
      return false;
    };

    // Get current tab ID - may be undefined on initial load
    resolveTabId();

    /**
     * 1. Fetch initial database list on mount
     * 2. Set loading to false after fetch
     */
    const fetchInitialData = async () => {
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

    const startInitialFetch = () => {
      if (initialFetchStartedRef.current) {
        return;
      }

      if (!resolveTabId()) {
        return;
      }

      initialFetchStartedRef.current = true;
      void fetchInitialData();
    };

    // Small delay to ensure DevTools context is ready
    const timeoutId = setTimeout(startInitialFetch, 100);
    let tabIdPolls = 0;
    const maxTabIdPolls = 20;
    const tabIdPollId = setInterval(() => {
      tabIdPolls += 1;
      if (resolveTabId()) {
        startInitialFetch();
        clearInterval(tabIdPollId);
        return;
      }

      if (tabIdPolls >= maxTabIdPolls) {
        clearInterval(tabIdPollId);
        if (!tabIdRef.current) {
          console.warn(
            "[useDatabaseList] tabId not available after waiting; updates may be delayed",
          );
          setIsLoading(false);
        }
      }
    }, 50);

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

      if (msg?.type !== DATABASE_LIST_MESSAGE) {
        return;
      }

      if (!resolveTabId()) {
        return;
      }

      if (msg.tabId === tabIdRef.current) {
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
      clearInterval(tabIdPollId);
    };
  }, []);

  return { databases, isLoading };
};
