/**
 * SQL Syntax Highlighter Utility
 *
 * @remarks
 * Uses react-syntax-highlighter library for proper SQL syntax highlighting.
 * Supports inline display with custom styling.
 */

/**
 * SQL log info interface
 */
interface SqlLogInfo {
  sql: string;
  duration?: number;
  bind?: unknown;
  [key: string]: unknown;
}

/**
 * Type guard to check if value is SqlLogInfo
 */
function isSqlLogInfo(arg: unknown): arg is SqlLogInfo {
  return (
    typeof arg === "object"
    && arg !== null
    && "sql" in arg
    && typeof (arg as { sql: unknown }).sql === "string"
  );
}

/**
 * Custom lightweight SQL syntax highlighter using inline spans
 * This preserves original formatting without adding extra spacing
 */
function renderInlineSql(sql: string): React.ReactNode {
  // Simple regex-based highlighting that preserves original spacing
  const keywords =
    /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|AND|OR|LIMIT|ORDER|BY|GROUP|VALUES|SET|INTO|CREATE|TABLE|DROP|ALTER|INDEX|JOIN|LEFT|RIGHT|INNER|OUTER|ON|IS|NULL|NOT|AS|DISTINCT|UNION|ALL|EXISTS|HAVING|ASC|DESC|OFFSET|PRIMARY|KEY|DEFAULT|CHECK|UNIQUE|FOREIGN|REFERENCES|BEGIN|TRANSACTION|COMMIT|ROLLBACK|PRAGMA|VIEW|TRIGGER|CASCADE|CONSTRAINT|IF|EXISTS)\b/gi;

  // Split by markers and build the final result
  const parts: Array<{ text: string; isKeyword: boolean }> = [];
  let lastIndex = 0;
  let match;

  while ((match = keywords.exec(sql)) !== null) {
    // Add text before the keyword
    if (match.index > lastIndex) {
      parts.push({ text: sql.slice(lastIndex, match.index), isKeyword: false });
    }
    // Add the keyword
    parts.push({ text: match[0], isKeyword: true });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < sql.length) {
    parts.push({ text: sql.slice(lastIndex), isKeyword: false });
  }

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, index) => (
        <span
          key={index}
          className={part.isKeyword ? "text-purple-600 font-semibold" : ""}
        >
          {part.text}
        </span>
      ))}

      {parts.length > 0 ? "; " : ""}
    </span>
  );
}

/**
 * Render log message with SQL highlighting if applicable (inline, single line)
 */
export function renderLogMessage(message: unknown): ReactNode {
  // Try to parse as JSON string first
  let parsedMessage = message;

  if (typeof message === "string") {
    try {
      parsedMessage = JSON.parse(message);
    } catch {
      // Not valid JSON, render as string
      return <span className="whitespace-pre-wrap">{message}</span>;
    }
  }

  // Check if it's a SQL log
  if (isSqlLogInfo(parsedMessage)) {
    const { sql, duration, bind, ...rest } = parsedMessage;

    return (
      <>
        {" "}
        {renderInlineSql(sql)}
        {/* Duration */}
        {duration !== undefined && (
          <span className="text-gray-500 text-xs ml-2">
            duration:{" "}
            <span className="font-mono">{duration.toFixed(2)}ms;</span>
          </span>
        )}
        {/* Bind parameters */}
        {bind !== undefined && (
          <span className="text-gray-500 text-xs ml-2">
            {" "}
            bind: <span className="font-mono">{JSON.stringify(bind)}</span>
          </span>
        )}
        {/* Other fields */}
        {Object.entries(rest).map(([key, value]) => (
          <span key={key} className="text-gray-500 text-xs ml-2">
            {key}: <span className="font-mono">{JSON.stringify(value)}</span>
          </span>
        ))}
      </>
    );
  }

  // For other objects, render as JSON
  if (typeof parsedMessage === "object" && parsedMessage !== null) {
    return (
      <pre className="whitespace-pre-wrap break-all inline">
        {JSON.stringify(parsedMessage, null, 2)}
      </pre>
    );
  }

  // Default rendering
  return <span className="whitespace-pre-wrap">{String(message)}</span>;
}

// Re-export types
import type { ReactNode } from "react";
