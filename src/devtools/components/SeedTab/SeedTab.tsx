import { useParams } from "react-router-dom";
import { useState } from "react";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";
import { databaseService } from "@/devtools/services/databaseService";
import { useInspectedWindowRequest } from "@/devtools/hooks/useInspectedWindowRequest";

/**
 * SeedTab component
 *
 * @remarks
 * - Seed SQL editor (placeholder for CodeMirror)
 * - Version input (for dev releases)
 * - Test seed button
 * - Auto-rollback after test
 * - Shows seed results
 *
 * @returns JSX.Element - Seed tab layout
 */
export const SeedTab = () => {
  const params = useParams<{ dbname: string }>();
  const dbname = decodeDatabaseName(params.dbname || "");

  const [version, setVersion] = useState("1.0.0-dev");
  const [seedSQL, setSeedSQL] = useState("-- Seed SQL here\nINSERT INTO ...");
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

  const handleTestSeed = async () => {
    if (!dbname) return;

    setIsTesting(true);
    setError(null);
    setResult(null);

    try {
      const response = await databaseService.devRelease(
        dbname,
        version,
        undefined, // No migration SQL for seed tab
        seedSQL,
      );

      if (response.success && response.data) {
        setResult(`Seed tested in dev version: ${response.data.devVersion}`);

        // Auto-rollback after test (as per requirement)
        setTimeout(async () => {
          const rollbackResponse = await databaseService.devRollback(
            dbname,
            version,
          );
          if (rollbackResponse.success) {
            setResult((prev) => `${prev}\nAuto-rollback completed.`);
          }
        }, 2000);
      } else {
        setError(response.error ?? "Failed to create dev version for testing");
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
      <div className="p-4 bg-green-50 border-b border-green-200">
        <h3 className="text-sm font-medium text-green-800 mb-1">
          Seed Testing Playground
        </h3>
        <p className="text-xs text-green-600">
          Test your seed SQL safely. A dev version will be created with your
          data and automatically rolled back after testing.
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
            Dev Version
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0-dev"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use a dev version suffix (e.g., 1.0.0-dev) for testing
          </p>
        </div>

        {/* Seed SQL Editor */}
        <div className="mb-4 flex-1 flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seed SQL
          </label>
          <textarea
            value={seedSQL}
            onChange={(e) => setSeedSQL(e.target.value)}
            className="flex-1 w-full p-3 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="-- Enter seed SQL here (INSERT statements)..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestSeed}
            disabled={isTesting}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            type="button"
          >
            {isTesting ? "Testing..." : "Test Seed"}
          </button>
        </div>

        {/* Result/Error Messages */}
        {result && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600 whitespace-pre-line">
              {result}
            </p>
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
