import { FaHistory, FaRegTrashAlt } from "react-icons/fa";
import { HistoryItem } from "./HistoryItem";
import type { QueryHistoryEntry } from "@/devtools/hooks/useQueryHistory";

/**
 * Props for HistorySidebar component
 */
interface HistorySidebarProps {
  /** History entries to display */
  history: QueryHistoryEntry[];
  /** Loading state */
  isLoading: boolean;
  /** Currently selected SQL (for active state) */
  currentSql?: string;
  /** Click handler for loading query */
  onLoadQuery: (sql: string) => void;
  /** Delete handler for removing entry */
  onDeleteQuery: (timestamp: string) => void;
  /** Clear all history handler */
  onClearHistory: () => void;
}

/**
 * Empty state for history sidebar
 */
const HistoryEmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-4">
    <FaHistory className="text-gray-300 mb-2" size={32} />
    <p className="text-sm text-gray-500 font-medium">No query history yet</p>
    <p className="text-xs text-gray-400 mt-1">
      Execute queries to see them appear here for quick access.
    </p>
  </div>
);

/**
 * Loading state for history sidebar
 */
const HistoryLoadingState = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
  </div>
);

/**
 * Query history sidebar component
 *
 * @remarks
 * - Displays last 10 queries (show all if < 10)
 * - Empty state when no history
 * - Loading state during initial load
 * - Clear all button at bottom
 * - Individual delete buttons on each item
 *
 * @param props - HistorySidebarProps
 * @returns JSX.Element - History sidebar
 */
export const HistorySidebar = ({
  history,
  isLoading,
  currentSql,
  onLoadQuery,
  onDeleteQuery,
  onClearHistory,
}: HistorySidebarProps) => {
  /**
   * Show loading state
   */
  if (isLoading) {
    return <HistoryLoadingState />;
  }

  /**
   * Show empty state
   */
  if (history.length === 0) {
    return <HistoryEmptyState />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaHistory className="text-blue-600" size={14} />
            <span className="text-sm font-medium text-gray-700">
              History ({history.length})
            </span>
          </div>
        </div>
      </div>

      {/* History items */}
      <div className="flex-1 overflow-auto">
        {history.map((entry) => (
          <HistoryItem
            key={entry.timestamp}
            entry={entry}
            isActive={entry.sql === currentSql}
            onClick={() => onLoadQuery(entry.sql)}
            onDelete={() => onDeleteQuery(entry.timestamp)}
          />
        ))}
      </div>

      {/* Clear all button */}
      {history.length > 0 && (
        <div className="p-2 border-t border-gray-200 bg-white">
          <button
            type="button"
            onClick={onClearHistory}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <FaRegTrashAlt size={14} />
            <span>Clear History</span>
          </button>
        </div>
      )}
    </div>
  );
};
