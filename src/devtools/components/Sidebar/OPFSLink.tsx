import { useLocation } from "react-router-dom";
import { FaFile } from "react-icons/fa";
import { SidebarLink } from "./SidebarLink";

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
   * 1. Determine if currently on OPFS route
   * 2. Used for active state styling
   * 3. pathname includes /opfs check
   */
  const isActive = location.pathname === "/opfs";

  return (
    <SidebarLink
      to="/opfs"
      label="OPFS"
      icon={FaFile}
      isActive={isActive}
      isCollapsed={isCollapsed}
      className="px-4 py-2"
    />
  );
};
