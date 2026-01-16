import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { DatabaseTabs } from "./components/DatabaseTabs";
import { TablesTab, TableDetail } from "./components/TablesTab";
import { QueryTab } from "./components/QueryTab";
import { MigrationTab } from "./components/MigrationTab";
import { SeedTab } from "./components/SeedTab";
import { AboutTab } from "./components/AboutTab";
import { LogView } from "./components/LogTab/LogView";
import { OPFSGallery } from "./components/OPFSBrowser";
import { KeyboardShortcutsHelp } from "./components/KeyboardShortcutsHelp";
import { OpenedDBList } from "./components/OpenedDBList";
import { useConnection } from "./hooks/useConnection";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { DatabaseRefreshProvider } from "./contexts/DatabaseRefreshContext";
import "./DevTools.css";

/**
 * DevTools content component (inside Router context)
 * This component is rendered inside HashRouter so it can use React Router hooks
 *
 * @returns JSX.Element - DevTools content with sidebar and routed content
 */
const DevToolsContent = () => {
  /**
   * 1. Use connection hook for heartbeat and auto-reconnect
   * 2. Manages connection state: connected, connecting, reconnecting, disconnected
   * 3. Provides retry function for manual reconnection
   */
  const { status, error, retry } = useConnection();

  /**
   * Sidebar collapse state (lifted for keyboard shortcuts)
   */
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  /**
   * Query tab callbacks (for keyboard shortcuts)
   */
  const queryExecuteRef = useRef<(() => void) | null>(null);
  const queryClearRef = useRef<(() => void) | null>(null);
  const queryToggleHistoryRef = useRef<(() => void) | null>(null);

  /**
   * Keyboard shortcuts hook (must be called inside Router context)
   */
  const {
    isHelpOpen,
    openHelp: _openHelp,
    closeHelp,
    shortcutCategories,
    setSidebarToggle,
    setQueryCallbacks,
  } = useKeyboardShortcuts();

  /**
   * Register sidebar toggle callback
   */
  useEffect(() => {
    setSidebarToggle(() => {
      setIsSidebarCollapsed((prev) => !prev);
    });
  }, [setSidebarToggle]);

  /**
   * Register query tab callbacks
   */
  useEffect(() => {
    setQueryCallbacks({
      onExecute: () => queryExecuteRef.current?.(),
      onClear: () => queryClearRef.current?.(),
      onToggleHistory: () => queryToggleHistoryRef.current?.(),
    });
  }, [setQueryCallbacks]);

  useEffect(() => {
    console.log("[Web Sqlite DevTools] Component mounted");
    console.log("[Web Sqlite DevTools] Current hash:", window.location.hash);

    // Log if web-sqlite-js API is available (for future debugging)
    if (typeof window !== "undefined") {
      // @ts-ignore - web-sqlite-js global
      const hasWebSqlite = typeof window.__web_sqlite !== "undefined";
      console.log(
        "[Web Sqlite DevTools] __web_sqlite API available:",
        hasWebSqlite,
      );
    }
  }, []);

  /**
   * 1. Render connection status indicator
   * 2. Shows loading spinner for connecting/reconnecting
   * 3. Shows error message with retry button for disconnected state
   */
  const renderConnectionStatus = () => {
    /**
     * 1. Connecting state: show loading indicator
     * 2. Reconnecting state: show loading with "Reconnecting..." text
     * 3. Disconnected state: show error with retry button
     */
    if (status === "connecting" || status === "reconnecting") {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span>
            {status === "connecting" ? "Connecting..." : "Reconnecting..."}
          </span>
        </div>
      );
    }

    if (status === "disconnected" && error) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm">
          <span>{error}</span>
          <button
            onClick={retry}
            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    // 1. Wrap with DatabaseRefreshProvider for shared refresh state (F-010)
    // 2. Provider enables coordinated refresh between sidebar and main page
    <DatabaseRefreshProvider>
      {/* 1. Main container with flex layout */}
      {/* 2. Sidebar takes 20% width when expanded */}
      {/* 3. Main content takes remaining width */}
      <div className="devtools-panel flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        <main className="flex-1 h-full overflow-auto flex flex-col text-left m-0 p-0">
          {/* Connection status indicator */}
          {renderConnectionStatus()}

          <Routes>
            {/* 1. Default route - redirect to opened database list (F-008) */}
            {/* 2. Shows all opened databases when DevTools opens */}
            <Route path="/" element={<Navigate to="/openedDB" replace />} />

            {/* 1. Opened database list route (F-008) */}
            {/* 2. Displays all opened databases as clickable cards */}
            {/* 3. CRITICAL: Generic route must precede parameterized route */}
            <Route path="/openedDB" element={<OpenedDBList />} />

            {/* 1. Database tabs with nested routing (F-002) */}
            {/* 2. /openedDB/:dbname redirects to /openedDB/:dbname/tables */}
            {/* 3. Each tab has its own route under the database path */}
            <Route path="/openedDB/:dbname" element={<DatabaseTabs />}>
              {/* Default redirect to tables tab */}
              <Route index element={<Navigate to="tables" replace />} />

              {/* Tables tab with nested :tableName route */}
              <Route path="tables" element={<TablesTab />}>
                <Route path=":tableName" element={<TableDetail />} />
              </Route>

              {/* Query tab */}
              <Route
                path="query"
                element={
                  <QueryTab
                    onExecuteRef={queryExecuteRef}
                    onClearRef={queryClearRef}
                    onToggleHistoryRef={queryToggleHistoryRef}
                  />
                }
              />

              {/* Log tab */}
              <Route path="logs" element={<LogView />} />

              {/* Migration tab */}
              <Route path="migration" element={<MigrationTab />} />

              {/* Seed tab */}
              <Route path="seed" element={<SeedTab />} />

              {/* About tab */}
              <Route path="about" element={<AboutTab />} />
            </Route>

            {/* 1. Log view route (separate from database tabs) */}
            {/* 2. Shows real-time log entries for a database */}
            {/* 3. Log streaming implemented in TASK-09 */}
            <Route path="/logs/:dbname" element={<LogView />} />

            {/* 1. OPFS browser route */}
            {/* 2. Shows file tree with lazy-loaded directories */}
            {/* 3. Implemented in TASK-10 */}
            <Route path="/opfs" element={<OPFSGallery />} />

            {/* Catch-all - redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Keyboard shortcuts help modal */}
        <KeyboardShortcutsHelp
          isOpen={isHelpOpen}
          onClose={closeHelp}
          categories={shortcutCategories}
        />
      </div>
    </DatabaseRefreshProvider>
  );
};

/**
 * Root DevTools component with routing
 * Uses HashRouter for Chrome extension context (per ADR-0002)
 *
 * @remarks
 * This component wraps the DevToolsContent with HashRouter.
 * All React Router hooks must be called inside DevToolsContent.
 *
 * @returns JSX.Element - DevTools component with HashRouter
 */
export const DevTools = () => {
  return (
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <DevToolsContent />
    </HashRouter>
  );
};

export default DevTools;
