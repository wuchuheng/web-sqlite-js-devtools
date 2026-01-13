import { Link } from "react-router-dom";
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
}

export const SidebarLink = ({
  to,
  label,
  icon,
  isActive,
  isCollapsed = false,
  className = "",
  style,
}: SidebarLinkProps) => {
  const activeClass = isActive
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
        <span
          className={`${icon ? "text-sm" : ""} whitespace-nowrap overflow-hidden text-ellipsis`}
        >
          {label}
        </span>
      )}
    </Link>
  );
};
