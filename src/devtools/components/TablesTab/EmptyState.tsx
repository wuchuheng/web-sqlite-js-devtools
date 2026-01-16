import { FaTable } from "react-icons/fa6";

/**
 * Empty state component for TablesTab
 *
 * @remarks
 * - Displays when no table is selected
 * - Shows helpful message and icon
 */
export const EmptyState = () => {
  return (
    <div className="flex-1 flex-col flex items-center justify-center text-gray-500 gap-4">
      <FaTable className="text-6xl" />
      <p className="text-sm">Select a table to view data and schema</p>
    </div>
  );
};
