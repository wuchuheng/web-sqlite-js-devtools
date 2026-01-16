import { useEffect, useState } from "react";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";

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
 * ImagePreview component (F-013)
 *
 * @remarks
 * 1. Display image files with responsive scaling and aspect ratio preservation
 * 2. Create object URL from Blob content for image display
 * 3. Cleanup object URL on unmount to prevent memory leaks
 *
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
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      {metadata.warning && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
          Warning: {metadata.warning}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-6 bg-slate-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-slate-500 text-sm">Loading image...</div>
        )}
      </div>
    </div>
  );
};
