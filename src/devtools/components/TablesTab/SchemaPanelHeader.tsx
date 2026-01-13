import { BsReverseLayoutSidebarInsetReverse } from "react-icons/bs";
import { ImTable2 } from "react-icons/im";

/**
 * Schema panel header component
 *
 * @remarks
 * Displays toggle button (left) and tab buttons (right) for schema panel.
 * Toggle button shows/hides the panel. Tab buttons switch between table and DDL views.
 *
 * @param props.visible - Current visibility state of the panel
 * @param props.activeTab - Currently active tab ('table' | 'ddl')
 * @param props.onToggle - Callback when toggle button is clicked
 * @param props.onTabChange - Callback when tab button is clicked
 *
 * @returns JSX.Element - Schema panel header
 */
interface SchemaPanelHeaderProps {
  visible: boolean;
  activeTab: "table" | "ddl";
  onToggle: () => void;
  onTabChange: (tab: "table" | "ddl") => void;
}

export const SchemaPanelHeader = ({
  visible,
  activeTab,
  onToggle,
  onTabChange,
}: SchemaPanelHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 border-b border-gray-200">
      {/* Left: Toggle button */}
      <button
        type="button"
        onClick={onToggle}
        className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={visible ? "Hide schema panel" : "Show schema panel"}
      >
        <BsReverseLayoutSidebarInsetReverse size={14} />
      </button>

      {/* Right: Tab buttons */}
      <div className="flex items-center gap-1">
        {/* Table icon button */}
        <button
          type="button"
          onClick={() => onTabChange("table")}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            activeTab === "table"
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
          title="Table view"
        >
          <ImTable2 size={14} />
        </button>

        {/* DDL text button */}
        <button
          type="button"
          onClick={() => onTabChange("ddl")}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            activeTab === "ddl"
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "text-gray-500 hover:text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
          title="DDL view"
        >
          DDL
        </button>
      </div>
    </div>
  );
};
