import { SiSqlite } from "react-icons/si";

/**
 * Empty state component for root route
 *
 * @remarks
 * Displays helpful instructions when no route is selected.
 * Shows large SiSqlite icon with getting started tips.
 * Implements FR-014 (empty state notice) and FR-042 (helpful instructions).
 *
 * @returns JSX.Element - EmptyState component
 */
export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {/* 1. Large SiSqlite icon as visual anchor */}
      {/* 2. Primary color for brand consistency */}
      {/* 3. Size text-6xl for prominence */}
      <SiSqlite className="text-primary text-6xl mb-6" />

      {/* 1. Main heading for empty state */}
      {/* 2. Large text for readability */}
      {/* 3. Gray-700 for subtle emphasis */}
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">
        Web Sqlite DevTools
      </h1>

      {/* 1. Descriptive subheading */}
      {/* 2. Explains purpose of the panel */}
      {/* 3. Gray-600 for secondary text */}
      <p className="text-gray-600 mb-8">
        Select a database or browse OPFS files to get started
      </p>

      {/* 1. Instructions list with helpful tips */}
      {/* 2. Left-aligned for readability */}
      {/* 3. Lighter text color for hierarchy */}
      <ul className="text-left text-sm text-gray-500 space-y-2 max-w-md">
        <li className="flex items-start gap-2">
          {/* Bullet point indicator */}
          <span className="text-primary mt-1">•</span>
          <span>Open a page that uses web-sqlite-js</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          <span>Click on a database in the sidebar to view tables</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-primary mt-1">•</span>
          <span>Browse OPFS files using the OPFS link</span>
        </li>
      </ul>
    </div>
  );
};
