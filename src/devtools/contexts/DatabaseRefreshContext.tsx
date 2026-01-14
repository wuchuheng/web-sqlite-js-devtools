import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

/**
 * Database refresh context value
 *
 * @remarks
 * Provides a shared refresh mechanism for database list updates across components.
 * - triggerRefresh: Function to increment refreshVersion and trigger refetch
 * - refreshVersion: Incrementing number that changes on each refresh
 *
 * Consumers use refreshVersion in dependency arrays to trigger refetch:
 * ```tsx
 * const { triggerRefresh, refreshVersion } = useDatabaseRefresh();
 * const { data } = useInspectedWindowRequest(
 *   () => databaseService.getDatabases(),
 *   [refreshVersion], // Refetch when version changes
 *   []
 * );
 * ```
 */
export interface DatabaseRefreshContextValue {
  /**
   * Trigger refresh by incrementing refreshVersion
   *
   * @remarks
   * - Increments refreshVersion by 1
   * - All consumers refetch databases via dependency array
   * - Debounced via React state batching (rapid clicks = single refresh)
   *
   * @returns void
   */
  triggerRefresh: () => void;

  /**
   * Current refresh version number
   *
   * @remarks
   * - Starts at 0
   * - Increments on each triggerRefresh call
   * - Used in dependency arrays to trigger refetch
   * - Changes propagate to all context consumers
   */
  refreshVersion: number;
}

/**
 * Database refresh context
 *
 * @remarks
 * - React Context for coordinating database refresh across components
 * - Null by default (must be used within DatabaseRefreshProvider)
 * - Use useDatabaseRefresh hook for type-safe access
 */
export const DatabaseRefreshContext =
  createContext<DatabaseRefreshContextValue | null>(null);

/**
 * Database refresh provider component
 *
 * @param props.children - Child components to wrap
 * @returns JSX.Element - Context provider with refresh state
 *
 * @remarks
 * - Manages refreshVersion state (starts at 0)
 * - Provides triggerRefresh function via context
 * - Memoizes context value to prevent unnecessary re-renders
 * - Throws error if used outside provider (development guard)
 *
 * @example
 * ```tsx
 * <DatabaseRefreshProvider>
 *   <Sidebar />
 *   <MainContent />
 * </DatabaseRefreshProvider>
 * ```
 */
export const DatabaseRefreshProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  // 1. Initialize refresh version counter at 0
  // 2. Increments on each triggerRefresh call
  // 3. Used in dependency arrays to trigger refetch
  const [refreshVersion, setRefreshVersion] = useState(0);

  // 1. Create stable reference for trigger function
  // 2. Increments refreshVersion by 1
  // 3. React batches rapid calls into single update
  const triggerRefresh = useCallback(() => {
    setRefreshVersion((prev) => prev + 1);
  }, []);

  // 1. Memoize context value to prevent re-renders
  // 2. Only recreates when triggerRefresh changes (never, due to useCallback)
  // 3. Includes refreshVersion for consumer updates
  const value: DatabaseRefreshContextValue = useMemo(
    () => ({
      triggerRefresh,
      refreshVersion,
    }),
    [triggerRefresh, refreshVersion],
  );

  return (
    <DatabaseRefreshContext.Provider value={value}>
      {children}
    </DatabaseRefreshContext.Provider>
  );
};

/**
 * Hook to access database refresh context
 *
 * @returns DatabaseRefreshContextValue - Context value with triggerRefresh and refreshVersion
 * @throws Error if used outside DatabaseRefreshProvider
 *
 * @remarks
 * - Type-safe context access (returns non-null value)
 * - Throws descriptive error if context is missing
 * - Use in any component under DatabaseRefreshProvider
 *
 * @example
 * ```tsx
 * const { triggerRefresh, refreshVersion } = useDatabaseRefresh();
 *
 * // Trigger refresh
 * triggerRefresh();
 *
 * // Use version in dependency array
 * const { data } = useInspectedWindowRequest(
 *   () => databaseService.getDatabases(),
 *   [refreshVersion],
 *   []
 * );
 * ```
 */
export const useDatabaseRefresh = (): DatabaseRefreshContextValue => {
  const context = useContext(DatabaseRefreshContext);

  // 1. Check if context is available
  // 2. Throw error if used outside provider
  // 3. Helps catch missing provider during development
  if (!context) {
    throw new Error(
      "useDatabaseRefresh must be used within DatabaseRefreshProvider",
    );
  }

  return context;
};
