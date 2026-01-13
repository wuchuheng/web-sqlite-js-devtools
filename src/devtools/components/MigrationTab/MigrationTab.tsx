import { useParams } from "react-router-dom";
import { useState } from "react";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";

/**
 * MigrationTab component
 *
 * @remarks
 * - Migration SQL editor (placeholder for CodeMirror)
 * - Version input (semantic version)
 * - Test release button
 * - Rollback to version button
 * - Shows current database version
 *
 * @returns JSX.Element - Migration tab layout
 */
export const MigrationTab = () => {
  const params = useParams<{ dbname: string }>();
  const dbname = decodeDatabaseName(params.dbname || "");

  const [version, setVersion] = useState("1.0.0");
  const [migrationSQL, setMigrationSQL] = useState(
    "-- Migration SQL here\nALTER TABLE ...",
  );
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch current database version
  const {
    data: versionInfo,
    isLoading: versionLoading,
    reload: reloadVersion,
  } = useInspectedWindowRequest(
    () => databaseService.getDbVersion(dbname),
    [dbname],
    null,
  );

  const handleTestRelease = async () => {
    if (!dbname) return;

    setIsTesting(true);
    setError(null);
    setResult(null);

    try {
      const response = await databaseService.devRelease(
        dbname,
        version,
        migrationSQL,
        undefined, // No seed SQL for migration tab
      );

      if (response.success && response.data) {
        setResult(`Dev version created: ${response.data.devVersion}`);
      } else {
        setError(response.error ?? "Failed to create dev version");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsTesting(false);
    }
  };

  const handleRollback = async () => {
    if (!dbname) return;

    setIsTesting(true);
    setError(null);
    setResult(null);

    try {
      const response = await databaseService.devRollback(dbname, version);

      if (response.success && response.data) {
        setResult(`Rolled back to version: ${response.data.currentVersion}`);
      } else {
        setError(response.error ?? "Failed to rollback");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsTesting(false);
    }
  };

  if (!dbname) {
    return (
      <div className="p-4 text-sm text-gray-500">No database selected.</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Helper Notice */}
      <div className="p-4 bg-blue-50 border-b border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-1">
          Migration Testing Playground
        </h3>
        <p className="text-xs text-blue-600">
          Test your migration SQL safely. A dev version will be created and you
          can rollback when done.
        </p>
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-auto">
        {/* Current Version Info */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Version
          </label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
              {versionLoading
                ? "Loading..."
                : (versionInfo?.version ?? "0.0.0")}
            </span>
            <button
              onClick={reloadVersion}
              className="text-blue-600 hover:text-blue-700 text-xs"
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Version Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Version
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Migration SQL Editor */}
        <div className="mb-4 flex-1 flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Migration SQL
          </label>
          <textarea
            value={migrationSQL}
            onChange={(e) => setMigrationSQL(e.target.value)}
            className="flex-1 w-full p-3 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="-- Enter migration SQL here..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestRelease}
            disabled={isTesting}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            type="button"
          >
            {isTesting ? "Testing..." : "Test Release"}
          </button>

          <button
            onClick={handleRollback}
            disabled={isTesting}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            type="button"
          >
            Rollback
          </button>
        </div>

        {/* Result/Error Messages */}
        {result && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{result}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
