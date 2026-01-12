/**
 * Background Panel Router
 *
 * @remarks
 * Routes messages from DevTools panel to content script.
 * Part of Content Script Proxy Pattern (ADR-0001).
 */

/**
 * Wire message format (matching src/messaging/core.ts)
 */
interface WireMessage {
  type: "request" | "response" | "register" | "unregister";
  channel: string;
  id?: string;
  payload?: unknown;
  success?: boolean;
  error?: string;
}

/**
 * 1. Get active tab from Chrome tabs API
 * 2. Find DevTools panel's inspected tab
 * 3. Return tab ID for message forwarding
 *
 * @returns Tab ID or null if no active tab found
 */
const getActiveTabId = async (): Promise<number | null> => {
  /**
   * 1. Query Chrome tabs for active tab in current window
   * 2. Filter for tabs with URL (not chrome:// pages)
   * 3. Return first matching tab's ID
   */
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tabs.length === 0 || !tabs[0].id) {
    console.warn("[Background Panel Router] No active tab found");
    return null;
  }

  return tabs[0].id;
};

/**
 * 1. Accept message from DevTools panel
 * 2. Get active tab ID
 * 3. Forward message to content script via chrome.tabs.sendMessage
 * 4. Return response from content script
 *
 * @remarks
 * This function enables the two-hop message routing pattern:
 * DevTools Panel → Background SW → Content Script → window.__web_sqlite
 *
 * @param message - WireMessage from DevTools panel
 * @returns Promise resolving to content script response
 */
export const forwardToContentScript = async (
  message: WireMessage,
): Promise<WireMessage> => {
  /**
   * 1. Get active tab ID for message forwarding
   * 2. Return error response if no tab found
   */
  const tabId = await getActiveTabId();

  if (!tabId) {
    return {
      type: "response",
      channel: message.channel,
      id: message.id,
      success: false,
      error: "No active tab found for content script communication",
    };
  }

  /**
   * 1. Forward message to content script in active tab
   * 2. Use chrome.tabs.sendMessage for tab-scoped messaging
   * 3. Handle content script not ready errors gracefully
   */
  try {
    const response = await chrome.tabs.sendMessage(tabId, message);

    return response as WireMessage;
  } catch (error) {
    /**
     * 1. Handle case where content script is not ready
     * 2. This can happen immediately after page load
     * 3. Return error response instead of throwing
     */
    return {
      type: "response",
      channel: message.channel,
      id: message.id,
      success: false,
      error: `Content script not ready: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * 1. Create channel for panel → content script routing
 * 2. Accept any request payload (forwarded as-is)
 * 3. Return response from content script
 *
 * @remarks
 * This is a passthrough channel that forwards all DevTools panel messages
 * to the content script for actual processing.
 */
export const createPanelRouterChannel = () => {
  /**
   * 1. Forward function that calls forwardToContentScript
   * 2. Takes WireMessage, returns WireMessage
   * 3. Handles all channels uniformly
   */
  const forward = async (message: WireMessage): Promise<WireMessage> => {
    return forwardToContentScript(message);
  };

  return { forward };
};
