import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";
import { TableSchemaPanel } from "../TableTab/TableSchema";
import { PaginationBar } from "../TableTab/PaginationBar";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";

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

  // Pagination state
  const [page, setPage] = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return [
      parseInt(searchParams.get("page") || "0", 10),
      (newPage: number) => {
        searchParams.set("page", newPage.toString());
        navigate({ search: searchParams.toString() }, { replace: true });
      },
    ];
  }, [location.search, navigate]);

  const [limit, setLimit] = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return [
      parseInt(searchParams.get("limit") || "50", 10),
      (newLimit: number) => {
        searchParams.set("limit", newLimit.toString());
        searchParams.set("page", "0"); // Reset to first page
        navigate({ search: searchParams.toString() }, { replace: true });
      },
    ];
  }, [location.search, navigate]);

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
      const sql = `SELECT * FROM "${tableName}"`;
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

  const handlePageChange = (delta: number) => {
    const newPage = page + delta;
    if (newPage >= 0 && newPage * limit < total) {
      setPage(newPage);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Table tabs header bar - placeholder for future multi-table support */}
      <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{tableName}</h3>
      </div>

      {/* Split View: Table Data (Left) + DDL Panel (Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Table Data Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
                onLimitChange={setLimit}
                onRefresh={handleRefresh}
              />
            </>
          )}
        </div>

        {/* Right: DDL Panel */}
        <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-auto">
          <TableSchemaPanel
            schema={schema}
            loading={schemaLoading}
            error={schemaError}
          />
        </div>
      </div>
    </div>
  );
};
