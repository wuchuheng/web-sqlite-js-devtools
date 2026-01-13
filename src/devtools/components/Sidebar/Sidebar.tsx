import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import { SidebarHeader } from "./SidebarHeader";
import { DatabaseList } from "./DatabaseList";
import { OPFSLink } from "./OPFSLink";
import { SidebarIcon } from "./SidebarIcon";

/**
 * Props for Sidebar component
 */
interface SidebarProps {
  /** Current collapse state */
  isCollapsed: boolean;
  /** Toggle callback */
  onToggle: () => void;
}

/**
 * Sidebar navigation component for Web Sqlite DevTools
 *
 * @remarks
 * - Provides collapsible sidebar with navigation items for databases and OPFS browser
 * - Collapse state is managed by parent DevTools component (for keyboard shortcuts)
 * - Width toggles between 20% (expanded) and 64px (collapsed)
 *
 * @param props - SidebarProps
 * @returns JSX.Element - Sidebar component
 */
export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  /**
   * 1. Determine toggle icon based on collapse state
   * 2. Uses same logic as previous header implementation for consistency
   * 3. FaAngleRight shows when expanded
   * 4. FaAngleLeft shows when collapsed
   */
  const ToggleIcon = isCollapsed ? FaAngleRight : FaAngleLeft;

  return (
    <aside
      className={`flex flex-col h-full border-r border-secondary-200 bg-white transition-all duration-300 ${
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
      <div className="py-2 border-t border-secondary-200 flex justify-center">
        <button
          onClick={onToggle}
          className="text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 p-2 rounded-lg transition-colors cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <SidebarIcon icon={ToggleIcon} />
        </button>
      </div>
    </aside>
  );
};
