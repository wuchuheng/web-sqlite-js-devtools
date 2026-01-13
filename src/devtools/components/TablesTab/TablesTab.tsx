import {
  Outlet,
  useParams,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  useMemo,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import { EmptyState } from "./EmptyState";
import { type TableTab } from "./OpenedTableTabs";
import { ResizeHandle } from "@/devtools/components/Shared/ResizeHandle";

/**
 * Context for opened tabs state management
 *
 * @remarks
 * - Provides openedTabs and activeTab state to child components
 * - Provides handlers for opening, selecting, and closing tabs
 * - State is managed at TablesTab level (parent of TableDetail)
 */
interface OpenedTabsContextValue {
  /** Array of opened table tabs */
  openedTabs: TableTab[];
  /** Currently active tab */
  activeTab: TableTab | null;
  /** Handle opening a table (adds to opened tabs if not already there) */
  handleOpenTable: (tableName: string) => void;
  /** Handle selecting a tab (sets as active) */
  handleSelectTab: (tab: TableTab) => void;
  /** Handle closing a tab (removes and auto-switches) */
  handleCloseTab: (tab: TableTab) => void;
}

const OpenedTabsContext = createContext<OpenedTabsContextValue | null>(null);

/**
 * Hook to access opened tabs context
 *
 * @throws Error if used outside OpenedTabsProvider
 * @returns Opened tabs context value
 */
export const useOpenedTabs = (): OpenedTabsContextValue => {
  const context = useContext(OpenedTabsContext);
  if (!context) {
    throw new Error("useOpenedTabs must be used within OpenedTabsProvider");
  }
  return context;
};

/**
 * TablesTab component
 *
 * @remarks
 * - Renders 25% table list sidebar + 75% content area
 * - Uses Outlet for nested :tableName route
 * - Table selection changes route to /openedDB/:dbname/tables/:tableName
 * - Manages opened tabs state (F-005) via context for child components
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

  // ============================================
  // Opened Tabs State Management (F-005)
  // ============================================

  /** Opened tabs state - tracks which tables are currently open in the tab bar */
  const [openedTabs, setOpenedTabs] = useState<TableTab[]>([]);

  /** Active tab state - currently selected table */
  const [activeTab, setActiveTab] = useState<TableTab | null>(null);

  // ============================================
  // Sidebar Resizable Width (F-006)
  // ============================================

  /** Sidebar width state - resizable with drag handle (default: 300px) */
  const [sidebarWidth, setSidebarWidth] = useState(300);

  /**
   * Handle sidebar resize drag
   *
   * @param deltaX - Change in mouse X position
   * @remarks
   * - Updates sidebar width by adding delta
   * - Enforces min (200px) and max (600px) constraints
   * - Uses Math.max/min for clamping
   */
  const handleSidebarResize = useCallback((deltaX: number) => {
    setSidebarWidth((prev) => {
      const newWidth = prev + deltaX;
      return Math.max(200, Math.min(600, newWidth));
    });
  }, []);

  /**
   * Handle opening a table and adding it to opened tabs
   *
   * @param tableName - The name of the table to open
   * @remarks
   * - Checks if table already opened (no duplicates)
   * - Appends to openedTabs if new
   * - Sets as activeTab and navigates
   */
  const handleOpenTable = useCallback(
    (tableName: string) => {
      const newTab: TableTab = { dbname, tableName };

      // 1. Check if table already in openedTabs (avoid duplicates)
      const exists = openedTabs.some(
        (t) => t.dbname === dbname && t.tableName === tableName,
      );

      // 2. Add to openedTabs if not already there
      if (!exists) {
        setOpenedTabs((prev) => [...prev, newTab]);
      }

      // 3. Set as active tab
      setActiveTab(newTab);

      // 4. Navigate to table
      navigate(`/openedDB/${rawDbname}/tables/${tableName}`);
    },
    [dbname, openedTabs, rawDbname, navigate],
  );

  /**
   * Handle selecting a tab as active
   *
   * @param tab - The tab to select
   * @remarks
   * - Sets the tab as active
   * - Navigates to the table route
   */
  const handleSelectTab = useCallback(
    (tab: TableTab) => {
      setActiveTab(tab);
      navigate(
        `/openedDB${tab.dbname ? "/" + encodeURIComponent(tab.dbname) : ""}/tables/${tab.tableName}`,
      );
    },
    [navigate],
  );

  /**
   * Handle closing a tab
   *
   * @param tabToClose - The tab to close
   * @remarks
   * - Removes tab from openedTabs
   * - Auto-switches to next available tab
   * - Navigates to parent route if no tabs remain
   */
  const handleCloseTab = useCallback(
    (tabToClose: TableTab) => {
      setOpenedTabs((prev) => {
        // 1. Filter out the closed tab
        const filtered = prev.filter(
          (t) =>
            !(
              t.dbname === tabToClose.dbname
              && t.tableName === tabToClose.tableName
            ),
        );

        // 2. Auto-switch to next available tab
        if (filtered.length > 0) {
          // Try to select the tab after the closed one
          const closedIndex = prev.findIndex(
            (t) =>
              t.dbname === tabToClose.dbname
              && t.tableName === tabToClose.tableName,
          );
          const nextTab =
            filtered[closedIndex] || filtered[filtered.length - 1];
          setActiveTab(nextTab);
          navigate(`/openedDB/${rawDbname}/tables/${nextTab.tableName}`);
        } else {
          // No tabs left - navigate to parent and clear active tab
          setActiveTab(null);
          navigate(`/openedDB/${rawDbname}/tables`);
        }

        return filtered;
      });
    },
    [rawDbname, navigate],
  );

  // Context value for child components
  const contextValue: OpenedTabsContextValue = {
    openedTabs,
    activeTab,
    handleOpenTable,
    handleSelectTab,
    handleCloseTab,
  };

  // ============================================
  // Table List Data Fetching
  // ============================================

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
    <OpenedTabsContext.Provider value={contextValue}>
      <div className="flex h-full">
        {/* Table List Sidebar - Resizable (F-006) */}
        <aside
          className="relative border-r border-gray-200 bg-white flex flex-col"
          style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
        >
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
                  <button
                    key={tableName}
                    type="button"
                    onClick={() => handleOpenTable(tableName)}
                    className={`flex w-full items-center px-4 py-2 text-left text-xs transition-colors ${getTableClass(
                      isActive,
                    )}`}
                  >
                    <span className="truncate" title={tableName}>
                      {tableName}
                    </span>
                  </button>
                );
              })}
          </div>

          {/* Resize Handle at Right Edge (F-006) */}
          <ResizeHandle
            position="right"
            onDrag={handleSidebarResize}
            currentWidth={sidebarWidth}
            minWidth={200}
            maxWidth={600}
          />
        </aside>

        {/* 75% Table Content Area */}
        <section className="w-3/4 flex flex-col overflow-hidden">
          {/* Show EmptyState when no table is selected, otherwise show Outlet */}
          {hasTableSelection ? <Outlet /> : <EmptyState />}
        </section>
      </div>
    </OpenedTabsContext.Provider>
  );
};
