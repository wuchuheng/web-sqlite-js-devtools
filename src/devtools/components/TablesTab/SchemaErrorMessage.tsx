/**
 * Schema error message component
 *
 * @remarks
 * Displays an error message when schema data fails to load.
 *
 * @param props.error - Error message to display
 *
 * @returns JSX.Element - Error message display
 */
interface SchemaErrorMessageProps {
  error: string;
}

export const SchemaErrorMessage = ({ error }: SchemaErrorMessageProps) => {
  return (
    <div className="px-4 py-3 border-b border-red-200 bg-red-50">
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
};
