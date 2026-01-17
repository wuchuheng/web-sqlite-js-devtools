import { IoMdRefresh } from "react-icons/io";
import { PageHeader } from "../Shared";

/**
 * Page header props (F-018: refresh now optional)
 */
interface HeaderProps {
  /** Optional function to refresh database list (no longer needed with real-time updates) */
  refresh?: () => void;
  /** Optional database count for badge */
  count?: number;
}

/**
 * Page header with title and optional refresh button
 *
 * @remarks
 * Displays "Opened Databases" title with optional count.
 * Refresh button is optional (F-018): auto-refresh via real-time messages.
 *
 * @param props.refresh - Optional function to refresh database list
 * @param props.count - Optional database count for badge
 *
 * @returns JSX.Element - Header with optional refresh button
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

      {refresh && (
        <button
          onClick={refresh}
          aria-label="Refresh database list"
          className="p-2 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-100 transition-colors"
          title="Manual refresh (auto-refresh enabled)"
        >
          <IoMdRefresh size={20} />
        </button>
      )}
    </PageHeader>
  );
};
