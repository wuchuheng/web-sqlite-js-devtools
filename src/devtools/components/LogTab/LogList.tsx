import type { LogEntry } from "@/devtools/hooks/useLogStreaming";
import { renderLogMessage } from "@/devtools/utils/sqlHighlighter";

/**
 * Log list component (F-018: updated LogEntry type with SQL highlighting)
 *
 * @remarks
 * Displays log entries with color coding by level.
 * - Info: blue text
 * - Debug: gray text
 * - Error: red text with light red background
 * - Warn: yellow text
 * - SQL logs are syntax highlighted when message contains `sql` field
 * - All text aligned left
 *
 * @param props.entries - Log entries to display
 * @param props.levelFilter - Optional level filter
 *
 * @returns JSX.Element - Log list
 */
interface LogListProps {
  entries: LogEntry[];
  levelFilter?: "all" | "info" | "debug" | "error" | "warn";
}

export const LogList = ({ entries, levelFilter = "all" }: LogListProps) => {
  // Filter entries by level
  const filteredEntries =
    levelFilter === "all"
      ? entries
      : entries.filter((entry) => entry.level === levelFilter);
  console.log(filteredEntries);

  return (
    <>
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
              border-b border-gray-100 px-4 py-2 text-left
              ${entry.level === "error" ? "bg-red-50" : ""}
            `}
          >
            <div className="flex items-center gap-2 flex-wrap">
              {/* Level badge */}
              {dateTime(entry.timestamp)}
              <span
                className={`
                  ${entry.level === "info" ? "text-blue-600" : ""}
                  ${entry.level === "debug" ? "text-gray-500" : ""}
                  ${entry.level === "error" ? "text-red-600 font-semibold" : ""}
                  ${entry.level === "warn" ? "text-yellow-600" : ""}
                `}
              >
                [{entry.level.toUpperCase()}]
              </span>
              <span className="text-gray-700">
                {renderLogMessage(entry.message)}
              </span>
            </div>
          </div>
        ))
      )}
    </>
  );
};

const dateTime = (dateTime: number): string => {
  const date = new Date(dateTime);
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s} `;
};
