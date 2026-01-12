/**
 * DevTools inspected window helpers
 *
 * @remarks
 * Executes code in the inspected page via chrome.devtools.inspectedWindow.eval.
 * Used for direct access to window.__web_sqlite without channel messaging.
 */

/**
 * Exception info from chrome.devtools.inspectedWindow.eval
 */
interface EvaluationExceptionInfo {
  isException: boolean;
  value?: unknown;
}

/**
 * Standard response envelope for inspected window calls
 */
export type InspectedWindowResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Database list entry returned from inspected window
 */
export type DatabaseSummary = {
  name: string;
};

/**
 * 1. Wrap evaluation body with try/catch
 * 2. Allow async execution when needed
 * 3. Return standardized response envelope
 *
 * @param body - Function body content
 * @param isAsync - Whether to wrap in async IIFE
 * @returns Eval-ready expression string
 */
const buildEvalExpression = (body: string, isAsync = false): string => {
  const asyncKeyword = isAsync ? "async " : "";

  return `(${asyncKeyword}() => {
    try {
      ${body}
    } catch (error) {
      return { success: false, error: String(error) };
    }
  })()`;
};

/**
 * 1. Execute expression in inspected window
 * 2. Reject on evaluation exception
 * 3. Resolve with evaluated result
 *
 * @param expression - JavaScript expression string
 * @returns Evaluated result
 */
const evalInInspectedWindow = <T>(expression: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(
      expression,
      (result: T, exceptionInfo: EvaluationExceptionInfo) => {
        if (exceptionInfo?.isException) {
          reject(
            new Error(
              exceptionInfo.value ? String(exceptionInfo.value) : "Eval failed",
            ),
          );
          return;
        }

        resolve(result);
      },
    );
  });
};

/**
 * 1. Read window.__web_sqlite.databases
 * 2. Return database names
 * 3. Return empty list when API missing
 *
 * @returns Databases response
 */
export const getDatabasesFromInspectedWindow = async (): Promise<
  InspectedWindowResponse<DatabaseSummary[]>
> => {
  const expression = buildEvalExpression(`
    const api = window.__web_sqlite;
    if (!api || !api.databases) {
      return { success: true, data: [] };
    }

    const databaseKeys =
      typeof api.databases?.keys === "function"
        ? Array.from(api.databases.keys())
        : Object.keys(api.databases || {});

    const databases = databaseKeys.map((name) => ({
      name: String(name),
    }));

    return { success: true, data: databases };
  `);

  return evalInInspectedWindow(expression);
};

/**
 * 1. Query tables for the selected database
 * 2. Normalize table names and remove sqlite_ internals
 * 3. Return alphabetically sorted table list
 *
 * @param dbname - Database name to inspect
 * @returns Table list response
 */
export const getTableListFromInspectedWindow = async (
  dbname: string,
): Promise<InspectedWindowResponse<string[]>> => {
  const serializedName = JSON.stringify(dbname);
  const expression = buildEvalExpression(
    `
    const api = window.__web_sqlite;
    if (!api || !api.databases) {
      return { success: false, error: "web-sqlite-js API not available" };
    }

    const db =
      typeof api.databases?.get === "function"
        ? api.databases.get(${serializedName})
        : api.databases?.[${serializedName}];
    if (!db) {
      return { success: false, error: "Database not found: " + ${serializedName} };
    }

    const normalizeTableNames = (rows) => {
      const names = rows
        .map((row) => {
          const nameValue = row.name ?? row.tbl_name;
          if (!nameValue) return null;

          const typeValue = row.type;
          if (typeof typeValue === "string" && typeValue.toLowerCase() !== "table") {
            return null;
          }

          if (String(nameValue).startsWith("sqlite_")) {
            return null;
          }

          return String(nameValue);
        })
        .filter(Boolean);

      return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    };

    let rows;
    try {
      rows = await db.query("PRAGMA table_list");
    } catch (error) {
      rows = await db.query(
        "SELECT name, type FROM sqlite_master WHERE type='table'",
      );
    }

    return { success: true, data: normalizeTableNames(rows || []) };
  `,
    true,
  );

  return evalInInspectedWindow(expression);
};
