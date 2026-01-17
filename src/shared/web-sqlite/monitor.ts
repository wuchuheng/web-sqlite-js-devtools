/**
 * WebSqlite Monitor
 *
 * @remarks
 * Monitors window.__web_sqlite for availability and database changes.
 * Notifies listeners when databases are opened, closed, or when the API is first detected.
 * Manages log subscriptions for real-time log streaming (F-018).
 */

import { crossWorldChannel } from "@/shared/messaging/channel";
import {
  DATABASE_LIST_MESSAGE,
  ICON_STATE_MESSAGE,
  LOG_ENTRY_MESSAGE,
} from "@/shared/messages";

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
 * Log subscription map (F-018)
 *
 * @remarks
 * Maps database name to unsubscribe function for log streaming.
 */
const logSubscriptions = new Map<string, () => void>();

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
 * Subscribe to logs for a specific database (F-018)
 *
 * @param dbname - Database name to subscribe to
 * @param dbRecord - DatabaseRecord from window.__web_sqlite.databases[dbname]
 *
 * @remarks
 * The dbRecord is a DatabaseRecord wrapper containing the actual DBInterface
 * at the `.db` property. This function unwraps it to access the onLog method.
 *
 * @example
 * ```ts
 * const webSqlite = window.__web_sqlite;
 * if (webSqlite?.databases) {
 *   for (const [dbname, dbRecord] of Object.entries(webSqlite.databases)) {
 *     subscribeToLogs(dbname, dbRecord);
 *   }
 * }
 * ```
 */
export function subscribeToLogs(dbname: string, dbRecord: unknown): void {
  // Unsubscribe if already subscribed (handle rapid open/close cycles)
  const existingUnsub = logSubscriptions.get(dbname);
  if (existingUnsub) {
    existingUnsub();
    logSubscriptions.delete(dbname);
  }

  // DatabaseRecord has .db property containing the actual DBInterface
  const record = dbRecord as {
    db?: {
      onLog?: (
        callback: (entry: { level: string; data: unknown }) => void,
      ) => () => void;
    };
  };

  // Check if db has onLog method
  const db = record.db;
  if (typeof db?.onLog !== "function") {
    console.warn(
      `[Content Script] Database ${dbname} does not support log streaming`,
    );
    return;
  }

  // Subscribe to logs
  const unsubscribe = db.onLog((entry) => {
    // Enrich log entry with database identification
    const enrichedEntry = {
      database: dbname,
      level: entry.level,
      message: entry.data,
      timestamp: Date.now(),
    };

    // Send via CrossWorldChannel to relay script
    crossWorldChannel.send(LOG_ENTRY_MESSAGE, enrichedEntry);
  });

  // Store unsubscribe function
  logSubscriptions.set(dbname, unsubscribe);

  console.log(`[Content Script] Subscribed to logs for database: ${dbname}`);
}

/**
 * Unsubscribe from logs for all databases (F-018)
 *
 * @remarks
 * Called on component unmount or when all databases are closed.
 *
 * @example
 * ```ts
 * // In useEffect cleanup
 * return () => {
 *   unsubscribeAllLogs();
 * };
 * ```
 */
export function unsubscribeAllLogs(): void {
  for (const [dbname, unsubscribe] of logSubscriptions) {
    unsubscribe();
    console.log(
      `[Content Script] Unsubscribed from logs for database: ${dbname}`,
    );
  }
  logSubscriptions.clear();
}

/**
 * Update log subscriptions when database list changes (F-018)
 *
 * @param currentDatabases - Current database names
 *
 * @remarks
 * - Subscribe to new databases
 * - Unsubscribe from closed databases
 * - Handle rapid open/close cycles (unsubscribe before subscribe)
 *
 * @example
 * ```ts
 * monitorWebSqlite(({ databases }) => {
 *   sendDatabaseUpdate(databases);
 *   updateLogSubscriptions(databases);
 * });
 * ```
 */
export function updateLogSubscriptions(currentDatabases: string[]): void {
  const webSqlite = window.__web_sqlite;
  if (!webSqlite?.databases) {
    unsubscribeAllLogs();
    return;
  }

  const subscribedDbs = new Set(logSubscriptions.keys());
  const currentDbs = new Set(currentDatabases);

  // Unsubscribe from closed databases
  for (const dbname of subscribedDbs) {
    if (!currentDbs.has(dbname)) {
      const unsubscribe = logSubscriptions.get(dbname);
      if (unsubscribe) {
        unsubscribe();
        logSubscriptions.delete(dbname);
        console.log(
          `[Content Script] Unsubscribed from closed database: ${dbname}`,
        );
      }
    }
  }

  // Subscribe to newly opened databases
  for (const dbname of currentDatabases) {
    if (!subscribedDbs.has(dbname)) {
      const db = webSqlite.databases[dbname];
      if (db) {
        subscribeToLogs(dbname, db);
      }
    }
  }
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
    unsubscribeAllLogs();
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
    updateLogSubscriptions(databases);
  });
}
