import type { ReactNode } from "react";

/**
 * Preview header component props
 *
 * @remarks
 * - fileName: Name of the file being previewed
 * - showStatus: Whether to show the status badge (default: true)
 * - statusText: Text to display in status badge (default: "started")
 */
interface PreviewHeaderProps {
  /** Name of the file being previewed */
  fileName: string;
  /** Whether to show the status badge (default: true) */
  showStatus?: boolean;
  /** Text to display in status badge (default: "started") */
  statusText?: string;
}

/**
 * Preview header component (F-014)
 *
 * @remarks
 * - Green header bar for preview panel
 * - Displays "Preview: [filename]" title
 * - Shows status badge (white background, green text)
 * - Used in FilePreview component
 *
 * @param props.fileName - Name of the file being previewed
 * @param props.showStatus - Whether to show the status badge (default: true)
 * @param props.statusText - Text to display in status badge (default: "started")
 * @returns Preview header JSX element
 *
 * @example
 * ```tsx
 * <PreviewHeader fileName="app.log" showStatus={true} statusText="started" />
 * ```
 */
export const PreviewHeader = ({
  fileName,
  showStatus = true,
  statusText = "started",
}: PreviewHeaderProps): ReactNode => {
  return (
    <div className="px-4 py-3 bg-green-600 text-white flex items-center justify-between">
      {/* File name */}
      <span className="text-sm font-medium">Preview: {fileName}</span>

      {/* Status badge */}
      {showStatus && (
        <span className="px-2 py-1 bg-white text-green-600 text-xs font-medium rounded">
          {statusText}
        </span>
      )}
    </div>
  );
};
