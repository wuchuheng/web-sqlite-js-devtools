import { Link, useLocation, useNavigation } from "react-router-dom";
import { IconType } from "react-icons";
import { SidebarIcon } from "./SidebarIcon";

interface SidebarLinkProps {
  to: string;
  label: string;
  icon?: IconType;
  isActive: boolean;
  isCollapsed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  isTopLevel?: boolean;
}

export const SidebarLink = ({
  to,
  label,
  icon,
  isActive,
  isCollapsed = false,
  className = "",
  style,
  children,
  isTopLevel = false,
}: SidebarLinkProps) => {
  // Access the current route from the hooks
  // print the current router for debugging

  const location = useLocation();
  const isMatchCurrenRoute = location.pathname === to;

  const isActiveForTopLevel =
    isMatchCurrenRoute || (isTopLevel && isActive && isCollapsed);
  const isActiveForChildLevel = !isTopLevel && isActive && !isCollapsed;

  const activeClass =
    isActiveForTopLevel || isActiveForChildLevel
      ? "bg-primary-50 text-primary-600 border-r-2 border-primary-600"
      : "text-secondary-600";

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 cursor-pointer transition-colors ${activeClass} ${className} ${
        isCollapsed ? "justify-center px-0" : ""
      }`}
      style={style}
      title={isCollapsed ? label : undefined}
    >
      {icon && <SidebarIcon icon={icon} />}

      {/* 
         1. Hide label when collapsed
         2. Use overflow-hidden to ensure it disappears smoothly if we animate opacity/width later, 
            but here we just conditionally render for simplicity and alignment.
      */}
      {(!isCollapsed || !icon) && (
        <div
          className={`${icon ? "text-sm" : ""} whitespace-nowrap overflow-hidden text-ellipsis
          justify-between align-center w-full flex
          `}
        >
          <div>{label}</div>
          <div>{children}</div>
        </div>
      )}
    </Link>
  );
};
