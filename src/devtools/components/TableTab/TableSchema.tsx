import type { TableSchema } from "@/devtools/services/databaseService";

/**
 * Table schema display component
 *
 * @remarks
 * Shows column information table and DDL panel for a table.
 *
 * @param props.schema - Table schema with columns and DDL
 * @param props.loading - Loading state
 * @param props.error - Error message
 *
 * @returns JSX.Element - Table schema display
 */
interface TableSchemaPanelProps {
  schema: TableSchema | null;
  loading?: boolean;
  error?: string | null;
}

export const TableSchemaPanel = ({
  schema,
  loading = false,
  error = null,
}: TableSchemaPanelProps) => {
  if (loading) {
    return (
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 border-b border-red-200 bg-red-50">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!schema) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-b border-gray-200">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
        Schema
      </h3>

      {/* Column info table */}
      <table className="w-full text-sm mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-3 py-2 text-left font-medium">Column</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-left font-medium">Constraints</th>
          </tr>
        </thead>
        <tbody>
          {schema.columns.map((col) => (
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

      {/* DDL panel */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          DDL
        </h4>
        <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
          {schema.ddl || "-- No DDL available --"}
        </pre>
      </div>
    </div>
  );
};
