import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { TableList } from "./TableList";
import { TableTabs, type TableTab } from "./TableTabs";
import { TableContent } from "./TableContent";
import { decodeDatabaseName } from "@/devtools/utils/databaseNames";

/**
 * Database view for /openedDB/:dbname route
 *
 * @remarks
 * Renders the table list and table content viewer with multi-tab support.
 *
 * 1. Decode dbname from route params
 * 2. Clear all tabs when database changes
 * 3. Render table list + tab bar + table content
 *
 * @returns JSX.Element - Database view layout
 */
export const DatabaseView = () => {
  const params = useParams<{ dbname: string }>();
  const [openTabs, setOpenTabs] = useState<TableTab[]>([]);
  const [activeTab, setActiveTab] = useState<TableTab | null>(null);

  /**
   * 1. Decode dbname from the route param
   * 2. Fallback to raw value on decode errors
   * 3. Return empty string when missing
   */
  const dbname = useMemo(() => {
    const rawName = params.dbname || "";
    return decodeDatabaseName(rawName);
  }, [params.dbname]);

  /**
   * Clear all tabs when database changes
   */
  useEffect(() => {
    setOpenTabs([]);
    setActiveTab(null);
  }, [dbname]);

  /**
   * Handle table selection from TableList
   * Opens new tab or activates existing tab
   */
  const handleTableSelect = useMemo(
    () => (tableName: string) => {
      if (!dbname) {
        return;
      }

      const newTab: TableTab = { dbname, tableName };

      // Check if tab already exists
      const existingTab = openTabs.find(
        (t) => t.dbname === dbname && t.tableName === tableName,
      );

      if (existingTab) {
        setActiveTab(existingTab);
      } else {
        setOpenTabs((prev) => [...prev, newTab]);
        setActiveTab(newTab);
      }
    },
    [dbname, openTabs],
  );

  /**
   * Handle tab close
   */
  const handleCloseTab = useMemo(
    () => (tab: TableTab) => {
      setOpenTabs((prev) => {
        const filtered = prev.filter((t) => t !== tab);
        // If we closed the active tab, switch to the last remaining tab
        if (isSameTab(activeTab, tab) && filtered.length > 0) {
          setActiveTab(filtered[filtered.length - 1]);
        } else if (filtered.length === 0) {
          setActiveTab(null);
        }
        return filtered;
      });
    },
    [activeTab],
  );

  /**
   * Handle clear all tabs
   */
  const handleClearAll = () => {
    setOpenTabs([]);
    setActiveTab(null);
  };

  if (!dbname) {
    return (
      <div className="p-4 text-sm text-gray-500">No database selected.</div>
    );
  }

  return (
    <div className="flex h-full">
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-xs font-semibold uppercase text-gray-500">
            Tables
          </h2>
        </div>
        <TableList
          dbname={dbname}
          selectedTable={activeTab?.tableName ?? null}
          onSelect={handleTableSelect}
        />
      </aside>

      <section className="flex-1 flex flex-col overflow-hidden">
        {openTabs.length > 0 && activeTab ? (
          <>
            <TableTabs
              tabs={openTabs}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              onCloseTab={handleCloseTab}
              onClearAll={handleClearAll}
            />
            <TableContent
              dbname={activeTab.dbname}
              tableName={activeTab.tableName}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
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
                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">Select a table to view data and schema</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

/**
 * Equality check for TableTab
 */
const isSameTab = (a: TableTab | null, b: TableTab | null): boolean => {
  if (!a || !b) {
    return false;
  }
  return a.dbname === b.dbname && a.tableName === b.tableName;
};
