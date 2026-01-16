import { IoMdRefresh } from "react-icons/io";
import { PageHeader } from "../Shared";

/**
 * Page header props
 */
interface HeaderProps {
  /** Function to refresh database list */
  refresh: () => void;
  /** Optional database count for badge */
  count?: number;
}

/**
 * Page header with title and refresh button
 *
 * @remarks
 * Displays "Opened Databases" title with optional count.
 * Refresh button re-fetches database list.
 *
 * @param props.refresh - Function to refresh database list
 * @param props.count - Optional database count for badge
 *
 * @returns JSX.Element - Header with refresh button
 */
export const Header = ({ refresh, count }: HeaderProps) => {
  return (
    <PageHeader className="flex items-center justify-between px-4">
      <h1 className="text-2xl font-semibold text-gray-700">
        Opened Databases
        {count !== undefined && (
          <span className="ml-2 text-sm text-secondary-500">({count})</span>
        )}
      </h1>

      <button
        onClick={refresh}
        aria-label="Refresh database list"
        className="p-2 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-100 transition-colors"
      >
        <IoMdRefresh size={20} />
      </button>
    </PageHeader>
  );
};
