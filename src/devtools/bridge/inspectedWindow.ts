/**
 * Inspected Window Bridge
 *
 * @remarks
 * Low-level Chrome API wrapper for executing code in the inspected page.
 * Provides type-safe access to chrome.scripting.executeScript in MAIN world.
 * This layer handles only Chrome API concerns - no business logic.
 */

/**
 * Execute options for the bridge
 */
export type ExecuteOptions = {
  /** Target tab ID (defaults to current inspected tab) */
  tabId?: number;
};

/**
 * Execute a function in the inspected tab's MAIN world with type-safe argument passing.
 *
 * @param config - Configuration object containing function, args, and options
 * @returns Resolved result from the inspected page
 * @throws Error if executeScript unavailable or no result returned
 *
 * @example
 * ```ts
 * // No arguments
 * const result = await executeInMainWorld({
 *   func: () => 42,
 * });
 *
 * // With arguments
 * const sum = await executeInMainWorld({
 *   func: (x: number, y: number) => x + y,
 *   args: [1, 2],
 * });
 *
 * // With options
 * const data = await executeInMainWorld({
 *   func: (x: number) => x * 2,
 *   args: [5],
 *   options: { tabId: 123 },
 * });
 * ```
 */
async function executeInMainWorld<
  Args extends unknown[],
  Result = unknown,
>(config: {
  /** Function executed in the inspected page */
  func: (...args: Args) => Result | Promise<Result>;
  /** JSON-serializable args for func */
  args?: Args;
  /** Execution options */
  options?: ExecuteOptions;
}): Promise<Result> {
  if (!chrome?.scripting?.executeScript) {
    throw new Error(
      "executeScript unavailable; check the 'scripting' permission.",
    );
  }

  const resolveTabId = async (
    candidateTabId: number | null | undefined,
  ): Promise<number> => {
    if (typeof candidateTabId === "number" && candidateTabId > 0) {
      return candidateTabId;
    }

    const startTime = Date.now();
    const timeoutMs = 1000;
    const pollIntervalMs = 50;

    while (Date.now() - startTime < timeoutMs) {
      const currentTabId = chrome.devtools?.inspectedWindow?.tabId;
      if (typeof currentTabId === "number" && currentTabId > 0) {
        return currentTabId;
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    return candidateTabId as number;
  };

  const { func, args = [], options } = config;
  const tabId = await resolveTabId(
    options?.tabId ?? chrome.devtools.inspectedWindow.tabId,
  );

  // Validate tabId before proceeding - it must be a valid number for executeScript
  if (typeof tabId !== "number" || tabId <= 0) {
    throw new Error(
      `Invalid tabId: ${tabId}. Ensure chrome.devtools.inspectedWindow.tabId is available.`,
    );
  }

  const target = { tabId };

  console.log("[inspectedWindowBridge] executeInMainWorld called", {
    tabId,
    target,
    args,
  });

  try {
    // Filter out trailing undefined values to avoid serialization errors
    // When optional parameters are not provided, they become undefined
    // which chrome.scripting.executeScript cannot serialize properly
    const filteredArgs = [...args];
    while (
      filteredArgs.length > 0
      && filteredArgs[filteredArgs.length - 1] === undefined
    ) {
      filteredArgs.pop();
    }

    const results = await chrome.scripting.executeScript({
      target,
      world: "MAIN",
      func,
      args: filteredArgs as unknown as Args,
    });

    console.log("[inspectedWindowBridge] executeScript results:", results);

    const [firstResult] = results;
    if (!firstResult) {
      throw new Error("No result returned from executeScript.");
    }

    return firstResult.result as Result;
  } catch (error) {
    console.error("[inspectedWindowBridge] executeScript error:", error);
    throw error;
  }
}

/**
 * Bridge API for inspected window operations
 */
export const inspectedWindowBridge = Object.freeze({
  /**
   * Execute a function in the inspected page's MAIN world
   */
  execute: executeInMainWorld,
});
