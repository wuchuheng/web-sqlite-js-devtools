import { useEffect, useState } from "react";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";
import { formatTimestamp } from "@/devtools/utils/timestampFormatting";

/**
 * Content metadata from service layer
 *
 * @remarks
 * lastModified can be Date | number | string because serialization through
 * chrome.scripting.executeScript converts Date to timestamp number
 */
interface ContentMetadata {
  size: number;
  lastModified: Date | number | string;
  mimeType: string;
  warning?: string;
}

/**
 * ImagePreview component props
 */
interface ImagePreviewProps {
  /** File entry being previewed */
  file: OpfsFileEntry;
  /** Image content as Blob */
  content: Blob;
  /** File metadata */
  metadata: ContentMetadata;
}

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
function formatFileSize(bytes: number): string {
  const KB = 1024;
  const MB = KB * 1024;

  if (bytes < KB) {
    return `${bytes} B`;
  }
  if (bytes < MB) {
    return `${(bytes / KB).toFixed(1)} KB`;
  }
  return `${(bytes / MB).toFixed(1)} MB`;
}

/**
 * ImagePreview component (F-013)
 *
 * @remarks
 * 1. Display image files with responsive scaling and aspect ratio preservation
 * 2. Create object URL from Blob content for image display
 * 3. Cleanup object URL on unmount to prevent memory leaks
 * 4. Show emerald-themed header with filename and metadata
 *
 * @param props.file - File entry being previewed
 * @param props.content - Image content as Blob
 * @param props.metadata - File metadata (size, lastModified, mimeType)
 * @returns Image preview panel
 *
 * @example
 * ```tsx
 * <ImagePreview
 *   file={selectedFile}
 *   content={imageBlob}
 *   metadata={{ size: 102400, lastModified: new Date(), mimeType: "image/jpeg" }}
 * />
 * ```
 */
export const ImagePreview = ({
  file,
  content,
  metadata,
}: ImagePreviewProps): JSX.Element => {
  const [imageUrl, setImageUrl] = useState<string>("");

  // 1. Create object URL from Blob for image display
  // 2. Cleanup object URL on unmount to prevent memory leaks
  useEffect(() => {
    // 1a. Create object URL from Blob content
    const url = URL.createObjectURL(content);
    setImageUrl(url);

    // 2a. Cleanup function: Revoke object URL on unmount
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [content]);

  return (
    <div className="flex flex-col h-full bg-emerald-50">
      {/* Header */}
      <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2">
        <h3 className="text-emerald-700 font-semibold">Preview: {file.name}</h3>
        <div className="text-xs text-gray-600 mt-1">
          {formatFileSize(metadata.size)} •{" "}
          {formatTimestamp(metadata.lastModified)} • {metadata.mimeType}
        </div>
        {metadata.warning && (
          <div className="text-xs text-orange-600 mt-1">
            ⚠️ {metadata.warning}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-gray-500 text-sm">Loading image...</div>
        )}
      </div>
    </div>
  );
};
