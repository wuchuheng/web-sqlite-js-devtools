import { useState } from "react";
import { FaFile, FaExclamationTriangle } from "react-icons/fa";
import { FileTree } from "./FileTree";
import { databaseService } from "@/devtools/services/databaseService";

/**
 * OPFSGallery component
 *
 * @remarks
 * - Main component for OPFS file browser
 * - Handles file downloads with proper cleanup
 * - Displays file tree with lazy-loading
 * - Shows helper notice about OPFS
 *
 * @returns JSX.Element - OPFS file browser layout
 */
export const OPFSGallery = () => {
  const [downloadStatus, setDownloadStatus] = useState<{
    isDownloading: boolean;
    filename: string | null;
    error: string | null;
  }>({
    isDownloading: false,
    filename: null,
    error: null,
  });

  const handleDownload = async (path: string, name: string) => {
    setDownloadStatus({ isDownloading: true, filename: name, error: null });

    try {
      const result = await databaseService.downloadOpfsFile(path);

      if (result.success && result.data) {
        const { blobUrl, filename } = result.data;

        // Create temporary link and trigger download
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL after a short delay
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);

        setDownloadStatus({
          isDownloading: false,
          filename: null,
          error: null,
        });
      } else {
        setDownloadStatus({
          isDownloading: false,
          filename: null,
          error: result.error ?? "Failed to download file",
        });
      }
    } catch (err) {
      setDownloadStatus({
        isDownloading: false,
        filename: null,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <FaFile className="text-blue-600" size={18} />
          <h2 className="text-lg font-semibold text-gray-800">
            OPFS File Browser
          </h2>
        </div>
      </div>

      {/* Helper Notice */}
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-1">
          Origin Private File System
        </h3>
        <p className="text-xs text-blue-600">
          Browse and download SQLite database files stored in the Origin Private
          File System. Files are organized in a tree structure with lazy-loaded
          directories.
        </p>
      </div>

      {/* Download Status */}
      {downloadStatus.isDownloading && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-200 flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full" />
          <span className="text-sm text-green-700">
            Downloading {downloadStatus.filename}...
          </span>
        </div>
      )}

      {downloadStatus.error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 flex items-center gap-2">
          <FaExclamationTriangle className="text-red-600" size={16} />
          <span className="text-sm text-red-700">{downloadStatus.error}</span>
          <button
            onClick={() =>
              setDownloadStatus({
                isDownloading: false,
                filename: null,
                error: null,
              })
            }
            className="ml-auto text-xs text-red-600 hover:text-red-800"
            type="button"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* File Tree */}
      <div className="flex-1 overflow-auto bg-white">
        <FileTree onDownload={handleDownload} />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Tip:</strong> Click on directories to expand them. Click the
          download icon next to files to save them to your computer.
        </p>
      </div>
    </div>
  );
};
