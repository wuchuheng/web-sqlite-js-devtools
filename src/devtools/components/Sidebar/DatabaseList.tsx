import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaDatabase } from "react-icons/fa";
import {
  getDatabasesFromInspectedWindow,
  type DatabaseSummary,
} from "@/devtools/inspectedWindow";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import { getDatabaseNameFromPath } from "@/devtools/utils/databaseNames";

/**
 * Database list navigation item
 *
 * @remarks
 * Fetches databases via inspected window eval and renders them under "Opened DB".
 * Clicking a database navigates to /openedDB/:dbname.
 *
 * @param props.isCollapsed - Current collapse state of sidebar
 *
 * @returns JSX.Element - DatabaseList component
 */
interface DatabaseListProps {
  isCollapsed: boolean;
}

/**
 * 1. Load database list from inspected window
 * 2. Render nested items under "Opened DB"
 * 3. Navigate to database routes on selection
 *
 * @param props - DatabaseList props
 * @returns JSX.Element - Database list navigation
 */
export const DatabaseList = ({ isCollapsed }: DatabaseListProps) => {
  const location = useLocation();
  const {
    data: databases,
    isLoading,
    error,
    reload,
  } = useInspectedWindowRequest<DatabaseSummary[]>(
    () => getDatabasesFromInspectedWindow(),
    [],
    [],
  );

  /**
   * 1. Check if current route is root ("/")
   * 2. Return active styling classes if on root route
   * 3. Return default hover classes if not active
   */
  const getActiveClass = (isActive: boolean): string =>
    isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100";

  /**
   * 1. Determine if currently on root route
   * 2. Used for "Opened DB" header active styling
   * 3. Keeps header inactive when viewing a specific database
   */
  const isActive = location.pathname === "/" || location.pathname === "";
  const activeDatabase = useMemo(
    () => getDatabaseNameFromPath(location.pathname),
    [location.pathname],
  );

  /**
   * 1. Render header and nested database list
   * 2. Show loading/empty/error states when expanded
   * 3. Highlight active database route
   *
   * @returns JSX.Element - Database list navigation
   */
  return (
    <div className="flex flex-col">
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
        {/* 2. Database list shown below when expanded */}
        {!isCollapsed && <span className="text-sm">Opened DB</span>}
      </Link>

      {!isCollapsed && (
        <div className="pb-2">
          {isLoading && (
            <div className="px-8 py-2 text-xs text-gray-500">
              Loading databases...
            </div>
          )}

          {!isLoading && error && (
            <div className="px-8 py-2 text-xs text-red-600">
              <span>{error}</span>
              <button
                onClick={reload}
                className="ml-2 text-blue-600 hover:text-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && databases.length === 0 && (
            <div className="px-8 py-2 text-xs text-gray-500">
              No databases opened
            </div>
          )}

          {!isLoading
            && !error
            && databases.map((database) => {
              const isDbActive = activeDatabase === database.name;

              return (
                <Link
                  key={database.name}
                  to={`/openedDB/${encodeURIComponent(database.name)}`}
                  className={`flex items-center justify-between gap-2 px-8 py-1 text-xs transition-colors ${getActiveClass(
                    isDbActive,
                  )}`}
                >
                  <span className="truncate" title={database.name}>
                    {database.name}
                  </span>
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
};
