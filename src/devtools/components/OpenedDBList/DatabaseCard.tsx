import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaDatabase } from "react-icons/fa";
import type { DatabaseSummary } from "@/devtools/services/databaseService";

/**
 * Database card props
 */
interface DatabaseCardProps {
  /** Database summary with name */
  database: DatabaseSummary;
  /** Whether this database is currently being viewed */
  isActive?: boolean;
}

/**
 * Clickable database card component
 *
 * @remarks
 * Displays database icon, name, and optional table count.
 * Navigates to /openedDB/:dbname/tables on click.
 * Uses FaDatabase icon from react-icons/fa.
 *
 * @param props.database - Database summary with name
 * @param props.isActive - Whether this database is currently being viewed
 *
 * @returns JSX.Element - Clickable database card button
 */
export const DatabaseCard = ({ database, isActive }: DatabaseCardProps) => {
  const navigate = useNavigate();

  // 1. Encode database name for URL safety
  // 2. Navigate to tables tab for this database
  const handleClick = useCallback(() => {
    const encodedName = encodeURIComponent(database.name);
    navigate(`/openedDB/${encodedName}/tables`);
  }, [database.name, navigate]);

  return (
    <button
      onClick={handleClick}
      aria-label={`Open database ${database.name}`}
      className={`
        flex items-center gap-3 w-full px-4 py-3 rounded-lg border transition-all
        ${
          isActive
            ? "bg-primary-50 border-primary-600 shadow-sm"
            : "bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm"
        }
      `}
    >
      <FaDatabase
        className={isActive ? "text-primary-600" : "text-gray-600"}
        size={20}
      />
      <div className="flex-1 text-left">
        <div
          className={`font-medium ${isActive ? "text-primary-600" : "text-gray-700"}`}
        >
          {database.name}
        </div>
      </div>
    </button>
  );
};
