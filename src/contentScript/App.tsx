/**
 * Content Script App (MAIN World)
 *
 * @remarks
 * Monitors window.__web_sqlite and sends database updates to background.
 */

import { useEffect } from "react";
import { monitorAndNotifyBackground } from "@/shared/web-sqlite/monitor";

/**
 * Main content script component
 */
export default function App() {
  useEffect(() => {
    return monitorAndNotifyBackground();
  }, []);

  // Content script doesn't render any UI
  return null;
}
