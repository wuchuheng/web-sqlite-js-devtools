<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/07-roadmap.md

OUTPUT MAP (write to)
agent-docs/07-taskManager/01-roadmap.md

NOTES
- Keep headings unchanged.
-->

# 01 Roadmap & Strategy

## 1. Active Release: v1.0.0 (MVP)
> **Focus**: Core DevTools extension for web-sqlite-js debugging (Table browser, Query editor, Log viewer, OPFS browser)
> **Target Date**: 2026-01-27
> **Duration**: 14 days (from 2026-01-13)

### Key Features (Scope)
- [ ] **F-001**: DevTools Panel with Sidebar navigation (FR-001 to FR-014)
- [ ] **F-002**: Table browser with multi-tab support (FR-016 to FR-023)
- [ ] **F-003**: SQL Query editor with CodeMirror (FR-024 to FR-028)
- [ ] **F-004**: Real-time Log viewer with filtering (FR-029 to FR-030)
- [ ] **F-005**: OPFS file browser with download (FR-036 to FR-038)
- [ ] **F-006**: Icon state management (FR-002, FR-003)
- [ ] **F-007**: About tab with database metadata (FR-035)
- [ ] **F-008**: Auto-reconnect on page refresh (FR-041)

### Release Phases (12 Tasks)

#### Phase 1: Foundation (Days 1-2)
**Milestone**: Project setup + messaging infrastructure
- TASK-01: Project Setup & Configuration
- TASK-02: Sidebar UI & Navigation

#### Phase 2: Core Messaging (Days 3-4)
**Milestone**: Panel ↔ Content Script communication working
- TASK-03: Content Script Proxy & Background Messaging
- TASK-04: Icon State & Auto-Reconnect

#### Phase 3: Database Inspection (Days 5-7)
**Milestone**: Can list and browse database tables
- TASK-05: Database List & Table Browser
- TASK-06: Table Data & Schema

#### Phase 4: Query & Logs (Days 8-10)
**Milestone**: SQL execution and log streaming working
- TASK-07: Query Editor with CodeMirror
- TASK-08: Query Results & Export
- TASK-09: Log Streaming & Ring Buffer

#### Phase 5: OPFS & About (Days 11-13)
**Milestone**: File browsing and database info working
- TASK-10: OPFS File Browser
- TASK-11: About Tab & Tab Navigation

#### Phase 6: Testing & Release (Day 14)
**Milestone**: Production-ready extension
- TASK-12: Testing & Release

## 2. Upcoming Releases (Backlog)

### Release v1.1.0 (Post-MVP)
- [ ] **TASK-101**: Migration playground (FR-031, FR-032, FR-033)
- [ ] **TASK-102**: Seed playground (FR-033, FR-034)

### Release v1.2.0 (Future)
- [ ] **TASK-201**: Query history (FR-106)
- [ ] **TASK-202**: Keyboard shortcuts (FR-107)
- [ ] **TASK-203**: Dark/light theme toggle (FR-108)

## 3. Milestones (History)
- [x] **Planning (2026-01-13)**: Stages 1-5 completed (Discovery, Feasibility, Architecture, ADR, Design)
- [ ] **Foundation Complete**: By end of Day 2 (TASK-01, TASK-02)
- [ ] **Core Messaging Working**: By end of Day 4 (TASK-03, TASK-04)
- [ ] **Database Inspection Working**: By end of Day 7 (TASK-05, TASK-06)
- [ ] **Query & Logs Working**: By end of Day 10 (TASK-07, TASK-08, TASK-09)
- [ ] **OPFS & About Working**: By end of Day 13 (TASK-10, TASK-11)
- [ ] **v1.0.0 MVP Released**: 2026-01-27 (TASK-12)
