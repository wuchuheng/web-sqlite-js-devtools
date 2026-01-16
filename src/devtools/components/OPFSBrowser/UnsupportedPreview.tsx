import { FiFile } from "react-icons/fi";
import type { OpfsFileEntry } from "@/devtools/services/databaseService";

/**
 * ContentMetadata interface
 *
 * @remarks
 * lastModified can be Date | number because serialization through
 * chrome.scripting.executeScript converts Date to timestamp number
 */
interface ContentMetadata {
  size: number;
  lastModified: Date | number | string;
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
  metadata: _metadata,
}: UnsupportedPreviewProps): JSX.Element => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 text-center gap-4">
        <div className="text-slate-300 mb-4">
          <FiFile size={64} />
        </div>
        <h3
          className="text-lg  mb-2 text-black font-bold"
          style={{ color: "black", fontSize: "1.125rem", fontWeight: "bold" }}
        >
          Preview not available for binary files.
        </h3>
        <p className="text-slate-500 text-sm">
          Please use the download button to save the file.
        </p>
      </div>
    </div>
  );
};
