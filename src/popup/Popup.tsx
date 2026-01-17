import { useState, useEffect } from "react";
import "./Popup.css";
import { DATABASE_STATUS_CHANGED } from "@/shared/messages";

const ACTIVE_ICON = "img/logo-48.png";
const INACTIVE_ICON = "img/logo-48-inactive.png";

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
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // 1. Query initial status on mount
    chrome.runtime.sendMessage(
      { type: "GET_TAB_DATABASE_STATUS" },
      (response: boolean) => {
        if (chrome.runtime.lastError) {
          return;
        }
        setHasDatabase(response);
      },
    );

    // 2. Listen for proactive updates from background
    const messageListener = (message: unknown) => {
      if (
        typeof message === "object"
        && message !== null
        && "type" in message
        && message.type === DATABASE_STATUS_CHANGED
        && "hasDatabase" in message
      ) {
        setHasDatabase(Boolean(message.hasDatabase));
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleMouseEnter = () => setShowStatus(true);
  const handleMouseLeave = () => setShowStatus(false);

  // Show loading spinner while querying
  if (hasDatabase === null) {
    return (
      <main className="popup-container">
        <div className="loading-spinner" />
      </main>
    );
  }

  const iconSrc = hasDatabase ? ACTIVE_ICON : INACTIVE_ICON;
  const statusText = hasDatabase ? "DevTools Active" : "No databases detected";

  return (
    <main
      className="popup-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={iconSrc}
        alt="Web SQLite DevTools"
        className="popup-logo"
        title={statusText}
      />
      {showStatus && (
        <div className="popup-status" role="status" aria-live="polite">
          {statusText}
        </div>
      )}
    </main>
  );
};

export default Popup;
