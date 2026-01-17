---
type: feature-spec
id: F-016
title: SVG to PNG Logo Generator
status: Completed
release: v1.3.1
owner: S1-IterationLead
created_at: 2026-01-17
completed_at: 2026-01-17
---

# Feature: SVG to PNG Logo Generator

## 1. Context & Goal

_Why are we building this? Who is it for?_

> As a developer working on the Web SQLite DevTools Extension, I need a reliable way to regenerate all logo PNG files from the SVG source when the design changes. Currently, manual SVG-to-PNG conversion is time-consuming and error-prone. This automation ensures consistency across all icon sizes and states, reducing development overhead.

**User Story**: As a developer, I want to run `npm run generate:logos` to automatically convert `public/icons/logo.svg` into multiple PNG files, so that I can update the extension logo without manual image conversion.

## 2. Requirements (The "What")

### User Stories

- [x] As a developer, I want to run a single NPM script to regenerate all logo PNGs from the SVG source, so that logo updates are consistent and efficient.
- [x] As a developer, I want the script to generate both active and inactive states for all sizes, so that the extension has complete icon variants ready for use.

### Acceptance Criteria (DoD)

- [x] **Happy Path**:
  - Running `npm run generate:logos` successfully creates 8 PNG files in `public/img/`:
    - `logo-16.png`, `logo-16-inactive.png`
    - `logo-32.png`, `logo-32-inactive.png`
    - `logo-48.png`, `logo-48-inactive.png`
    - `logo-128.png`, `logo-128-inactive.png`
  - All PNGs are rendered correctly from the SVG source
  - Active state uses the full-color SQLite logo (blue gradient)
  - Inactive state uses a grayscale or desaturated version of the logo
  - Script completes without errors in < 5 seconds
- [x] **Error Path**:
  - Script fails with clear error message if `public/icons/logo.svg` is missing
  - Script fails with clear error message if `public/img/` directory cannot be written
  - Script validates file creation (checks if all 8 files were successfully written)

### Non-Functional Requirements

- **Performance**: Script completes in < 5 seconds for all 8 PNG files
- **Maintainability**: TypeScript code with clear comments and type definitions
- **Dependencies**: Uses `tsx` for TypeScript runtime execution (no additional image processing libraries)
- **Compatibility**: Works on Node.js 18+ (matches project's Node version)

## 3. Impact Analysis (The "Ripple")

_Agent S1-IterationLead MUST fill this after analyzing existing docs._

### Dependencies

- **Blockers**: None (standalone developer tooling feature)
- **ADR Compliance**: None (this is a build tool, not runtime architecture)
- **External Dependencies**: `tsx` package for TypeScript execution (likely already installed for dev)

### System Changes

- [ ] **Architecture (S3)**:
  - New Component? No (developer tooling only)
  - Data Flow Change? N/A
- [ ] **API Contract (S5)**:
  - New Endpoints: None
  - Breaking Changes? No (no runtime impact)
- [ ] **Database (S5)**:
  - New Tables/Columns: None
- [ ] **Build Configuration**:
  - New NPM script: `generate:logos`
  - New TypeScript script: `scripts/generate-logos.ts`
  - Package update: Ensure `tsx` is installed as devDependency

### Module Ownership

- **Module**: Developer Tooling / Build Automation
- **Files to Create**:
  - `scripts/generate-logos.ts` (TypeScript logo generator script)
- **Files to Modify**:
  - `package.json` (add `generate:logos` script)
- **Files to Delete**: None
- **Files to Rename**: None

## 4. Verification Plan

_How will we know it works?_

- **Test Scenarios**:
  1. **Case A: Full Generation** - Run `npm run generate:logos` with clean `public/img/` directory (no existing PNGs)
     - Expected: All 8 PNG files created successfully
  2. **Case B: Overwrite Existing** - Run `npm run generate:logos` with existing PNG files in `public/img/`
     - Expected: All 8 PNG files overwritten with new versions from SVG
  3. **Case C: Invalid State Variant** - Modify script to request unsupported state
     - Expected: Script fails with clear error about invalid state
  4. **Case D: Missing Source SVG** - Run script with `public/icons/logo.svg` renamed/moved
     - Expected: Script fails with error message "Source SVG not found: public/icons/logo.svg"

- **Manual Check**:
  1. Run `npm run generate:logos`
  2. Verify 8 files exist in `public/img/` with correct names
  3. Open each PNG in image viewer to verify:
     - All 4 sizes (16, 32, 48, 128) are correctly rendered
     - Active state has full blue gradient color
     - Inactive state is grayscale/desaturated
  4. Check file sizes are reasonable (not corrupted or empty)

## 5. Implementation Roadmap (S7)

_Rough breakdown for Task Manager._

1. **Setup & Configuration** (0.5h)
   - Create `scripts/` directory if not exists
   - Verify `tsx` is installed in devDependencies
   - Add `generate:logos` script to package.json

2. **Script Implementation** (2h)
   - Create `scripts/generate-logos.ts` with TypeScript
   - Implement SVG parsing and rendering logic
   - Implement PNG generation for 4 sizes (16, 32, 48, 128)
   - Implement state generation (active/inactive) using SVG filter or color manipulation
   - Add file system operations (read SVG, write PNGs)
   - Add error handling and validation

3. **Testing & Verification** (0.5h)
   - Run script and verify all 8 PNGs generated
   - Test error scenarios (missing SVG, write permissions)
   - Verify output quality in image viewer
   - Update feature spec with completion status

**Total Estimated Time**: 3 hours
