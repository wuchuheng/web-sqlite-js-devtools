import { IconType } from "react-icons";

interface SidebarIconProps {
  icon: IconType;
  className?: string;
}

export const SidebarIcon = ({
  icon: Icon,
  className = "",
}: SidebarIconProps) => {
  return <Icon className={className} style={{ fontSize: "1.3rem" }} />;
};
