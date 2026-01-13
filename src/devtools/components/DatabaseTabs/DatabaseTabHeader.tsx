import { NavLink, Outlet, useParams } from "react-router-dom";
import { CiViewTable } from "react-icons/ci";
import { BsFiletypeSql } from "react-icons/bs";
import { MdOutlineQueryBuilder } from "react-icons/md";
import { FaSeedling } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";

/**
 * Database tab definition
 */
interface DatabaseTab {
  path: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * Database tabs configuration
 */
const DATABASE_TABS: DatabaseTab[] = [
  { path: "tables", label: "Tables", icon: <CiViewTable size={18} /> },
  { path: "query", label: "Query", icon: <BsFiletypeSql size={16} /> },
  {
    path: "migration",
    label: "Migration",
    icon: <MdOutlineQueryBuilder size={18} />,
  },
  { path: "seed", label: "Seed", icon: <FaSeedling size={16} /> },
  { path: "about", label: "About", icon: <FaInfoCircle size={16} /> },
];

/**
 * DatabaseTabHeader Props
 */
interface DatabaseTabHeaderProps {
  dbname: string;
}

/**
 * Database tab header component
 *
 * @remarks
 * Renders 5 tabs: Tables, Query, Migration, Seed, About
 * Uses NavLink for active state styling
 */
export const DatabaseTabHeader = ({ dbname }: DatabaseTabHeaderProps) => {
  return (
    <nav className="flex border-b border-gray-200 bg-white">
      {DATABASE_TABS.map((tab) => (
        <NavLink
          key={tab.path}
          to={`/openedDB/${dbname}/${tab.path}`}
          end={tab.path === "tables" ? false : undefined}
          className={({ isActive }) =>
            `flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`
          }
        >
          {tab.icon}
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
};

/**
 * DatabaseTabs component
 *
 * @remarks
 * - Renders tab header with 5 tabs
 * - Uses Outlet for nested route rendering
 * - Redirects /openedDB/:dbname to /openedDB/:dbname/tables
 *
 * @returns JSX.Element - Database tabs layout
 */
export const DatabaseTabs = () => {
  const params = useParams<{ dbname: string }>();
  const dbname = params.dbname || "";

  if (!dbname) {
    return (
      <div className="p-4 text-sm text-gray-500">No database selected.</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DatabaseTabHeader dbname={dbname} />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
