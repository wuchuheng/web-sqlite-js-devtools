<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/07-task/00-roadmap.md

OUTPUT MAP (write to)
agent-docs/07-task/00-roadmap.md

NOTES
- Keep headings unchanged.
- Track releases and their target dates.
-->

# 00 Roadmap

## 1) Release Overview

| Release | Target Date | Status | Features | Evidence |
| ------- | ----------- | ------ | -------- | -------- |
| v1.0.0  | 2026-01-14  | Done   | MVP (44 FRs) | `package.json` v1.0.0 |
| v1.1.0  | TBD         | Done   | Post-MVP (TASK-201, TASK-202) | TASK-201, TASK-202 complete |
| v1.1.1  | TBD         | Planning | F-004: DDL Syntax Highlight & Copy | This roadmap |
| v1.2.0  | TBD         | Backlog | Future features | Feature backlog |

## 2) v1.1.1 Release Plan

**Target Date**: TBD (After F-003 completion)

**Focus**: DDL UX Enhancement

**Features**:
- F-004: DDL Syntax Highlight & Copy Button

### 2.1) Task Breakdown

| Task ID | Task Description | Owner | Status | Evidence |
| ------- | ---------------- | ----- | ------ | -------- |
| F-004.1 | Install dependencies (react-syntax-highlighter) | S8:worker | Pending | `package.json` updated |
| F-004.2 | Update SchemaDDLView component with state | S8:worker | Pending | `SchemaDDLView.tsx` modified |
| F-004.3 | Implement copy button with clipboard API | S8:worker | Pending | Copy button functional |
| F-004.4 | Implement syntax highlighting (Prism.js) | S8:worker | Pending | DDL syntax highlighted |
| F-004.5 | Build, test, and commit changes | S8:worker | Pending | Build passes, committed |

### 2.2) Acceptance Criteria

- [ ] SQL DDL is syntax highlighted with light theme
- [ ] Copy button (MdOutlineContentCopy) visible in DDL header
- [ ] Clicking copy copies DDL to clipboard
- [ ] Icon changes to green checkmark (FaCheck) on success
- [ ] Checkmark persists until next click
- [ ] Inline error shows if clipboard API fails
- [ ] Build passes with no errors
- [ ] Bundle size increase < 50KB

### 2.3) Definition of Done

- All 5 tasks completed
- All acceptance criteria met
- Code reviewed and committed
- Documentation updated (status board)
- Extension build tested manually

## 3) v1.2.0 Release (Future)

**Status**: Backlog

**Potential Features**:
- Additional syntax highlighting for Query Editor
- Export DDL to file
- Copy table data to clipboard

**Dependencies**: v1.1.1 completion

## 4) Release History

### v1.0.0 - MVP Release (2026-01-14)

**Completed**:
- F-001: Service Layer Expansion
- F-002: Database Tab Navigation Restructuring
- F-003: Schema Panel Enhancement

**Evidence**: `package.json` version 1.0.0, production build verified

### v1.1.0 - Post-MVP Features (TBD)

**Completed**:
- TASK-201: Query History
- TASK-202: Keyboard Shortcuts
- TASK-203: Dark/Light Theme (SKIPPED)

**Evidence**: Task catalog entries marked complete

## 5) Upcoming Releases

**Next Release**: v1.1.1 (F-004)

**Target**: Complete F-004 implementation with DDL syntax highlighting and copy button

**Blocking Issues**: None

**Dependencies**:
- F-003 must be complete (DONE)
- react-syntax-highlighter package installation
