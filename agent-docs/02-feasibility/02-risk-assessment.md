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

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|------------|--------|------------|-------|
| R-001 | Message serialization fails for Map objects in DatabaseRecord | Medium | High | Convert Maps to Arrays before sending, reconstruct on DevTools side | S3:systemArchitect |
| R-002 | chrome.runtime.sendMessage overhead exceeds NFR targets | Low | Medium | Spike to benchmark; implement response caching if needed | S3:systemArchitect |
| R-003 | CodeMirror bundle size exceeds 2MB extension limit | Medium | High | Spike to test; consider lazy-loading or alternative if needed | S3:systemArchitect |
| R-004 | Content script lifecycle differs from DevTools panel | Medium | Medium | Implement heartbeat/reconnect logic (FR-041) | S3:systemArchitect |
| R-005 | Page refresh disrupts active DevTools session | High | Medium | Auto-reconnect with timeout (FR-041), show loading state | S3:systemArchitect |
| R-006 | Large query results (1000+ rows) cause UI freeze | Medium | Medium | Enforce pagination, implement virtual scrolling | S6:techLead |
| R-007 | Log subscription memory leak (FR-029, 500 entry limit) | Medium | Low | Implement ring buffer for logs, cleanup on unsubscribe | S6:techLead |
| R-008 | web-sqlite-js version mismatch (v1.0.11 in template vs v2.1.0+ required) | High | High | Update dependency; verify API compatibility | S3:systemArchitect |
| R-009 | OPFS access from DevTools context not possible | High | High | Content script proxy required (Option A handles this) | S3:systemArchitect |
| R-010 | Hash routing conflicts with existing DevTools navigation | Low | Low | React Router handles hash routing correctly | S6:techLead |
| R-011 | Icon state updates lag behind database changes | Low | Low | Content script listens to `onDatabaseChange`, notifies background | S6:techLead |
| R-012 | CodeMirror auto-theme detection doesn't work | Low | Low | Fallback to light theme, document limitation | S6:techLead |

## Key unknowns
- **U1**: Actual serialized size of DatabaseRecord with large migration/seed Maps
  - **Impact**: May need chunking or compression for large schemas
  - **Mitigation**: Spike S-001 will test this
- **U2**: Performance of content script → DevTools message round-trip
  - **Impact**: Could affect real-time log streaming (FR-029)
  - **Mitigation**: Spike S-002 will benchmark this
- **U3**: CodeMirror 6 SQL mode availability and bundle size
  - **Impact**: May need alternative SQL editor (e.g., CodeMirror 5, or simple textarea)
  - **Mitigation**: Spike S-003 will validate this
- **U4**: Whether `window.__web_sqlite.onDatabaseChange` is immediately available on page load
  - **Impact**: Affects initial icon state detection
  - **Mitigation**: Poll with fallback if event not immediately available
