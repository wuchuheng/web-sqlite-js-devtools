/**
 * Background Icon State Manager
 *
 * @remarks
 * Manages extension icon state based on web-sqlite-js availability per tab and frame.
 * Updates icon to active (colored) or inactive (grayscale) based on database state.
 * Tracks each tab's database list independently (including iframes) for correct icon when switching tabs.
 */

import type { FrameDatabases } from "@/shared/messages";
import { DATABASE_STATUS_CHANGED } from "@/shared/messages";

/**
 * Map of tab ID to array of frame database entries
 * Key: tabId (number)
 * Value: Array of {databases: string[], frameId?: number}
 * @remarks
 * Enables per-tab, per-frame icon state tracking.
 * - Top-level frame: {databases: string[], frameId: undefined}
 * - Iframe: {databases: string[], frameId: number}
 *
 * When user switches tabs, we look up the tab in this map and check if ANY frame
 * has databases to determine the correct icon state.
 */
const databaseMap = new Map<number, FrameDatabases[]>();

const getActiveTabId = (): Promise<number | null> => {
  return new Promise((resolve) => {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
        windowType: "normal",
      },
      (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.id) {
          resolve(activeTab.id);
          return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (fallback) => {
          const fallbackTab = fallback[0];
          resolve(fallbackTab?.id ?? null);
        });
      },
    );
  });
};

const queryTabDatabases = async (
  tabId: number,
): Promise<FrameDatabases[] | null> => {
  if (!chrome?.scripting?.executeScript) {
    return null;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: "MAIN",
      func: () => {
        try {
          const api = window.__web_sqlite;
          return api?.databases ? Object.keys(api.databases) : [];
        } catch {
          return [];
        }
      },
    });

    return results.map((result) => {
      const databases = Array.isArray(result.result) ? result.result : [];
      const frameId =
        typeof result.frameId === "number" && result.frameId > 0
          ? result.frameId
          : undefined;
      return { databases, frameId };
    });
  } catch (error) {
    console.warn("[Icon State] Failed to query databases for tab:", tabId, error);
    return null;
  }
};

export const getTabDatabaseStatus = async (
  tabId: number,
): Promise<boolean> => {
  const existingFrames = databaseMap.get(tabId);
  if (existingFrames && existingFrames.length > 0) {
    return tabHasDatabases(tabId);
  }

  const frames = await queryTabDatabases(tabId);
  if (!frames) {
    return false;
  }

  databaseMap.set(tabId, frames);
  return frames.some((frame) => frame.databases.length > 0);
};

/**
 * 1. Check if hasDatabase is true/false
 * 2. Set icon path to active (colored) or inactive (grayscale)
 * 3. Update all icon sizes (16, 32, 48, 128)
 *
 * @remarks
 * Updates the extension action icon to reflect web-sqlite-js availability.
 * Active icons are colored, inactive icons are grayscale.
 *
 * @param hasDatabase - true for active icon, false for inactive
 */
export const setIconState = (hasDatabase: boolean): void => {
  /**
   * 1. Define icon paths for active state (colored)
   * 2. Define icon paths for inactive state (grayscale)
   * 3. Select appropriate paths based on hasDatabase parameter
   */
  const iconPaths = hasDatabase
    ? {
        "16": "img/logo-16.png",
        "32": "img/logo-32.png",
        "48": "img/logo-48.png",
        "128": "img/logo-128.png",
      }
    : {
        "16": "img/logo-16-inactive.png",
        "32": "img/logo-32-inactive.png",
        "48": "img/logo-48-inactive.png",
        "128": "img/logo-128-inactive.png",
      };

  /**
   * 1. Set extension action icon for all sizes
   * 2. chrome.action.setIcon updates the browser action icon
   * 3. Path object includes all required icon sizes
   */
  chrome.action.setIcon({ path: iconPaths });

  /**
   * 1. Log icon state change for debugging
   * 2. Include current state (active/inactive)
   */
  console.log(
    `[Icon State] Icon set to ${hasDatabase ? "active" : "inactive"}`,
  );
};

/**
 * Check if tab has any databases across all frames
 *
 * @remarks
 * Iterates through all frame entries for a tab to determine if ANY frame
 * has databases. Returns true if at least one frame has databases.
 *
 * @param tabId - Tab ID to check
 * @returns true if tab has any databases, false otherwise
 */
const tabHasDatabases = (tabId: number): boolean => {
  const frames = databaseMap.get(tabId);
  if (!frames || frames.length === 0) {
    return false;
  }

  // Check if ANY frame has databases
  return frames.some((frame) => frame.databases.length > 0);
};

/**
 * Update icon state based on tab's database list
 *
 * @remarks
 * Looks up the tab in the database map and updates icon based on
 * whether that tab has any databases across all frames.
 *
 * @param tabId - Tab ID to update icon for
 */
export const updateIconForTab = (tabId: number): void => {
  const frames = databaseMap.get(tabId);

  // DEBUG: Log raw state
  console.log(
    `[Icon State DEBUG] Tab ${tabId} frames:`,
    JSON.stringify(frames),
  );

  const hasDatabase = tabHasDatabases(tabId);

  // DEBUG: Log computed hasDatabase value
  console.log(`[Icon State DEBUG] tabHasDatabases(${tabId}) = ${hasDatabase}`);

  setIconState(hasDatabase);

  const totalDatabases =
    frames?.reduce((sum, frame) => sum + frame.databases.length, 0) ?? 0;
  console.log(
    `[Icon State] Tab ${tabId}: ${hasDatabase ? "active" : "inactive"} (${totalDatabases} databases in ${frames?.length || 0} frame(s))`,
  );

  // Broadcast status change to popup for real-time updates
  broadcastStatusChange(hasDatabase);
};

/**
 * Handle database list message from content script
 *
 * @remarks
 * Updates the database map for the sender tab with the provided frame data.
 * - If frameId is provided (iframe): finds and updates existing frame entry, or adds new one
 * - If frameId is undefined (top-level): finds and updates top-level entry, or adds new one
 * If the sender tab is currently active, immediately updates the icon.
 *
 * @param tabId - Tab ID that sent the message
 * @param databases - Array of database names (empty if none)
 * @param frameId - Frame ID (undefined for top-level, number for iframe)
 */
export const handleDatabaseListMessage = (
  tabId: number,
  databases: string[],
  frameId?: number,
): void => {
  let frames = databaseMap.get(tabId);

  if (!frames) {
    frames = [];
    databaseMap.set(tabId, frames);
  }

  // Find existing frame entry or create new one
  const frameIndex = frames.findIndex((f) => f.frameId === frameId);
  const frameEntry: FrameDatabases = { databases, frameId };

  if (frameIndex >= 0) {
    // Update existing frame entry
    frames[frameIndex] = frameEntry;
  } else {
    // Add new frame entry
    frames.push(frameEntry);
  }

  const frameInfo = frameId === undefined ? "top-level" : `iframe ${frameId}`;
  console.log(
    `[Icon State] Updated tab ${tabId} (${frameInfo}): ${databases.length} databases`,
    databases,
  );

  // Update icon if this is the active tab
  void getActiveTabId().then((activeTabId) => {
    if (activeTabId === tabId) {
      const hasDatabase = tabHasDatabases(tabId);
      updateIconForTab(tabId);
      // Broadcast status change to popup for real-time updates
      broadcastStatusChange(hasDatabase);
    }
  });
};

/**
 * Clean up when tab is closed
 *
 * @remarks
 * Removes the tab from the database map to free memory.
 * Icon will be updated when user switches to another tab.
 *
 * @param tabId - Tab ID that was closed
 */
export const cleanupTab = (tabId: number): void => {
  const deleted = databaseMap.delete(tabId);
  if (deleted) {
    console.log(`[Icon State] Cleaned up tab ${tabId}`);
  }
};

/**
 * 1. Initialize icon state on service worker startup
 * 2. Set to inactive by default (no database yet)
 * 3. Will update to active when content script detects web-sqlite-js
 *
 * @remarks
 * Called once on background service worker initialization.
 */
export const initializeIconState = (): void => {
  setIconState(false);
};

/**
 * Get database status for current tab
 *
 * @remarks
 * Used by popup component to determine whether to show active or inactive icon.
 * Queries the current active tab and checks if it has any databases in the databaseMap.
 *
 * @example
 * ```typescript
 * const hasDatabase = await getCurrentTabDatabaseStatus();
 * console.log("Has database:", hasDatabase);
 * ```
 *
 * @returns Promise resolving to boolean (true if databases exist)
 */
export const getCurrentTabDatabaseStatus = async (): Promise<boolean> => {
  // 1. Query current active tab ID
  // 2. Look up tab in databaseMap
  // 3. Return boolean indicating if databases exist
  const tabId = await getActiveTabId();
  if (!tabId) {
    return false;
  }

  const status = await getTabDatabaseStatus(tabId);
  updateIconForTab(tabId);
  return status;
};

/**
 * Broadcast database status change to popup
 *
 * @remarks
 * Sends a message to the popup when the database status changes for the current tab.
 * This allows the popup to update its UI in real-time without polling.
 *
 * @param hasDatabase - Current database status
 */
const broadcastStatusChange = (hasDatabase: boolean): void => {
  chrome.runtime.sendMessage({
    type: DATABASE_STATUS_CHANGED,
    hasDatabase,
  });
  console.log(`[Icon State] Broadcast status change: ${hasDatabase}`);
};
