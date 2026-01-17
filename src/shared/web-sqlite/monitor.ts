/**
 * WebSqlite Monitor
 *
 * @remarks
 * Monitors window.__web_sqlite for availability and database changes.
 * Notifies listeners when databases are opened, closed, or when the API is first detected.
 */

import { crossWorldChannel } from "@/shared/messaging/channel";
import { DATABASE_LIST_MESSAGE, ICON_STATE_MESSAGE } from "@/shared/messages";

/**
 * Current state of web-sqlite-js databases
 */
export interface WebSqliteState {
  /** List of database names */
  databases: string[];
  /** Whether any databases are open */
  hasDatabase: boolean;
}

/**
 * Listener function type
 */
export type WebSqliteChangeListener = (state: WebSqliteState) => void;

/**
 * Get frame type for logging
 */
function getFrameType(): string {
  return window !== window.top ? "iframe" : "top";
}

/**
 * Get current database list from window.__web_sqlite
 */
function getDatabases(): string[] {
  const webSqlite = window.__web_sqlite;
  return webSqlite?.databases ? Object.keys(webSqlite.databases) : [];
}

/**
 * Send database list to background service worker
 */
function sendDatabaseUpdate(databases: string[]): void {
  crossWorldChannel.send(DATABASE_LIST_MESSAGE, { databases });
  crossWorldChannel.send(ICON_STATE_MESSAGE, {
    hasDatabase: databases.length > 0,
  });

  const frameInfo = window !== window.top ? " (iframe)" : " (top-level)";
  console.log(
    `[Content Script] Sent database list: ${databases.length} databases${frameInfo}`,
    databases,
  );
}

/**
 * Monitor window.__web_sqlite and notify on changes
 *
 * @param listener - Function to call when databases change
 * @returns Cleanup function to stop monitoring
 *
 * @example
 * ```ts
 * const cleanup = monitorWebSqlite(({ databases, hasDatabase }) => {
 *   console.log('Databases:', databases);
 * });
 *
 * // Later: cleanup();
 * ```
 */
export function monitorWebSqlite(
  listener: WebSqliteChangeListener,
): () => void {
  const notify = () => {
    const databases = getDatabases();
    listener({ databases, hasDatabase: databases.length > 0 });
  };

  // Check if web-sqlite-js is already available
  if (typeof window.__web_sqlite !== "undefined") {
    console.log(
      `[Content Script] web-sqlite-js API detected (frame: ${getFrameType()})`,
    );
    console.log("[Content Script] Available databases:", getDatabases());
    notify();
  } else {
    console.log(
      `[Content Script] web-sqlite-js API not found - watching for it to be set (frame: ${getFrameType()})`,
    );

    // Watch for window.__web_sqlite to be set
    let webSqliteHasBeenSet = false;

    Object.defineProperty(window, "__web_sqlite", {
      configurable: true,
      set(value) {
        // @ts-ignore - setting the underlying property
        this._web_sqlite = value;
        if (!webSqliteHasBeenSet) {
          webSqliteHasBeenSet = true;
          console.log(
            "[Content Script] web-sqlite-js API was set - sending database list",
          );
          notify();
        }
      },
      get() {
        // @ts-ignore - getting the underlying property
        return this._web_sqlite;
      },
    });
  }

  // Subscribe to database change events
  const webSqlite = window.__web_sqlite;
  if (webSqlite?.onDatabaseChange) {
    webSqlite.onDatabaseChange(notify);
  }

  // Return cleanup function
  return () => {
    console.log("[Content Script] Unmounting (page unloading)");
  };
}

/**
 * Monitor web-sqlite-js and automatically send updates to background
 *
 * @returns Cleanup function to stop monitoring
 *
 * @example
 * ```ts
 * // In content script
 * const cleanup = monitorAndNotifyBackground();
 * ```
 */
export function monitorAndNotifyBackground(): () => void {
  return monitorWebSqlite(({ databases }) => {
    sendDatabaseUpdate(databases);
  });
}
