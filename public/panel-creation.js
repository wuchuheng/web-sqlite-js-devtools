/**
 * DevTools Panel Creation Script
 * Creates the "Sqlite" panel in Chrome DevTools
 * This script runs in the devtools_page context (chrome.devtools.panels is available)
 */

// Debug logging
console.log("[Web Sqlite DevTools] panel-creation.js loaded");
console.log("[Web Sqlite DevTools] chrome:", typeof chrome);
console.log("[Web Sqlite DevTools] chrome.devtools:", chrome?.devtools);
console.log(
  "[Web Sqlite DevTools] chrome.devtools.panels:",
  chrome?.devtools?.panels,
);

// Create DevTools panel only in devtools_page context
if (
  typeof chrome !== "undefined"
  && chrome.devtools
  && chrome.devtools.panels
) {
  console.log("[Web Sqlite DevTools] Creating DevTools panel...");
  chrome.devtools.panels.create("Sqlite", "", "panel.html", function (panel) {
    console.log("[Web Sqlite DevTools] Panel created successfully!", panel);
    panel.onShown.addListener(function (window) {
      console.log("[Web Sqlite DevTools] Panel shown - window:", window);
    });
    panel.onHidden.addListener(function () {
      console.log("[Web Sqlite DevTools] Panel hidden");
    });
  });
} else {
  console.error(
    "[Web Sqlite DevTools] Cannot create panel - chrome.devtools.panels not available",
  );
}
