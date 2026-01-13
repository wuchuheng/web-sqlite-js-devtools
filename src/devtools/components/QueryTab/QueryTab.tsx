import { useParams } from "react-router-dom";
import { useState } from "react";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";

/**
 * QueryTab component
 *
 * @remarks
 * - SQL editor with CodeMirror (placeholder for now)
 * - Execute button + Ctrl+Enter shortcut
 * - Results table below editor
 * - Export buttons (CSV/JSON)
 *
 * @returns JSX.Element - Query tab layout
 */
export const QueryTab = () => {
  const params = useParams<{ dbname: string }>();
  const dbname = decodeDatabaseName(params.dbname || "");

  const [sql, setSql] = useState("SELECT * FROM table_name LIMIT 100");
  const [results, setResults] = useState<{
    rows: Record<string, unknown>[];
    columns: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = async () => {
    if (!dbname) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await databaseService.execSQL(dbname, sql);

      if (response.success && response.data) {
        // For SELECT queries, we'd use queryTableData instead
        // This is a simplified version for now
        setResults({ rows: [], columns: [] });
      } else {
        setError(response.error ?? "Query execution failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      handleExecute();
    }
  };

  if (!dbname) {
    return (
      <div className="p-4 text-sm text-gray-500">No database selected.</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* SQL Editor Area */}
      <div className="flex-1 flex flex-col p-4">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-700">SQL Query</h3>
          <p className="text-xs text-gray-500">Press Ctrl+Enter to execute</p>
        </div>

        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 w-full p-3 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Enter SQL query here..."
        />

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            type="button"
          >
            {isLoading ? "Executing..." : "Execute"}
          </button>

          <button
            className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
            type="button"
          >
            Export CSV
          </button>

          <button
            className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
            type="button"
          >
            Export JSON
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Results Area */}
      {results && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Results</h3>
          <div className="text-xs text-gray-500">
            Query results will appear here. (CodeMirror integration pending)
          </div>
        </div>
      )}
    </div>
  );
};
