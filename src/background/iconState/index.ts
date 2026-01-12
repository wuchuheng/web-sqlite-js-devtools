/**
 * Background Icon State Manager
 *
 * @remarks
 * Manages extension icon state based on web-sqlite-js availability.
 * Updates icon to active (colored) or inactive (grayscale) based on database state.
 */

/**
 * 1. Check if hasDatabase is true/false
 * 2. Set icon path to active (colored) or inactive (grayscale)
 * 3. Update all icon sizes (16, 32, 48, 128)
 *
 * @remarks
 * Updates the extension action icon to reflect web-sqlite-js availability.
 * Active icons are colored, inactive icons are grayscale.
 *
 * @param hasDatabase - true for active icon, false for inactive
 */
export const setIconState = (hasDatabase: boolean): void => {
  /**
   * 1. Define icon paths for active state (colored)
   * 2. Define icon paths for inactive state (grayscale)
   * 3. Select appropriate paths based on hasDatabase parameter
   */
  const iconPaths = hasDatabase
    ? {
        "16": "img/logo-16.png",
        "32": "img/logo-32.png",
        "48": "img/logo-48.png",
        "128": "img/logo-128.png",
      }
    : {
        "16": "img/logo-16-inactive.png",
        "32": "img/logo-32-inactive.png",
        "48": "img/logo-48-inactive.png",
        "128": "img/logo-128-inactive.png",
      };

  /**
   * 1. Set extension action icon for all sizes
   * 2. chrome.action.setIcon updates the browser action icon
   * 3. Path object includes all required icon sizes
   */
  chrome.action.setIcon({ path: iconPaths });

  /**
   * 1. Log icon state change for debugging
   * 2. Include current state (active/inactive)
   */
  console.log(
    `[Background Icon State] Icon set to ${hasDatabase ? "active" : "inactive"}`,
  );
};

/**
 * 1. Initialize icon state on service worker startup
 * 2. Set to inactive by default (no database yet)
 * 3. Will update to active when content script detects web-sqlite-js
 *
 * @remarks
 * Called once on background service worker initialization.
 */
export const initializeIconState = (): void => {
  setIconState(false);
};
