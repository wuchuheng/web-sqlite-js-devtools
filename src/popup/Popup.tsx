import { useState, useEffect } from "react";
import "./Popup.css";

const ACTIVE_ICON = "img/logo-48.png";
const INACTIVE_ICON = "img/logo-48-inactive.png";

/**
 * Popup component displaying DevTools status indicator
 *
 * @remarks
 * Shows the app logo (active or inactive) based on current tab's database state.
 * Hovering over the logo reveals a status text tooltip.
 *
 * @example
 * ```tsx
 * <Popup />
 * // Renders logo + status text on hover
 * ```
 */
export const Popup = () => {
  // 1. Track database state for current tab
  // 2. Track hover state for status text visibility
  const [hasDatabase, setHasDatabase] = useState<boolean | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  // 1. Query background for current tab's database status on mount
  // 2. Update hasDatabase state with response
  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "GET_TAB_DATABASE_STATUS" },
      (response) => {
        if (response) {
          setHasDatabase(response.hasDatabase);
        }
      },
    );
  }, []);

  const handleMouseEnter = () => setShowStatus(true);
  const handleMouseLeave = () => setShowStatus(false);

  // 1. Show loading spinner while querying
  // 2. Show active/inactive icon based on state
  // 3. Show status text on hover
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
