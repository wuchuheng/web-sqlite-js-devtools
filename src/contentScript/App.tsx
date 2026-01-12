/**
 * Content Script App
 *
 * @remarks
 * Runs in the context of web pages to provide access to window.__web_sqlite API.
 * Implements Content Script Proxy Pattern (ADR-0001) for DevTools panel communication.
 */

import { useEffect } from "react";
import { registerAllHandlers } from "./messaging/handlers";

// Declare web-sqlite-js global type
declare global {
  interface Window {
    __web_sqlite?: {
      databases?: Record<string, unknown>;
      onDatabaseChange?: (callback: () => void) => void;
      _updateDatabases?: () => void;
      _emitEvent?: (event: string, data: unknown) => void;
    };
  }
}

/**
 * Main content script component
 *
 * @remarks
 * Registers all message channel handlers on mount to enable
 * DevTools panel → Background SW → Content Script → window.__web_sqlite communication.
 */
export default function App() {
  useEffect(() => {
    /**
     * 1. Register all message handlers for content script proxy
     * 2. Enables GET_DATABASES, HEARTBEAT, and 8 stub channels
     * 3. Called once on content script mount
     */
    registerAllHandlers();

    /**
     * 1. Check if web-sqlite-js API is available on the page
     * 2. Log detection for debugging
     * 3. Log available databases if API present
     */
    const hasWebSqlite = typeof window.__web_sqlite !== "undefined";

    if (hasWebSqlite) {
      console.log(
        "[Web Sqlite DevTools Content Script] web-sqlite-js API detected",
      );
      console.log(
        "[Web Sqlite DevTools Content Script] Available databases:",
        Object.keys(window.__web_sqlite?.databases || {}),
      );
    } else {
      console.log(
        "[Web Sqlite DevTools Content Script] web-sqlite-js API not found on this page",
      );
    }

    /**
     * 1. Cleanup function (optional)
     * 2. Handlers persist until page unload
     * 3. No explicit cleanup needed for content script lifecycle
     */
    return () => {
      // Handlers automatically cleaned up on page unload
      console.log(
        "[Web Sqlite DevTools Content Script] Unmounting (page unloading)",
      );
    };
  }, []);

  // Content script doesn't render any UI - it runs in the background
  return null;
}
