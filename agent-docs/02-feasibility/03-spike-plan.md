<!--
TEMPLATE MAP (reference-only)
.claude/templates/docs/02-feasibility/03-spike-plan.md

OUTPUT MAP (write to)
agent-docs/02-feasibility/03-spike-plan.md

NOTES
- Keep headings unchanged.
- Use when you need timeboxed PoCs to validate unknowns.
-->

# 03 Spike Plan (Timeboxed PoCs)

## Spike list

| Spike ID  | Goal                                                   | Timebox | Steps                                                                                                                                                                                          | Acceptance outcome                                                                                                         |
| --------- | ------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **S-001** | Test message serialization of DatabaseRecord with Maps | 1h      | 1. Create mock DatabaseRecord with migrationSQL/seedSQL Maps<br>2. Send via chrome.runtime.sendMessage<br>3. Verify received object structure<br>4. Test with large Maps (100+ entries)        | **Pass**: Maps serialize correctly (or conversion strategy works)<br>**Fail**: Maps cannot be serialized, need alternative |
| **S-002** | Benchmark message passing overhead for query results   | 1h      | 1. Set up content script to return mock 100-row result<br>2. Measure round-trip time from DevTools panel<br>3. Test with 100, 500, 1000 rows<br>4. Measure memory usage                        | **Pass**: <100ms for 100 rows (meets NFR-002)<br>**Fail**: Exceeds target, need caching strategy                           |
| **S-003** | Validate CodeMirror 6 bundle size and SQL mode         | 2h      | 1. Install @codemirror/lang-sql and dependencies<br>2. Build minimal test extension<br>3. Measure unpacked bundle size<br>4. Test SQL syntax highlighting                                      | **Pass**: Bundle <2MB with CodeMirror<br>**Fail**: Exceeds limit, evaluate alternatives                                    |
| **S-004** | Test web-sqlite-js v2.1.0+ API compatibility           | 1h      | 1. Update web-sqlite-js to latest version<br>2. Test `window.__web_sqlite` access<br>3. Verify `onDatabaseChange`, `db.onLog`, `db.devTool` APIs<br>4. Check for breaking changes from v1.0.11 | **Pass**: All required APIs work as documented<br>**Fail**: Need API adapter or version pinning                            |

## Notes

- **What decisions these spikes will unblock**:
  - **S-001**: Determines message protocol design (Map serialization vs Array conversion)
  - **S-002**: Confirms if caching/batching is needed for large queries
  - **S-003**: Finalizes SQL editor choice (CodeMirror 6 vs alternatives)
  - **S-004**: Validates web-sqlite-js version requirement, may require API adapter

- **Spike execution order**:
  1. **S-004** (first) - Validate library compatibility before building anything
  2. **S-001** - Establishes messaging protocol foundation
  3. **S-002** - Performance validation for core feature
  4. **S-003** - Finalizes UI component choice

- **Total spike time**: 5 hours (can be done in 1 day)

- **Success criteria for Stage 2 completion**:
  - All spikes completed
  - Option A (Content Script Proxy) validated or pivoted based on spike results
  - Technology stack finalized (React Router, CodeMirror or alternative)
  - Risks R-001 through R-004 addressed or accepted
