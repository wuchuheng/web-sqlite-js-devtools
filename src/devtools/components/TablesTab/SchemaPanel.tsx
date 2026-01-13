import type { TableSchema } from "@/devtools/services/databaseService";
import { SchemaPanelHeader } from "./SchemaPanelHeader";
import { SchemaTableView } from "./SchemaTableView";
import { SchemaDDLView } from "./SchemaDDLView";
import { SchemaLoadingSkeleton } from "./SchemaLoadingSkeleton";
import { SchemaErrorMessage } from "./SchemaErrorMessage";

/**
 * Schema panel component
 *
 * @remarks
 * Toggleable panel with tabbed view for table schema and DDL.
 * Panel is hidden by default, shows table view or DDL view based on active tab.
 * Toggle button is in the parent TableDetail component.
 *
 * @param props.schema - Table schema with columns and DDL
 * @param props.loading - Loading state
 * @param props.error - Error message
 * @param props.visible - Panel visibility state
 * @param props.activeTab - Currently active tab ('table' | 'ddl')
 * @param props.onTabChange - Callback when tab button is clicked
 *
 * @returns JSX.Element - Schema panel
 */
interface SchemaPanelProps {
  schema: TableSchema | null;
  loading?: boolean;
  error?: string | null;
  visible: boolean;
  activeTab: "table" | "ddl";
  onTabChange: (tab: "table" | "ddl") => void;
}

export const SchemaPanel = ({
  schema,
  loading = false,
  error = null,
  visible,
  activeTab,
  onTabChange,
}: SchemaPanelProps) => {
  const panelClasses = `
    transition-all duration-200 ease-in-out
    ${visible ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden"}
    bg-secondary-50 border-l border-secondary-200
  `;

  return (
    <div className={panelClasses}>
      {/* Header with tab buttons */}
      <SchemaPanelHeader
        visible={visible}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Content - conditional render based on loading/error/schema */}
      {loading && <SchemaLoadingSkeleton />}
      {error && <SchemaErrorMessage error={error} />}
      {!loading && !error && schema && (
        <>
          {activeTab === "table" && (
            <SchemaTableView columns={schema.columns} />
          )}
          {activeTab === "ddl" && <SchemaDDLView ddl={schema.ddl} />}
        </>
      )}
    </div>
  );
};
