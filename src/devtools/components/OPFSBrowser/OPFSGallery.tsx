import { useState, useCallback, useEffect } from "react";
import { FaFile, FaExclamationTriangle } from "react-icons/fa";
import { FileTree } from "./FileTree";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Toast, type ToastProps } from "./Toast";
import { databaseService } from "@/devtools/services/databaseService";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";

/**
 * OPFSGallery component
 *
 * @remarks
 * - Main component for OPFS file browser
 * - Handles file downloads with proper cleanup
 * - Handles file and directory deletion with confirmation modal
 * - Displays toast notifications for success/error feedback
 * - Displays file tree with lazy-loading
 * - Shows helper notice about OPFS
 * - TASK-313: Integrated DeleteConfirmModal and Toast components
 *
 * @returns JSX.Element - OPFS file browser layout
 */
export const OPFSGallery = () => {
  // Download state
  const [downloadStatus, setDownloadStatus] = useState<{
    isDownloading: boolean;
    filename: string | null;
    error: string | null;
  }>({
    isDownloading: false,
    filename: null,
    error: null,
  });

  // Modal state (TASK-313)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<OpfsFileEntry | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state (TASK-313)
  const [toast, setToast] = useState<Omit<ToastProps, "onDismiss" | "onRetry">>(
    {
      isVisible: false,
      variant: "success",
      title: "",
      message: "",
      itemName: undefined,
    },
  );

  // 1. Handle download with error handling
  const handleDownload = useCallback(async (path: string, name: string) => {
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
  }, []);

  // 2. Handle delete click - open modal (TASK-313)
  const handleDeleteClick = useCallback((entry: OpfsFileEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  }, []);

  // 3. Handle delete confirmation (TASK-313)
  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedEntry) {
      return;
    }

    setIsDeleting(true);

    try {
      // Call appropriate delete function based on entry type
      if (selectedEntry.type === "file") {
        const result = await databaseService.deleteOpfsFile(selectedEntry.path);
        if (!result.success) {
          throw new Error(result.error ?? "Failed to delete file");
        }
      } else {
        const result = await databaseService.deleteOpfsDirectory(
          selectedEntry.path,
        );
        if (!result.success) {
          throw new Error(result.error ?? "Failed to delete directory");
        }
      }

      // Show success toast
      setToast({
        isVisible: true,
        variant: "success",
        title: "Deleted successfully",
        message: `${selectedEntry.name} has been deleted.`,
        itemName: selectedEntry.name,
      });

      // Close modal
      setIsModalOpen(false);
      setSelectedEntry(null);
    } catch (err) {
      // Show error toast
      setToast({
        isVisible: true,
        variant: "error",
        title: "Delete failed",
        message: err instanceof Error ? err.message : "An error occurred",
        itemName: selectedEntry?.name,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [selectedEntry]);

  // 4. Handle modal close (TASK-313)
  const handleModalClose = useCallback(() => {
    if (!isDeleting) {
      setIsModalOpen(false);
      setSelectedEntry(null);
    }
  }, [isDeleting]);

  // 5. Handle toast dismiss (TASK-313)
  const handleToastDismiss = useCallback(() => {
    setToast({ ...toast, isVisible: false });
  }, [toast]);

  // 6. Handle toast retry (TASK-313)
  const handleToastRetry = useCallback(() => {
    if (toast.variant === "error") {
      handleDeleteConfirm();
    }
  }, [toast.variant, handleDeleteConfirm]);

  // 7. Clear download status on mount
  useEffect(() => {
    return () => {
      setDownloadStatus({
        isDownloading: false,
        filename: null,
        error: null,
      });
    };
  }, []);

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
          Browse and manage SQLite database files stored in the Origin Private
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
        <FileTree onDownload={handleDownload} onDelete={handleDeleteClick} />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Tip:</strong> Click on directories to expand them. Click the
          download icon next to files to save them to your computer. Click the
          delete icon to remove files.
        </p>
      </div>

      {/* Delete Confirmation Modal (TASK-313) */}
      <DeleteConfirmModal
        isOpen={isModalOpen}
        entry={selectedEntry}
        onConfirm={handleDeleteConfirm}
        onCancel={handleModalClose}
        isDeleting={isDeleting}
      />

      {/* Toast Notification (TASK-313) */}
      <Toast
        isVisible={toast.isVisible}
        variant={toast.variant}
        title={toast.title}
        message={toast.message}
        itemName={toast.itemName}
        onDismiss={handleToastDismiss}
        onRetry={toast.variant === "error" ? handleToastRetry : undefined}
      />
    </div>
  );
};
