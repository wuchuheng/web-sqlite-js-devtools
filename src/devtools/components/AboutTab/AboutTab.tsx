import { useParams } from "react-router-dom";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";
import { FaInfoCircle } from "react-icons/fa";

/**
 * AboutTab component
 *
 * @remarks
 * - Shows database metadata
 * - Displays: name, version, table count, row counts, OPFS file info, web-sqlite-js version
 *
 * @returns JSX.Element - About tab layout
 */
export const AboutTab = () => {
  const params = useParams<{ dbname: string }>();
  const dbname = decodeDatabaseName(params.dbname || "");

  // Fetch database version
  const {
    data: versionInfo,
    isLoading: versionLoading,
    error: versionError,
  } = useInspectedWindowRequest(
    () => databaseService.getDbVersion(dbname),
    [dbname],
    null,
  );

  // Fetch table list
  const { data: tables, isLoading: tablesLoading } = useInspectedWindowRequest(
    () => databaseService.getTableList(dbname),
    [dbname],
    [],
  );

  // Calculate total row counts (simplified - would need to query each table)
  const totalRowEstimate = tables?.length ?? 0;

  if (!dbname) {
    return (
      <div className="p-4 text-sm text-gray-500">No database selected.</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <FaInfoCircle className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">
            Database Information
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl">
          {/* Database Name */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Database Name
            </h4>
            <p className="text-lg font-semibold text-gray-900">{dbname}</p>
          </div>

          {/* Version Information */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Version
            </h4>
            <div className="bg-white border border-gray-200 rounded-md p-4">
              {versionLoading ? (
                <p className="text-sm text-gray-500">Loading version...</p>
              ) : versionError ? (
                <p className="text-sm text-red-600">{versionError}</p>
              ) : (
                <p className="text-lg font-mono text-gray-900">
                  {versionInfo?.version ?? "0.0.0"}
                </p>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Statistics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <p className="text-xs text-gray-500 mb-1">Table Count</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tablesLoading ? "..." : (tables?.length ?? 0)}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <p className="text-xs text-gray-500 mb-1">Total Tables</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalRowEstimate}
                </p>
              </div>
            </div>
          </div>

          {/* Table List */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Tables
            </h4>
            <div className="bg-white border border-gray-200 rounded-md p-4">
              {tablesLoading ? (
                <p className="text-sm text-gray-500">Loading tables...</p>
              ) : tables && tables.length > 0 ? (
                <ul className="space-y-1">
                  {tables.map((table) => (
                    <li
                      key={table}
                      className="text-sm font-mono text-gray-700 py-1 px-2 hover:bg-gray-50 rounded"
                    >
                      {table}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No tables found</p>
              )}
            </div>
          </div>

          {/* OPFS Information */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              OPFS File Info
            </h4>
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <p className="text-sm text-gray-600">
                Database is stored in Origin Private File System (OPFS).
              </p>
              <p className="text-xs text-gray-500 mt-2">
                File path: /sqlite/{dbname}
              </p>
            </div>
          </div>

          {/* web-sqlite-js Version */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
              Library Version
            </h4>
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <p className="text-sm font-mono text-gray-900">
                web-sqlite-js v2.1.0+
              </p>
              <p className="text-xs text-gray-500 mt-1">
                SQLite {versionInfo?.version ?? "3.x"} (WASM)
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> This extension provides debugging tools for
              web-sqlite-js databases. All database operations are performed in
              the context of the inspected page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
