/**
 * Schema table view component
 *
 * @remarks
 * Displays column information in a table format without the "SCHEMA" title.
 * Shows column name, type, and constraints (PK, NOT NULL, DEFAULT).
 *
 * @param props.columns - Array of column information
 *
 * @returns JSX.Element - Schema table view
 */
interface SchemaTableViewProps {
  columns: Array<{
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: any;
    pk: number;
  }>;
}

export const SchemaTableView = ({ columns }: SchemaTableViewProps) => {
  return (
    <div className="px-4 py-3">
      {/* Column info table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-3 py-2 text-left font-medium">Column</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-left font-medium">Constraints</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((col) => (
            <tr key={col.cid} className="border-t border-gray-100">
              <td className="px-3 py-2">{col.name}</td>
              <td className="px-3 py-2 text-gray-600">{col.type || "-"}</td>
              <td className="px-3 py-2">
                {col.pk > 0 && (
                  <span className="inline-block mr-2 text-blue-600 text-xs">
                    PK
                  </span>
                )}
                {col.notnull > 0 && (
                  <span className="inline-block mr-2 text-red-600 text-xs">
                    NOT NULL
                  </span>
                )}
                {col.dflt_value !== null && (
                  <span className="inline-block text-gray-500 text-xs">
                    DEFAULT {String(col.dflt_value)}
                  </span>
                )}
                {col.pk === 0
                  && col.notnull === 0
                  && col.dflt_value === null && (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
