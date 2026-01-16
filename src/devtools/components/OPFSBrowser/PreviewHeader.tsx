import type { ReactNode } from "react";

/**
 * Preview header component props
 *
 * @remarks
 * - fileName: Name of the file being previewed
 * - fileSize: Optional formatted file size string
 */
interface PreviewHeaderProps {
  /** Name of the file being previewed */
  fileName: string;
  /** Optional formatted file size string */
  fileSize?: string;
}

/**
 * Preview header component (F-014)
 *
 * @remarks
 * - Neutral header bar for preview panel
 * - Displays "Preview: [filename]" title
 * - Optionally displays file size under the title
 * - Used in FilePreview component
 *
 * @param props.fileName - Name of the file being previewed
 * @param props.showStatus - Whether to show the status badge (default: true)
 * @param props.statusText - Text to display in status badge (default: "started")
 * @returns Preview header JSX element
 *
 * @example
 * ```tsx
 * <PreviewHeader fileName="app.log" fileSize="12.4 KB" />
 * ```
 */
export const PreviewHeader = ({
  fileName,
  fileSize,
}: PreviewHeaderProps): ReactNode => {
  return (
    <div className="px-6 py-4 bg-white border-b border-slate-200">
      <div className="text-base font-semibold text-slate-800">
        Preview: {fileName}
      </div>
      {fileSize && <div className="text-xs text-slate-500">{fileSize}</div>}
    </div>
  );
};
