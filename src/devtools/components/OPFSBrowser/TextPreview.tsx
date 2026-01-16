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
 * 2. Handle large files (> 1MB) with warning message
 * 3. Use whitespace-pre-wrap for preserving formatting
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
  content,
  metadata,
}: TextPreviewProps): JSX.Element => {
  const ONE_MB = 1024 * 1024;
  const isLargeFile = metadata.size > ONE_MB;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      {(isLargeFile || metadata.warning) && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
          {isLargeFile && (
            <div>
              Warning: Large file ({formatFileSize(metadata.size)}) - preview
              may be slow.
            </div>
          )}
          {metadata.warning && <div>Warning: {metadata.warning}</div>}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto p-4 bg-white">
        <pre className="font-mono text-sm text-slate-700 whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    </div>
  );
};
