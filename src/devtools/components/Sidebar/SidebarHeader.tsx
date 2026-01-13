import { SiSqlite } from "react-icons/si";
import { SidebarIcon } from "./SidebarIcon";

/**
 * Sidebar header component with app branding
 *
 * @remarks
 * Displays SiSqlite icon with "Web Sqlite" text.
 * Text is hidden when sidebar is collapsed.
 *
 * @param props.isCollapsed - Current collapse state of sidebar
 *
 * @returns JSX.Element - SidebarHeader component
 */
interface SidebarHeaderProps {
  isCollapsed: boolean;
}

export const SidebarHeader = ({ isCollapsed }: SidebarHeaderProps) => {
  return (
    <div
      className={`flex items-center p-4 border-b border-gray-200 h-14 ${
        isCollapsed ? "justify-center" : ""
      }`}
    >
      {/* 1. Display SiSqlite icon always visible */}
      {/* 2. Show "Web Sqlite" text only when expanded */}
      {/* 3. Both elements align left in flex row */}
      <div
        className={`flex items-center overflow-hidden transition-all duration-300 ${
          isCollapsed ? "gap-0" : "gap-2"
        }`}
      >
        <SidebarIcon icon={SiSqlite} className="text-primary flex-shrink-0" />
        <span
          className={`font-semibold text-gray-700 text-sm whitespace-nowrap transition-all duration-300 ${
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          }`}
        >
          Web Sqlite
        </span>
      </div>
    </div>
  );
};
