import { memo } from "react";

/**
 * Table tab identifier
 */
export interface TableTab {
  dbname: string;
  tableName: string;
}

/**
 * Equality check for TableTab
 */
const isSameTab = (a: TableTab | null, b: TableTab | null): boolean => {
  if (!a || !b) return false;
  return a.dbname === b.dbname && a.tableName === b.tableName;
};

/**
 * Multi-table tab bar component
 *
 * @remarks
 * Displays open table tabs with close buttons and Clear All option.
 *
 * @param props.tabs - Array of open tabs
 * @param props.activeTab - Currently active tab
 * @param props.onSelectTab - Callback when a tab is selected
 * @param props.onCloseTab - Callback when a tab is closed
 * @param props.onClearAll - Callback when Clear All is clicked
 *
 * @returns JSX.Element - Tab bar
 */
interface TableTabsProps {
  tabs: TableTab[];
  activeTab: TableTab | null;
  onSelectTab: (tab: TableTab) => void;
  onCloseTab: (tab: TableTab) => void;
  onClearAll: () => void;
}

const TabButton = memo(
  ({
    tab,
    isActive,
    onSelect,
    onClose,
  }: {
    tab: TableTab;
    isActive: boolean;
    onSelect: () => void;
    onClose: () => void;
  }) => {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`
          group flex items-center gap-2 px-4 py-2 text-sm border-r border-gray-200
          ${
            isActive
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
        `}
      >
        <span className="truncate max-w-[150px]" title={tab.tableName}>
          {tab.tableName}
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={`
            rounded-full p-0.5 transition-opacity
            ${isActive ? "hover:bg-blue-700" : "hover:bg-gray-300"}
            opacity-60 group-hover:opacity-100
          `}
          title="Close tab"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
      </button>
    );
  },
);

TabButton.displayName = "TabButton";

export const TableTabs = ({
  tabs,
  activeTab,
  onSelectTab,
  onCloseTab,
  onClearAll,
}: TableTabsProps) => {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center border-b border-gray-200 bg-gray-50">
      {tabs.map((tab) => (
        <TabButton
          key={`${tab.dbname}.${tab.tableName}`}
          tab={tab}
          isActive={isSameTab(tab, activeTab)}
          onSelect={() => onSelectTab(tab)}
          onClose={() => onCloseTab(tab)}
        />
      ))}

      {tabs.length > 1 && (
        <div className="ml-auto flex items-center pr-2">
          <button
            type="button"
            onClick={onClearAll}
            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
