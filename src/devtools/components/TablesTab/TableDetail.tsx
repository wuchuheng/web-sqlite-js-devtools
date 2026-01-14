import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useCallback, useState, useEffect } from "react";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";
import { BsReverseLayoutSidebarInsetReverse } from "react-icons/bs";
import { SchemaPanel } from "./SchemaPanel";
import { PaginationBar } from "../TableTab/PaginationBar";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import { OpenedTableTabs } from "./OpenedTableTabs";
import { useOpenedTabs } from "./TablesTab";
import { ResizeHandle } from "@/devtools/components/Shared/ResizeHandle";

/**
 * TableDetail component
 *
 * @remarks
 * - Renders for /openedDB/:dbname/tables/:tableName route
 * - Split view: Table data (left) + DDL panel (right)
 * - Always shows DDL panel when table is selected
 *
 * @returns JSX.Element - Table detail view
 */
export const TableDetail = () => {
  const params = useParams<{ dbname: string; tableName: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const dbname = useMemo(
    () => decodeDatabaseName(params.dbname || ""),
    [params.dbname],
  );
  const tableName = params.tableName || "";
  const _rawDbname = params.dbname || "";

  // Pagination state - properly sync with URL search params
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);

  // Schema panel state - toggle visibility and tabbed view (F-003)
  const [schemaPanelVisible, setSchemaPanelVisible] = useState(false); // Hidden by default
  const [schemaTab, setSchemaTab] = useState<"table" | "ddl">("table"); // Default to table view

  // Schema panel resizable width (F-006)
  const [schemaPanelWidth, setSchemaPanelWidth] = useState(320); // Default 320px (w-80)

  /**
   * Handle schema panel resize drag
   *
   * @param deltaX - Change in mouse X position
   * @remarks
   * - Subtracts delta (dragging left expands panel)
   * - Enforces min (250px) and max (600px) constraints
   */
  const handleSchemaResize = useCallback((deltaX: number) => {
    setSchemaPanelWidth((prev) => {
      const newWidth = prev - deltaX; // Subtract because dragging left expands
      return Math.max(250, Math.min(600, newWidth));
    });
  }, []);

  // ============================================
  // Opened Tabs Context (F-005)
  // ============================================

  /**
   * Get opened tabs context from TablesTab
   *
   * @remarks
   * - TablesTab owns the state for opened tabs
   * - TableDetail consumes via context (nested route)
   * - Provides handlers for opening, selecting, and closing tabs
   */
  const {
    openedTabs,
    activeTab,
    handleOpenTable,
    handleSelectTab,
    handleCloseTab,
  } = useOpenedTabs();

  // Update state when URL search params change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlPage = parseInt(searchParams.get("page") || "0", 10);
    const urlLimit = parseInt(searchParams.get("limit") || "50", 10);
    setPage(urlPage);
    setLimit(urlLimit);
  }, [location.search]);

  // Update URL when page changes
  const setPageWithNavigation = useCallback(
    (newPage: number) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("page", newPage.toString());
      navigate({ search: searchParams.toString() }, { replace: true });
    },
    [location.search, navigate],
  );

  // Update URL when limit changes (resets to page 0)
  const setLimitWithNavigation = useCallback(
    (newLimit: number) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("limit", newLimit.toString());
      searchParams.set("page", "0");
      navigate({ search: searchParams.toString() }, { replace: true });
    },
    [location.search, navigate],
  );

  // Fetch table schema
  const {
    data: schema,
    isLoading: schemaLoading,
    error: schemaError,
    reload: reloadSchema,
  } = useInspectedWindowRequest(
    () => databaseService.getTableSchema(dbname, tableName),
    [dbname, tableName],
    null,
  );

  // Fetch table data
  const {
    data: queryResult,
    isLoading: dataLoading,
    error: dataError,
    reload: reloadData,
  } = useInspectedWindowRequest(
    () => {
      // SQL injection prevention: validate table name only contains safe characters
      // and use proper SQLite identifier quoting
      const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, "");
      if (safeTableName !== tableName) {
        throw new Error("Invalid table name");
      }
      const sql = `SELECT * FROM "${safeTableName}"`;
      return databaseService.queryTableData(dbname, sql, limit, page * limit);
    },
    [dbname, tableName, limit, page],
    null,
  );

  const total = queryResult?.total ?? 0;
  const rows = queryResult?.rows ?? [];
  const columns = queryResult?.columns ?? [];

  const handleRefresh = () => {
    reloadSchema();
    reloadData();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage * limit < total) {
      setPageWithNavigation(newPage);
    }
  };

  // Schema panel handlers (F-003)
  const handleToggleSchema = useCallback(() => {
    setSchemaPanelVisible((prev) => !prev);
  }, []);

  const handleSchemaTabChange = useCallback((tab: "table" | "ddl") => {
    setSchemaTab(tab);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Table tabs header bar - shows only opened tables (F-005) */}
      <div className="flex items-center justify-between border-b border-secondary-200 bg-white">
        {/* Left: Opened table tabs */}
        <OpenedTableTabs
          dbname={dbname}
          tabs={openedTabs}
          activeTab={activeTab}
          onOpenTable={handleOpenTable}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
        />

        {/* Right: Schema toggle button */}
        <button
          type="button"
          onClick={handleToggleSchema}
          className="p-1.5 text-secondary-600 hover:text-secondary-700 border-l border-secondary-200 transition-colors"
          title={schemaPanelVisible ? "Hide schema panel" : "Show schema panel"}
        >
          <BsReverseLayoutSidebarInsetReverse size={14} />
        </button>
      </div>

      {/* Split View: Table Data (Left) + Schema Panel (Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Table Data Panel - Responsive width */}
        <div
          className={`flex flex-col overflow-hidden transition-all duration-200 ease-in-out ${schemaPanelVisible ? "flex-1" : "w-full"}`}
        >
          {schemaLoading || dataLoading ? (
            <div className="flex-1 flex items-center justify-center text-secondary-500">
              Loading...
            </div>
          ) : schemaError || dataError ? (
            <div className="flex-1 flex items-center justify-center text-error-600">
              {schemaError || dataError}
            </div>
          ) : !schema ? (
            <div className="flex-1 flex items-center justify-center text-secondary-500">
              No table data available
            </div>
          ) : (
            <>
              {/* Table Data */}
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50 sticky top-0">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-secondary-50">
                        {columns.map((column) => (
                          <td
                            key={column}
                            className="px-4 py-2 whitespace-nowrap text-sm text-secondary-900"
                          >
                            {String(row[column] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <PaginationBar
                page={page}
                total={total}
                limit={limit}
                loading={dataLoading}
                onPageChange={handlePageChange}
                onLimitChange={setLimitWithNavigation}
                onRefresh={handleRefresh}
              />
            </>
          )}
        </div>

        {/* Right: Schema Panel - Toggleable with tabbed view (F-006: Resizable) */}
        <div
          className="relative transition-all duration-200 ease-in-out"
          style={{
            width: schemaPanelVisible ? `${schemaPanelWidth}px` : "0px",
            minWidth: schemaPanelVisible ? `${schemaPanelWidth}px` : "0px",
          }}
        >
          {schemaPanelVisible && (
            <ResizeHandle
              position="left"
              onDrag={handleSchemaResize}
              currentWidth={schemaPanelWidth}
              minWidth={250}
              maxWidth={600}
            />
          )}
          <SchemaPanel
            schema={schema}
            loading={schemaLoading}
            error={schemaError}
            visible={schemaPanelVisible}
            activeTab={schemaTab}
            onTabChange={handleSchemaTabChange}
          />
        </div>
      </div>
    </div>
  );
};
