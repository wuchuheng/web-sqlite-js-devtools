import { useEffect } from "react";
import { FaCheck, FaExclamationCircle } from "react-icons/fa";

/**
 * Toast variant type
 */
export type ToastVariant = "success" | "error";

/**
 * Toast notification component props
 */
export interface ToastProps {
  /** Whether the toast is visible */
  isVisible: boolean;
  /** Toast variant (success or error) */
  variant: ToastVariant;
  /** Title message */
  title: string;
  /** Detail message */
  message: string;
  /** Function called when toast is dismissed */
  onDismiss: () => void;
  /** Function called when retry button clicked (error only) */
  onRetry?: () => void;
  /** Item name being deleted (for message context) */
  itemName?: string;
}

/**
 * Toast notification component for success/error feedback
 *
 * Displays auto-dismissing notifications with optional retry button for errors.
 * Fixed position at top-right with slide-in animation.
 *
 * @remarks
 * - Auto-dismisses after duration (3s for success, 5s for error)
 * - Success variant: green styling with FaCheck icon
 * - Error variant: red styling with FaExclamationCircle icon and retry button
 * - Fixed position at top-right with z-index 60 (above modal)
 * - Slide-in animation from right (300ms ease-out)
 * - Accessibility: role="alert", aria-live="polite", aria-atomic="true"
 *
 * @param props.isVisible - Toast visibility state
 * @param props.variant - Toast variant (success or error)
 * @param props.title - Title message (e.g., "Deleted successfully")
 * @param props.message - Detail message (e.g., "database.sqlite has been deleted.")
 * @param props.onDismiss - Callback when toast is dismissed (auto or manual)
 * @param props.onRetry - Callback when retry button clicked (error only)
 * @param props.itemName - Item name for context (optional)
 *
 * @returns React component or null when not visible
 *
 * @example
 * ```tsx
 * // Success toast
 * <Toast
 *   isVisible={showToast}
 *   variant="success"
 *   title="Deleted successfully"
 *   message="database.sqlite has been deleted."
 *   onDismiss={() => setShowToast(false)}
 *   itemName="database.sqlite"
 * />
 *
 * // Error toast with retry
 * <Toast
 *   isVisible={showToast}
 *   variant="error"
 *   title="Delete failed"
 *   message="Permission denied"
 *   onDismiss={() => setShowToast(false)}
 *   onRetry={handleRetry}
 * />
 * ```
 */
export const Toast: React.FC<ToastProps> = ({
  isVisible,
  variant,
  title,
  message,
  onDismiss,
  onRetry,
  itemName: _itemName,
}) => {
  // 1. Auto-dismiss after duration based on variant
  useEffect(() => {
    // 1a. Return early if not visible
    if (!isVisible) {
      return undefined;
    }

    // 1b. Set duration based on variant (3s for success, 5s for error)
    const duration = variant === "success" ? 3000 : 5000;

    // 1c. Set timeout to dismiss toast
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    // 1d. Cleanup timeout on unmount or visibility change
    return function cleanup() {
      clearTimeout(timer);
    };
  }, [isVisible, variant, onDismiss]);

  // 2. Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // 3. Determine styling based on variant
  const isSuccess = variant === "success";
  const bgColor = isSuccess ? "bg-green-50" : "bg-red-50";
  const borderColor = isSuccess ? "border-green-200" : "border-red-200";
  const textColor = isSuccess ? "text-green-700" : "text-red-700";
  const iconColor = isSuccess ? "text-green-600" : "text-red-600";
  const Icon = isSuccess ? FaCheck : FaExclamationCircle;

  return (
    <div
      className={`fixed top-4 right-4 z-[60] max-w-md w-full ${bgColor} ${borderColor} ${textColor} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-[slide-in_0.3s_ease-out]`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${iconColor}`}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p className="text-sm font-semibold">{title}</p>

        {/* Message */}
        <p className="text-sm mt-1">{message}</p>

        {/* Retry Button (error only) */}
        {!isSuccess && onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            type="button"
          >
            Retry
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        aria-label="Close notification"
        type="button"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};
