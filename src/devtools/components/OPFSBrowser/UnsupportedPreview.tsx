import { FiFile } from "react-icons/fi";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";

/**
 * ContentMetadata interface
 */
interface ContentMetadata {
  size: number;
  lastModified: Date;
  mimeType: string;
}

/**
 * UnsupportedPreview component props
 */
interface UnsupportedPreviewProps {
  /** File entry to display metadata for */
  file: OpfsFileEntry;
  /** File metadata from service layer */
  metadata: ContentMetadata;
}

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format timestamp for display
 */
const formatTimestamp = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * UnsupportedPreview component (F-013)
 *
 * @remarks
 * - Displays when file type cannot be previewed (binary files, SQLite databases, etc.)
 * - Shows file metadata (name, size, type, modified date)
 * - Download button is provided (handled by parent via tree download button)
 * - Part of the right panel preview area
 *
 * @param props.file - File entry to display metadata for
 * @param props.metadata - File metadata from service layer
 * @returns Unsupported file preview JSX.Element
 *
 * @example
 * ```tsx
 * <UnsupportedPreview file={file} metadata={metadata} />
 * ```
 */
export const UnsupportedPreview = ({
  file,
  metadata,
}: UnsupportedPreviewProps): JSX.Element => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <h3 className="text-gray-700 font-semibold">Preview: {file.name}</h3>
        <div className="text-xs text-gray-600 mt-1">
          {formatFileSize(metadata.size)} •{" "}
          {formatTimestamp(metadata.lastModified)} • {metadata.mimeType}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-gray-400 mb-4">
          <FiFile size={64} />
        </div>
        <h3 className="text-gray-600 text-lg font-semibold mb-2">
          Preview not available
        </h3>
        <p className="text-gray-500 text-sm">
          This file type ({metadata.mimeType || "binary"}) cannot be previewed
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Use the download button in the file tree to save this file
        </p>
      </div>
    </div>
  );
};
