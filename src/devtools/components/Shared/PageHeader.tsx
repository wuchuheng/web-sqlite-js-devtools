import { ReactNode } from "react";

/**
 * Props for the PageHeader component.
 */
interface PageHeaderProps {
  /** Child elements to render inside the header */
  children: ReactNode;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * A reusable page header container component with consistent styling.
 *
 * Provides consistent border, background, and padding across route pages.
 * Use this component to wrap any header content layout.
 *
 * @example
 * ```tsx
 * // Simple icon + title
 * <PageHeader>
 *   <div className="flex items-center gap-3">
 *     <FaFile className="text-emerald-600" size={18} />
 *     <h2 className="text-base font-semibold text-slate-800">
 *       OPFS File Browser
 *     </h2>
 *   </div>
 * </PageHeader>
 * ```
 *
 * @example
 * ```tsx
 * // Title with right action button
 * <PageHeader>
 *   <div className="flex items-center justify-between">
 *     <div className="flex items-center gap-3">
 *       <FaDatabase className="text-blue-600" size={18} />
 *       <h2 className="text-base font-semibold text-slate-800">
 *         Database Information
 *       </h2>
 *     </div>
 *     <button>Action</button>
 *   </div>
 * </PageHeader>
 * ```
 */
export const PageHeader = ({ children, className = "" }: PageHeaderProps) => {
  return (
    <div
      className={`h-14 border-b border-slate-200 ${className}`}
      // className={`border-b border-slate-200 bg-white px-4.5 py-4 ${className}`}
    >
      {children}
    </div>
  );
};
