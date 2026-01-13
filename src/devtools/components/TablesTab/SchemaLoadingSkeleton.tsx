/**
 * Schema loading skeleton component
 *
 * @remarks
 * Displays a loading animation while schema data is being fetched.
 *
 * @returns JSX.Element - Loading skeleton
 */
export const SchemaLoadingSkeleton = () => {
  return (
    <div className="px-4 py-3">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
};
