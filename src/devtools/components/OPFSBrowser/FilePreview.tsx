import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import { databaseService } from "@/devtools/services/databaseService";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";
import { FiAlertCircle } from "react-icons/fi";
import { EmptyPreview } from "./EmptyPreview";
import { PreviewHeader } from "./PreviewHeader";
import { TextPreview } from "./TextPreview";
import { ImagePreview } from "./ImagePreview";
import { UnsupportedPreview } from "./UnsupportedPreview";

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
 * 2. Display loading state with subtle spinner
 * 3. Display error state with retry button
 * 4. Display green header bar with filename and status badge (TASK-321)
 * 5. Delegate to appropriate preview component based on file type
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
    { enabled: Boolean(file?.path) },
  );

  // 2. No file selected - show empty state (TASK-319)
  if (!file) {
    return <EmptyPreview />;
  }

  // 3. Loading state - show subtle spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-transparent rounded-full" />
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
  // NOTE: Child components implemented in TASK-316, TASK-317, and TASK-319
  // NOTE: PreviewHeader added in TASK-321
  switch (data.type) {
    case "text":
      // TextPreview component (TASK-316)
      return (
        <>
          <PreviewHeader fileName={file.name} fileSize={file.sizeFormatted} />
          <TextPreview
            file={file}
            content={data.content as string}
            metadata={data.metadata}
          />
        </>
      );

    case "image":
      // ImagePreview component (TASK-317)
      return (
        <>
          <PreviewHeader fileName={file.name} fileSize={file.sizeFormatted} />
          <ImagePreview
            file={file}
            content={data.content as Blob}
            metadata={data.metadata}
          />
        </>
      );

    case "binary":
      // UnsupportedPreview - Binary files cannot be previewed (TASK-319)
      return (
        <>
          <PreviewHeader fileName={file.name} fileSize={file.sizeFormatted} />
          <UnsupportedPreview file={file} metadata={data.metadata} />
        </>
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
