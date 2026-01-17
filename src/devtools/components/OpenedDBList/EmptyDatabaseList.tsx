import { SiSqlite } from "react-icons/si";
import { IoMdRefresh } from "react-icons/io";

/**
 * Empty database list props (F-018: refresh now optional)
 */
interface EmptyDatabaseListProps {
  /** Optional function to refresh database list (no longer needed with real-time updates) */
  refresh?: () => void;
}

/**
 * Empty state component when no databases are opened
 *
 * @remarks
 * Displays helpful message and optional refresh button.
 * Uses SiSqlite icon from react-icons/si.
 * Refresh button is optional (F-018): auto-refresh via real-time messages.
 *
 * @param props.refresh - Optional function to refresh database list
 *
 * @returns JSX.Element - Empty state with optional refresh button
 */
export const EmptyDatabaseList = ({ refresh }: EmptyDatabaseListProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <SiSqlite className="text-primary-600 text-6xl mb-6" />
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">
        No Opened Databases
      </h1>
      <p className="text-gray-600 mb-4">
        Could not detect any opened databases.
      </p>
      <p className="text-gray-500 text-sm mb-6">
        Open a page that uses web-sqlite-js to see databases here.
      </p>
      {refresh && (
        <button
          onClick={refresh}
          aria-label="Refresh database list"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          title="Manual refresh (auto-refresh enabled)"
        >
          <IoMdRefresh size={18} />
          Refresh
        </button>
      )}
    </div>
  );
};
