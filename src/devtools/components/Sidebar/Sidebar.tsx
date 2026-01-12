import { useState } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { DatabaseList } from "./DatabaseList";
import { OPFSLink } from "./OPFSLink";

/**
 * Sidebar navigation component for Web Sqlite DevTools
 *
 * @remarks
 * Provides collapsible sidebar with navigation items for databases and OPFS browser.
 * Collapse state defaults to expanded (per FR-044) and manages width state locally.
 *
 * @returns JSX.Element - Sidebar component
 */
export const Sidebar = () => {
  /**
   * 1. Manage collapse state (default: expanded per FR-044)
   * 2. Width toggles between 20% (expanded) and auto (collapsed)
   * 3. State is local (persistence to chrome.storage.local deferred to future task)
   */
  const [isCollapsed, setIsCollapsed] = useState(false);

  /**
   * 1. Toggle collapse state
   * 2. Trigger re-render with new width classes
   * 3. Header, nav items, and toggle button respond to state
   */
  const handleToggle = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <aside
      className={`flex flex-col h-full border-r border-gray-200 bg-gray-50 ${
        isCollapsed ? "w-auto" : "w-1/5"
      }`}
    >
      <SidebarHeader isCollapsed={isCollapsed} onToggle={handleToggle} />

      <nav className="flex-1 overflow-y-auto">
        <DatabaseList isCollapsed={isCollapsed} />
        <OPFSLink isCollapsed={isCollapsed} />
      </nav>
    </aside>
  );
};
