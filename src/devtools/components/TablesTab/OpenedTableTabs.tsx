import { memo } from "react";
import { IoMdClose } from "react-icons/io";

/**
 * Table tab identifier for opened tabs tracking
 *
 * @remarks
 * - Used to track which tables are currently opened in the tab bar
 * - Unique key format: `${dbname}.${tableName}`
 */
export interface TableTab {
  /** Database name */
  dbname: string;
  /** Table name */
  tableName: string;
}

/**
 * Props for OpenedTableTabs component
 *
 * @remarks
 * - Controlled component: state managed by parent (TablesTab)
 * - Displays only opened tables (not all tables from database)
 */
interface OpenedTableTabsProps {
  /** Current database name */
  dbname: string;
  /** Array of opened tabs */
  tabs: TableTab[];
  /** Currently active tab (selected) */
  activeTab: TableTab | null;
  /** Callback when user clicks a table in sidebar to open it */
  _onOpenTable: (tableName: string) => void;
  /** Callback when user clicks a tab to select it */
  onSelectTab: (tab: TableTab) => void;
  /** Callback when user clicks close button on a tab */
  onCloseTab: (tab: TableTab) => void;
}

/**
 * Tab button component with close button
 *
 * @remarks
 * - Memoized to prevent unnecessary re-renders
 * - Close button hidden by default, visible on group-hover
 * - Click on close button stops propagation (doesn't trigger tab selection)
 *
 * @param props - Tab button props
 * @returns Tab button JSX element
 */
const TabButton = memo(
  ({
    tab,
    isActive,
    onSelect,
    onClose,
  }: {
    /** Tab data */
    tab: TableTab;
    /** Whether this tab is currently selected */
    isActive: boolean;
    /** Callback when tab is clicked */
    onSelect: () => void;
    /** Callback when close button is clicked */
    onClose: () => void;
  }) => {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`
          group flex items-center gap-2 px-4 py-2 text-sm border-r border-secondary-200
          ${
            isActive
              ? "bg-primary-600 text-white"
              : "bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
          }
        `}
      >
        {/* Table name with truncation */}
        <span className="truncate max-w-[150px]" title={tab.tableName}>
          {tab.tableName}
        </span>

        {/* Close button - hidden by default, visible on group-hover */}
        <span
          onClick={(e) => {
            // 1. Stop propagation so tab click doesn't trigger
            e.stopPropagation();
            // 2. Trigger close handler
            onClose();
          }}
          className={`
            rounded-full p-0.5 transition-opacity
            ${isActive ? "hover:bg-primary-700" : "hover:bg-secondary-300"}
            opacity-0 group-hover:opacity-100
          `}
          title="Close tab"
        >
          <IoMdClose size={14} />
        </span>
      </button>
    );
  },
);

TabButton.displayName = "TabButton";

/**
 * Opened table tabs component
 *
 * @remarks
 * - Displays only opened tables (not all tables from database)
 * - Shows empty state when no tabs are open
 * - Each tab has close button (IoMdClose) visible on hover
 * - Auto-switch to next tab after close (handled by parent)
 *
 * @param props - Component props
 * @returns Opened tabs JSX element or empty state
 */
export const OpenedTableTabs = ({
  dbname: _dbname,
  tabs,
  activeTab,
  onOpenTable: _onOpenTable,
  onSelectTab,
  onCloseTab,
}: OpenedTableTabsProps) => {
  // 1. Show empty state when no tabs are open
  if (tabs.length === 0) {
    return (
      <div className="flex items-center justify-center flex-1 px-4 py-2 text-sm text-secondary-500">
        No tables open. Select a table from the sidebar.
      </div>
    );
  }

  // 2. Render tabs
  return (
    <div className="flex items-center flex-1 overflow-x-auto">
      {tabs.map((tab) => (
        <TabButton
          key={`${tab.dbname}.${tab.tableName}`}
          tab={tab}
          isActive={
            activeTab !== null
            && tab.dbname === activeTab.dbname
            && tab.tableName === activeTab.tableName
          }
          onSelect={() => onSelectTab(tab)}
          onClose={() => onCloseTab(tab)}
        />
      ))}
    </div>
  );
};
