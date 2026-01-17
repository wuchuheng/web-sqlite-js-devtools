<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/02-feasibility/02-risk-assessment.md

OUTPUT MAP (write to)
agent-docs/02-feasibility/02-risk-assessment.md

NOTES
- Keep headings unchanged.
- Use when options have meaningful unknowns or risks.
-->

# 02 Risk Assessment

| ID       | Risk                                                       | Likelihood | Impact | Mitigation                                                                                | Owner              |
| -------- | ---------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------------- | ------------------ |
| R-RT-001 | DevTools panel misses database list messages when closed   | Medium     | Medium | Panel fetches current state on mount via chrome.runtime.sendMessage                       | S3:systemArchitect |
| R-RT-002 | Log entries lost during DevTools panel closure             | Low        | Low    | Logs are ephemeral; acceptable to miss entries when panel closed                          | S3:systemArchitect |
| R-RT-003 | Message forwarding latency exceeds 10ms target             | Low        | Medium | Measure latency; if needed, batch log entries                                             | S3:systemArchitect |
| R-RT-004 | Memory leak from log subscriptions not cleaned up          | Medium     | High   | Implement unsubscribe on database close; track subscriptions in Map                       | S6:techLead        |
| R-RT-005 | Multiple DevTools panels receive cross-tab messages        | Low        | High   | Background worker routes messages by tabId only                                           | S3:systemArchitect |
| R-RT-006 | Rapid database open/close causes message flood             | Medium     | Low    | Existing databaseMap provides deduplication                                               | S6:techLead        |
| R-RT-007 | Log entry payload too large for chrome.runtime.sendMessage | Low        | Low    | Log entries are small (level + data); < 1KB typical                                       | S6:techLead        |
| R-RT-008 | Content script MAIN world cannot access chrome.runtime     | Low        | High   | Relay script (ISOLATED world) handles chrome.runtime calls (already implemented in F-017) | S3:systemArchitect |

## Key unknowns

- **U1**: Actual message latency from content script to DevTools panel
  - **Impact**: Could affect real-time UX if > 100ms
  - **Mitigation**: chrome.runtime.sendMessage is typically < 5ms; will measure during implementation

- **U2**: Log entry frequency in production applications
  - **Impact**: High-frequency logs could flood DevTools panel
  - **Mitigation**: Existing ring buffer (500 entries) limits memory; consider rate limiting if needed

- **U3**: Whether web-sqlite-js db.onLog callback fires synchronously
  - **Impact**: Could cause performance issues if very frequent
  - **Mitigation**: Web-sqlite-js logs are async; CrossWorldChannel uses postMessage (async)

---

**Maintainer**: S2: Feasibility Analyst
**Status**: Draft — Ready for Review
