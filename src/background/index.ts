/**
 * Background Service Worker
 *
 * @remarks
 * Main entry point for Chrome extension background service worker.
 * Initializes offscreen document and icon state handling.
 * Tracks per-tab, per-frame database state for correct icon display.
 */

import {
  initializeIconState,
  setIconState,
  updateIconForTab,
  handleDatabaseListMessage,
  cleanupTab,
} from "./iconState";
import { initRouter } from "@/messaging/core";
import { ICON_STATE_MESSAGE, DATABASE_LIST_MESSAGE } from "@/shared/messages";

console.log("[Background] Service worker starting...");
initRouter();

// ============================================================================
// OFFSCREEN DOCUMENT SETUP
// ============================================================================

const OFFSCREEN_PATH = "offscreen.html";

/**
 * 1. Check if offscreen document already exists
 * 2. Create offscreen document if not present
 * 3. Handle errors with retry in dev mode
 *
 * @remarks
 * Offscreen document used for log storage and WASM execution.
 * Retries after 2 seconds in dev mode if initial setup fails.
 */
async function setupOffscreen() {
  try {
    if (await chrome.offscreen.hasDocument()) {
      return;
    }

    const url = chrome.runtime.getURL(OFFSCREEN_PATH);
    console.log("[Background] Creating offscreen document with URL:", url);

    await chrome.offscreen.createDocument({
      url,
      // @ts-expect-error Offscreen reasons string literals missing in current @types/chrome
      reasons: ["LOCAL_STORAGE", "WORKERS"],
      justification:
        "Database storage (SQLite) and WASM execution for log management",
    });
    console.log("[Background] Offscreen document created successfully");
  } catch (err) {
    console.error(
      "[Background] CRITICAL: Failed to setup offscreen document:",
      err,
    );
    // In dev mode, the page might fail to load if the dev server is still starting.
    // We can try to retry after a short delay.
    // @ts-ignore
    if (import.meta.env.DEV) {
      console.log("[Background] Retrying offscreen setup in 2 seconds...");
      setTimeout(setupOffscreen, 2000);
    }
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * 1. Initialize offscreen document
 * 2. Initialize icon state
 */
const initializeBackground = () => {
  /**
   * 1. Setup offscreen document
   * 2. Delay in dev mode for dev server startup
   * 3. Immediate setup in production
   */
  // @ts-ignore
  if (import.meta.env.DEV) {
    setTimeout(setupOffscreen, 1000);
  } else {
    setupOffscreen();
  }

  initializeIconState();
};

// ============================================================================
// STARTUP
// ============================================================================

/**
 * 1. Initialize background service worker on startup
 * 2. Configure offscreen document and icon state
 */
initializeBackground();

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Listen for messages from content scripts
 * @remarks
 * - ICON_STATE_MESSAGE: Backward compatibility (deprecated)
 * - DATABASE_LIST_MESSAGE: New per-tab, per-frame tracking
 * - "request": Wake up offscreen document
 */
chrome.runtime.onMessage.addListener((message, sender) => {
  // DEBUG: Log all messages
  console.log(
    "[Background DEBUG] Received message:",
    message,
    "from tab:",
    sender.tab?.id,
    "frame:",
    sender.frameId,
  );

  // Backward compatibility: old icon state message
  if (message?.type === ICON_STATE_MESSAGE) {
    console.log("[Background DEBUG] Handling ICON_STATE_MESSAGE");
    setIconState(Boolean(message.hasDatabase));
  }

  // New per-tab, per-frame database tracking
  if (message?.type === DATABASE_LIST_MESSAGE) {
    console.log("[Background DEBUG] Handling DATABASE_LIST_MESSAGE");
    if (sender.tab?.id !== undefined) {
      // sender.frameId contains the frame ID (0 for top-level, >0 for iframes)
      handleDatabaseListMessage(
        sender.tab.id,
        message.databases,
        sender.frameId && sender.frameId > 0 ? sender.frameId : undefined,
      );
    }
  }

  // Wake up offscreen document
  if (message?.type === "request") {
    setupOffscreen();
  }
});

// ============================================================================
// TAB EVENT HANDLERS
// ============================================================================

/**
 * Listen for tab activation
 * @remarks
 * When user switches tabs, update icon based on that tab's database state.
 * Icon shows active if ANY frame (top-level or iframe) has databases.
 */
chrome.tabs.onActivated.addListener(({ tabId }) => {
  console.log(`[Background] Tab switched to ${tabId}`);
  updateIconForTab(tabId);
});

/**
 * Listen for tab removal
 * @remarks
 * When tab is closed, clean up the database map to free memory.
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  cleanupTab(tabId);
});

export {};
