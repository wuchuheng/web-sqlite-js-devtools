import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { MdOutlineContentCopy } from "react-icons/md";
import { FaCheck } from "react-icons/fa";

/**
 * Schema DDL view component
 *
 * @remarks
 * Displays SQL CREATE TABLE statement with syntax highlighting and copy button.
 * Uses prism-react-renderer for lightweight syntax highlighting.
 *
 * @param props.ddl - SQL CREATE TABLE statement
 *
 * @returns JSX.Element - Schema DDL view
 */
interface SchemaDDLViewProps {
  ddl: string;
}

export const SchemaDDLView = ({ ddl }: SchemaDDLViewProps) => {
  // Phase 1: State initialization
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 2: Copy handler with clipboard API and fallback
  const handleCopy = async () => {
    // Phase 2a: Try modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        const result = navigator.clipboard.writeText(ddl);
        if (result && typeof result.then === "function") {
          await result;
          setCopied(true);
          setError(null);
          return;
        }
      } catch {
        // Fall through to fallback
      }
    }

    // Phase 2b: Fallback to textarea-based copy
    try {
      const textarea = document.createElement("textarea");
      textarea.value = ddl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (successful) {
        setCopied(true);
        setError(null);
      } else {
        setError("Failed to copy");
        setCopied(false);
      }
    } catch {
      setError("Failed to copy");
      setCopied(false);
    }
  };

  // Phase 3: Click handler for state reset
  const handleClick = () => {
    if (copied) {
      setCopied(false);
      setError(null); // Clear error when resetting
    } else {
      handleCopy();
    }
  };

  return (
    <div className="px-4 py-3">
      {/* Header row with copy button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleClick}
          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
          title={copied ? "Copied!" : "Copy DDL"}
        >
          {copied ? (
            <FaCheck className="text-green-600" size={14} />
          ) : (
            <MdOutlineContentCopy size={14} />
          )}
        </button>
      </div>

      {/* Inline error message (conditional) */}
      {error && (
        <div className="text-red-600 text-xs mb-2 text-right">{error}</div>
      )}

      {/* Syntax highlighted DDL using prism-react-renderer */}
      <Highlight
        theme={themes.github}
        code={ddl || "-- No DDL available --"}
        language="sql"
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={className}
            style={{
              ...style,
              background: "#f9fafb",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "12px",
              overflow: "auto",
            }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
};
