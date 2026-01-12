/**
 * Database Proxy for web-sqlite-js API
 *
 * @remarks
 * Wrapper for window.__web_sqlite API with Map→Array conversion.
 * Converts Map objects to Arrays for Chrome Extension message serialization.
 * Safe to call when web-sqlite-js API is not available on the page.
 */

/**
 * Database metadata type
 */
export interface DatabaseMetadata {
  name: string;
  tableCount?: number;
}

/**
 * 1. Check if window.__web_sqlite exists on the page
 * 2. Access databases Map from global namespace
 * 3. Convert Map<string, Database> to Array for serialization
 * 4. Return array of database metadata with table counts
 *
 * @remarks
 * This is the primary function for TASK-03. Full implementation with
 * table count queries comes in TASK-05 when we have actual database access.
 *
 * @returns Array of database metadata (empty if API not available)
 */
export const getDatabases = (): Array<DatabaseMetadata> => {
  /**
   * 1. Access global window.__web_sqlite namespace
   * 2. Use type assertion to access databases property
   * 3. Returns undefined if API not present on page
   */
  const webSqlite = (window as unknown as Record<string, unknown>)
    .__web_sqlite as
    | {
        databases?: Map<string, unknown>;
      }
    | undefined;

  /**
   * 1. Check if web-sqlite-js API is available
   * 2. Check if databases Map exists
   * 3. Return empty array if either check fails
   */
  if (!webSqlite?.databases) {
    return [];
  }

  /**
   * 1. Convert databases Map to Array of entries
   * 2. Extract database name from each entry
   * 3. Create metadata objects (tableCount deferred to TASK-05)
   */
  const dbEntries: Array<[string, unknown]> = Array.from(
    webSqlite.databases.entries(),
  );

  return dbEntries.map((entry) => ({
    name: String(entry[0]),
    // tableCount will be added in TASK-05 with actual db.getTableList() calls
  }));
};

/**
 * 1. Accept Map object with any key/value types
 * 2. Convert to Array of [key, value] pairs
 * 3. Return structured clone compatible format
 *
 * @remarks
 * Chrome Extension messaging cannot serialize Map objects directly.
 * Use this function to convert Maps before sending in messages.
 *
 * @param map - Map object to convert
 * @returns Array of [key, value] pairs
 */
export const mapToArray = <K, V>(map: Map<K, V>): Array<[K, V]> => {
  return Array.from(map.entries());
};

/**
 * 1. Accept Array of [key, value] pairs
 * 2. Convert back to Map object
 * 3. Return reconstructed Map
 *
 * @remarks
 * Use this function to convert Arrays back to Maps after receiving messages.
 *
 * @param entries - Array of [key, value] pairs
 * @returns Reconstructed Map object
 */
export const arrayToMap = <K, V>(entries: Array<[K, V]>): Map<K, V> => {
  return new Map(entries);
};
