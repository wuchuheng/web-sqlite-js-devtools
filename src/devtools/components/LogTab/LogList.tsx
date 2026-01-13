import type { BufferedLogEntry } from "@/contentScript/subscriptions/LogRingBuffer";

/**
 * Log list component
 *
 * @remarks
 * Displays log entries with color coding by level.
 * - Info: blue text
 * - Debug: gray text
 * - Error: red text with light red background
 *
 * @param props.entries - Log entries to display
 * @param props.levelFilter - Optional level filter
 *
 * @returns JSX.Element - Log list
 */
interface LogListProps {
  entries: BufferedLogEntry[];
  levelFilter?: "all" | "info" | "debug" | "error";
}

export const LogList = ({ entries, levelFilter = "all" }: LogListProps) => {
  // Filter entries by level
  const filteredEntries =
    levelFilter === "all"
      ? entries
      : entries.filter((entry) => entry.level === levelFilter);

  return (
    <div className="font-mono text-xs overflow-auto flex-1">
      {filteredEntries.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>
              {entries.length === 0
                ? "No logs yet. Logs will appear here when database activity occurs."
                : "No logs match the current filter."}
            </p>
          </div>
        </div>
      ) : (
        filteredEntries.map((entry, index) => (
          <div
            key={`${entry.timestamp}-${index}`}
            className={`
              border-b border-gray-100 px-4 py-2
              ${entry.level === "error" ? "bg-red-50" : ""}
            `}
          >
            <div className="flex items-center gap-2">
              <span
                className={`
                  ${entry.level === "info" ? "text-blue-600" : ""}
                  ${entry.level === "debug" ? "text-gray-500" : ""}
                  ${entry.level === "error" ? "text-red-600 font-semibold" : ""}
                `}
              >
                [{entry.level.toUpperCase()}]
              </span>
              <span className="text-gray-400">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <pre className="mt-1 whitespace-pre-wrap break-all text-gray-700">
              {JSON.stringify(entry.data, null, 2)}
            </pre>
          </div>
        ))
      )}
    </div>
  );
};
