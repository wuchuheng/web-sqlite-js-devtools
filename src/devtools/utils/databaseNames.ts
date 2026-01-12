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
  } catch (error) {
    return value;
  }
};

/**
 * 1. Read /openedDB/:dbname from pathname
 * 2. Decode URL-encoded database name
 * 3. Return null when not on database route
 *
 * @param pathname - Current route pathname
 * @returns Active database name or null
 */
export const getDatabaseNameFromPath = (pathname: string): string | null => {
  const prefix = "/openedDB/";

  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const encodedName = pathname.slice(prefix.length);
  if (!encodedName) {
    return null;
  }

  return decodeDatabaseName(encodedName) || null;
};
