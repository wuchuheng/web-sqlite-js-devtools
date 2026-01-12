import { Link, useLocation } from "react-router-dom";
import { FaFile } from "react-icons/fa";

/**
 * OPFS browser navigation link
 *
 * @remarks
 * Navigation item for accessing the OPFS (Origin Private File System) browser.
 * Uses React Router's Link component for hash-based routing.
 * Active state styling applied when on /opfs route.
 *
 * @param props.isCollapsed - Current collapse state of sidebar
 *
 * @returns JSX.Element - OPFSLink component
 */
interface OPFSLinkProps {
  isCollapsed: boolean;
}

export const OPFSLink = ({ isCollapsed }: OPFSLinkProps) => {
  const location = useLocation();

  /**
   * 1. Check if current route is /opfs
   * 2. Return active styling classes if on OPFS route
   * 3. Return default hover classes if not active
   */
  const getActiveClass = (isActive: boolean): string =>
    isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100";

  /**
   * 1. Determine if currently on OPFS route
   * 2. Used for active state styling
   * 3. pathname includes /opfs check
   */
  const isActive = location.pathname === "/opfs";

  return (
    <Link
      to="/opfs"
      className={`flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors ${getActiveClass(
        isActive,
      )}`}
    >
      {/* 1. FaFile icon always visible */}
      {/* 2. Color changes based on active state */}
      <FaFile className="text-sm flex-shrink-0" />

      {/* 1. "OPFS" text hidden when collapsed */}
      {/* 2. Full label "OPFS" shown when expanded */}
      {!isCollapsed && <span className="text-sm">OPFS</span>}
    </Link>
  );
};
