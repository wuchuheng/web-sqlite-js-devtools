import { useState, useCallback } from "react";
import { FaFolder, FaFolderOpen, FaFile, FaDownload } from "react-icons/fa";
import { IoMdTrash } from "react-icons/io";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";
import { MetadataPanel } from "./MetadataPanel";

/**
 * FileNode component props
 */
interface FileNodeProps {
  entry: OpfsFileEntry;
  level?: number;
  onDownload: (_path: string, name: string) => Promise<void>;
  onDelete?: (entry: OpfsFileEntry) => void;
}

/**
 * FileNode component
 *
 * @remarks
 * - Renders a single file or directory entry in the OPFS file tree
 * - Supports expand/collapse for directories
 * - Shows file size, download button, and delete button for files
 * - Shows metadata on hover (file type badge, timestamp)
 * - Delete button appears on hover (group-hover)
 * - Indented based on level in the tree hierarchy
 *
 * @param props.entry - The OPFS file entry to display
 * @param props.level - Nesting level for indentation (default: 0)
 * @param props.onDownload - Callback for downloading files
 * @param props.onDelete - Callback for delete button click
 *
 * @returns JSX.Element - File node display
 */
export const FileNode = ({
  entry,
  level = 0,
  onDownload,
  onDelete,
}: FileNodeProps) => {
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
    if (isDirectory || isDownloading) {
      return;
    }

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

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onDelete) {
        onDelete(entry);
      }
    },
    [entry, onDelete],
  );

  return (
    <div className="select-none">
      {/* File/Directory Row with hover state for metadata */}
      <div
        className={`group flex flex-col py-1 px-2 hover:bg-gray-100 cursor-pointer ${isDirectory ? "cursor-pointer" : ""}`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleToggle}
      >
        {/* Primary Row: Icon + Name + Actions */}
        <div className="flex items-center gap-2">
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
            <span className="text-xs text-gray-500">{entry.sizeFormatted}</span>
          )}

          {/* Action Buttons (only for files) */}
          {!isDirectory && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {/* Download Button */}
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

              {/* Delete Button */}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  aria-label={`Delete ${entry.name}`}
                  title={`Delete ${entry.name}`}
                  type="button"
                >
                  <IoMdTrash size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Metadata Row (shown on hover) */}
        <MetadataPanel entry={entry} inline={true} />
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
