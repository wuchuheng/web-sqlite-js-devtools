# F-014: OPFS UI Visual Redesign

## 0) Meta

- **Feature ID**: F-014
- **Title**: OPFS UI Visual Redesign
- **Status**: Completed (2026-01-16)
- **Priority**: P1 (User Experience)
- **Estimated**: 6-8 hours
- **Dependencies**: F-012 (OPFS Browser Enhancement), F-013 (OPFS Two-Panel Preview)
- **Source**: Prototype design at `screenshots/opfs-product.png`

## 1) Problem Statement

The current OPFS File Browser implementation (F-012, F-013) has a complete two-panel layout with file preview, but the visual design does not match the product prototype. Key gaps:

1. **Color Scheme Mismatch**: Current uses blue/white theme, prototype uses green (#4CAF50) headers
2. **Preview Panel Styling**: Current has emerald-50 background, prototype has white with green header
3. **Missing Visual Elements**: No file/directory counts, no preview status badge
4. **Extra Elements**: Footer tip section not in prototype
5. **Icon Visibility**: File actions (download/delete) only show on hover, prototype shows them always

**Impact**: Users see inconsistent UI between prototype and production, causing confusion and reduced trust in the tool.

## 2) Proposed Solution

Complete visual redesign of OPFS File Browser to match the product prototype:

### 2.1 Color Theme Changes

| Element                  | Current          | Target (Prototype)        |
| ------------------------ | ---------------- | ------------------------- |
| Main header icon         | Blue (#3B82F6)   | **Green (#4CAF50)**       |
| Preview panel background | Emerald-50       | **White (#FFFFFF)**       |
| Preview header           | None             | **Green bar (#4CAF50)**   |
| Status badge             | None             | **Green with white text** |
| Helper notice            | Blue-50/Blue-200 | **Remove entirely**       |

### 2.2 Layout & Component Changes

**Main Header:**

- Change icon from `FaFile` (blue) to `FaFile` (green)
- Remove helper notice section entirely

**Left Panel (File Tree):**

- Add file/directory counts to folder nodes (e.g., "3 files 2 dirs", "120 files")
- Make download/delete icons always visible (not hover-only)
- Keep tree lines and expand/collapse behavior

**Right Panel (Preview):**

- Add green header bar with "Preview: [filename]" title
- Add "started" status badge (green background, white text, rounded)
- Change background from emerald-50 to white
- Keep all preview functionality (text/image/binary/empty states)

**Footer:**

- Remove footer tip section entirely

### 2.3 Typography & Spacing

- Preview content: Keep monospace for text files
- File tree: Keep sans-serif
- Spacing: Match prototype (16px padding, 8px gutter between panels)

## 3) Functional Requirements

| ID                 | Description                                                         | Priority |
| ------------------ | ------------------------------------------------------------------- | -------- |
| **FR-OPFS-UI-001** | Change main header icon color from blue to green (#4CAF50)          | P0       |
| **FR-OPFS-UI-002** | Remove helper notice section ("Origin Private File System...")      | P0       |
| **FR-OPFS-UI-003** | Add green header bar to preview panel with "Preview: [filename]"    | P0       |
| **FR-OPFS-UI-004** | Add "started" status badge in preview header (green bg, white text) | P1       |
| **FR-OPFS-UI-005** | Change preview panel background from emerald-50 to white            | P0       |
| **FR-OPFS-UI-006** | Add file/directory counts to folder nodes in FileTree               | P1       |
| **FR-OPFS-UI-007** | Make download/delete icons always visible (not hover-only)          | P1       |
| **FR-OPFS-UI-008** | Remove footer tip section                                           | P0       |

## 4) Non-Functional Requirements

| ID                  | Description                       | Target                              |
| ------------------- | --------------------------------- | ----------------------------------- |
| **NFR-OPFS-UI-001** | Visual consistency with prototype | 100% match                          |
| **NFR-OPFS-UI-002** | Color accessibility               | WCAG AA contrast ratios             |
| **NFR-OPFS-UI-003** | Performance                       | No measurable impact on render time |
| **NFR-OPFS-UI-004** | Browser compatibility             | Chrome 90+                          |
| **NFR-OPFS-UI-005** | Code quality                      | Follow S8 quality rules             |

## 5) Dependencies

| ID    | Feature                  | Status  | Required For                  |
| ----- | ------------------------ | ------- | ----------------------------- |
| F-012 | OPFS Browser Enhancement | ✅ Done | Base file tree, delete, toast |
| F-013 | OPFS Two-Panel Preview   | ✅ Done | Preview panel, resize handle  |

## 6) Implementation Scope

### In Scope

- Visual styling changes (colors, backgrounds, borders)
- Header modifications (add preview header, update main header)
- File tree enhancements (counts, icon visibility)
- Footer removal

### Out of Scope

- New functionality (all features exist from F-012, F-013)
- Service layer changes (no new API calls)
- Responsive design changes (current mobile behavior is acceptable)
- Dark mode support (not in prototype)

## 7) Success Criteria

- [ ] Main header uses green (#4CAF50) icon
- [ ] Helper notice section removed
- [ ] Preview panel has green header bar with file name
- [ ] Preview panel has "started" status badge
- [ ] Preview panel background is white
- [ ] Folder nodes show file/directory counts
- [ ] Download/delete icons are always visible
- [ ] Footer tip section removed
- [ ] Visual design matches prototype screenshot
- [ ] All existing functionality works (download, delete, preview)

## 8) Effort Estimation

| Phase     | Task                                                   | Hours         |
| --------- | ------------------------------------------------------ | ------------- |
| 1         | Color scheme updates (green theme)                     | 1.5h          |
| 2         | Header modifications (add preview header, update main) | 1h            |
| 3         | Preview panel styling (white bg, header, badge)        | 1h            |
| 4         | File tree enhancements (counts, icon visibility)       | 2h            |
| 5         | Footer removal                                         | 0.5h          |
| 6         | Testing & validation                                   | 1h            |
| **Total** |                                                        | **7-8 hours** |

## 9) Risk Assessment

| Risk                            | Impact | Mitigation                                  |
| ------------------------------- | ------ | ------------------------------------------- |
| Color accessibility issues      | Medium | Use WCAG AA compliant shades of green       |
| Breaking existing functionality | Low    | Visual-only changes, no logic modifications |
| Prototype ambiguity             | Low    | Reference screenshot for clarification      |

## 10) Open Questions

1. Should file/directory counts be real-time (recalculate on every expand) or cached?
2. What should happen to file/directory counts when items are deleted?
3. Should "started" badge always show, or only when preview is actively loading?

## 11) References

- Prototype: `screenshots/opfs-product.png`
- Current implementation: `src/devtools/components/OPFSBrowser/`
- Related features: F-012, F-013
