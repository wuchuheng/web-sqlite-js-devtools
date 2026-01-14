/**
 * 1. Decode URL-encoded database names safely
 * 2. Fall back to raw value on decode errors
 * 3. Return empty string for empty input
 *
 * @param value - Encoded database name
 * @returns Decoded database name
 */
export const decodeDatabaseName = (value: string): string => {
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/**
 * 1. Read /openedDB/:dbname from pathname
 * 2. Extract only the database name (stops at next / or end)
 * 3. Decode URL-encoded database name
 * 4. Return null when not on database route
 *
 * @param pathname - Current route pathname
 * @returns Active database name or null
 *
 * @example
 * - getDatabaseNameFromPath("/openedDB/my-db/tables") → "my-db"
 * - getDatabaseNameFromPath("/openedDB/my-db/query") → "my-db"
 * - getDatabaseNameFromPath("/openedDB/encoded%20name") → "encoded name"
 * - getDatabaseNameFromPath("/logs/test") → null
 */
export const getDatabaseNameFromPath = (pathname: string): string | null => {
  const prefix = "/openedDB/";

  // 1. Check if pathname starts with the database route prefix
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  // 2. Extract the part after /openedDB/
  const afterPrefix = pathname.slice(prefix.length);
  if (!afterPrefix) {
    return null;
  }

  // 3. Extract only the database name (stop at next / or end of string)
  // This handles nested routes like /openedDB/:dbname/tables, /openedDB/:dbname/query, etc.
  const slashIndex = afterPrefix.indexOf("/");
  const encodedName =
    slashIndex === -1
      ? afterPrefix // No slash, use entire string
      : afterPrefix.slice(0, slashIndex); // Has slash, use part before first slash

  if (!encodedName) {
    return null;
  }

  // 4. Decode the URL-encoded database name
  return decodeDatabaseName(encodedName) || null;
};
