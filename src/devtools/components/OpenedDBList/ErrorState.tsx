import { FaExclamationCircle } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";

/**
 * Error state props
 */
interface ErrorStateProps {
  /** Error message to display */
  error: string;
  /** Function to retry data fetch */
  retry: () => void;
}

/**
 * Error state component with retry button
 *
 * @remarks
 * Displays error message and retry button when data fetch fails.
 * Uses FaExclamationCircle icon from react-icons/fa.
 *
 * @param props.error - Error message to display
 * @param props.retry - Function to retry data fetch
 *
 * @returns JSX.Element - Error display with retry button
 */
export const ErrorState = ({ error, retry }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <FaExclamationCircle className="text-error-600 text-6xl mb-6" />
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">
        Error Loading Databases
      </h1>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={retry}
        aria-label="Retry loading database list"
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
      >
        <IoMdRefresh size={18} />
        Retry
      </button>
    </div>
  );
};
