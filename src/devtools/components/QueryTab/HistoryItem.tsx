import { FaRegClock } from "react-icons/fa";
import type { QueryHistoryEntry } from "@/devtools/hooks/useQueryHistory";
import { formatRelativeTime } from "@/devtools/hooks/useQueryHistory";

/**
 * Props for HistoryItem component
 */
interface HistoryItemProps {
  /** History entry to display */
  entry: QueryHistoryEntry;
  /** Whether this item is currently selected */
  isActive?: boolean;
  /** Click handler for loading query */
  onClick: () => void;
  /** Delete handler for removing this entry */
  onDelete?: () => void;
}

/**
 * Individual query history item component
 *
 * @remarks
 * - Displays SQL preview (truncated at 50 chars)
 * - Shows relative timestamp and execution count
 * - Click to load query into editor
 * - Delete button to remove from history
 *
 * @param props - HistoryItemProps
 * @returns JSX.Element - History item row
 */
export const HistoryItem = ({
  entry,
  isActive,
  onClick,
  onDelete,
}: HistoryItemProps) => {
  /**
   * Truncate SQL for preview (max 50 chars)
   */
  const sqlPreview =
    entry.sql.length > 50 ? `${entry.sql.slice(0, 50)}...` : entry.sql;

  return (
    <div
      className={`p-2 rounded border-b cursor-pointer transition-colors ${
        isActive
          ? "bg-primary-50 border-l-4 border-l-primary-500"
          : "hover:bg-secondary-50 border-l-4 border-l-transparent"
      }`}
      onClick={onClick}
    >
      {/* SQL preview */}
      <div className="text-sm font-mono truncate text-secondary-800">
        {sqlPreview}
      </div>

      {/* Metadata row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1 text-xs text-secondary-500">
          <FaRegClock size={10} />
          <span>{formatRelativeTime(entry.timestamp)}</span>
          {entry.executionCount > 1 && (
            <span>• executed {entry.executionCount} times</span>
          )}
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-xs text-secondary-400 hover:text-error-600 px-1 py-0.5 rounded hover:bg-error-50"
            title="Remove from history"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
