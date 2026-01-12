import { SiSqlite } from "react-icons/si";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";

/**
 * Sidebar header component with app branding and collapse toggle
 *
 * @remarks
 * Displays SiSqlite icon with "Web Sqlite" text and collapse toggle button.
 * Text is hidden when sidebar is collapsed. Toggle icon changes based on state.
 *
 * @param props.isCollapsed - Current collapse state of sidebar
 * @param props.onToggle - Callback to toggle collapse state
 *
 * @returns JSX.Element - SidebarHeader component
 */
interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const SidebarHeader = ({
  isCollapsed,
  onToggle,
}: SidebarHeaderProps) => {
  /**
   * 1. Determine toggle icon based on collapse state
   * 2. FaAngleRight shows when expanded (indicates can collapse)
   * 3. FaAngleLeft shows when collapsed (indicates can expand)
   */
  const ToggleIcon = isCollapsed ? FaAngleLeft : FaAngleRight;

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      {/* 1. Display SiSqlite icon always visible */}
      {/* 2. Show "Web Sqlite" text only when expanded */}
      {/* 3. Both elements align left in flex row */}
      <div className="flex items-center gap-2">
        <SiSqlite className="text-blue-600 text-xl flex-shrink-0" />
        {!isCollapsed && (
          <span className="font-semibold text-gray-700 text-sm">
            Web Sqlite
          </span>
        )}
      </div>

      {/* 1. Collapse toggle button always visible */}
      {/* 2. Hover effect for better UX */}
      {/* 3. onClick triggers toggle callback from parent */}
      <button
        onClick={onToggle}
        className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 rounded transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ToggleIcon className="text-sm" />
      </button>
    </div>
  );
};
