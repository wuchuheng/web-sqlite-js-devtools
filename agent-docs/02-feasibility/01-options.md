<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/02-feasibility/01-options.md

OUTPUT MAP (write to)
agent-docs/02-feasibility/01-options.md

NOTES
- Keep headings unchanged.
- Must include Option A/B/C and a clear recommendation tied to Stage-1 success criteria.
-->

# 01 Options — Feasibility & Tech Choices

## 1) Decision drivers (what matters most)

- **D1 (Implementation Speed)**: F-015 is a focused visual enhancement, should be completed quickly
- **D2 (Code Quality)**: Must follow existing S8 functional component patterns
- **D3 (Bundle Size)**: Adding new react-icons imports increases bundle size
- **D4 (User Experience)**: Default expansion improves discoverability but must not impact performance

## 2) Constraints recap (from Stage 1)

- **Key constraints**:
  - Must modify existing `FileTree.tsx` component
  - Must preserve lazy-loading for child directories
  - Tree lines use `TreeLines` component for responsive hiding
  - Icons come from react-icons library (multiple sub-packages)
  - TypeScript strict mode enabled
- **Key success criteria**:
  - Root directories expand by default on load
  - Tree lines use dotted/dashed styling
  - 6 file types get specific icons (sqlite3, images, txt, json, folders, unknown)
  - No performance regression on initial load
  - ESLint passes with no new warnings

## 3) Options (A/B/C)

### Option A — Component-Based Enhancement

- **Summary**: Modify existing `FileTree.tsx` and `TreeLines.tsx` directly with new icon imports, expansion logic, and styling
- **Approach**:
  - Add 6 icon imports to FileTree.tsx (FaDatabase, FaRegFileImage, TiDocumentText, LuFileJson, FaFolder, FaFolderOpen)
  - Create `getFileIcon(entry, isExpanded)` helper function that returns icon based on extension
  - Update `isExpanded` initial state: `useState(level === 0)` for root-level auto-expansion
  - Add `useEffect` hook to auto-load root directory children on mount
  - Update `TreeLines.tsx` className: change `bg-gray-200` to `border-dotted border-gray-300`
- **Pros**:
  - Leverages existing FileTree structure and patterns
  - Minimal code changes (2 files, ~50 lines added)
  - No additional abstraction layers or wrapper components
  - Direct performance benefits (no lazy-loading or wrapper overhead)
  - Follows existing S8 functional component patterns with hooks
- **Cons**:
  - Tightly couples icon logic to FileTree component (harder to test in isolation)
  - Icon imports increase bundle size for all react-icons variants (~15-20KB total)
  - Less reusable if other components need same icon mapping
- **Risks**:
  - R1: Auto-expanding all root directories may slow initial load if many files exist
  - R2: Missing icon libraries may cause build errors
- **Estimated effort**: 2-3 hours for implementation
- **Fits success criteria?**: **Yes** - Direct approach with minimal overhead, meets all functional requirements

### Option B — Icon Component Abstraction

- **Summary**: Create new `FileTypeIcon.tsx` component that encapsulates icon selection logic, then consume in FileTree
- **Approach**:
  - Create `src/devtools/components/OPFSBrowser/FileTypeIcon.tsx` (new file)
  - Implement discriminated union type for file extensions
  - Export component with `fileName: string` and `isExpanded?: boolean` props
  - Use in FileTree: `<FileTypeIcon fileName={entry.name} isExpanded={isExpanded} />`
  - Same expansion and tree line changes as Option A
- **Pros**:
  - Separates concerns (icon logic isolated in dedicated component)
  - Reusable across other components (FilePreview, MetadataPanel, etc.)
  - Easier to unit test icon mapping in isolation
  - Clean component interface with TypeScript types
  - Better maintainability if new file types are added
- **Cons**:
  - Additional file and component to maintain
  - Slightly more complex component hierarchy (extra prop layer)
  - Over-engineering for current use case (only used in FileTree today)
  - Same bundle size impact as Option A
- **Risks**:
  - R1: May be seen as "gold-plating" for a simple visual enhancement
  - R2: Extra component may add minor render overhead
- **Estimated effort**: 3-4 hours for implementation
- **Fits success criteria?**: **Yes** - Meets all requirements with better code organization

### Option C (fallback) — CSS-Only with Icon Map

- **Summary**: Use plain JavaScript object for icon mapping and CSS-only tree line styling, avoiding React component overhead
- **Approach**:
  - Create `iconMap.ts` utility with object mapping extensions to component names
  - Use dynamic imports: `const Icon = lazy(() => import(\`react-icons/${icon.library}\`).then(m => m[icon.name]))`
  - Update FileTree to use dynamic icon rendering based on map lookup
  - Same expansion changes as Option A
  - Use Tailwind `@apply` or CSS modules for tree line dot styling
- **Pros**:
  - Centralized icon configuration (easy to add new types without modifying component)
  - Potential for code-splitting icon bundles (lazy loading)
  - CSS-only tree line changes are simple
- **Cons**:
  - Dynamic imports add complexity and may cause icon flicker on render
  - Type safety issues with object key lookups (need runtime validation)
  - More difficult to maintain and debug than direct imports
  - Lazy loading overhead defeats purpose for commonly-used icons
- **Risks**:
  - R1: Dynamic icon rendering may cause visual inconsistency during load
  - R2: Type errors may not be caught at compile time
- **Estimated effort**: 4-5 hours for implementation
- **Fits success criteria?**: **Partial** - Meets functional requirements but may introduce UX issues

## 4) Tradeoff table

| Dimension           | Option A (Component-Based) | Option B (Abstraction) | Option C (CSS-Only)  |
| ------------------- | -------------------------- | ---------------------- | -------------------- |
| **Speed**           | Fast (2-3h)                | Medium (3-4h)          | Slower (4-5h)        |
| **Cost**            | Low (2 files modified)     | Medium (new component) | Medium (new utility) |
| **Ops complexity**  | Low (direct changes)       | Medium (abstraction)   | Medium (dynamic)     |
| **Maintainability** | Medium                     | High                   | Low                  |
| **Reusability**     | Low (FileTree only)        | High (any component)   | Medium (map lookup)  |
| **Performance**     | High (no wrappers)         | High (minimal props)   | Medium (lazy load)   |
| **Bundle size**     | +15-20KB                   | +15-20KB               | +15-20KB (same)      |
| **Code quality**    | Medium                     | High                   | Low                  |

## 5) Recommendation

- **Recommended baseline**: **Option A — Component-Based Enhancement**
- **Why (tie to decision drivers and success criteria)**:
  - **D1 (Speed)**: Fastest implementation at 2-3 hours, gets feature to users quickly
  - **D2 (Quality)**: Follows existing S8 patterns (hooks, functional components) already used in FileTree
  - **D3 (Bundle)**: All react-icons already imported in other components (FaFile in FileNode, FiFileText in EmptyPreview), incremental cost is minimal
  - **D4 (UX)**: No wrapper overhead or lazy-loading flicker, direct rendering ensures smooth experience
  - FileTree already has direct icon usage (FaFile, FaDownload, IoMdTrash) - adding more is consistent
  - F-015 is a focused enhancement, not a framework change - over-engineering is not warranted
- **What we postpone (explicit)**:
  - Icon component abstraction (Option B) - can extract later if 3+ components need same mapping
  - Code-splitting for icons (Option C) - not needed unless bundle size becomes critical

## 6) Open questions / Needs spikes

- **Q1**: Will auto-expanding all root directories cause performance issues with large OPFS file systems (100+ files)?
  - **Spike needed?**: **No** - Lazy-loading is preserved for child directories, only root expands
- **Q2**: Do all react-icons sub-packages (fa, fa6, ti, lu) exist in the project's dependencies?
  - **Spike needed?**: **No** - Can verify with `npm list react-icons` before implementation
- **Q3**: Will dotted tree lines be visible enough on high-DPI displays?
  - **Spike needed?**: **No** - Can test during implementation, fallback to `border-dashed` if needed
- **Q4**: Should we expand root directories immediately or after a short delay for perceived performance?
  - **Spike needed?**: **No** - Immediate expansion is standard UX pattern (matches prototype)

## 7) Architectural Notes

**Relation to F-012, F-013, F-014**:

F-015 builds on the existing OPFS browser architecture established in earlier features:

- **F-012**: Added TreeLines component, delete operations, metadata display
- **F-013**: Added two-panel preview layout with file selection
- **F-014**: Added green color theme, preview headers, file counts, always-visible icons
- **F-015**: Enhances tree visual hierarchy (expansion, lines, file type icons)

**Component Update Scope**:

```
src/devtools/components/OPFSBrowser/
├── FileTree.tsx          [MODIFY] - Add icon imports, getFileIcon helper, auto-expand logic
├── TreeLines.tsx         [MODIFY] - Change solid border to dotted/dashed
├── FileTypeIcon.tsx      [SKIP - Option A] - Not creating abstraction layer
└── iconMap.ts            [SKIP - Option C] - Not creating utility map
```

**Implementation Boundary**:

F-015 ONLY touches FileTree.tsx and TreeLines.tsx. No changes to:

- Service layer (databaseService.ts)
- Bridge layer (inspectedWindow.ts)
- Other components (FilePreview, MetadataPanel, etc.)
- Routing or navigation

This ensures minimal risk and focused delivery.
