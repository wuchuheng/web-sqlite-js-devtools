import { useParams } from "react-router-dom";
import { useState, useImperativeHandle, useRef, useEffect } from "react";
import { FiSidebar } from "react-icons/fi";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";
import { databaseService } from "@/devtools/services/databaseService";
import { useQueryHistory } from "@/devtools/hooks/useQueryHistory";
import { HistorySidebar } from "./HistorySidebar";

/**
 * Props for QueryTab component
 */
interface QueryTabProps {
  /** Ref for execute function (used by keyboard shortcuts) */
  onExecuteRef: React.MutableRefObject<(() => void) | null>;
  /** Ref for clear function (used by keyboard shortcuts) */
  onClearRef: React.MutableRefObject<(() => void) | null>;
  /** Ref for toggle history function (used by keyboard shortcuts) */
  onToggleHistoryRef: React.MutableRefObject<(() => void) | null>;
}

/**
 * QueryTab component
 *
 * @remarks
 * - SQL editor with CodeMirror (placeholder for now)
 * - Execute button + Ctrl+Enter shortcut (global)
 * - Results table below editor
 * - Query history sidebar for quick re-execution
 * - Export buttons (CSV/JSON)
 * - Exposes functions via refs for global keyboard shortcuts
 *
 * @param props - QueryTabProps
 * @returns JSX.Element - Query tab layout
 */
export const QueryTab = ({
  onExecuteRef,
  onClearRef,
  onToggleHistoryRef,
}: QueryTabProps) => {
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
    if (!dbname) {
      return;
    }

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
   * Clear SQL editor
   */
  const handleClear = () => {
    setSql("");
  };

  /**
   * Toggle history sidebar
   */
  const handleToggleHistory = () => {
    setIsHistoryOpen((prev) => !prev);
  };

  /**
   * Load query from history into editor
   */
  const handleLoadQuery = (querySql: string) => {
    setSql(querySql);
    // Auto-execute on load? For now, just load into editor
  };

  /**
   * Expose functions via refs for global keyboard shortcuts
   */
  useImperativeHandle(onExecuteRef, () => handleExecute, [handleExecute]);
  useImperativeHandle(onClearRef, () => handleClear, []);
  useImperativeHandle(onToggleHistoryRef, () => handleToggleHistory, [
    handleToggleHistory,
  ]);

  /**
   * Focus textarea on mount (for keyboard shortcuts)
   */
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-focus textarea when query tab becomes active
   */
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!dbname) {
    return (
      <div className="p-4 text-sm text-secondary-500">
        No database selected.
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* History Sidebar */}
      {isHistoryOpen && (
        <div className="w-64 flex-shrink-0 border-r border-secondary-200">
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
        <div className="px-4 py-2 border-b border-secondary-200 bg-white flex items-center justify-between">
          <h3 className="text-sm font-medium text-secondary-700">SQL Query</h3>
          <button
            type="button"
            onClick={handleToggleHistory}
            className="p-1.5 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded transition-colors"
            title={isHistoryOpen ? "Hide History" : "Show History"}
          >
            <FiSidebar size={16} />
          </button>
        </div>

        {/* SQL Editor Area */}
        <div className="flex-1 flex flex-col p-4">
          <p className="text-xs text-secondary-500 mb-2">
            Press{" "}
            <kbd className="font-mono bg-secondary-100 px-1 rounded">
              Ctrl+Enter
            </kbd>{" "}
            to execute
          </p>

          <textarea
            ref={textareaRef}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            className="flex-1 w-full p-3 font-mono text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Enter SQL query here..."
          />

          {/* Action buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleExecute}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:bg-secondary-400 disabled:cursor-not-allowed"
              type="button"
            >
              {isLoading ? "Executing..." : "Execute"}
            </button>

            <button
              className="px-3 py-2 border border-secondary-300 text-secondary-700 text-sm font-medium rounded-md hover:bg-secondary-50"
              type="button"
            >
              Export CSV
            </button>

            <button
              className="px-3 py-2 border border-secondary-300 text-secondary-700 text-sm font-medium rounded-md hover:bg-secondary-50"
              type="button"
            >
              Export JSON
            </button>
          </div>

          {/* Error display */}
          {error && (
            <div className="mt-3 p-3 bg-error-50 border border-error-200 rounded-md">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )}

          {/* History error display */}
          {historyError && (
            <div className="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-md">
              <p className="text-sm text-warning-700">
                History error: {historyError}
              </p>
            </div>
          )}
        </div>

        {/* Results Area */}
        {results && (
          <div className="border-t border-secondary-200 p-4">
            <h3 className="text-sm font-medium text-secondary-700 mb-2">
              Results
            </h3>
            <div className="text-xs text-secondary-500">
              Query results will appear here. (CodeMirror integration pending)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
