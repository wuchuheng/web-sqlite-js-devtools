import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;
  /** Display label (e.g., "Ctrl+Enter") */
  label: string;
  /** Key combination (e.g., "ctrl+enter") */
  combo: string;
  /** Description of what the shortcut does */
  description: string;
  /** Handler function to execute */
  handler: () => void;
  /** Route regex where shortcut is active (null = global) */
  activeRoute?: RegExp | null;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
}

/**
 * Shortcut category for help modal
 */
export interface ShortcutCategory {
  /** Category name */
  name: string;
  /** Shortcuts in this category */
  shortcuts: KeyboardShortcut[];
}

/**
 * Result type for useKeyboardShortcuts hook
 */
interface UseKeyboardShortcutsResult {
  /** Whether help modal is open */
  isHelpOpen: boolean;
  /** Open help modal */
  openHelp: () => void;
  /** Close help modal */
  closeHelp: () => void;
  /** All registered shortcuts grouped by category */
  shortcutCategories: ShortcutCategory[];
  /** Register additional shortcut */
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  /** Unregister shortcut by ID */
  unregisterShortcut: (id: string) => void;
  /** Set sidebar toggle callback */
  setSidebarToggle: (callback: () => void) => void;
  /** Set query tab callbacks */
  setQueryCallbacks: (callbacks: {
    onExecute: () => void;
    onClear: () => void;
    onToggleHistory: () => void;
  }) => void;
}

/**
 * Parse key combo string into key info
 *
 * 1. Split combo by '+' and normalize to lowercase
 * 2. Extract modifier keys and main key
 * 3. Return parsed key info object
 *
 * @param combo - Key combo string (e.g., "ctrl+enter", "shift+ctrl+1")
 * @returns Parsed key info
 */
function parseKeyCombo(combo: string): {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  key: string;
} {
  const parts = combo.toLowerCase().split("+");
  const keyInfo = {
    ctrl: false,
    shift: false,
    alt: false,
    key: "",
  };

  for (const part of parts) {
    if (part === "ctrl" || part === "control") {
      keyInfo.ctrl = true;
    } else if (part === "shift") {
      keyInfo.shift = true;
    } else if (part === "alt") {
      keyInfo.alt = true;
    } else {
      keyInfo.key = part;
    }
  }

  return keyInfo;
}

/**
 * Check if KeyboardEvent matches key combo
 *
 * 1. Parse the combo string
 * 2. Compare event modifiers and key
 * 3. Return true if all match
 *
 * @param event - Keyboard event
 * @param combo - Key combo string
 * @returns True if event matches combo
 */
function eventMatchesCombo(event: KeyboardEvent, combo: string): boolean {
  const keyInfo = parseKeyCombo(combo);

  // Handle special case for Escape key (no modifiers)
  if (combo.toLowerCase() === "escape") {
    return event.key === "Escape";
  }

  return (
    event.ctrlKey === keyInfo.ctrl
    && event.shiftKey === keyInfo.shift
    && event.altKey === keyInfo.alt
    && event.key.toLowerCase() === keyInfo.key
  );
}

/**
 * Check if element is editable (input, textarea, contenteditable)
 *
 * 1. Check if element is null
 * 2. Check tagName and attributes
 * 3. Return true for editable elements
 *
 * @param element - DOM element
 * @returns True if element is editable
 */
function isEditableElement(element: HTMLElement | null): boolean {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();
  const isContentEditable = element.isContentEditable;

  return (
    tagName === "input"
    || tagName === "textarea"
    || isContentEditable
    || element.getAttribute("contenteditable") === "true"
  );
}

/**
 * Check if shortcut is active for current route
 *
 * 1. If activeRoute is null, always active
 * 2. Otherwise, test path against regex
 *
 * @param shortcut - Keyboard shortcut
 * @param currentPath - Current router path
 * @returns True if shortcut is active
 */
function isShortcutActive(
  shortcut: KeyboardShortcut,
  currentPath: string,
): boolean {
  if (shortcut.activeRoute === null || shortcut.activeRoute === undefined) {
    return true;
  }

  return shortcut.activeRoute.test(currentPath);
}

/**
 * Hook for managing global keyboard shortcuts
 *
 * @remarks
 * - Registers document-level keydown listener
 * - Checks editable elements before triggering
 * - Respects route context for shortcuts
 * - Supports dynamic shortcut registration
 * - Provides help modal state
 *
 * @returns Shortcut state and control functions
 */
export const useKeyboardShortcuts = (): UseKeyboardShortcutsResult => {
  const location = useLocation();
  const navigate = useNavigate();

  const [shortcuts, setShortcuts] = useState<Map<string, KeyboardShortcut>>(
    new Map(),
  );
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Callbacks for various actions
  const [sidebarToggle, setSidebarToggle] = useState<(() => void) | null>(null);
  const [queryCallbacks, setQueryCallbacks] = useState<{
    onExecute: () => void;
    onClear: () => void;
    onToggleHistory: () => void;
  } | null>(null);

  /**
   * Register a new shortcut
   */
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts((prev) => new Map(prev).set(shortcut.id, shortcut));
  }, []);

  /**
   * Unregister a shortcut by ID
   */
  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /**
   * Open help modal
   */
  const openHelp = useCallback(() => setIsHelpOpen(true), []);

  /**
   * Close help modal
   */
  const closeHelp = useCallback(() => setIsHelpOpen(false), []);

  /**
   * Define all default shortcuts
   */
  useEffect(() => {
    const defaultShortcuts: KeyboardShortcut[] = [
      // Global shortcuts
      {
        id: "show-help",
        label: "Ctrl+/",
        combo: "ctrl+/",
        description: "Show keyboard shortcuts",
        handler: openHelp,
        preventDefault: true,
      },
      {
        id: "escape",
        label: "Escape",
        combo: "escape",
        description: "Close modals / clear focus",
        handler: () => {
          if (isHelpOpen) {
            closeHelp();
          }
          // Blur active element
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        },
        preventDefault: false,
      },
    ];

    // Register default shortcuts
    setShortcuts((prev) => {
      const next = new Map(prev);
      for (const shortcut of defaultShortcuts) {
        next.set(shortcut.id, shortcut);
      }
      return next;
    });
  }, [isHelpOpen, openHelp, closeHelp]);

  /**
   * Register context-aware shortcuts when callbacks are set
   */
  useEffect(() => {
    if (sidebarToggle) {
      registerShortcut({
        id: "toggle-sidebar",
        label: "Ctrl+B",
        combo: "ctrl+b",
        description: "Toggle sidebar collapse",
        handler: sidebarToggle,
        preventDefault: true,
      });
    }
  }, [sidebarToggle, registerShortcut]);

  /**
   * Register navigation shortcuts for database routes
   */
  useEffect(() => {
    const dbnameMatch = location.pathname.match(/^\/openedDB\/([^\/]+)/);
    if (!dbnameMatch) return;

    const dbname = dbnameMatch[1];

    const navShortcuts: KeyboardShortcut[] = [
      {
        id: "nav-tables",
        label: "Ctrl+1",
        combo: "ctrl+1",
        description: "Go to Tables tab",
        handler: () => navigate(`/openedDB/${dbname}/tables`),
        activeRoute: /^\/openedDB\/.+/,
        preventDefault: true,
      },
      {
        id: "nav-query",
        label: "Ctrl+2",
        combo: "ctrl+2",
        description: "Go to Query tab",
        handler: () => navigate(`/openedDB/${dbname}/query`),
        activeRoute: /^\/openedDB\/.+/,
        preventDefault: true,
      },
      {
        id: "nav-migration",
        label: "Ctrl+3",
        combo: "ctrl+3",
        description: "Go to Migration tab",
        handler: () => navigate(`/openedDB/${dbname}/migration`),
        activeRoute: /^\/openedDB\/.+/,
        preventDefault: true,
      },
      {
        id: "nav-seed",
        label: "Ctrl+4",
        combo: "ctrl+4",
        description: "Go to Seed tab",
        handler: () => navigate(`/openedDB/${dbname}/seed`),
        activeRoute: /^\/openedDB\/.+/,
        preventDefault: true,
      },
      {
        id: "nav-about",
        label: "Ctrl+5",
        combo: "ctrl+5",
        description: "Go to About tab",
        handler: () => navigate(`/openedDB/${dbname}/about`),
        activeRoute: /^\/openedDB\/.+/,
        preventDefault: true,
      },
    ];

    for (const shortcut of navShortcuts) {
      registerShortcut(shortcut);
    }

    // Cleanup on unmount
    return () => {
      for (const shortcut of navShortcuts) {
        unregisterShortcut(shortcut.id);
      }
    };
  }, [location.pathname, navigate, registerShortcut, unregisterShortcut]);

  /**
   * Register query tab shortcuts when callbacks are set
   */
  useEffect(() => {
    if (!queryCallbacks) return;

    const queryShortcuts: KeyboardShortcut[] = [
      {
        id: "execute-query",
        label: "Ctrl+Enter",
        combo: "ctrl+enter",
        description: "Execute SQL query",
        handler: queryCallbacks.onExecute,
        activeRoute: /^\/openedDB\/.+\/query/,
        preventDefault: true,
      },
      {
        id: "clear-editor",
        label: "Ctrl+L",
        combo: "ctrl+l",
        description: "Clear SQL editor",
        handler: queryCallbacks.onClear,
        activeRoute: /^\/openedDB\/.+\/query/,
        preventDefault: true,
      },
      {
        id: "toggle-history",
        label: "Ctrl+H",
        combo: "ctrl+h",
        description: "Toggle query history",
        handler: queryCallbacks.onToggleHistory,
        activeRoute: /^\/openedDB\/.+\/query/,
        preventDefault: true,
      },
    ];

    for (const shortcut of queryShortcuts) {
      registerShortcut(shortcut);
    }

    // Cleanup on unmount
    return () => {
      for (const shortcut of queryShortcuts) {
        unregisterShortcut(shortcut.id);
      }
    };
  }, [queryCallbacks, registerShortcut, unregisterShortcut]);

  /**
   * Handle keyboard event at document level
   *
   * 1. Check if event target is editable input/textarea
   * 2. Find matching registered shortcut
   * 3. Check if shortcut is active for current route
   * 4. Execute handler if match found
   * 5. Prevent default if specified
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger if user is typing in editable element
      if (isEditableElement(event.target as HTMLElement)) {
        return;
      }

      // Find matching shortcut
      for (const shortcut of shortcuts.values()) {
        if (eventMatchesCombo(event, shortcut.combo)) {
          // Check if shortcut is active for current route
          if (isShortcutActive(shortcut, location.pathname)) {
            if (shortcut.preventDefault) {
              event.preventDefault();
            }

            try {
              shortcut.handler();
            } catch (err) {
              console.error(`Keyboard shortcut error (${shortcut.id}):`, err);
            }

            return;
          }
        }
      }
    },
    [shortcuts, location.pathname],
  );

  /**
   * Register document-level keyboard listener
   */
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  /**
   * Group shortcuts by category for help modal
   */
  const shortcutCategories: ShortcutCategory[] = [
    {
      name: "Global Shortcuts",
      shortcuts: Array.from(shortcuts.values()).filter(
        (s) => !s.activeRoute || s.activeRoute.test(location.pathname),
      ),
    },
    {
      name: "Navigation",
      shortcuts: Array.from(shortcuts.values()).filter((s) =>
        s.id.startsWith("nav-"),
      ),
    },
    {
      name: "Query Tab",
      shortcuts: Array.from(shortcuts.values()).filter((s) =>
        s.activeRoute?.source.includes("query"),
      ),
    },
  ];

  return {
    isHelpOpen,
    openHelp,
    closeHelp,
    shortcutCategories,
    registerShortcut,
    unregisterShortcut,
    setSidebarToggle,
    setQueryCallbacks,
  };
};
