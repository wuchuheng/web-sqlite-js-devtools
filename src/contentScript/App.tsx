/**
 * Content Script App
 * This script runs in the context of web pages to provide access to window.__web_sqlite API
 * For TASK-01, this is a minimal placeholder - full proxy implementation comes in TASK-03
 */

import { useEffect } from "react";

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
 * Detects and logs web-sqlite-js API availability
 */
export default function App() {
  useEffect(() => {
    // Check if web-sqlite-js API is available on the page
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

    // TODO: TASK-03 - Implement message proxy handlers for:
    // - GET_DATABASES
    // - GET_TABLE_LIST
    // - GET_TABLE_SCHEMA
    // - QUERY_TABLE_DATA
    // - EXEC_SQL
    // - SUBSCRIBE_LOGS / UNSCRIBE_LOGS
    // - DEV_RELEASE / DEV_ROLLBACK
    // - GET_DB_VERSION
    // - GET_OPFS_FILES / DOWNLOAD_OPFS_FILE
    // - HEARTBEAT / ICON_STATE
  }, []);

  // Content script doesn't render any UI - it runs in the background
  return null;
}
