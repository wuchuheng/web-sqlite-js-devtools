/**
 * Background Service Worker
 *
 * @remarks
 * Main entry point for Chrome extension background service worker.
 * Initializes offscreen document and icon state handling.
 */

import { initializeIconState, setIconState } from "./iconState";
import { initRouter } from "@/messaging/core";
import { ICON_STATE_MESSAGE } from "@/shared/messages";

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
    if (await chrome.offscreen.hasDocument()) return;

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

/**
 * 1. Listen for any request and ensure offscreen is ready
 * 2. Safety measure to ensure offscreen document is awake
 * 3. Wakes offscreen when messages come through
 */
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === ICON_STATE_MESSAGE) {
    setIconState(Boolean(message.hasDatabase));
  }

  if (message?.type === "request") {
    setupOffscreen();
  }
});

export {};
