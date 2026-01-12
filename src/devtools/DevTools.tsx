import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import "./DevTools.css";

/**
 * Root DevTools component with routing
 * Uses HashRouter for Chrome extension context (per ADR-0002)
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

  return (
    <HashRouter>
      <div className="devtools-panel">
        <Routes>
          {/* Default route - landing page */}
          <Route
            path="/"
            element={
              <div className="p-4">
                <h1 className="text-xl font-semibold mb-2">
                  Web Sqlite DevTools
                </h1>
                <p className="text-sm text-gray-600">
                  Database inspection panel for web-sqlite-js
                </p>
                <p className="text-xs text-gray-400 mt-4">
                  Routes available: /openedDB/:dbname, /opfs
                </p>
              </div>
            }
          />

          {/* Database view routes (to be implemented in later tasks) */}
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

          {/* OPFS browser route (to be implemented in later tasks) */}
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
      </div>
    </HashRouter>
  );
};

export default DevTools;
