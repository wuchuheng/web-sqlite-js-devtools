# TASK-303: Integration Testing & Polish (F-005, F-006)

## 0) Meta

- **Task ID**: TASK-303
- **Features**: F-005 (Opened Table Tabs), F-006 (Resizable Vertical Dividers)
- **Status**: In Progress ([-] locked)
- **Priority**: P1 (High)
- **Estimated**: 6 hours (1 day)
- **Started**: 2026-01-14
- **Dependencies**: TASK-301, TASK-302

## 1) Objective

Perform cross-feature integration testing between F-005 (Opened Table Tabs) and F-006 (Resizable Vertical Dividers). Test edge cases, polish any issues, and update documentation with completion status.

## 2) Current State

**TASK-301 Complete:**

- OpenedTableTabs component created
- React Context for state management
- Close buttons with auto-switch logic

**TASK-302 Complete:**

- ResizeHandle component created
- Sidebar resize (200-600px)
- Schema panel resize (250-600px)

## 3) Testing Plan

### Phase 1: Cross-Feature Testing (2 hours)

**Test 1.1: Resize works with opened tabs**

- Open multiple tables (tabs appear)
- Resize sidebar while tabs are open
- Verify tabs remain visible and functional
- Verify tab close buttons still work

**Test 1.2: Schema panel toggle works with custom width**

- Open a table
- Show schema panel
- Resize schema panel to custom width (e.g., 400px)
- Hide schema panel
- Show schema panel again
- Verify width is preserved

**Test 1.3: Tab close works with custom panel widths**

- Open multiple tables
- Resize sidebar to narrow width (200px)
- Resize schema panel to wide width (500px)
- Close tabs one by one
- Verify auto-switch works correctly
- Verify panel widths remain stable

**Test 1.4: No state conflicts between features**

- Open tables
- Resize panels
- Toggle schema panel
- Close tabs
- Verify no console errors
- Verify no state corruption

### Phase 2: Edge Cases (2 hours)

**Test 2.1: Closing tab while resizing**

- Open multiple tables
- Start resizing sidebar
- Close a tab during drag
- Verify resize completes cleanly
- Verify tab closes correctly

**Test 2.2: Mouse release outside browser window**

- Start resizing sidebar
- Drag mouse outside DevTools panel
- Release mouse button
- Verify resize stops cleanly
- Verify next resize works

**Test 2.3: Min/max constraints enforced correctly**

- Resize sidebar to minimum (200px)
- Try to resize further left
- Verify constraint stops at 200px
- Resize sidebar to maximum (600px)
- Try to resize further right
- Verify constraint stops at 600px
- Repeat for schema panel (250-600px)

**Test 2.4: Resize when schema panel hidden**

- Hide schema panel
- Resize table data area (via sidebar)
- Verify resize works
- Show schema panel
- Verify previous width preserved

### Phase 3: Polish (2 hours)

**Test 3.1: Fix any visual glitches**

- Check for layout shifts during resize
- Check for flickering on tab close
- Check for z-index issues with resize handles

**Test 3.2: Fix any state bugs**

- Verify state updates are consistent
- Verify no duplicate tabs
- Verify no orphaned state

**Test 3.3: Update HLD if needed**

- Review HLD for accuracy
- Update component hierarchy if needed
- Update dataflow diagrams if needed

**Test 3.4: Update LLD if needed**

- Review LLD for accuracy
- Update component interfaces if needed
- Update module documentation if needed

**Test 3.5: Update feature docs with completion status**

- Mark F-005 as completed in feature spec
- Mark F-006 as completed in feature spec
- Add completion date

## 4) Code Quality Rules

**No code changes unless bugs found**

**If bugs found, follow existing patterns:**

- Three-phase comments for functions > 5 lines
- TSDoc for exported functions
- Functional components only

## 5) Acceptance Criteria

From task catalog DoD:

- [ ] **Cross-feature Testing** (2 hours)
  - [ ] Resize works with opened tabs
  - [ ] Schema panel toggle works with custom width
  - [ ] Tab close works with custom panel widths
  - [ ] No state conflicts between features

- [ ] **Edge Cases** (2 hours)
  - [ ] Closing tab while resizing
  - [ ] Switching databases resets opened tabs
  - [ ] Min/max constraints enforced correctly
  - [ ] Mouse release outside browser window handled

- [ ] **Polish** (2 hours)
  - [ ] Fix any visual glitches
  - [ ] Fix any state bugs
  - [ ] Update HLD if needed
  - [ ] Update LLD if needed
  - [ ] Update feature docs with completion status

- [ ] Build passed with no errors
- [ ] Extension loads and functions correctly

## 6) Files Changed

### Files to Review (No changes expected)

- `src/devtools/components/TablesTab/OpenedTableTabs.tsx`
- `src/devtools/components/TablesTab/TablesTab.tsx`
- `src/devtools/components/TablesTab/TableDetail.tsx`
- `src/devtools/components/Shared/ResizeHandle.tsx`

### Files to Update (if bugs found)

- Any of the above (only if bugs)

### Documentation to Update

- `agent-docs/01-discovery/features/F-005-opened-table-tabs-management.md`
- `agent-docs/01-discovery/features/F-006-resizable-vertical-dividers.md`

## 7) Build Verification

**After testing, run:**

```bash
npm run build
```

**Expected:** No errors, successful build

## 8) Notes

- **Testing focus**: Cross-feature interaction, not individual features
- **Bug fixes only**: Don't add new features
- **Documentation**: Mark features as completed
- **No breaking changes**: Preserve existing functionality
