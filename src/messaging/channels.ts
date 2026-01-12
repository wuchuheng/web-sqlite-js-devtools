import { defineChannel } from "./core";
import type { LogEntry, LogLevel } from "@/types/logging";

// ============================================================================
// WEB-SQLITE DEVTOOLS CHANNELS
// Message channels for DevTools panel ↔ Background ↔ Content Script communication
// ============================================================================

// 1. Database Inspection
export const GET_DATABASES = "GET_DATABASES";
export const GET_TABLE_LIST = "GET_TABLE_LIST";
export const GET_TABLE_SCHEMA = "GET_TABLE_SCHEMA";
export const QUERY_TABLE_DATA = "QUERY_TABLE_DATA";

// 2. Query Execution
export const EXEC_SQL = "EXEC_SQL";

// 3. Log Streaming
export const SUBSCRIBE_LOGS = "SUBSCRIBE_LOGS";
export const UNSUBSCRIBE_LOGS = "UNSUBSCRIBE_LOGS";
export const LOG_EVENT = "LOG_EVENT";

// 4. Migration & Seed Testing
export const DEV_RELEASE = "DEV_RELEASE";
export const DEV_ROLLBACK = "DEV_ROLLBACK";
export const GET_DB_VERSION = "GET_DB_VERSION";

// 5. OPFS File Browser
export const GET_OPFS_FILES = "GET_OPFS_FILES";
export const DOWNLOAD_OPFS_FILE = "DOWNLOAD_OPFS_FILE";

// 6. Connection & Health
export const HEARTBEAT = "HEARTBEAT";
export const ICON_STATE = "ICON_STATE";

// ============================================================================
// LEGACY CHANNELS (from template - may be removed in future cleanup)
// ============================================================================

export const logAdd = defineChannel<
  { level: LogLevel; message: string; agentId?: string; timestamp: string },
  { success: boolean }
>("log:add");

export const logGet = defineChannel<
  { limit: number; offset: number },
  { logs: LogEntry[] }
>("log:get");

export const logMeta = defineChannel<Record<string, never>, { total: number }>(
  "log:meta",
);

export const logClear = defineChannel<
  Record<string, never>,
  { success: boolean }
>("log:clear");
