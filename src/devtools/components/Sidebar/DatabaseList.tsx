import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FaDatabase } from "react-icons/fa";
import {
  databaseService,
  type DatabaseSummary,
} from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import { getDatabaseNameFromPath } from "@/devtools/utils/databaseNames";
import { SidebarLink } from "./SidebarLink";

/**
 * Database list navigation item
 *
 * @remarks
 * Fetches databases via inspected window eval and renders them under "Opened DB".
 * Clicking a database navigates to /openedDB/:dbname/tables (F-002).
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
    () => databaseService.getDatabases(),
    [],
    [],
  );

  /**
   * 1. Determine if currently on root route
   * 2. Used for "Opened DB" header active styling
   * 3. Keeps header inactive when viewing a specific database
   */
  const isActive =
    location.pathname === "/"
    || location.pathname === ""
    || (isCollapsed && location.pathname.startsWith("/openedDB"));
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
    <div className="flex flex-col ">
      <SidebarLink
        to="/"
        label="Opened DB"
        icon={FaDatabase}
        isActive={isActive}
        isCollapsed={isCollapsed}
        className="px-4 py-2"
      />

      {!isCollapsed && (
        <div className="pb-2">
          {isLoading && (
            <div className="px-8 text-xs text-secondary-500">
              Loading databases...
            </div>
          )}

          {!isLoading && error && (
            <div className="px-8 py-2 text-xs text-error-600">
              <span>{error}</span>
              <button
                onClick={reload}
                className="ml-2 text-primary-600 hover:text-primary-700"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && databases.length === 0 && (
            <div className="px-8  text-xs text-secondary-500">
              No databases opened
            </div>
          )}

          {!isLoading
            && !error
            && databases.map((database) => {
              const isDbActive = activeDatabase === database.name;

              return (
                <SidebarLink
                  key={database.name}
                  to={`/openedDB/${encodeURIComponent(database.name)}/tables`}
                  label={database.name}
                  isActive={isDbActive}
                  className="px-8 py-2 text-xs"
                  style={{
                    fontSize: "0.8rem",
                  }}
                />
              );
            })}
        </div>
      )}
    </div>
  );
};
