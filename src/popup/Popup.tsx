import { useState, useEffect } from "react";
import "./Popup.css";
import {
  DATABASE_STATUS_CHANGED,
  GET_TAB_DATABASE_STATUS,
} from "@/shared/messages";

/**
 * Popup component displaying DevTools status indicator
 *
 * @remarks
 * Shows the app logo (active or inactive) based on current tab's database state.
 * Hovering over the logo reveals a status text tooltip.
 * Receives real-time updates from background when database status changes.
 *
 * @example
 * ```tsx
 * <Popup />
 * // Renders logo + status text on hover
 * ```
 */
export const Popup = () => {
  // 1. Track database state for current tab (boolean)
  // 2. Track hover state for status text visibility
  const [hasDatabase, setHasDatabase] = useState<boolean | null>(null);
  const getActiveTabId = async (): Promise<number | null> => {
    const query = (queryInfo: chrome.tabs.QueryInfo) =>
      new Promise<chrome.tabs.Tab[]>((resolve) => {
        chrome.tabs.query(queryInfo, resolve);
      });

    const [primary] = await query({
      active: true,
      lastFocusedWindow: true,
      windowType: "normal",
    });
    if (primary?.id) {
      return primary.id;
    }

    const [fallback] = await query({ active: true, windowType: "normal" });
    if (fallback?.id) {
      return fallback.id;
    }

    const [currentWindow] = await query({
      active: true,
      currentWindow: true,
    });
    return currentWindow?.id ?? null;
  };
  const updateState = async () => {
    const tabId = await getActiveTabId();
    const result = await chrome.runtime.sendMessage({
      type: GET_TAB_DATABASE_STATUS,
      tabId,
    });
    console.log("Popup received database status:", result, "tabId:", tabId);
    setHasDatabase(Boolean(result));
  };

  useEffect(() => {
    updateState().then();
    const messageListener = (message: any) => {
      console.log("Popup received message:", message);
      if (message?.type === DATABASE_STATUS_CHANGED) {
        console.log(
          "Popup received DATABASE_STATUS_CHANGED message:",
          message.hasDatabase,
        );
        setHasDatabase(Boolean(message.hasDatabase));
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  // Show loading message while querying
  if (hasDatabase === null) {
    return (
      <main className="popup-container" data-status="loading">
        <div className="popup-status">Checking status...</div>
      </main>
    );
  }

  const statusText = hasDatabase
    ? "Web-Sqlite-js detected"
    : "Web-Sqlite-js not detected";

  return (
    <div
      className="popup-status"
      role="status"
      aria-live="polite"
      style={{
        padding: "10px",
        fontSize: "14px",
        color: hasDatabase ? "green" : "red",
      }}
    >
      {statusText}
    </div>
  );
};

export default Popup;
