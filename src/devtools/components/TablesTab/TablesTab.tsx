import {
  Outlet,
  useParams,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useMemo } from "react";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import { EmptyState } from "./EmptyState";

/**
 * TablesTab component
 *
 * @remarks
 * - Renders 25% table list sidebar + 75% content area
 * - Uses Outlet for nested :tableName route
 * - Table selection changes route to /openedDB/:dbname/tables/:tableName
 * - Redirects to first table on mount if no table selected (optional)
 *
 * @returns JSX.Element - Tables tab layout
 */
export const TablesTab = () => {
  const params = useParams<{ dbname: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const rawDbname = params.dbname || "";
  const dbname = useMemo(() => {
    try {
      return decodeURIComponent(rawDbname);
    } catch {
      return rawDbname;
    }
  }, [rawDbname]);

  // Fetch table list
  const {
    data: tables,
    isLoading,
    error,
    reload,
  } = useInspectedWindowRequest<string[]>(
    () => databaseService.getTableList(dbname),
    [dbname],
    [],
  );

  // Check if we're currently on a specific table route
  // TablesTab is rendered for /openedDB/:dbname/tables and its nested routes
  // If there's an additional path segment after /tables, we have a table selection
  const hasTableSelection =
    location.pathname.match(/\/tables\/[^/]+$/) !== null;

  // Build table link
  const getTableLink = (tableName: string) => {
    return `/openedDB/${rawDbname}/tables/${tableName}`;
  };

  // Get active table from path
  const activeTable = useMemo(() => {
    const match = location.pathname.match(/\/tables\/([^/]+)$/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const getTableClass = (isActive: boolean): string =>
    isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100";

  if (!dbname) {
    return (
      <div className="p-4 text-sm text-gray-500">No database selected.</div>
    );
  }

  return (
    <div className="flex h-full">
      {/* 25% Table List Sidebar */}
      <aside className="w-1/4 min-w-[200px] max-w-[300px] border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-xs font-semibold uppercase text-gray-500">
            Tables
          </h2>
        </div>
        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="px-4 py-2 text-xs text-gray-500">
              Loading tables...
            </div>
          )}

          {!isLoading && error && (
            <div className="px-4 py-2 text-xs text-red-600">
              <span>{error}</span>
              <button
                onClick={reload}
                className="ml-2 text-blue-600 hover:text-blue-700"
                type="button"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && tables.length === 0 && (
            <div className="px-4 py-2 text-xs text-gray-500">
              No tables found
            </div>
          )}

          {!isLoading
            && !error
            && tables.map((tableName) => {
              const isActive = tableName === activeTable;
              return (
                <NavLink
                  key={tableName}
                  to={getTableLink(tableName)}
                  className={`flex w-full items-center px-4 py-2 text-left text-xs transition-colors ${getTableClass(
                    isActive,
                  )}`}
                >
                  <span className="truncate" title={tableName}>
                    {tableName}
                  </span>
                </NavLink>
              );
            })}
        </div>
      </aside>

      {/* 75% Table Content Area */}
      <section className="w-3/4 flex flex-col overflow-hidden">
        {/* Show EmptyState when no table is selected, otherwise show Outlet */}
        {hasTableSelection ? <Outlet /> : <EmptyState />}
      </section>
    </div>
  );
};
