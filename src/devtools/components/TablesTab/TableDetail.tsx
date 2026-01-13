import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useCallback, useState, useEffect } from "react";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";
import { BsReverseLayoutSidebarInsetReverse } from "react-icons/bs";
import { SchemaPanel } from "./SchemaPanel";
import { PaginationBar } from "../TableTab/PaginationBar";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";

/**
 * Tab button component for table navigation
 */
interface TableTabButtonProps {
  tableName: string;
  isActive: boolean;
  onClick: () => void;
}

const TableTabButton = ({
  tableName,
  isActive,
  onClick,
}: TableTabButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
        ${
          isActive
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
        }
      `}
    >
      {tableName}
    </button>
  );
};

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
  const rawDbname = params.dbname || "";

  // Pagination state - properly sync with URL search params
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);

  // Schema panel state - toggle visibility and tabbed view (F-003)
  const [schemaPanelVisible, setSchemaPanelVisible] = useState(false); // Hidden by default
  const [schemaTab, setSchemaTab] = useState<"table" | "ddl">("table"); // Default to table view

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

  // Fetch all tables for the database (for tab bar)
  const { data: tables, isLoading: tablesLoading } = useInspectedWindowRequest(
    () => databaseService.getTableList(dbname),
    [dbname],
    [],
  );

  // Navigate to a specific table
  const handleTableClick = useCallback(
    (targetTableName: string) => {
      navigate(`/openedDB/${rawDbname}/tables/${targetTableName}`, {
        replace: true,
      });
    },
    [navigate, rawDbname],
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
      {/* Table tabs header bar - shows all tables as tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white">
        {/* Left: Table tabs container with overflow */}
        <div className="flex items-center overflow-x-auto flex-1">
          {tablesLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Loading tables...
            </div>
          ) : tables.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No tables found
            </div>
          ) : (
            tables.map((tableTableName) => (
              <TableTabButton
                key={tableTableName}
                tableName={tableTableName}
                isActive={tableTableName === tableName}
                onClick={() => handleTableClick(tableTableName)}
              />
            ))
          )}
        </div>

        {/* Right: Schema toggle button */}
        <button
          type="button"
          onClick={handleToggleSchema}
          className="p-1.5 text-gray-600 hover:text-gray-700 border-l border-gray-200 transition-colors"
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
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Loading...
            </div>
          ) : schemaError || dataError ? (
            <div className="flex-1 flex items-center justify-center text-red-600">
              {schemaError || dataError}
            </div>
          ) : !schema ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              No table data available
            </div>
          ) : (
            <>
              {/* Table Data */}
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {columns.map((column) => (
                          <td
                            key={column}
                            className="px-4 py-2 whitespace-nowrap text-sm text-gray-900"
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

        {/* Right: Schema Panel - Toggleable with tabbed view */}
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
  );
};
