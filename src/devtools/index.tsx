import React from "react";
import ReactDOM from "react-dom/client";
import { DevTools } from "./DevTools";
import "./index.css";

// Create React root and render DevTools component
ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <DevTools />
  </React.StrictMode>,
);

// Log successful initialization
console.log("Web Sqlite DevTools panel initialized");
