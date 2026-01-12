/**
 * Background Service Worker
 *
 * @remarks
 * Main entry point for Chrome extension background service worker.
 * Initializes offscreen document, message router, and panel routing.
 */

import { initRouter } from "@/messaging/core";
import { initializeBackgroundRouter } from "./messaging/index";

console.log("[Background] Service worker starting...");

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
 * 2. Initialize message router
 * 3. Register background passthrough channels
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

  /**
   * 1. Initialize message router with debug enabled
   * 2. Enables logging for all message routing
   * 3. Central router for all extension contexts
   */
  initRouter({ debug: true });

  /**
   * 1. Initialize background passthrough router
   * 2. Registers 10 channels for panel ↔ content script communication
   * 3. Returns unsubscribe functions for cleanup
   */
  const unsubscribers = initializeBackgroundRouter();

  console.log(
    "[Background] Background service worker initialized successfully",
  );

  return unsubscribers;
};

// ============================================================================
// STARTUP
// ============================================================================

/**
 * 1. Initialize background service worker on startup
 * 2. Store unsubscribers for potential cleanup
 * 3. Log successful initialization
 */
const backgroundUnsubscribers = initializeBackground();

/**
 * 1. Listen for any request and ensure offscreen is ready
 * 2. Safety measure to ensure offscreen document is awake
 * 3. Wakes offscreen when messages come through
 */
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "request") {
    setupOffscreen();
  }
});

/**
 * 1. Log when service worker is being terminated
 * 2. Chrome may terminate SW for memory management
 * 3. Useful for debugging lifecycle issues
 */
self.addEventListener("beforeunload", () => {
  console.log("[Background] Service worker terminating");
  // Cleanup unsubscribers if needed
  backgroundUnsubscribers?.forEach((unsub) => unsub());
});

export {};
