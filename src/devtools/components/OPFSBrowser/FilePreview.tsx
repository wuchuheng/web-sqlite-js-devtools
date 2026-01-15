import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import { databaseService } from "@/devtools/services/databaseService";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";
import { FiAlertCircle } from "react-icons/fi";

// Type alias for file content data returned from service layer (for documentation)
type _FileContentData = {
  type: "text" | "image" | "binary";
  content: string | Blob;
  metadata: {
    size: number;
    lastModified: Date;
    mimeType: string;
    warning?: string;
  };
};

/**
 * FilePreview component props
 */
interface FilePreviewProps {
  /** Selected file entry to preview */
  file: OpfsFileEntry | null;
}

/**
 * FilePreview component (F-013)
 *
 * @remarks
 * 1. Load file content when file prop changes
 * 2. Display loading state with emerald spinner
 * 3. Display error state with retry button
 * 4. Delegate to appropriate preview component based on file type
 *
 * @param props.file - Selected file entry to preview
 * @returns Preview panel content
 *
 * @example
 * ```tsx
 * <FilePreview file={selectedFile} />
 * ```
 */
export const FilePreview = ({ file }: FilePreviewProps): JSX.Element => {
  // 1. Load file content when file prop changes
  const { data, isLoading, error, reload } = useInspectedWindowRequest(
    () => databaseService.getFileContent(file?.path || ""),
    [file?.path],
    null,
  );

  // 2. No file selected - show empty state
  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-gray-400 mb-4">
          <FiAlertCircle size={64} />
        </div>
        <h3 className="text-gray-600 text-lg font-semibold mb-2">
          No file selected
        </h3>
        <p className="text-gray-500 text-sm">
          Select a file from the tree to preview its contents
        </p>
      </div>
    );
  }

  // 3. Loading state - show emerald spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // 4. Error state - show error message with retry button
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-red-500 mb-4">
          <FiAlertCircle size={64} />
        </div>
        <h3 className="text-gray-700 text-lg font-semibold mb-2">
          Failed to load file
        </h3>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        <button
          onClick={() => reload()}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  // 5. No content yet (edge case)
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">Loading file...</p>
      </div>
    );
  }

  // 6. Delegate to appropriate preview component based on file type
  // NOTE: Child components will be implemented in subsequent tasks:
  //   - TextPreview (TASK-316)
  //   - ImagePreview (TASK-317)
  //   - EmptyPreview (will be part of this component's no-file state)
  //   - UnsupportedPreview (will be part of this component's binary state)
  switch (data.type) {
    case "text":
      // TextPreview will be implemented in TASK-316
      return (
        <div className="flex flex-col h-full bg-emerald-50">
          {/* Header */}
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2">
            <h3 className="text-emerald-700 font-semibold">{file.name}</h3>
            <div className="text-xs text-emerald-600 mt-1">
              {data.metadata.size} bytes •{" "}
              {new Date(data.metadata.lastModified).toLocaleString()}
            </div>
          </div>

          {/* Content placeholder */}
          <div className="flex-1 p-4 bg-white overflow-auto">
            <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap">
              {data.content as string}
            </pre>
          </div>
        </div>
      );

    case "image":
      // ImagePreview will be implemented in TASK-317
      return (
        <div className="flex flex-col h-full bg-emerald-50">
          {/* Header */}
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2">
            <h3 className="text-emerald-700 font-semibold">{file.name}</h3>
            <div className="text-xs text-emerald-600 mt-1">
              {data.metadata.size} bytes • {data.metadata.mimeType}
            </div>
          </div>

          {/* Content placeholder */}
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
            <div className="text-gray-500 text-sm text-center">
              <p>Image preview will be implemented in TASK-317</p>
              <p className="text-xs mt-2">
                MIME type: {data.metadata.mimeType}
              </p>
            </div>
          </div>
        </div>
      );

    case "binary":
      // UnsupportedPreview
      return (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
            <h3 className="text-gray-700 font-semibold">{file.name}</h3>
            <div className="text-xs text-gray-600 mt-1">
              {data.metadata.size} bytes • {data.metadata.mimeType}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FiAlertCircle size={64} />
            </div>
            <h3 className="text-gray-600 text-lg font-semibold mb-2">
              Preview not available
            </h3>
            <p className="text-gray-500 text-sm">
              This file type ({data.metadata.mimeType}) cannot be previewed
            </p>
          </div>
        </div>
      );

    default:
      // Fallback for unknown types
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-sm">Unknown file type</p>
        </div>
      );
  }
};
