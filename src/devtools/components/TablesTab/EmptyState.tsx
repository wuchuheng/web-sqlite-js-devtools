/**
 * Empty state component for TablesTab
 *
 * @remarks
 * - Displays when no table is selected
 * - Shows helpful message and icon
 */
export const EmptyState = () => {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-500">
      <div className="text-center">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm">Select a table to view data and schema</p>
      </div>
    </div>
  );
};
