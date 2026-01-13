import { FaRegKeyboard, FaTimes } from "react-icons/fa";
import type { ShortcutCategory } from "@/devtools/hooks/useKeyboardShortcuts";

/**
 * Props for KeyboardShortcutsHelp component
 */
interface KeyboardShortcutsHelpProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Shortcut categories to display */
  categories: ShortcutCategory[];
}

/**
 * Keyboard shortcuts help modal component
 *
 * @remarks
 * - Displays all shortcuts grouped by category
 * - Shows key combos and descriptions
 * - Modal overlay with close button
 * - Closes on Escape or clicking outside
 *
 * @param props - KeyboardShortcutsHelpProps
 * @returns JSX.Element - Help modal or null if closed
 */
export const KeyboardShortcutsHelp = ({
  isOpen,
  onClose,
  categories,
}: KeyboardShortcutsHelpProps) => {
  /**
   * Handle click on overlay (close modal)
   */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Handle Escape key
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaRegKeyboard className="text-blue-600" size={18} />
            <h2 className="text-lg font-semibold text-gray-800">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Close (Escape)"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {categories.map((category) => {
            const filteredShortcuts = category.shortcuts.filter(
              (s) => s.label !== "Escape", // Don't show Escape in list
            );

            if (filteredShortcuts.length === 0) return null;

            return (
              <div key={category.name} className="mb-4 last:mb-0">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {category.name}
                </h3>
                <div className="space-y-1">
                  {filteredShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex justify-between items-center px-3 py-2 hover:bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-600">
                        {shortcut.description}
                      </span>
                      <kbd className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-300">
                        {shortcut.label}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Press{" "}
            <kbd className="font-mono bg-gray-100 px-1 rounded">Escape</kbd> to
            close this modal
          </p>
        </div>
      </div>
    </div>
  );
};
