import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { DatabaseCard } from "./DatabaseCard";
import type { DatabaseSummary } from "@/devtools/services/databaseService";

/**
 * Database list props
 */
interface DatabaseListProps {
  /** Array of database summaries */
  databases: DatabaseSummary[];
}

/**
 * Database list container with active state detection
 *
 * @remarks
 * Renders DatabaseCard components for each database.
 * Detects active database from current route.
 *
 * @param props.databases - Array of database summaries
 *
 * @returns JSX.Element - Nav list of database cards
 */
export const DatabaseList = ({ databases }: DatabaseListProps) => {
  const location = useLocation();

  // 1. Extract current database name from route
  // 2. Compare with each database for active state
  const activeDatabase = useMemo(() => {
    const match = location.pathname.match(/^\/openedDB\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }, [location.pathname]);

  return (
    <nav aria-label="Database list" className="p-6 space-y-3">
      {databases.map((database) => (
        <DatabaseCard
          key={database.name}
          database={database}
          isActive={database.name === activeDatabase}
        />
      ))}
    </nav>
  );
};
