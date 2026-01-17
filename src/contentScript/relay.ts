/**
 * Content Script Relay (ISOLATED World)
 *
 * @remarks
 * Runs in ISOLATED world where chrome.* APIs are available.
 * Listens for messages from MAIN world via CrossWorldChannel
 * and forwards them to the background service worker.
 */

import { crossWorldChannel } from "@/shared/messaging/channel";
import {
  DATABASE_LIST_MESSAGE,
  ICON_STATE_MESSAGE,
  LOG_ENTRY_MESSAGE,
} from "@/shared/messages";

// Start listening for messages from MAIN world
crossWorldChannel.start();

// Database list messages → background worker
crossWorldChannel.listen(
  DATABASE_LIST_MESSAGE,
  (data: { databases: string[] }) => {
    chrome.runtime.sendMessage({
      type: DATABASE_LIST_MESSAGE,
      databases: data.databases,
    });
  },
);

// Icon state messages → background worker
crossWorldChannel.listen(
  ICON_STATE_MESSAGE,
  (data: { hasDatabase: boolean }) => {
    chrome.runtime.sendMessage({
      type: ICON_STATE_MESSAGE,
      hasDatabase: data.hasDatabase,
    });
  },
);

// Log entry messages → background worker (F-018: enriched format)
crossWorldChannel.listen(
  LOG_ENTRY_MESSAGE,
  (data: {
    database: string;
    level: string;
    message: unknown;
    timestamp: number;
  }) => {
    chrome.runtime.sendMessage({
      type: LOG_ENTRY_MESSAGE,
      database: data.database,
      level: data.level,
      message: data.message,
      timestamp: data.timestamp,
    });
  },
);
