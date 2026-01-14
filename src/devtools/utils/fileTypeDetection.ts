/**
 * File type mapping for known extensions
 */
const FILE_TYPE_MAP: Record<string, string> = {
  // SQLite databases
  sqlite: "SQLite Database",
  db: "SQLite Database",
  sqlite3: "SQLite Database",

  // Data files
  json: "JSON Data",
  xml: "XML Data",
  csv: "CSV Data",
  yaml: "YAML Data",
  yml: "YAML Data",

  // Text files
  txt: "Text File",
  md: "Markdown",
  log: "Log File",

  // Image files
  png: "Image File",
  jpg: "Image File",
  jpeg: "Image File",
  gif: "Image File",
  svg: "SVG Image",
  webp: "Image File",

  // Audio files
  mp3: "Audio File",
  wav: "Audio File",
  ogg: "Audio File",

  // Video files
  mp4: "Video File",
  webm: "Video File",
  mov: "Video File",
};

/**
 * Badge color mapping for file types
 */
const BADGE_COLOR_MAP: Record<
  string,
  "blue" | "yellow" | "gray" | "purple" | "red" | "green"
> = {
  "SQLite Database": "blue",
  "JSON Data": "yellow",
  "XML Data": "yellow",
  "CSV Data": "yellow",
  "YAML Data": "yellow",
  "Text File": "gray",
  Markdown: "gray",
  "Log File": "gray",
  "Image File": "purple",
  "SVG Image": "purple",
  "Audio File": "green",
  "Video File": "red",
};

/**
 * Detect file type based on filename extension
 *
 * @param filename - Name of the file
 * @returns File type display string
 *
 * @example
 * ```tsx
 * detectFileType('database.sqlite') // Returns: 'SQLite Database'
 * detectFileType('data.json') // Returns: 'JSON Data'
 * detectFileType('unknown.xyz') // Returns: 'XYZ File'
 * detectFileType('noextension') // Returns: 'File'
 * ```
 */
export function detectFileType(filename: string): string {
  // 1. Extract extension from filename
  const ext = filename.split(".").pop()?.toLowerCase();

  // 2. Return "File" if no extension
  if (!ext) {
    return "File";
  }

  // 3. Look up in FILE_TYPE_MAP or generate from extension
  return FILE_TYPE_MAP[ext] || `${ext.toUpperCase()} File`;
}

/**
 * Get badge color for file type
 *
 * @param fileType - File type string from detectFileType()
 * @returns Badge color name for Tailwind classes
 *
 * @example
 * ```tsx
 * getBadgeColor('SQLite Database') // Returns: 'blue'
 * getBadgeColor('JSON Data') // Returns: 'yellow'
 * getBadgeColor('Unknown File') // Returns: 'gray'
 * ```
 */
export function getBadgeColor(
  fileType: string,
): "blue" | "yellow" | "gray" | "purple" | "red" | "green" {
  return BADGE_COLOR_MAP[fileType] || "gray";
}

/**
 * Get Tailwind CSS classes for badge color
 *
 * @param badgeColor - Color name from getBadgeColor()
 * @returns Tailwind CSS class string for badge styling
 *
 * @example
 * ```tsx
 * getBadgeColorClasses('blue') // Returns: 'bg-blue-100 text-blue-700'
 * getBadgeColorClasses('yellow') // Returns: 'bg-yellow-100 text-yellow-700'
 * ```
 */
export function getBadgeColorClasses(
  badgeColor: "blue" | "yellow" | "gray" | "purple" | "red" | "green",
): string {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    gray: "bg-gray-100 text-gray-700",
    purple: "bg-purple-100 text-purple-700",
    red: "bg-red-100 text-red-700",
    green: "bg-green-100 text-green-700",
  };

  return colorMap[badgeColor];
}
