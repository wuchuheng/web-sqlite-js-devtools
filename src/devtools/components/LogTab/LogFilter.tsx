/**
 * Log filter component (F-018: added warn level support)
 *
 * @remarks
 * Provides level filter buttons (All/Info/Debug/Error/Warn) for filtering log entries.
 *
 * @param props.levelFilter - Current filter level
 * @param props.onLevelChange - Callback when filter level changes
 * @param props.entryCount - Total entry count
 * @param props.filteredCount - Filtered entry count
 *
 * @returns JSX.Element - Filter controls
 */
interface LogFilterProps {
  levelFilter: "all" | "info" | "debug" | "error" | "warn";
  onLevelChange: (level: "all" | "info" | "debug" | "error" | "warn") => void;
  entryCount: number;
  filteredCount: number;
}

const LEVEL_OPTIONS: readonly ("all" | "info" | "debug" | "error" | "warn")[] =
  ["all", "info", "debug", "error", "warn"] as const;

export const LogFilter = ({
  levelFilter,
  onLevelChange,
  entryCount,
  filteredCount,
}: LogFilterProps) => {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50">
      <label htmlFor="log-filter" className="text-sm font-medium text-gray-700">
        Filter:
      </label>

      <div
        id="log-filter"
        className="flex gap-2"
        role="group"
        aria-label="Log level filter"
      >
        {LEVEL_OPTIONS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onLevelChange(level)}
            className={`
              px-3 py-1 text-sm rounded transition-colors
              ${
                levelFilter === level
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
              }
            `}
            aria-pressed={levelFilter === level}
          >
            {level === "all"
              ? "All"
              : level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      <div className="ml-auto text-sm text-gray-500">
        Showing {filteredCount} of {entryCount}{" "}
        {entryCount === 1 ? "entry" : "entries"}
      </div>
    </div>
  );
};
