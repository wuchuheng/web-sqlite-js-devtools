import { getTableListFromInspectedWindow } from "@/devtools/inspectedWindow";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";

/**
 * Table list panel for a single database
 *
 * @param props.dbname - Database name to query
 * @param props.selectedTable - Active table name
 * @param props.onSelect - Callback when a table is selected
 *
 * @returns JSX.Element - Table list panel
 */
interface TableListProps {
  dbname: string;
  selectedTable: string | null;
  onSelect: (tableName: string) => void;
}

/**
 * 1. Fetch table list for the selected database
 * 2. Render loading/empty/error states
 * 3. Highlight active table selection
 *
 * @param props - Table list props
 * @returns JSX.Element - Table list UI
 */
export const TableList = ({
  dbname,
  selectedTable,
  onSelect,
}: TableListProps) => {
  const {
    data: tables,
    isLoading,
    error,
    reload,
  } = useInspectedWindowRequest<string[]>(
    () => getTableListFromInspectedWindow(dbname),
    [dbname],
    [],
  );

  /**
   * 1. Apply active styling for selected table
   * 2. Use neutral styling for inactive tables
   * 3. Keep classes consistent with sidebar styling
   */
  const getTableClass = (isActive: boolean): string =>
    isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100";

  return (
    <div className="flex-1 overflow-auto">
      {isLoading && (
        <div className="px-4 py-2 text-xs text-gray-500">Loading tables...</div>
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
        <div className="px-4 py-2 text-xs text-gray-500">No tables found</div>
      )}

      {!isLoading
        && !error
        && tables.map((tableName) => {
          const isActive = tableName === selectedTable;

          return (
            <button
              key={tableName}
              type="button"
              onClick={() => onSelect(tableName)}
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
  );
};
