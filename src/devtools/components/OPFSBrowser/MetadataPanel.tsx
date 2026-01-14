import React from "react";
import {
  detectFileType,
  getBadgeColor,
  getBadgeColorClasses,
} from "@/devtools/utils/fileTypeDetection";
import { formatTimestamp } from "@/devtools/utils/timestampFormatting";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";

/**
 * MetadataPanel component props
 */
interface MetadataPanelProps {
  /** File or directory entry */
  entry: OpfsFileEntry;
  /** Whether to show inline metadata (compact mode) */
  inline?: boolean;
  /** Whether to show full metadata (expanded mode) */
  expanded?: boolean;
}

/**
 * Metadata display component for OPFS files and directories
 *
 * Shows file type badges, timestamps, and item counts (for directories).
 * Supports inline (compact) and expanded display modes.
 *
 * @remarks
 * - Inline mode: Shows type badge and timestamp in a compact row (visible on hover)
 * - Expanded mode: Shows all metadata in a detailed list view
 * - Color-coded badges for quick visual recognition
 * - Supports both files and directories
 *
 * @param props.entry - OPFS file entry to display metadata for
 * @param props.inline - Show inline compact view (default: false)
 * @param props.expanded - Show expanded detailed view (default: false)
 *
 * @returns React component or null if neither inline nor expanded
 *
 * @example
 * ```tsx
 * // Inline view (shown on hover in file tree)
 * <MetadataPanel entry={fileEntry} inline={true} />
 *
 * // Expanded view (for detailed metadata panel)
 * <MetadataPanel entry={dirEntry} expanded={true} />
 * ```
 */
export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  entry,
  inline = false,
  expanded = false,
}) => {
  // 1. Detect file type and badge color
  const fileType = entry.fileType || detectFileType(entry.name);
  const badgeColor = getBadgeColor(fileType);
  const badgeClasses = getBadgeColorClasses(badgeColor);

  // 2. Format timestamp if available
  const formattedTimestamp = entry.lastModified
    ? formatTimestamp(entry.lastModified)
    : null;

  // 3. Inline view: Compact metadata row
  if (inline) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {/* File Type Badge */}
        {entry.type === "file" && (
          <span
            className={`px-1.5 py-0.5 rounded text-xs font-medium ${badgeClasses}`}
          >
            {fileType}
          </span>
        )}

        {/* Timestamp */}
        {formattedTimestamp && <span>{formattedTimestamp}</span>}
      </div>
    );
  }

  // 4. Expanded view: Detailed metadata list
  if (expanded) {
    return (
      <div className="space-y-1 text-xs">
        {/* File Type Badge (files only) */}
        {entry.type === "file" && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Type:</span>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-medium ${badgeClasses}`}
            >
              {fileType}
            </span>
          </div>
        )}

        {/* Timestamp (files only) */}
        {entry.type === "file" && formattedTimestamp && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Modified:</span>
            <span className="text-gray-700">{formattedTimestamp}</span>
          </div>
        )}

        {/* Item Count (directories only) */}
        {entry.type === "directory" && entry.itemCount && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Contains:</span>
            <span className="text-gray-700">
              {entry.itemCount.files}{" "}
              {entry.itemCount.files === 1 ? "file" : "files"}
              {", "}
              {entry.itemCount.directories}{" "}
              {entry.itemCount.directories === 1 ? "directory" : "directories"}
            </span>
          </div>
        )}

        {/* Full Path */}
        <div className="flex items-start gap-2">
          <span className="text-gray-500">Path:</span>
          <span className="text-gray-700 font-mono break-all">
            {entry.path}
          </span>
        </div>
      </div>
    );
  }

  // 5. No view requested
  return null;
};
