import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import "./DevTools.css";

/**
 * Root DevTools component with routing
 * Uses HashRouter for Chrome extension context (per ADR-0002)
 */
export const DevTools = () => {
  return (
    <HashRouter>
      <div className="h-screen w-screen flex">
        <Routes>
          {/* Default route - landing page */}
          <Route path="/" element={<div>Web Sqlite DevTools</div>} />

          {/* Database view routes (to be implemented in later tasks) */}
          <Route path="/openedDB/:dbname" element={<div>Database View</div>} />

          {/* OPFS browser route (to be implemented in later tasks) */}
          <Route path="/opfs" element={<div>OPFS Browser</div>} />

          {/* Catch-all - redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default DevTools;
