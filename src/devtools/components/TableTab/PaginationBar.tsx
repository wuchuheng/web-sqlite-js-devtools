import { RefreshIcon, ChevronLeftIcon, ChevronRightIcon } from "../Icon";

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
  const totalPages = Math.ceil(total / limit);
  const currentPage = page + 1; // Convert to 1-indexed for display

  const handleGoToPage = () => {
    const input = document.querySelector(
      'input[name="page-number"]',
    ) as HTMLInputElement;
    if (input) {
      const targetPage = parseInt(input.value, 10);
      if (targetPage >= 1 && targetPage <= totalPages) {
        onPageChange(targetPage - 1); // Convert back to 0-indexed
      }
    }
  };

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-t border-gray-200">
      {/* Left side: Refresh button */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center justify-center w-6 h-6 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Refresh"
      >
        <RefreshIcon size={14} className={loading ? "animate-spin" : ""} />
      </button>

      {/* Right side: Page navigation controls */}
      <div className="flex items-center gap-1">
        {/* First page button */}
        <button
          type="button"
          onClick={() => onPageChange(0)}
          disabled={page === 0 || loading || totalPages === 0}
          className="flex items-center justify-center w-6 h-6 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="First page"
        >
          <ChevronLeftIcon size={12} className="-mr-1.5" />
          <ChevronLeftIcon size={12} />
        </button>

        {/* Previous page button */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0 || loading || totalPages === 0}
          className="flex items-center justify-center w-6 h-6 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeftIcon size={12} />
        </button>

        {/* Page number input */}
        <input
          type="number"
          name="page-number"
          min={1}
          max={totalPages || 1}
          defaultValue={currentPage}
          disabled={loading || totalPages === 0}
          className="w-14 h-6 px-1.5 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Go button */}
        <button
          type="button"
          onClick={handleGoToPage}
          disabled={loading || totalPages === 0}
          className="h-6 px-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Go
        </button>

        {/* Next page button */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1 || loading || totalPages === 0}
          className="flex items-center justify-center w-6 h-6 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRightIcon size={12} />
        </button>

        {/* Last page button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, totalPages - 1))}
          disabled={page >= totalPages - 1 || loading || totalPages === 0}
          className="flex items-center justify-center w-6 h-6 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Last page"
        >
          <ChevronRightIcon size={12} />
          <ChevronRightIcon size={12} className="-ml-1.5" />
        </button>
      </div>
    </div>
  );
};
