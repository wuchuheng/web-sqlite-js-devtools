import { useEffect } from "react";
import { IoMdTrash } from "react-icons/io";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";

/**
 * Delete confirmation modal props
 */
interface DeleteConfirmModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** File or directory entry to delete */
  entry: OpfsFileEntry | null;
  /** Function called when user confirms deletion */
  onConfirm: () => Promise<void>;
  /** Function called when user cancels or closes modal */
  onCancel: () => void;
  /** Whether delete operation is in progress */
  isDeleting?: boolean;
}

/**
 * Delete confirmation modal for OPFS files and directories (F-012)
 *
 * @remarks
 * 1. Handle backdrop click and Escape key for closing
 * 2. Render modal structure with backdrop and centered container
 * 3. Display metadata grid (type, size, file type, modified, item count, path)
 * 4. Show warning text (enhanced for directories with item count)
 * 5. Render confirm/cancel buttons with loading state
 *
 * @param props.isOpen - Modal visibility state
 * @param props.entry - OPFS file or directory entry to delete
 * @param props.onConfirm - Async callback when user confirms deletion
 * @param props.onCancel - Callback when user cancels or closes modal
 * @param props.isDeleting - Loading state during deletion operation
 *
 * @returns JSX.Element - Modal or null when not open
 *
 * @example
 * ```tsx
 * <DeleteConfirmModal
 *   isOpen={isModalOpen}
 *   entry={selectedEntry}
 *   onConfirm={handleDelete}
 *   onCancel={closeModal}
 *   isDeleting={isDeleting}
 * />
 * ```
 */
export const DeleteConfirmModal = ({
  isOpen,
  entry,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmModalProps) => {
  // Phase 1: Handle keyboard (Escape key) and cleanup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      // Close on Escape key, but not during deletion
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isDeleting, onCancel]);

  // Don't render if modal is closed or no entry
  if (!isOpen || !entry) {
    return null;
  }

  // Handle backdrop click (close modal when clicking outside)
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on backdrop, not during deletion
    if (e.target === e.currentTarget && !isDeleting) {
      onCancel();
    }
  };

  // Handle confirm button click
  const handleConfirm = async () => {
    await onConfirm();
    // Parent component is responsible for closing modal after success/error
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp?: number): string | null => {
    if (!timestamp) {
      return null;
    }
    return new Date(timestamp).toLocaleString();
  };

  // Calculate total items in directory
  const totalItems =
    entry.itemCount?.files && entry.itemCount.directories
      ? entry.itemCount.files + entry.itemCount.directories
      : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-50"
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Phase 2: Metadata Display Grid */}
        <div className="space-y-4">
          {/* Title */}
          <h2
            id="delete-modal-title"
            className="text-xl font-semibold text-gray-900"
          >
            Delete {entry.name}?
          </h2>

          {/* Metadata Grid */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            {/* Type Badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Type</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  entry.type === "file"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {entry.type === "file" ? "File" : "Directory"}
              </span>
            </div>

            {/* Size (files only) */}
            {entry.type === "file" && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Size</span>
                <span className="text-sm text-gray-900 font-mono">
                  {entry.sizeFormatted}
                </span>
              </div>
            )}

            {/* File Type (files only) */}
            {entry.fileType && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  File Type
                </span>
                <span className="text-sm text-gray-900">{entry.fileType}</span>
              </div>
            )}

            {/* Last Modified (files only) */}
            {entry.lastModified && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Modified
                </span>
                <span className="text-sm text-gray-900">
                  {formatTimestamp(entry.lastModified)}
                </span>
              </div>
            )}

            {/* Item Count (directories only) */}
            {entry.type === "directory" && entry.itemCount && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Contains
                </span>
                <span className="text-sm text-gray-900">
                  {entry.itemCount.files}{" "}
                  {entry.itemCount.files === 1 ? "file" : "files"}
                  {", "}
                  {entry.itemCount.directories}{" "}
                  {entry.itemCount.directories === 1
                    ? "directory"
                    : "directories"}
                </span>
              </div>
            )}

            {/* Full Path */}
            <div className="pt-2 border-t border-gray-200">
              <span className="text-xs font-medium text-gray-500 block mb-1">
                Full Path
              </span>
              <span className="text-xs text-gray-700 font-mono break-all">
                {entry.path}
              </span>
            </div>
          </div>

          {/* Phase 3: Warning Text */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium">
              This action cannot be undone.
            </p>

            {/* Enhanced warning for directories */}
            {entry.type === "directory" && totalItems !== undefined && (
              <p className="text-sm text-red-700 mt-2">
                Delete directory and all contents ({totalItems} items)?
              </p>
            )}
          </div>

          {/* Phase 4: Confirm/Cancel Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  {/* Loading spinner */}
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <IoMdTrash size={16} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
