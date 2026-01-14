import {
  databaseService,
  type DatabaseSummary,
} from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import { useDatabaseRefresh } from "@/devtools/contexts/DatabaseRefreshContext";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorState } from "./ErrorState";
import { EmptyDatabaseList } from "./EmptyDatabaseList";
import { Header } from "./Header";
import { DatabaseList } from "./DatabaseList";

/**
 * Main component for /openedDB route
 *
 * @remarks
 * Displays list of all opened databases with refresh functionality.
 * Uses useInspectedWindowRequest hook for data fetching.
 * Handles loading, error, empty, and success states.
 *
 * @returns JSX.Element - Database list page
 */
export const OpenedDBList = () => {
  // 1. Consume database refresh context for coordinated refresh (F-010)
  // 2. triggerRefresh: Function passed to Header for refresh button
  // 3. refreshVersion: Used in dependency array to trigger refetch when changed
  const { triggerRefresh, refreshVersion } = useDatabaseRefresh();

  // 1. Fetch databases using service layer
  // 2. Refetch when refreshVersion changes (triggered by refresh button)
  // 3. Handle loading, error, empty, and success states
  const {
    data: databases,
    isLoading,
    error,
    reload,
  } = useInspectedWindowRequest<DatabaseSummary[]>(
    () => databaseService.getDatabases(),
    [refreshVersion], // Refetch when refreshVersion changes
    [],
  );

  // 1. Show loading skeleton while fetching
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // 1. Show error state with retry button
  if (error) {
    return <ErrorState error={error} retry={reload} />;
  }

  // 1. Show empty state when no databases
  if (databases.length === 0) {
    return <EmptyDatabaseList refresh={reload} />;
  }

  // 1. Show header and database list
  // 2. Pass triggerRefresh to Header for coordinated refresh (F-010)
  return (
    <div className="flex flex-col h-full">
      <Header refresh={triggerRefresh} count={databases.length} />
      <DatabaseList databases={databases} />
    </div>
  );
};
