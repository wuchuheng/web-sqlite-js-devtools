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
 * TextPreview component props
 */
interface TextPreviewProps {
  /** File entry being previewed */
  file: OpfsFileEntry;
  /** Text file content */
  content: string;
  /** File metadata */
  metadata: ContentMetadata;
}

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 KB", "2.3 MB")
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
 * TextPreview component (F-013)
 *
 * @remarks
 * 1. Display text file content in monospace font with line breaks preserved
 * 2. Show emerald-themed header with filename and metadata
 * 3. Handle large files (> 1MB) with warning message
 * 4. Use whitespace-pre-wrap for preserving formatting
 *
 * @param props.file - File entry being previewed
 * @param props.content - Text file content
 * @param props.metadata - File metadata (size, lastModified, mimeType)
 * @returns Text preview panel
 *
 * @example
 * ```tsx
 * <TextPreview
 *   file={selectedFile}
 *   content="Hello, World!"
 *  ={{ size: 13, lastModified: new Date(), mimeType: "text/plain" }}
 * />
 * ```
 */
export const TextPreview = ({
  file,
  content,
  metadata,
}: TextPreviewProps): JSX.Element => {
  const ONE_MB = 1024 * 1024;
  const isLargeFile = metadata.size > ONE_MB;

  return (
    <div className="flex flex-col h-full bg-emerald-50">
      {/* Header */}
      <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2">
        <h3 className="text-emerald-700 font-semibold">Preview: {file.name}</h3>
        <div className="text-xs text-gray-600 mt-1">
          {formatFileSize(metadata.size)} •{" "}
          {formatTimestamp(metadata.lastModified)}
        </div>
        {isLargeFile && (
          <div className="text-xs text-orange-600 mt-1">
            ⚠️ Large file ({formatFileSize(metadata.size)}) - preview may be
            slow
          </div>
        )}
        {metadata.warning && (
          <div className="text-xs text-orange-600 mt-1">
            ⚠️ {metadata.warning}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 bg-white">
        <pre className="font-mono text-sm text-gray-700 whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    </div>
  );
};
