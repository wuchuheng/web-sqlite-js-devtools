import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { TableList } from "./TableList";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";

/**
 * Database view for /openedDB/:dbname route
 *
 * @remarks
 * Renders the table list for the selected database and a placeholder
 * for table data/content (implemented in TASK-06).
 *
 * 1. Decode dbname from route params
 * 2. Reset table selection when database changes
 * 3. Render table list + placeholder content
 *
 * @returns JSX.Element - Database view layout
 */
export const DatabaseView = () => {
  const params = useParams<{ dbname: string }>();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  /**
   * 1. Decode dbname from the route param
   * 2. Fallback to raw value on decode errors
   * 3. Return empty string when missing
   */
  const dbname = useMemo(() => {
    const rawName = params.dbname || "";

    return decodeDatabaseName(rawName);
  }, [params.dbname]);

  useEffect(() => {
    setSelectedTable(null);
  }, [dbname]);

  if (!dbname) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No database selected.
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <aside className="w-64 border-r border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-xs font-semibold uppercase text-gray-500">
            Tables
          </h2>
        </div>
        <TableList
          dbname={dbname}
          selectedTable={selectedTable}
          onSelect={setSelectedTable}
        />
      </aside>

      <section className="flex-1 p-4 text-left">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700">{dbname}</h2>
          <p className="text-xs text-gray-500">
            Select a table to view data and schema.
          </p>
        </div>

        <div className="rounded border border-dashed border-gray-300 p-4 text-sm text-gray-500">
          {selectedTable
            ? `Table "${selectedTable}" view coming in TASK-06.`
            : "Table view coming in TASK-06."}
        </div>
      </section>
    </div>
  );
};
