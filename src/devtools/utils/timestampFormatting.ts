/**
 * Format timestamp for display
 *
 * @param date - Date object, timestamp, or date string
 * @returns Formatted timestamp string in YYYY-MM-DD HH:mm format (local time)
 *
 * @example
 * ```tsx
 * formatTimestamp(new Date('2026-01-15T10:30:00')) // Returns: '2026-01-15 10:30'
 * formatTimestamp(1705316400000) // Returns: '2026-01-15 10:30'
 * formatTimestamp('2026-01-15T10:30:00') // Returns: '2026-01-15 10:30'
 * ```
 */
export function formatTimestamp(date: Date | string | number): string {
  // 1. Parse input to Date object
  const d = date instanceof Date ? date : new Date(date);

  // 2. Format to YYYY-MM-DD HH:mm (local time)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Get relative time string
 *
 * @param date - Date object, timestamp, or date string
 * @returns Relative time string (e.g., "2 hours ago") or formatted timestamp for older dates
 *
 * @example
 * ```tsx
 * getRelativeTime(new Date(Date.now() - 3600000)) // Returns: '1 hour ago'
 * getRelativeTime(new Date(Date.now() - 120000)) // Returns: '2 minutes ago'
 * getRelativeTime(new Date(Date.now() - 30)) // Returns: 'just now'
 * getRelativeTime(new Date('2020-01-01')) // Returns: '2020-01-01 00:00'
 * ```
 */
export function getRelativeTime(date: Date | string | number): string {
  // 1. Parse input to Date object
  const d = date instanceof Date ? date : new Date(date);

  // 2. Calculate difference from now
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // 3. Return relative time string or formatted timestamp
  if (diffSecs < 60) {
    return "just now";
  }
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  // For dates older than 7 days, return formatted timestamp
  return formatTimestamp(d);
}
