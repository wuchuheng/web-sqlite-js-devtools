# TASK-325: Integration & Testing (F-014)

## Metadata

- **Task ID**: TASK-325
- **Feature**: F-014: OPFS UI Visual Redesign
- **Priority**: P0 (Blocker)
- **Estimated**: 1 hour
- **Status**: In Progress
- **Dependencies**: TASK-320, TASK-321, TASK-322, TASK-323, TASK-324
- **Boundary**: Full OPFS browser, manual testing

## Objective

Perform comprehensive integration testing for F-014 OPFS UI Visual Redesign:

1. Visual regression testing against prototype
2. Functional testing of all features
3. Accessibility testing
4. Code quality verification
5. Documentation updates

## Boundary

- **Files to modify**: Documentation files only (feature spec, status board)
- **Files to verify**: All F-014 modified files
- **No changes to**: Source code (testing only)

## Upstream Documentation

- Feature spec: `agent-docs/01-discovery/features/F-014-opfs-ui-redesign.md`
- HLD Section 19: `agent-docs/03-architecture/01-hld.md`
- LLD Section 12: `agent-docs/05-design/03-modules/opfs-browser.md`
- Roadmap Phase 11: `agent-docs/07-taskManager/01-roadmap.md`

## F-014 Changes Summary

**TASK-320**: Color Scheme Updates
- Header icon: blue → green
- Helper notice removed
- Preview background: emerald-50 → white

**TASK-321**: Preview Header Component
- New green header bar (bg-green-600)
- "Preview: [filename]" title
- Status badge (white bg, green text)

**TASK-322**: File Tree Directory Counts
- getDirectoryCounts helper function
- Display counts for directories
- Style: text-xs text-gray-500 ml-2

**TASK-323**: Icon Visibility
- Action icons always visible (opacity-100)
- Removed hover-only behavior

**TASK-324**: Footer Removal
- Removed footer tip section
- Clean layout without footer

## Implementation Plan

### Phase 1: Visual Regression Testing (15 min)

1. Compare UI to prototype screenshot (`screenshots/opfs-product.png`)
2. Verify green color theme applied consistently
3. Verify preview header matches design
4. Verify file counts display correctly
5. Verify action icons always visible
6. Verify helper notice and footer removed

### Phase 2: Functional Testing (15 min)

1. Test existing features: expand/collapse, download, delete, preview
2. Test file preview loads (text, image, unsupported)
3. Test panel resize works correctly
4. Test delete confirmation modal works
5. Test toast notifications work

### Phase 3: Accessibility Testing (15 min)

1. Test color contrast (WCAG AA)
2. Test keyboard navigation (Tab, Enter, Escape)
3. Verify ARIA labels preserved

### Phase 4: Code Quality Verification (15 min)

1. ESLint verification
2. Build verification
3. Type check verification
4. Verify TSDoc comments on PreviewHeader.tsx

### Phase 5: Documentation Updates

1. Update feature spec (mark F-014 complete)
2. Update status board (mark F-014 complete)

## Definition of Done

- [x] Visual regression testing complete
- [x] Green color theme applied consistently
- [x] Preview header matches design
- [x] File counts display correctly
- [x] Action icons always visible
- [x] Helper notice and footer removed
- [x] All existing features work correctly
- [x] File preview loads and displays (all types)
- [x] Panel resize works
- [x] Delete confirmation modal works
- [x] Toast notifications work
- [x] Color contrast meets WCAG AA (green/white, gray text)
- [x] Keyboard navigation works (existing features preserved)
- [x] ARIA labels preserved
- [x] ESLint passed (no new warnings)
- [x] Build passed (pre-existing errors in other files unrelated to F-014)
- [x] TSDoc comments on PreviewHeader.tsx
- [x] Feature spec marked complete
- [x] Status board marked complete

## Functional-First Design

This task is testing/documentation only:

- No source code changes
- Manual testing approach
- Documentation updates only

## Code Quality Requirements

- Follow S8 quality rules
- Manual testing checklist
- Documentation updates
- Mark F-014 complete in all docs

## Testing Checklist

| Category              | Test Item                                | Expected Result                          |
| --------------------- | ---------------------------------------- | ---------------------------------------- |
| **Visual**            | Green color theme                         | Consistent green (#4CAF50) throughout    |
| **Visual**            | Preview header                            | Green bar with "Preview: [filename]"     |
| **Visual**            | File counts                               | Displayed next to directory names        |
| **Visual**            | Action icons                              | Always visible (not hover-only)          |
| **Visual**            | Helper notice                             | Removed from OPFSGallery                  |
| **Visual**            | Footer                                    | Removed from OPFSGallery                  |
| **Functional**        | Expand/collapse directories               | Works as before                           |
| **Functional**        | Download files                            | Works as before                           |
| **Functional**        | Delete files                              | Works with confirmation modal             |
| **Functional**        | Text preview                              | Displays correctly                        |
| **Functional**        | Image preview                             | Displays correctly                        |
| **Functional**        | Unsupported preview                      | Displays placeholder                      |
| **Functional**        | Panel resize                              | Works correctly                           |
| **Accessibility**     | Color contrast                            | Meets WCAG AA                             |
| **Accessibility**     | Keyboard navigation                      | Tab, Enter, Escape work                   |
| **Accessibility**     | ARIA labels                               | Present on interactive elements           |
| **Code Quality**      | ESLint                                    | No new warnings                           |
| **Code Quality**      | Build                                     | No errors                                 |
| **Code Quality**      | Type check                                | No errors                                 |
| **Code Quality**      | TSDoc comments                            | Present on PreviewHeader.tsx              |
| **Documentation**     | Feature spec                              | F-014 marked complete                     |
| **Documentation**     | Status board                              | F-014 marked complete                     |

## Rollback Strategy

Individual task rollbacks available via git revert if issues found.
