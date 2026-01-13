import { useState } from "react";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import { SidebarHeader } from "./SidebarHeader";
import { DatabaseList } from "./DatabaseList";
import { OPFSLink } from "./OPFSLink";
import { SidebarIcon } from "./SidebarIcon";

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

  /**
   * 1. Determine toggle icon based on collapse state
   * 2. Uses same logic as previous header implementation for consistency
   * 3. FaAngleRight shows when expanded
   * 4. FaAngleLeft shows when collapsed
   */
  const ToggleIcon = isCollapsed ? FaAngleRight : FaAngleLeft;

  return (
    <aside
      className={`flex flex-col h-full border-r border-gray-200 bg-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-1/5 min-w-[200px]"
      }`}
    >
      <SidebarHeader isCollapsed={isCollapsed} />

      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        <DatabaseList isCollapsed={isCollapsed} />
        <OPFSLink isCollapsed={isCollapsed} />
      </nav>

      {/* 
        1. Footer section for toggle button
        2. Aligned to bottom of sidebar
        3. Contains only the icon button
      */}
      <div className="py-2 border-t border-gray-200 flex justify-center">
        <button
          onClick={handleToggle}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <SidebarIcon icon={ToggleIcon} />
        </button>
      </div>
    </aside>
  );
};
