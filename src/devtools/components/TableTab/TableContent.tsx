import { useCallback, useMemo, useState } from "react";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import { TableSchemaPanel } from "./TableSchema";
import { PaginationBar } from "./PaginationBar";

/**
 * SQL identifier escaper (copied from databaseService)
 */
const escapeIdentifier = (identifier: string): string => {
  return `"${identifier.replace(/"/g, '""')}"`;
};

/**
 * Table content viewer component
 *
 * @remarks
 * Displays table schema and paginated data for a selected table.
 *
 * @param props.dbname - Database name
 * @param props.tableName - Table name
 *
 * @returns JSX.Element - Table content viewer
 */
interface TableContentProps {
  dbname: string;
  tableName: string;
}

export const TableContent = ({ dbname, tableName }: TableContentProps) => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [refreshKey, setRefreshKey] = useState(0);

  // Schema query
  const {
    data: schema,
    isLoading: schemaLoading,
    error: schemaError,
  } = useInspectedWindowRequest(
    () => databaseService.getTableSchema(dbname, tableName),
    [dbname, tableName],
    null,
  );

  // Data query - construct SQL with escaped table name
  const sql = useMemo(
    () => `SELECT * FROM ${escapeIdentifier(tableName)}`,
    [tableName],
  );

  const {
    data: tableData,
    isLoading: dataLoading,
    error: dataError,
    reload: _reloadData,
  } = useInspectedWindowRequest(
    () => databaseService.queryTableData(dbname, sql, limit, page * limit),
    [dbname, sql, limit, page, refreshKey],
    null,
  );

  // Reset to page 0 when limit changes
  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(0);
  }, []);

  // Refresh data
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Render cell value
  const renderCellValue = useCallback((value: unknown): string => {
    if (value === null) {
      return "NULL";
    }
    if (value === undefined) {
      return "";
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  }, []);

  const total = tableData?.total ?? 0;
  const rows = tableData?.rows ?? [];
  const columns =
    tableData?.columns ?? schema?.columns.map((c) => c.name) ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Table header with name */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700">{tableName}</h2>
      </div>

      {/* Schema panel */}
      <TableSchemaPanel
        schema={schema}
        loading={schemaLoading}
        error={schemaError}
      />

      {/* Data table or error/loading state */}
      {dataError ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm text-red-600 mb-2">{dataError}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Data table with fixed header */}
          <div className="flex-1 overflow-auto">
            {dataLoading && !tableData ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading data...</div>
              </div>
            ) : rows.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">
                  {total === 0 ? "No data in this table" : "No rows to display"}
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr>
                    {columns.map((columnName) => {
                      const colInfo = schema?.columns.find(
                        (c) => c.name === columnName,
                      );
                      return (
                        <th
                          key={columnName}
                          className="px-4 py-2 text-left bg-gray-50 border-b border-gray-200"
                        >
                          <div>
                            <div className="font-medium text-gray-700">
                              {columnName}
                            </div>
                            {colInfo?.type && (
                              <div className="text-xs text-gray-500">
                                {colInfo.type}
                              </div>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-gray-100">
                      {columns.map((columnName) => (
                        <td
                          key={`${rowIndex}-${columnName}`}
                          className="px-4 py-2 text-sm text-gray-700"
                        >
                          {renderCellValue(row[columnName])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination bar */}
          <PaginationBar
            page={page}
            total={total}
            limit={limit}
            loading={dataLoading}
            onPageChange={setPage}
            onLimitChange={handleLimitChange}
            onRefresh={handleRefresh}
          />
        </>
      )}
    </div>
  );
};
