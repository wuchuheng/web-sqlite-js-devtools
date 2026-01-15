import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { FaDatabase } from "react-icons/fa6";
import {
  FaFile,
  FaDownload,
  FaRegFileImage,
  FaFolder,
  FaFolderOpen,
} from "react-icons/fa";
import { IoMdTrash } from "react-icons/io";
import { TiDocumentText } from "react-icons/ti";
import { LuFileJson } from "react-icons/lu";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";
import { TreeLines } from "./TreeLines";

/**
 * Get directory counts for display (TASK-322)
 *
 * @remarks
 * - Pure function with no side effects
 * - Uses entry.itemCount for file/directory counts
 * - Returns formatted string for display
 * - Returns empty string for files (not directories)
 *
 * @param entry - OpfsFileEntry to calculate counts for
 * @returns Formatted count string (e.g., "3 files 2 dirs") or empty string for files
 *
 * @example
 * ```ts
 * const counts = getDirectoryCounts(entry); // "3 files 2 dirs"
 * ```
 */
const getDirectoryCounts = (entry: OpfsFileEntry): string => {
  // 1. Only directories have itemCount to display
  if (entry.type !== "directory") {
    return "";
  }

  // 2. Get itemCount or default to zeros
  const counts = entry.itemCount ?? { files: 0, directories: 0 };

  // 3. Return formatted string based on counts
  if (counts.directories === 0) {
    return `${counts.files} files`;
  }
  if (counts.files === 0) {
    return `${counts.directories} dirs`;
  }
  return `${counts.files} files ${counts.directories} dirs`;
};

/**
 * Get file extension from filename (TASK-326)
 *
 * @remarks
 * - Pure function with no side effects
 * - Extracts extension using lastIndexOf('.')
 * - Returns lowercase extension with dot
 * - Returns empty string if no extension found
 *
 * @param filename - File name to extract extension from
 * @returns File extension with dot (e.g., ".txt") or empty string
 *
 * @example
 * ```ts
 * const ext = getFileExtension("database.sqlite3"); // ".sqlite3"
 * const ext2 = getFileExtension("README"); // ""
 * ```
 */
const getFileExtension = (filename: string): string => {
  // 1. Find last dot position
  const idx = filename.lastIndexOf(".");

  // 2. Return empty string if no dot found
  if (idx === -1) {
    return "";
  }

  // 3. Return lowercase extension with dot
  return filename.substring(idx).toLowerCase();
};

/**
 * Get icon component based on file type and expansion state (TASK-326)
 *
 * @remarks
 * - Pure function with no side effects
 * - Returns icon component based on file extension
 * - Directories use FaFolder/FaFolderOpen based on expansion state
 * - Files use type-specific icons (sqlite3, images, txt, json, unknown)
 * - Icon colors provide visual differentiation (purple, yellow, gray)
 *
 * @param entry - OpfsFileEntry to get icon for
 * @param isExpanded - Whether directory is expanded (for folder icons)
 * @returns ReactNode representing the icon
 *
 * @example
 * ```ts
 * const icon = getFileIcon(entry, true); // <FaFolderOpen />
 * const icon2 = getFileIcon(fileEntry, false); // <FaDatabase />
 * ```
 */
const getFileIcon = (entry: OpfsFileEntry, isExpanded: boolean): ReactNode => {
  // 1. Handle directories - use folder icons based on expansion state
  if (entry.type === "directory") {
    return isExpanded ? (
      <FaFolderOpen className="text-yellow-500" size={14} />
    ) : (
      <FaFolder className="text-gray-600" size={14} />
    );
  }

  // 2. Get file extension
  const ext = getFileExtension(entry.name);

  // 3. Return icon based on file extension
  switch (ext) {
    case ".sqlite3":
      return <FaDatabase className="text-purple-600" size={14} />;

    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".webp":
    case ".gif":
    case ".svg":
    case ".ico":
      return <FaRegFileImage className="text-purple-500" size={12} />;

    case ".txt":
      return <TiDocumentText className="text-gray-600" size={14} />;

    case ".json":
    case ".json5":
      return <LuFileJson className="text-yellow-600" size={14} />;

    default:
      return <FaFile className="text-gray-500" size={12} />;
  }
};

/**
 * FileTree component props
 */
interface FileTreeProps {
  onDownload: (_path: string, name: string) => Promise<void>;
  onDelete?: (entry: OpfsFileEntry) => void;
  onFileSelect?: (entry: OpfsFileEntry) => void; // NEW (TASK-318)
  selectedFile?: OpfsFileEntry | null; // NEW (TASK-318)
}

/**
 * FileTreeItem props for internal use
 */
interface FileTreeItemProps {
  entry: OpfsFileEntry;
  level: number;
  onDownload: (_path: string, name: string) => Promise<void>;
  onDelete?: (entry: OpfsFileEntry) => void;
  onFileSelect?: (entry: OpfsFileEntry) => void; // NEW (TASK-318)
  selectedFile?: OpfsFileEntry | null; // NEW (TASK-318)
  keyPrefix: string;
  showLines: boolean;
  isLast?: boolean;
  fileCounts?: string; // NEW - TASK-322
}

/**
 * FileTreeItem - Internal component for tree items with lazy-loading (F-012 enhanced, TASK-313 delete button, TASK-318 selection)
 */
const FileTreeItem = ({
  entry,
  level,
  onDownload,
  onDelete,
  onFileSelect,
  selectedFile,
  keyPrefix,
  showLines,
  isLast = false,
}: FileTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [children, setChildren] = useState<OpfsFileEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirectory = entry.type === "directory";

  // 11. Calculate directory counts for display (TASK-322)
  const directoryCounts = getDirectoryCounts(entry);

  // 12. Selection state (TASK-318: Two-panel layout)
  const isSelected = selectedFile?.path === entry.path;

  const loadChildren = useCallback(async () => {
    if (!isDirectory || hasLoaded || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await databaseService.getOpfsFiles(entry.path);
      if (result.success && result.data) {
        setChildren(result.data);
        setHasLoaded(true);
        setIsExpanded(true);
      } else {
        setError(result.error ?? "Failed to load directory contents");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [entry.path, hasLoaded, isLoading, isDirectory]);

  const handleClick = useCallback(() => {
    if (!isDirectory) {
      return;
    }

    if (hasLoaded) {
      setIsExpanded((prev) => !prev);
    } else {
      loadChildren();
    }
  }, [isDirectory, hasLoaded, loadChildren]);

  // 13. Handle file selection (TASK-318: Two-panel layout)
  const handleFileSelect = useCallback(() => {
    if (entry.type === "file" && onFileSelect) {
      onFileSelect(entry);
    }
  }, [entry, onFileSelect]);

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

  const paddingLeft = level * 16;

  return (
    <div>
      {/* Parent Node with horizontal connector (F-012) */}
      <div
        className={`group flex items-center gap-2 py-1 px-2 cursor-pointer select-none relative ${
          isSelected
            ? "bg-emerald-50 text-emerald-600 border-l-4 border-emerald-600"
            : "hover:bg-gray-100"
        }`}
        style={{ paddingLeft: `${paddingLeft + 16}px` }}
        onClick={isDirectory ? handleClick : handleFileSelect}
      >
        {/* Horizontal connector line (F-012) */}
        {level > 0 && showLines && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-px bg-gray-200 pointer-events-none"
            style={{
              left: `${paddingLeft}px`,
              width: "12px",
            }}
            aria-hidden="true"
          />
        )}
        {/* Icon */}
        {isDirectory ? (
          isLoading ? (
            <div className="animate-spin h-3 w-3 border-2 border-yellow-600 border-t-transparent rounded-full" />
          ) : isExpanded ? (
            <svg
              className="w-3 h-3 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a2 2 0 100 4h8a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2zm2 10a2 2 0 100-4H8a2 2 0 000 4h8z"
              />
            </svg>
          ) : (
            <svg
              className="w-3 h-3 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a2 2 0 100 4h8a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2z" />
            </svg>
          )
        ) : (
          <FaFile className="text-gray-500" size={12} />
        )}

        {/* Name */}
        <span
          className="flex-1 text-sm text-gray-700 truncate"
          title={entry.name}
        >
          {entry.name}
        </span>

        {/* Directory counts (TASK-322) */}
        {isDirectory && directoryCounts && (
          <span className="text-xs text-gray-500 ml-2">{directoryCounts}</span>
        )}

        {/* Size (only for files) */}
        {!isDirectory && (
          <span className="text-xs text-gray-500">{entry.sizeFormatted}</span>
        )}

        {/* Action Buttons (files only, TASK-313, TASK-323: always visible) */}
        {!isDirectory && (
          <div className="flex items-center gap-1 opacity-100">
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

            {/* Delete Button (TASK-313) */}
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

        {/* Chevron for directories */}
        {isDirectory && (
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="px-2 text-xs text-red-600"
          style={{ paddingLeft: `${paddingLeft + 32}px` }}
        >
          {error}
        </div>
      )}

      {/* Children (when expanded) - F-012 enhanced with TreeLines, TASK-313 pass onDelete, TASK-318 pass selection props */}
      {isExpanded && hasLoaded && children.length > 0 && (
        <TreeLines depth={level + 1} isLast={isLast} isCollapsed={!showLines}>
          {children.map((child, index) => (
            <FileTreeItem
              key={`${keyPrefix}/${child.name}`}
              entry={child}
              level={level + 1}
              onDownload={onDownload}
              onDelete={onDelete}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              keyPrefix={`${keyPrefix}/${child.name}`}
              showLines={showLines}
              isLast={index === children.length - 1}
            />
          ))}
        </TreeLines>
      )}

      {/* Empty State */}
      {isExpanded && hasLoaded && children.length === 0 && (
        <div
          className="text-xs text-gray-400 italic"
          style={{ paddingLeft: `${paddingLeft + 32}px` }}
        >
          (empty directory)
        </div>
      )}
    </div>
  );
};

/**
 * FileTree component (F-012 enhanced with responsive tree lines, TASK-313 delete functionality, TASK-318 selection)
 *
 * @remarks
 * - Displays OPFS file tree with lazy-loaded directories
 * - Root level files are shown initially
 * - Directories are loaded on-demand when expanded
 * - Supports file download via callback
 * - VSCode-style tree lines with responsive hiding (F-012)
 * - Delete button for files (TASK-313)
 * - File selection with visual highlight (TASK-318)
 *
 * @param props.onDownload - Callback for downloading files
 * @param props.onDelete - Callback for delete button click (TASK-313)
 * @param props.onFileSelect - Callback for file selection (TASK-318)
 * @param props.selectedFile - Currently selected file (TASK-318)
 *
 * @returns JSX.Element - File tree display
 */
export const FileTree = ({
  onDownload,
  onDelete,
  onFileSelect,
  selectedFile,
}: FileTreeProps) => {
  // F-012: Track container width for responsive tree lines
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLines, setShowLines] = useState(true);

  // F-012: ResizeObserver to detect sidebar collapse
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Hide lines when width < 200px (collapsed sidebar)
        setShowLines(entry.contentRect.width >= 200);
      }
    });

    observer.observe(container);
    return function cleanup() {
      observer.disconnect();
    };
  }, []);

  // Fetch root level files
  const {
    data: entries,
    isLoading,
    error,
    reload,
  } = useInspectedWindowRequest<OpfsFileEntry[]>(
    () => {
      console.log("[FileTree] Fetching OPFS files...");
      return databaseService.getOpfsFiles();
    },
    [],
    [],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
        <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full mr-2" />
        Loading OPFS files...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600 text-sm">
        <span>{error}</span>
        <button
          onClick={reload}
          className="ml-2 text-blue-600 hover:text-blue-700"
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
        No OPFS files found
      </div>
    );
  }

  return (
    // F-012: Add containerRef for responsive tree lines
    <div ref={containerRef} className="flex flex-col">
      {entries.map((entry, index) => (
        <FileTreeItem
          key={entry.name}
          entry={entry}
          level={0}
          onDownload={onDownload}
          onDelete={onDelete}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
          keyPrefix={entry.name}
          showLines={showLines}
          isLast={index === entries.length - 1}
        />
      ))}
    </div>
  );
};
