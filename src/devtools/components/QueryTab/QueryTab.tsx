import { useParams } from "react-router-dom";
import { useState } from "react";
import { FiSidebar } from "react-icons/fi";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";
import { databaseService } from "@/devtools/services/databaseService";
import { useQueryHistory } from "@/devtools/hooks/useQueryHistory";
import { HistorySidebar } from "./HistorySidebar";

/**
 * QueryTab component
 *
 * @remarks
 * - SQL editor with CodeMirror (placeholder for now)
 * - Execute button + Ctrl+Enter shortcut
 * - Results table below editor
 * - Query history sidebar for quick re-execution
 * - Export buttons (CSV/JSON)
 *
 * @returns JSX.Element - Query tab layout
 */
export const QueryTab = () => {
  const params = useParams<{ dbname: string }>();
  const dbname = decodeDatabaseName(params.dbname || "");

  // Editor state
  const [sql, setSql] = useState("SELECT * FROM table_name LIMIT 100");
  const [results, setResults] = useState<{
    rows: Record<string, unknown>[];
    columns: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // History sidebar state
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  // Query history hook
  const {
    history,
    isLoading: isHistoryLoading,
    error: historyError,
    addQuery,
    removeQuery,
    clearHistory,
  } = useQueryHistory(dbname || "");

  /**
   * Execute SQL query
   *
   * 1. Validate database name
   * 2. Execute query via service layer
   * 3. Add to history on success
   * 4. Update results or error state
   */
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

        // Add to history on success
        await addQuery(sql, dbname);
      } else {
        setError(response.error ?? "Query execution failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Ctrl+Enter keyboard shortcut
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      handleExecute();
    }
  };

  /**
   * Load query from history into editor
   */
  const handleLoadQuery = (querySql: string) => {
    setSql(querySql);
    // Auto-execute on load? For now, just load into editor
  };

  if (!dbname) {
    return (
      <div className="p-4 text-sm text-gray-500">No database selected.</div>
    );
  }

  return (
    <div className="flex h-full">
      {/* History Sidebar */}
      {isHistoryOpen && (
        <div className="w-64 flex-shrink-0 border-r border-gray-200">
          <HistorySidebar
            history={history}
            isLoading={isHistoryLoading}
            currentSql={sql}
            onLoadQuery={handleLoadQuery}
            onDeleteQuery={removeQuery}
            onClearHistory={clearHistory}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header with history toggle */}
        <div className="px-4 py-2 border-b border-gray-200 bg-white flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">SQL Query</h3>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title={isHistoryOpen ? "Hide History" : "Show History"}
          >
            <FiSidebar size={16} />
          </button>
        </div>

        {/* SQL Editor Area */}
        <div className="flex-1 flex flex-col p-4">
          <p className="text-xs text-gray-500 mb-2">
            Press Ctrl+Enter to execute
          </p>

          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 w-full p-3 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter SQL query here..."
          />

          {/* Action buttons */}
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

          {/* Error display */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* History error display */}
          {historyError && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                History error: {historyError}
              </p>
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
    </div>
  );
};
