/**
 * Schema DDL view component
 *
 * @remarks
 * Displays SQL CREATE TABLE statement in a dark code block.
 * No "DDL" sub-heading as it's redundant with the tab button.
 *
 * @param props.ddl - SQL CREATE TABLE statement
 *
 * @returns JSX.Element - Schema DDL view
 */
interface SchemaDDLViewProps {
  ddl: string;
}

export const SchemaDDLView = ({ ddl }: SchemaDDLViewProps) => {
  return (
    <div className="px-4 py-3">
      {/* Dark code block */}
      <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
        {ddl || "-- No DDL available --"}
      </pre>
    </div>
  );
};
