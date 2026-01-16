import { useState, useCallback, useEffect } from "react";
import { FaFile, FaExclamationTriangle } from "react-icons/fa";
import { FileTree } from "./FileTree";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Toast, type ToastProps } from "./Toast";
import { FilePreview } from "./FilePreview";
import { ResizeHandle } from "@/devtools/components/Shared/ResizeHandle";
import { PageHeader } from "@/devtools/components/Shared/PageHeader";
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
 * - TASK-313: Integrated DeleteConfirmModal and Toast components
 * - TASK-318: Two-panel layout with resizable divider and file preview
 * - TASK-320: Updated to green color theme, removed helper notice, white preview background
 *
 * @returns JSX.Element - OPFS file browser layout
 */
export const OPFSGallery = () => {
  // 8. Panel width state (TASK-318: Two-panel layout)
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(350);

  // 9. Selected file state (TASK-318: File preview)
  const [selectedFile, setSelectedFile] = useState<OpfsFileEntry | null>(null);
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

  // 10. Handle panel drag (TASK-318: Two-panel layout)
  // 1. ResizeHandle provides delta X from drag operation
  // 2. Apply delta to current width and update state
  const handleDrag = useCallback((deltaX: number) => {
    setLeftPanelWidth((prevWidth) => prevWidth + deltaX);
  }, []);

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
    <div className="flex flex-col h-full bg-slate-100">
      <div className="flex flex-col flex-1 min-h-0  bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
        {/* Header */}
        <PageHeader className="flex items-center gap-3 px-4">
          <FaFile className="text-emerald-600" size={18} />
          <h2 className="text-base font-semibold text-slate-800">
            OPFS File Browser
          </h2>
        </PageHeader>

        {/* Download Status */}
        {downloadStatus.isDownloading && (
          <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
            <span className="text-sm text-emerald-700">
              Downloading {downloadStatus.filename}...
            </span>
          </div>
        )}

        {downloadStatus.error && (
          <div className="px-5 py-2 bg-rose-50 border-b border-rose-200 flex items-center gap-2">
            <FaExclamationTriangle className="text-rose-600" size={16} />
            <span className="text-sm text-rose-700">
              {downloadStatus.error}
            </span>
            <button
              onClick={() =>
                setDownloadStatus({
                  isDownloading: false,
                  filename: null,
                  error: null,
                })
              }
              className="ml-auto text-xs text-rose-600 hover:text-rose-800"
              type="button"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* File Tree (TASK-318: Two-panel layout) */}
        <div className="flex flex-1 min-h-0 overflow-hidden bg-slate-50 relative">
          {/* Left Panel: File Tree */}
          <div
            style={{ width: `${leftPanelWidth}px` }}
            className="relative flex flex-col overflow-hidden bg-slate-50 border-r border-slate-200"
          >
            <div className="flex-1 overflow-auto py-2">
              <FileTree
                onDownload={handleDownload}
                onDelete={handleDeleteClick}
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />
            </div>
          </div>

          {/* Divider (TASK-318: ResizeHandle) */}
          <ResizeHandle
            position="right"
            onDrag={handleDrag}
            minWidth={200}
            maxWidth={600}
            currentWidth={leftPanelWidth}
          />

          {/* Right Panel: Preview (TASK-318: FilePreview) */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <FilePreview file={selectedFile} />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal (TASK-313, TASK-324: footer removed) */}
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
