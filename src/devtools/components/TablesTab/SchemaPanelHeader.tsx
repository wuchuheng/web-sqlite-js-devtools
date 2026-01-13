import { ImTable2 } from "react-icons/im";

/**
 * Schema panel header component
 *
 * @remarks
 * Displays tab buttons for switching between table and DDL views.
 * Toggle button is now in the parent TableDetail component.
 *
 * @param props.visible - Current visibility state of the panel
 * @param props.activeTab - Currently active tab ('table' | 'ddl')
 * @param props.onTabChange - Callback when tab button is clicked
 *
 * @returns JSX.Element - Schema panel header
 */
interface SchemaPanelHeaderProps {
  visible: boolean;
  activeTab: "table" | "ddl";
  onTabChange: (tab: "table" | "ddl") => void;
}

export const SchemaPanelHeader = ({
  visible,
  activeTab,
  onTabChange,
}: SchemaPanelHeaderProps) => {
  return (
    <div className="flex items-center justify-end px-2 py-1.5 bg-gray-50 border-b border-gray-200">
      {/* Tab buttons */}
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
