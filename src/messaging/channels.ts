import { defineChannel } from "./core";
import type { LogEntry, LogLevel } from "@/types/logging";

/**
 * Log storage channels for the offscreen document.
 */

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
