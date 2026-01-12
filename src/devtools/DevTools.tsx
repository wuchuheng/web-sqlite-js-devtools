import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { EmptyState } from "./components/EmptyState/EmptyState";
import "./DevTools.css";

/**
 * Root DevTools component with routing
 * Uses HashRouter for Chrome extension context (per ADR-0002)
 *
 * @returns JSX.Element - DevTools component with sidebar and routed content
 */
export const DevTools = () => {
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
   * 1. Log component mount for debugging
   * 2. Log current hash route for navigation tracking
   * 3. Check for web-sqlite-js API availability (for future tasks)
   */
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

  return (
    <HashRouter>
      {/* 1. Main container with flex layout */}
      {/* 2. Sidebar takes 20% width when expanded */}
      {/* 3. Main content takes remaining width */}
      <div className="devtools-panel flex">
        <Sidebar />

        <main className="flex-1 h-full overflow-auto">
          <Routes>
            {/* 1. Default route - empty state with helpful instructions */}
            {/* 2. Implements FR-014 (empty state notice) */}
            {/* 3. Implements FR-042 (helpful instructions) */}
            <Route path="/" element={<EmptyState />} />

            {/* 1. Database view routes (to be implemented in TASK-05) */}
            {/* 2. Placeholder for database detail pages */}
            {/* 3. Will show table browser, query editor, logs, etc. */}
            <Route
              path="/openedDB/:dbname"
              element={
                <div className="p-4">
                  <h2 className="text-lg font-semibold">Database View</h2>
                  <p className="text-sm text-gray-600">
                    Database: <span id="dbname-display"></span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Coming soon...</p>
                </div>
              }
            />

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
