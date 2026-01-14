import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useLogSubscription } from "@/devtools/hooks/useLogSubscription";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";
import { LogList } from "./LogList";
import { LogFilter } from "./LogFilter";

/**
 * Log view component for /logs/:dbname route
 *
 * @remarks
 * Displays real-time log entries for a database with filtering by level.
 * Auto-subscribes on mount and unsubscribes on unmount.
 *
 * @returns JSX.Element - Log view layout
 */
export const LogView = () => {
  const params = useParams<{ dbname: string }>();
  const [levelFilter, setLevelFilter] = useState<
    "all" | "info" | "debug" | "error"
  >("all");

  const { entries, isSubscribed, error, subscribe, unsubscribe } =
    useLogSubscription();

  /**
   * Decode dbname from route params
   */
  const dbname = useMemo(() => {
    const rawName = params.dbname || "";
    return decodeDatabaseName(rawName);
  }, [params.dbname]);

  /**
   * Auto-subscribe on mount, unsubscribe on unmount
   */
  useEffect(() => {
    if (dbname) {
      subscribe(dbname);
    }

    return () => {
      unsubscribe();
    };
  }, [dbname, subscribe, unsubscribe]);

  /**
   * Handle level filter change
   */
  const handleLevelChange = useMemo(
    () => (level: "all" | "info" | "debug" | "error") => {
      setLevelFilter(level);
    },
    [],
  );

  /**
   * Filter entries by level
   */
  const filteredEntries = useMemo(
    () =>
      levelFilter === "all"
        ? entries
        : entries.filter((entry) => entry.level === levelFilter),
    [entries, levelFilter],
  );

  if (!dbname) {
    return (
      <div className="p-4 text-sm text-gray-500">No database specified.</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-700">Logs</h2>
          <span className="text-gray-400">/</span>
          <span className="text-blue-600">{dbname}</span>
          {isSubscribed && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Live
            </span>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm border-b border-red-200">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => subscribe(dbname)}
            className="ml-3 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter */}
      <LogFilter
        levelFilter={levelFilter}
        onLevelChange={handleLevelChange}
        entryCount={entries.length}
        filteredCount={filteredEntries.length}
      />

      {/* Log list */}
      <LogList entries={entries} levelFilter={levelFilter} />
    </div>
  );
};
