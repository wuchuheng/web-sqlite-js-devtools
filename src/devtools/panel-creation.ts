/**
 * DevTools Panel Creation Script
 * Creates the "Sqlite" panel in Chrome DevTools
 * This script runs in the devtools_page context (chrome.devtools.panels is available)
 */

// Create DevTools panel only in devtools_page context
if (
  typeof chrome !== "undefined"
  && chrome.devtools
  && chrome.devtools.panels
) {
  chrome.devtools.panels.create(
    "Sqlite",
    "",
    "devtools.html",
    function (panel) {
      console.log("[Web Sqlite DevTools] Panel created successfully");
      panel.onShown.addListener(function (window) {
        console.log("[Web Sqlite DevTools] Panel shown");
      });
      panel.onHidden.addListener(function () {
        console.log("[Web Sqlite DevTools] Panel hidden");
      });
    },
  );
}
