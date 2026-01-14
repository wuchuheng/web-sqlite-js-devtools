import { useState, useCallback, useMemo } from "react";
import { FileNode } from "./FileNode";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";

/**
 * FileTree component props
 */
interface FileTreeProps {
  onDownload: (_path: string, name: string) => Promise<void>;
}

/**
 * FileTreeItem props for internal use
 */
interface FileTreeItemProps {
  entry: OpfsFileEntry;
  level: number;
  onDownload: (_path: string, name: string) => Promise<void>;
  keyPrefix: string;
}

/**
 * FileTreeItem - Internal component for tree items with lazy-loading
 */
const FileTreeItem = ({
  entry,
  level,
  onDownload,
  keyPrefix,
}: FileTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<OpfsFileEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirectory = entry.type === "directory";

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
  }, [entry.path, entry.type, hasLoaded, isLoading, isDirectory]);

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

  const paddingLeft = level * 16;

  return (
    <div>
      {/* Parent Node */}
      <div
        className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-100 cursor-pointer select-none`}
        style={{ paddingLeft: `${paddingLeft + 16}px` }}
        onClick={handleClick}
      >
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
          <svg
            className="w-3 h-3 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
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

      {/* Children (when expanded) */}
      {isExpanded && hasLoaded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FileTreeItem
              key={`${keyPrefix}/${child.name}`}
              entry={child}
              level={level + 1}
              onDownload={onDownload}
              keyPrefix={`${keyPrefix}/${child.name}`}
            />
          ))}
        </div>
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
 * FileTree component
 *
 * @remarks
 * - Displays OPFS file tree with lazy-loaded directories
 * - Root level files are shown initially
 * - Directories are loaded on-demand when expanded
 * - Supports file download via callback
 *
 * @param props.onDownload - Callback for downloading files
 *
 * @returns JSX.Element - File tree display
 */
export const FileTree = ({ onDownload }: FileTreeProps) => {
  // Fetch root level files
  const {
    data: entries,
    isLoading,
    error,
    reload,
  } = useInspectedWindowRequest<OpfsFileEntry[]>(
    () => databaseService.getOpfsFiles(),
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
    <div className="flex flex-col">
      {entries.map((entry) => (
        <FileTreeItem
          key={entry.name}
          entry={entry}
          level={0}
          onDownload={onDownload}
          keyPrefix={entry.name}
        />
      ))}
    </div>
  );
};
