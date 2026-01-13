<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/04-adr/0000-template.md

OUTPUT MAP (write to)
agent-docs/04-adr/0007-inspectedwindow-async.md

NOTES
- Keep headings unchanged.
- Use this for ANY significant decision (DB choice, Framework, Auth, etc.).
-->

# ADR-0007: Async Page Access via chrome.scripting.executeScript

## Status

Accepted (2026-01-13)

## Context

- `chrome.devtools.inspectedWindow.eval` requires a JSON-compliant return value.
- `web-sqlite-js` APIs like `db.query()` and `db.exec()` return Promises.
- When eval returns a Promise, the callback receives `undefined` or throws an
  exception because Promises are not JSON-serializable.
- **How to inspect**: run `chrome.devtools.inspectedWindow.eval("Promise.resolve(1)")`
  and observe `exceptionInfo.isException` or an empty/undefined result.

## Decision

We will use `chrome.scripting.executeScript` with `world: "MAIN"` from the
DevTools panel for async access to `window.__web_sqlite`. This API awaits
Promise results and returns structured-clone data safely.

## Alternatives Considered

### Option 1: Keep `inspectedWindow.eval` + async IIFE

- Pros: No new permissions.
- Cons: Promise results are not JSON-compliant and fail to return data.

### Option 2: Reintroduce content-script proxy

- Pros: Async operations are easy via messaging.
- Cons: Higher complexity; content scripts run in isolated world and cannot
  access page JS objects without extra bridging.

### Option 3: Use `chrome.debugger` + CDP Runtime.evaluate

- Pros: Supports `awaitPromise`.
- Cons: Requires `"debugger"` permission and more complex lifecycle handling.

### Option 4: `chrome.scripting.executeScript` (CHOSEN)

- Pros: Awaits Promises, runs in MAIN world, simple API.
- Cons: Requires `"scripting"` permission.

## Consequences

- Add `"scripting"` permission in `src/manifest.ts`.
- DevTools helpers should use `executeScript` for async database calls.
- `inspectedWindow.eval` should be limited to synchronous, JSON-serializable
  expressions only.
