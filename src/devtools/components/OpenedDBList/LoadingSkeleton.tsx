/**
 * Loading skeleton component for database list
 *
 * @remarks
 * Displays 3 animated placeholder cards while data loads.
 * Matches DatabaseCard layout for smooth transition.
 *
 * @returns JSX.Element - Loading skeleton with animated cards
 */
export const LoadingSkeleton = () => {
  return (
    <div className="p-6 space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-200 animate-pulse"
        >
          <div className="w-5 h-5 rounded" />
          <div className="flex-1 h-4 rounded" />
        </div>
      ))}
    </div>
  );
};
