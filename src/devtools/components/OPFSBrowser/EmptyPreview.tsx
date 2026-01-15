import { FiFileText } from "react-icons/fi";

/**
 * EmptyPreview component (F-013)
 *
 * @remarks
 * - Displays when no file is selected in the two-panel layout
 * - Shows helpful message instructing user to select a file
 * - Part of the right panel preview area
 *
 * @returns Empty state JSX.Element
 *
 * @example
 * ```tsx
 * <EmptyPreview />
 * ```
 */
export const EmptyPreview = (): JSX.Element => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="text-gray-400 mb-4">
        <FiFileText size={64} />
      </div>
      <h3 className="text-gray-600 text-lg font-semibold mb-2">
        No file selected
      </h3>
      <p className="text-gray-500 text-sm">
        Select a file from the tree to preview its contents
      </p>
    </div>
  );
};
