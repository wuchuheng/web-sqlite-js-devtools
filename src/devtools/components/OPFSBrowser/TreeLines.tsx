import React from "react";

/**
 * TreeLines component props
 */
interface TreeLinesProps {
  /** Depth level in the tree (0 = root level, no lines) */
  depth: number;
  /** Whether this is the last child (affects vertical line rendering) */
  isLast?: boolean;
  /** Whether sidebar is collapsed (lines hidden when true) */
  isCollapsed?: boolean;
  /** Child elements to wrap */
  children: React.ReactNode;
}

/**
 * TreeLines component for visual hierarchy in file trees (F-012)
 *
 * @remarks
 * 1. Don't render lines at root level (depth = 0)
 * 2. Don't render lines when sidebar collapsed
 * 3. Render vertical line for parent connection
 * 4. Children render their own horizontal connectors
 *
 * @param props.depth - Current nesting depth (0 = root, no lines)
 * @param props.isLast - Whether this is the last child (shortens vertical line)
 * @param props.isCollapsed - Whether to hide lines (collapsed sidebar)
 * @param props.children - Child nodes to wrap
 *
 * @returns JSX.Element - Wrapped children with tree line container
 *
 * @example
 * ```tsx
 * <TreeLines depth={2} isLast={false}>
 *   <FileTreeItem {...props} />
 * </TreeLines>
 * ```
 */
export const TreeLines = ({
  depth,
  isLast = false,
  isCollapsed = false,
  children,
}: TreeLinesProps) => {
  // Phase 1: Check if we should render lines at all
  // - Root level (depth 0) has no tree lines
  // - Collapsed sidebar hides tree lines
  if (depth === 0 || isCollapsed) {
    return <>{children}</>;
  }

  // Calculate indentation: (depth - 1) * 16px for nested levels
  const indent = (depth - 1) * 16;

  return (
    <div className="relative" style={{ paddingLeft: `${indent}px` }}>
      {/* Phase 2: Render vertical line (parent connection) - TASK-328: dotted border style */}
      {/* Vertical line extends from top to bottom of container */}
      {/* For last child, we only extend to middle (handled by CSS in children) */}
      <div
        className="tree-line-vertical absolute top-0 border-l border-dotted border-slate-300 pointer-events-none"
        style={{
          left: "12px",
          // For non-last children: line goes full height
          // For last child: height is 50% (L-shape)
          height: isLast ? "50%" : "100%",
        }}
        aria-hidden="true"
      />

      {/* Phase 3: Render children with horizontal connector spacing */}
      {/* Children will render their own horizontal lines */}
      <div className="relative">{children}</div>
    </div>
  );
};
