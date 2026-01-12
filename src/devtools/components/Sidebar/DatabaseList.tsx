import { Link, useLocation } from "react-router-dom";
import { FaDatabase } from "react-icons/fa";

/**
 * Database list navigation item (stub implementation)
 *
 * @remarks
 * This is a stub component for the "Opened DB" navigation item.
 * In TASK-05, this will be expanded to fetch and display actual databases
 * from web-sqlite-js via GET_DATABASES message channel.
 *
 * For now, clicking navigates to root route "/" as a placeholder.
 *
 * @param props.isCollapsed - Current collapse state of sidebar
 *
 * @returns JSX.Element - DatabaseList component
 */
interface DatabaseListProps {
  isCollapsed: boolean;
}

export const DatabaseList = ({ isCollapsed }: DatabaseListProps) => {
  const location = useLocation();

  /**
   * 1. Check if current route is root ("/")
   * 2. Return active styling classes if on root route
   * 3. Return default hover classes if not active
   */
  const getActiveClass = (isActive: boolean): string =>
    isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100";

  /**
   * 1. Determine if currently on root route
   * 2. Used for active state styling
   * 3. Will be updated in TASK-05 to check /openedDB routes
   */
  const isActive = location.pathname === "/" || location.pathname === "";

  return (
    <Link
      to="/"
      className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors ${getActiveClass(
        isActive,
      )}`}
    >
      {/* 1. FaDatabase icon always visible */}
      {/* 2. Color changes based on active state */}
      <FaDatabase className="text-sm flex-shrink-0" />

      {/* 1. "Opened DB" text hidden when collapsed */}
      {/* 2. Shows actual database list in TASK-05 */}
      {!isCollapsed && <span className="text-sm">Opened DB</span>}
    </Link>
  );
};
