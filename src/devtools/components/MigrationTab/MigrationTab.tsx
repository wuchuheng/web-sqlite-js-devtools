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
    if (!dbname) {
      return;
    }

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
    if (!dbname) {
      return;
    }

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
      <div className="p-4 text-sm text-secondary-500">
        No database selected.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Helper Notice */}
      <div className="p-4 bg-primary-50 border-b border-primary-200">
        <p className="text-xs text-primary-600">
          Test your migration SQL safely. A dev version will be created and you
          can rollback when done.
        </p>
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-auto">
        {/* Current Version Info */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Current Version
          </label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-secondary-100 text-secondary-700 text-sm rounded">
              {versionLoading
                ? "Loading..."
                : (versionInfo?.version ?? "0.0.0")}
            </span>
            <button
              onClick={reloadVersion}
              className="text-primary-600 hover:text-primary-700 text-xs"
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Version Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            New Version
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>

        {/* Migration SQL Editor */}
        <div className="mb-4 flex-1 flex flex-col">
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Migration SQL
          </label>
          <textarea
            value={migrationSQL}
            onChange={(e) => setMigrationSQL(e.target.value)}
            className="flex-1 w-full p-3 font-mono text-sm border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="-- Enter migration SQL here..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestRelease}
            disabled={isTesting}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:bg-secondary-400 disabled:cursor-not-allowed"
            type="button"
          >
            {isTesting ? "Testing..." : "Test Release"}
          </button>

          <button
            onClick={handleRollback}
            disabled={isTesting}
            className="px-4 py-2 bg-error-600 text-white text-sm font-medium rounded-md hover:bg-error-700 disabled:bg-secondary-400 disabled:cursor-not-allowed"
            type="button"
          >
            Rollback
          </button>
        </div>

        {/* Result/Error Messages */}
        {result && (
          <div className="mt-4 p-3 bg-success-50 border border-success-200 rounded-md">
            <p className="text-sm text-success-600">{result}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-md">
            <p className="text-sm text-error-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
