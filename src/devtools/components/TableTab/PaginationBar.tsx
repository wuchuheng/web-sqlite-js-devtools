import { RefreshIcon } from "../Icon";

/**
 * Pagination bar component
 *
 * @remarks
 * Displays a minimized pagination bar with row count indicator and refresh button.
 * Design matches the screenshot with compact height and clean layout.
 *
 * @param props.page - Current page number (0-indexed)
 * @param props.total - Total number of rows
 * @param props.limit - Rows per page
 * @param props.loading - Loading state
 * @param props.onPageChange - Callback when page changes (reserved for future use)
 * @param props.onLimitChange - Callback when limit changes (reserved for future use)
 * @param props.onRefresh - Callback when refresh is clicked
 *
 * @returns JSX.Element - Pagination bar
 */
interface PaginationBarProps {
  page: number;
  total: number;
  limit: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => void;
}

const LIMIT_OPTIONS = [10, 25, 50, 100, 500] as const;

export const PaginationBar = ({
  page,
  total,
  limit,
  loading = false,
  onPageChange,
  onLimitChange,
  onRefresh,
}: PaginationBarProps) => {
  const startRow = total === 0 ? 0 : page * limit + 1;
  const endRow = Math.min((page + 1) * limit, total);

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-t border-gray-200">
      {/* Row count indicator - "Showing X-Y of Z" */}
      <div className="text-xs text-gray-600">
        {total === 0 ? (
          <span>No rows</span>
        ) : (
          <span>
            Showing {startRow}-{endRow} of {total}
          </span>
        )}
      </div>

      {/* Refresh button */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Refresh"
      >
        <RefreshIcon size={14} className={loading ? "animate-spin" : ""} />
      </button>
    </div>
  );
};
