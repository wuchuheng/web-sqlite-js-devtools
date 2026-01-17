import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useLogStreaming } from "@/devtools/hooks/useLogStreaming";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";
import { LogList } from "./LogList";
import { LogFilter } from "./LogFilter";

/**
 * Log view component for /openedDB/:dbname/logs route (F-018: updated to use useLogStreaming)
 *
 * @remarks
 * Displays real-time log entries for a database with filtering by level.
 * Uses chrome.runtime.onMessage for automatic log streaming.
 * Auto-scrolls to bottom when bottom guard is visible.
 *
 * @returns JSX.Element - Log view layout
 */
export const LogView = () => {
  const params = useParams<{ dbname: string }>();
  const [levelFilter, setLevelFilter] = useState<
    "all" | "info" | "debug" | "error" | "warn"
  >("all");

  // Ref for the scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Ref for the bottom guard element
  const bottomGuardRef = useRef<HTMLDivElement>(null);
  // State to track if bottom guard is visible
  const [isBottomGuardVisible, setIsBottomGuardVisible] = useState(true);

  /**
   * Decode dbname from route params
   */
  const dbname = useMemo(() => {
    const rawName = params.dbname || "";
    return decodeDatabaseName(rawName);
  }, [params.dbname]);

  /**
   * Real-time log streaming via chrome.runtime.onMessage (F-018)
   */
  const { logs, isLoading } = useLogStreaming(dbname || "");

  /**
   * Handle level filter change
   */
  const handleLevelChange = useMemo(
    () => (level: "all" | "info" | "debug" | "error" | "warn") => {
      setLevelFilter(level);
    },
    [],
  );

  /**
   * Intersection Observer to detect when bottom guard is visible
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsBottomGuardVisible(entry.isIntersecting);
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.1,
      },
    );

    if (bottomGuardRef.current) {
      observer.observe(bottomGuardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  /**
   * Auto-scroll to bottom when new logs arrive and bottom guard is visible
   */
  useEffect(() => {
    if (isBottomGuardVisible && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [logs.length, isBottomGuardVisible]);

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
          {!isLoading && (
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

      {/* Filter */}
      <LogFilter
        levelFilter={levelFilter}
        onLevelChange={handleLevelChange}
        entryCount={logs.length}
        filteredCount={
          levelFilter === "all"
            ? logs.length
            : logs.filter((entry) => entry.level === levelFilter).length
        }
      />

      {/* Log list with scroll container */}
      <div
        ref={scrollContainerRef}
        className="font-mono text-xs overflow-auto flex-1"
      >
        <LogList entries={logs} levelFilter={levelFilter} />
        {/* Bottom guard for auto-scroll detection */}
        <div ref={bottomGuardRef} className="h-1" />
      </div>
    </div>
  );
};
