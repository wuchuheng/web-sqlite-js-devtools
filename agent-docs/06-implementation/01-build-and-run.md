<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/06-implementation/01-build-and-run.md

OUTPUT MAP (write to)
agent-docs/06-implementation/01-build-and-run.md
-->

# 01 Build & Run Guide

## 1) Prerequisites

- **Runtime**: Node.js v18+ (npm included)

## 2) Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

## 3) Development Workflow (The Loop)

Every change should follow this loop:

1. **Phase 1: Code (Implement)**
   - Keep functions small and functional.
   - Use three-phase comments for non-trivial logic.
2. **Phase 2: Verify (Build)**
   - Run `npm run build`.
3. **Phase 3: Refactor (Polish)**
   - Keep nesting under 3 levels and params under 4.
   - Re-run `npm run build` after refactors.

## 4) Build Commands

- `npm run build`: Type-check and build the extension.
- `npm run format`: Format sources (optional).
