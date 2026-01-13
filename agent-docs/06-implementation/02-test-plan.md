<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/06-implementation/02-test-plan.md

OUTPUT MAP (write to)
agent-docs/06-implementation/02-test-plan.md
-->

# 02 Test Plan

## 1) Strategy (The Pyramid)

- **Unit Tests (70%)**: Utilities, messaging helpers, and pure functions (TBD).
- **Integration Tests (20%)**: DevTools panel -> inspected window eval flows (manual for now).
- **E2E Tests (10%)**: Manual verification in Chrome DevTools (tracked in TASK-12).

## 2) Tools

- **Runner**: TBD (no automated tests yet)
- **Mocking**: TBD
- **E2E**: Manual checklist

## 3) Naming & Location

- Unit: `src/**/__tests__/*.test.ts` (TBD)
- Integration: `tests/integration/*.test.ts` (TBD)
- E2E: Manual checklist in `agent-docs/07-taskManager/02-task-catalog.md`

## 4) Current Inventory

- **Unit test files**: 0
- **Integration test files**: 0
- **E2E test files**: 0
