/**
 * Shared message identifiers for runtime messaging.
 */
export const ICON_STATE_MESSAGE = "icon-state";
export const DATABASE_LIST_MESSAGE = "database-list";
export const LOG_ENTRY_MESSAGE = "LOG_ENTRY";
export const LOG_ENTRY_SOURCE = "web-sqlite-devtools";

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
