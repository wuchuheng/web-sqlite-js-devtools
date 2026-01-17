/**
 * Content Script App
 *
 * @remarks
 * Runs in the context of web pages and iframes to monitor window.__web_sqlite availability.
 * Sends database list and icon state updates to the background service worker.
 * Tracks per-tab and per-frame database state for correct icon display when switching tabs.
 */

import { useEffect } from "react";
import {
  ICON_STATE_MESSAGE,
  DATABASE_LIST_MESSAGE,
  LOG_ENTRY_MESSAGE,
  LOG_ENTRY_SOURCE,
} from "@/shared/messages";

/**
 * Main content script component
 *
 * @remarks
 * Sends DATABASE_LIST_MESSAGE (with database names and frameId) and ICON_STATE_MESSAGE (for compatibility)
 * to enable per-tab, per-frame icon state tracking in the background service worker.
 */
export default function App() {
  useEffect(() => {
    type LogEntryRelayMessage = {
      source?: string;
      type?: string;
      subscriptionId?: string;
      entry?: unknown;
    };

    /**
     * 1. Get list of database names from window.__web_sqlite
     * 2. Get frame ID (undefined for top-level, number for iframe)
     * 3. Send DATABASE_LIST_MESSAGE to background with array of database names and frameId
     * 4. Also send ICON_STATE_MESSAGE for backward compatibility
     *
     * @remarks
     * Background worker maintains a Map<tabId, FrameDatabases[]> to track per-tab, per-frame state.
     * This enables correct icon display when switching between tabs.
     */
    const sendDatabaseList = () => {
      const webSqlite = window.__web_sqlite;
      const databases = webSqlite?.databases
        ? Object.keys(webSqlite.databases)
        : [];

      // Detect if we're in an iframe
      // chrome.runtime.getFrameId() returns frame ID (0 for top-level, >0 for iframes)
      const frameId =
        chrome.runtime.getFrameId?.(undefined)
        ?? (window !== window.top ? undefined : 0);
      const isIframe = window !== window.top;

      // 1. Send detailed database list for per-tab, per-frame tracking
      chrome.runtime.sendMessage({
        type: DATABASE_LIST_MESSAGE,
        databases,
        frameId:
          isIframe && typeof frameId === "number" && frameId > 0
            ? frameId
            : undefined,
      });

      // 2. Also send icon state for backward compatibility
      chrome.runtime.sendMessage({
        type: ICON_STATE_MESSAGE,
        hasDatabase: databases.length > 0,
      });

      const frameInfo = isIframe ? ` (iframe: ${frameId})` : " (top-level)";
      console.log(
        `[Content Script] Sent database list: ${databases.length} databases${frameInfo}`,
        databases,
      );
    };

    // ========================================================================
    // 1. Initial check and setup
    // ========================================================================

    const hasWebSqlite = typeof window.__web_sqlite !== "undefined";

    if (hasWebSqlite) {
      console.log(
        `[Content Script] web-sqlite-js API detected (frame: ${chrome.runtime.getFrameId?.(undefined) ?? (window !== window.top ? "iframe" : "top")})`,
      );
      console.log(
        "[Content Script] Available databases:",
        Object.keys(window.__web_sqlite?.databases || {}),
      );
      // Send initial database list
      sendDatabaseList();
    } else {
      console.log(
        `[Content Script] web-sqlite-js API not found - watching for it to be set (frame: ${chrome.runtime.getFrameId?.(undefined) ?? (window !== window.top ? "iframe" : "top")})`,
      );

      // Watch for window.__web_sqlite to be set (if script loads before web-sqlite-js)
      let webSqliteHasBeenSet = false;

      Object.defineProperty(window, "__web_sqlite", {
        configurable: true,
        set(value) {
          // @ts-expect-error - setting the underlying property
          this._web_sqlite = value;
          if (!webSqliteHasBeenSet) {
            webSqliteHasBeenSet = true;
            console.log(
              "[Content Script] web-sqlite-js API was set - sending database list",
            );
            sendDatabaseList();
          }
        },
        get() {
          // @ts-expect-error - getting the underlying property
          return this._web_sqlite;
        },
      });
    }

    // ========================================================================
    // 2. Subscribe to database changes
    // ========================================================================

    /**
     * Listen for database open/close events
     * @remarks
     * web-sqlite-js calls onDatabaseChange callback when:
     * - A database is opened (openDB)
     * - A database is closed
     * - Database schema changes
     */
    const webSqlite = window.__web_sqlite;
    if (webSqlite?.onDatabaseChange) {
      webSqlite.onDatabaseChange(sendDatabaseList);
    }

    // ========================================================================
    // 3. Log entry relay (existing functionality)
    // ========================================================================

    const onWindowMessage = (event: MessageEvent) => {
      if (event.source !== window) {
        return;
      }

      const data = event.data as LogEntryRelayMessage | null;
      if (
        !data
        || data.source !== LOG_ENTRY_SOURCE
        || data.type !== LOG_ENTRY_MESSAGE
        || typeof data.subscriptionId !== "string"
      ) {
        return;
      }

      chrome.runtime.sendMessage({
        type: LOG_ENTRY_MESSAGE,
        subscriptionId: data.subscriptionId,
        entry: data.entry,
      });
    };

    window.addEventListener("message", onWindowMessage);

    // ========================================================================
    // 4. Cleanup
    // ========================================================================

    return () => {
      window.removeEventListener("message", onWindowMessage);
      console.log("[Content Script] Unmounting (page unloading)");
    };
  }, []);

  // Content script doesn't render any UI - it runs in the background
  return null;
}
