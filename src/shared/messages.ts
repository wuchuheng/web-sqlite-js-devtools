/**
 * Shared message identifiers for runtime messaging.
 */
export const ICON_STATE_MESSAGE = "icon-state";
export const DATABASE_LIST_MESSAGE = "database-list";
export const LOG_ENTRY_MESSAGE = "log-entry";
export const LOG_ENTRY_SOURCE = "web-sqlite-devtools";

/**
 * Log level types from web-sqlite-js
 */
export type LogLevel = "info" | "debug" | "error" | "warn";

/**
 * Enriched log entry message (F-018)
 *
 * @remarks
 * Contains database identification for filtering in DevTools panel.
 * Forwarded from content script → background → DevTools panel.
 */
export interface LogEntryMessage {
  type: typeof LOG_ENTRY_MESSAGE;
  /** Database name that generated this log */
  database: string;
  /** Log level */
  level: LogLevel;
  /** Log message content (can be any JSON-serializable type) */
  message: unknown;
  /** Unix timestamp in milliseconds */
  timestamp: number;
}

/**
 * Per-frame database entry
 */
export interface FrameDatabases {
  /** List of database names in this frame */
  databases: string[];
  /** Frame ID (undefined for top-level frame, number for iframe) */
  frameId?: number;
}

/**
 * Message sent from content script to background worker with database list
 */
export interface DatabaseListMessage {
  type: typeof DATABASE_LIST_MESSAGE;
  /** List of database names in this frame */
  databases: string[];
  /** Frame ID (only set for iframes) */
  frameId?: number;
}
