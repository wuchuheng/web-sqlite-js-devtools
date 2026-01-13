import { useEffect, useState, useCallback } from "react";

/**
 * Props for ResizeHandle component
 *
 * @remarks
 * - Controls resize behavior and positioning
 * - Enforces min/max width constraints
 */
interface ResizeHandleProps {
  /** Which edge to attach to ("left" or "right") */
  position: "left" | "right";
  /** Callback when dragging occurs with delta X */
  onDrag: (deltaX: number) => void;
  /** Minimum panel width in pixels (default: 150) */
  minWidth?: number;
  /** Maximum panel width in pixels (default: 800) */
  maxWidth?: number;
  /** Current panel width in pixels */
  currentWidth: number;
}

/**
 * Resize handle component for draggable panel dividers
 *
 * @remarks
 * - Renders 4px wide drag area that expands to 6px on hover
 * - Cursor changes to col-resize when hovering
 * - Captures mouse events for drag operation
 * - Enforces min/max width constraints
 * - Cleans up event listeners on unmount
 * - Left-positioned: dragging left increases width (subtract delta)
 * - Right-positioned: dragging right increases width (add delta)
 *
 * @param props - Component props
 * @returns Resize handle JSX element
 */
export const ResizeHandle = ({
  position,
  onDrag,
  minWidth = 150,
  maxWidth = 800,
  currentWidth,
}: ResizeHandleProps) => {
  /** Whether user is currently dragging the handle */
  const [isDragging, setIsDragging] = useState(false);

  /** Initial mouse X position when drag started */
  const [dragStartX, setDragStartX] = useState(0);

  /**
   * Handle mouse down on resize handle
   *
   * @param e - Mouse event
   * @remarks
   * - Prevents default to avoid text selection
   * - Sets dragging state to true
   * - Captures initial mouse X position
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
  }, []);

  /**
   * Effect for handling mouse move and mouse up during drag
   *
   * @remarks
   * - Listens for mousemove on document (not element)
   * - Calculates delta X from dragStartX
   * - Adjusts delta based on position (left vs right)
   * - Enforces min/max constraints
   * - Calls onDrag(adjustedDelta)
   * - Updates dragStartX for next frame
   * - Listens for mouseup to end drag
   * - Cleans up event listeners on unmount
   */
  useEffect(() => {
    // Only attach listeners when dragging
    if (!isDragging) return;

    /**
     * Handle mouse move during drag
     *
     * @param e - Mouse event
     * @remarks
     * - Calculates delta from current X to dragStartX
     * - For left position: dragging left increases width (subtract delta)
     * - For right position: dragging right increases width (add delta)
     * - Enforces min/max constraints before calling onDrag
     * - Updates dragStartX for next frame (continuous drag)
     */
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;

      // 1. For left-positioned handle, dragging left increases width
      // 2. For right-positioned handle, dragging right increases width
      const adjustedDelta = position === "left" ? -deltaX : deltaX;

      // 3. Calculate new width and enforce constraints
      const newWidth = currentWidth + adjustedDelta;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        // 4. Call parent handler with adjusted delta
        onDrag(adjustedDelta);
        // 5. Update dragStartX for next frame
        setDragStartX(e.clientX);
      }
    };

    /**
     * Handle mouse up to end drag
     *
     * @remarks
     * - Sets dragging state to false
     * - Event listeners will be cleaned up by useEffect return
     */
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Attach listeners to document for reliable drag detection
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Cleanup: remove listeners when dragging ends or component unmounts
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    dragStartX,
    position,
    onDrag,
    currentWidth,
    minWidth,
    maxWidth,
  ]);

  return (
    <div
      className={`
        absolute top-0 bottom-0 z-10 transition-all duration-150
        ${position === "left" ? "-left-2" : "-right-2"}
        ${isDragging ? "w-2 bg-blue-300" : "w-1 hover:bg-blue-200 hover:w-2"}
      `}
      style={{ cursor: "col-resize" }}
      onMouseDown={handleMouseDown}
      aria-label="Resize panel"
      role="separator"
      aria-orientation="vertical"
    />
  );
};
