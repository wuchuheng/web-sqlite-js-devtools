/**
 * Pagination bar component
 *
 * @remarks
 * Displays pagination controls with page navigation, limit selector, and refresh button.
 *
 * @param props.page - Current page number (0-indexed)
 * @param props.total - Total number of rows
 * @param props.limit - Rows per page
 * @param props.loading - Loading state
 * @param props.onPageChange - Callback when page changes
 * @param props.onLimitChange - Callback when limit changes
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
  const totalPages = Math.ceil(total / limit);
  const startRow = total === 0 ? 0 : page * limit + 1;
  const endRow = Math.min((page + 1) * limit, total);

  const canGoPrevious = page > 0;
  const canGoNext = endRow < total;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
      {/* Page controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious || loading}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-700">
          Page {page + 1} of {totalPages || 1}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext || loading}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>

      {/* Row count indicator */}
      <div className="text-sm text-gray-600">
        {total === 0 ? (
          <span>No rows</span>
        ) : (
          <span>
            {startRow}-{endRow} of {total}
          </span>
        )}
      </div>

      {/* Limit selector and refresh */}
      <div className="flex items-center gap-3">
        <label htmlFor="limit-select" className="text-sm text-gray-600">
          Rows:
        </label>
        <select
          id="limit-select"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          disabled={loading}
          className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {LIMIT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
