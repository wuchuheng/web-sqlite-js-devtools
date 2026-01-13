import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { EmptyState } from "./components/EmptyState/EmptyState";
import { DatabaseView } from "./components/TableTab/DatabaseView";
import { LogView } from "./components/LogTab/LogView";
import { useConnection } from "./hooks/useConnection";
import "./DevTools.css";

/**
 * Root DevTools component with routing
 * Uses HashRouter for Chrome extension context (per ADR-0002)
 *
 * @returns JSX.Element - DevTools component with sidebar and routed content
 */
export const DevTools = () => {
  /**
   * 1. Use connection hook for heartbeat and auto-reconnect
   * 2. Manages connection state: connected, connecting, reconnecting, disconnected
   * 3. Provides retry function for manual reconnection
   */
  const { status, error, retry } = useConnection();

  useEffect(() => {
    console.log("[Web Sqlite DevTools] Component mounted");
    console.log("[Web Sqlite DevTools] Current hash:", window.location.hash);

    // Log if web-sqlite-js API is available (for future debugging)
    if (typeof window !== "undefined") {
      // @ts-ignore - web-sqlite-js global
      const hasWebSqlite = typeof window.__web_sqlite !== "undefined";
      console.log(
        "[Web Sqlite DevTools] __web_sqlite API available:",
        hasWebSqlite,
      );
    }
  }, []);

  /**
   * 1. Render connection status indicator
   * 2. Shows loading spinner for connecting/reconnecting
   * 3. Shows error message with retry button for disconnected state
   */
  const renderConnectionStatus = () => {
    /**
     * 1. Connecting state: show loading indicator
     * 2. Reconnecting state: show loading with "Reconnecting..." text
     * 3. Disconnected state: show error with retry button
     */
    if (status === "connecting" || status === "reconnecting") {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span>
            {status === "connecting" ? "Connecting..." : "Reconnecting..."}
          </span>
        </div>
      );
    }

    if (status === "disconnected" && error) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm">
          <span>{error}</span>
          <button
            onClick={retry}
            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <HashRouter>
      {/* 1. Main container with flex layout */}
      {/* 2. Sidebar takes 20% width when expanded */}
      {/* 3. Main content takes remaining width */}
      <div className="devtools-panel flex">
        <Sidebar />

        <main className="flex-1 h-full overflow-auto flex flex-col text-left">
          {/* Connection status indicator */}
          {renderConnectionStatus()}

          <Routes>
            {/* 1. Default route - empty state with helpful instructions */}
            {/* 2. Implements FR-014 (empty state notice) */}
            {/* 3. Implements FR-042 (helpful instructions) */}
            <Route path="/" element={<EmptyState />} />

            {/* 1. Database view route */}
            {/* 2. Shows table list and placeholder content */}
            {/* 3. Table data view implemented in TASK-06 */}
            <Route path="/openedDB/:dbname" element={<DatabaseView />} />

            {/* 1. Log view route */}
            {/* 2. Shows real-time log entries for a database */}
            {/* 3. Log streaming implemented in TASK-09 */}
            <Route path="/logs/:dbname" element={<LogView />} />

            {/* 1. OPFS browser route (to be implemented in TASK-10) */}
            {/* 2. Placeholder for OPFS file tree */}
            {/* 3. Will show file browser with download functionality */}
            <Route
              path="/opfs"
              element={
                <div className="p-4">
                  <h2 className="text-lg font-semibold">OPFS Browser</h2>
                  <p className="text-sm text-gray-600">
                    Browse Origin Private File System
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Coming soon...</p>
                </div>
              }
            />

            {/* Catch-all - redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default DevTools;
