import { useDatabaseList } from "@/devtools/hooks/useDatabaseList";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyDatabaseList } from "./EmptyDatabaseList";
import { Header } from "./Header";
import { DatabaseList } from "./DatabaseList";

/**
 * Main component for /openedDB route
 *
 * @remarks
 * Displays list of all opened databases with real-time updates (F-018).
 * Uses useDatabaseList hook for automatic database list updates.
 * Handles loading, empty, and success states.
 *
 * @returns JSX.Element - Database list page
 */
export const OpenedDBList = () => {
  // 1. Real-time database list updates via chrome.runtime.onMessage (F-018)
  // 2. Automatically updates when databases are opened/closed
  const { databases, isLoading } = useDatabaseList();

  // 1. Show loading skeleton while fetching
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // 1. Show empty state when no databases
  if (databases.length === 0) {
    return <EmptyDatabaseList />;
  }

  // 1. Show header and database list
  // 2. No refresh button needed (auto-updates via real-time messages)
  return (
    <div className="flex flex-col h-full">
      <Header count={databases.length} />
      <DatabaseList databases={databases.map((name) => ({ name }))} />
    </div>
  );
};
