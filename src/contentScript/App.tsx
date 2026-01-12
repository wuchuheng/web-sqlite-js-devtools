/**
 * Content Script App
 *
 * @remarks
 * Runs in the context of web pages to provide access to window.__web_sqlite API.
 * Implements Content Script Proxy Pattern (ADR-0001) for DevTools panel communication.
 */

import { useEffect } from "react";
import { registerAllHandlers } from "./messaging/handlers";
import { ICON_STATE } from "@/messaging/channels";

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
 * Also sends ICON_STATE messages to update extension icon based on database availability.
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
     * 1. Check if databases Map has entries
     * 2. Send ICON_STATE message with hasDatabase boolean
     * 3. Called on mount and on database changes
     *
     * @remarks
     * Updates extension icon to active (colored) when databases exist,
     * inactive (grayscale) when no databases present.
     */
    const updateIconState = () => {
      const webSqlite = (window as unknown as Record<string, unknown>)
        .__web_sqlite as { databases?: Map<string, unknown> } | undefined;

      const hasDatabase = webSqlite?.databases && webSqlite.databases.size > 0;

      /**
       * 1. Send ICON_STATE message to background
       * 2. chrome.runtime.sendMessage delivers to background service worker
       * 3. Background updates icon based on hasDatabase boolean
       */
      chrome.runtime.sendMessage({
        type: "request",
        channel: ICON_STATE,
        payload: { hasDatabase },
      });
    };

    /**
     * 1. Update icon state on mount
     * 2. Sets icon to active if databases exist, inactive otherwise
     * 3. Ensures icon reflects current state immediately on page load
     */
    updateIconState();

    /**
     * 1. Listen for database changes via onDatabaseChange callback
     * 2. Update icon state when databases are opened/closed
     * 3. Enables real-time icon state updates
     *
     * @remarks
     * web-sqlite-js calls onDatabaseChange callback when:
     * - A database is opened (openDB)
     * - A database is closed
     * - Database schema changes
     */
    const webSqlite = window.__web_sqlite;
    if (webSqlite?.onDatabaseChange) {
      webSqlite.onDatabaseChange(updateIconState);
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
