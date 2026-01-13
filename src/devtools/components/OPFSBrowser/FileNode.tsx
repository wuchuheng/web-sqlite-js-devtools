import { useState, useCallback } from "react";
import { FaFolder, FaFolderOpen, FaFile, FaDownload } from "react-icons/fa";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";

/**
 * FileNode component props
 */
interface FileNodeProps {
  entry: OpfsFileEntry;
  level?: number;
  onDownload: (path: string, name: string) => Promise<void>;
}

/**
 * FileNode component
 *
 * @remarks
 * - Renders a single file or directory entry in the OPFS file tree
 * - Supports expand/collapse for directories
 * - Shows file size and download button for files
 * - Indented based on level in the tree hierarchy
 *
 * @param props.entry - The OPFS file entry to display
 * @param props.level - Nesting level for indentation (default: 0)
 * @param props.onDownload - Callback for downloading files
 *
 * @returns JSX.Element - File node display
 */
export const FileNode = ({ entry, level = 0, onDownload }: FileNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirectory = entry.type === "directory";
  const paddingLeft = level * 16 + 16; // Base padding + indentation

  const handleToggle = useCallback(() => {
    if (isDirectory) {
      setIsExpanded((prev) => !prev);
    }
  }, [isDirectory]);

  const handleDownload = useCallback(async () => {
    if (isDirectory || isDownloading) return;

    setIsDownloading(true);
    setError(null);

    try {
      await onDownload(entry.path, entry.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDownloading(false);
    }
  }, [entry, isDirectory, isDownloading, onDownload]);

  return (
    <div className="select-none">
      {/* File/Directory Row */}
      <div
        className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-100 cursor-pointer ${isDirectory ? "cursor-pointer" : ""}`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleToggle}
      >
        {/* Icon */}
        {isDirectory ? (
          isExpanded ? (
            <FaFolderOpen className="text-yellow-500" size={14} />
          ) : (
            <FaFolder className="text-yellow-500" size={14} />
          )
        ) : (
          <FaFile className="text-gray-500" size={14} />
        )}

        {/* Name */}
        <span
          className="flex-1 text-sm text-gray-700 truncate"
          title={entry.name}
        >
          {entry.name}
        </span>

        {/* Size (only for files) */}
        {!isDirectory && (
          <span className="text-xs text-gray-500 mr-2">
            {entry.sizeFormatted}
          </span>
        )}

        {/* Download Button (only for files) */}
        {!isDirectory && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            disabled={isDownloading}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Download ${entry.name}`}
            type="button"
          >
            {isDownloading ? (
              <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full" />
            ) : (
              <FaDownload size={12} />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="px-2 text-xs text-red-600"
          style={{ paddingLeft: `${paddingLeft + 20}px` }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
