# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
roadmap: audits/ROADMAP_NEXT.md
implementation_report: audits/implementation/MAIN_PROJECT_HISTORY_V44_19846AA7.md
previous_accepted_report: audits/history/MAIN_JOURNAL_ESTIMATOR_UX_V43_436a3696bd69779ef7d03e618db1c4ad4d8cf42a_20260915-2200.md
protocol_required: true
```

# MODE GUARD — AUDIT ONLY

```yaml
task_type: AUDIT
production_write_forbidden: true
production_commit_forbidden: true
active_PR_mutation_forbidden: true
merge_forbidden: true
audit_exact_head_required: true
```

```yaml
task_id: MAIN_PROJECT_HISTORY_V44_AUDIT_01
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
production_branch: main
base_accepted_head: 436a3696bd69779ef7d03e618db1c4ad4d8cf42a
target_head: 19846aa72a0370fbb5cd164a37d8abe9c41a750a
status: ACTIVE
```

## OBJECTIVE

Perform an independent adversarial audit of exact `main` HEAD `19846aa72a0370fbb5cd164a37d8abe9c41a750a` after adding reusable Project Calculator history/snapshots.

Do not treat this as a UI-only audit. Verify data authority, frozen pricing semantics, duplicate/import behavior, full-app backup, PWA and all accepted calculator/financial fail-closed gates.

## REQUIRED HISTORY FLOW

```text
staged calculator
-> resolve required inputs / generated BOM
-> current Catalog pricing
-> Confirm & Save Calculation
-> frozen active snapshot
-> History
-> Activate / Duplicate / Export / Import
```

Verify:

- `Confirm & Save Calculation` cannot succeed while `projectPlan.ready` is false;
- Commercial remains fail-closed for confirmation while commercial verification is unavailable;
- full calculator disabled Apply state prevents confirmation;
- saved snapshot captures the selected BOM and current displayed Customer Materials / Your Cost / Margin values;
- later edits to Catalog/current plan do not mutate the historical snapshot;
- Activate changes history selection only and does not mutate Job/current calculation;
- delete removes only the selected history snapshot.

## DUPLICATE AS NEW

Critical requirement:

- Duplicate restores the historical project structure/rooms/overrides/extras into a new editable calculation;
- historical Catalog extra price fields are removed before duplication;
- Catalog IDs and quantities remain so the duplicate reprices through CURRENT Catalog;
- duplicate carries `duplicatedFromSnapshotId` / timestamp provenance;
- duplicate does not mutate the source frozen snapshot.

## IMPORT / EXPORT

Audit both single-snapshot and full-history payloads.

Required import behavior:

- Bruno product marker required;
- version 1 required;
- supported payload type required;
- project plan must validate;
- BOM must be an array;
- totals numeric/null only;
- malformed payloads rejected before history write;
- imported snapshots receive new IDs;
- `importedFromId` preserves source identity without allowing overwrite/collision.

Confirm full App Export/Import includes `bruno-ac-project-history-v1` through the accepted full-app `bruno-ac-*` storage policy.

## V43 REGRESSION — MUST PRESERVE

Re-check accepted V43 behavior:

- Step 4 still visibly shows `Materials & price preview`;
- price strip still reads existing full calculator outputs rather than a parallel pricing engine;
- `Total building area` still recalculates live on input;
- 2,000 vs 20,000 ft² remains visibly responsive through the explicitly labeled estimating heuristic;
- heuristic is never represented as code minimum / Manual J / Manual D / equipment sizing;
- required line-set/condensate measurements remain fail-closed;
- secondary-drain pan-drain/overflow-drain guard remains fail-closed;
- Commercial Apply remains fail-closed;
- unresolved BOM and INVALID_FINANCIAL remain fail-closed;
- blank Your Cost fallback, explicit zero, Customer Price/Your Cost separation and explicit Apply/Re-Apply snapshots remain intact;
- Actual Cost precedence and Method A remain unchanged.

## PWA V44

Expected cache:

```text
bruno-ac-v44
```

Verify:

- `project-history-core.js` is included in SHELL;
- history works after v44 activation;
- existing network-first JS/CSS/JSON + cached fallback behavior is preserved;
- offline availability of history core is not inferred from static source if runtime is unavailable.

## VALIDATION EVIDENCE TO VERIFY

```yaml
validated_run: 35051528777
validated_commit: ca7f2ee9eaa81354ea59d5f5c6e81dace9d08ae8
expected_ci_result: SUCCESS
final_target: 19846aa72a0370fbb5cd164a37d8abe9c41a750a
expected_post_ci_delta:
  - DELETE .github/workflows/main-v44-history-validation.yml
pages_run: 35051572014
expected_cache: bruno-ac-v44
```

Exact compare from accepted V43 HEAD to target should contain only:

- `project-estimator-wizard.js`
- `project-history-core.js`
- `sw.js`
- `tests/project-estimator-integration.test.js`
- `tests/project-history-core.test.js`

Auditor must independently verify Pages final conclusion for exact target HEAD.

## BROWSER RUNTIME

Strongly preferred. Minimum runtime path:

1. create/resolve a residential staged calculation;
2. ensure current full BOM Apply is eligible;
3. Confirm & Save;
4. verify Active snapshot totals;
5. change current project/Catalog and prove frozen snapshot does not change;
6. Duplicate as new and verify current Catalog repricing path;
7. export one snapshot;
8. import it and verify a new ID is created;
9. export/import full history;
10. verify malformed import is rejected;
11. verify accepted V43 2,000 -> 20,000 ft² responsiveness and fail-closed gates still work.

If browser runtime is unavailable, report exactly `NOT_PERFORMED`.

## REQUIRED REPORT

```yaml
report_path_template: audits/history/MAIN_PROJECT_HISTORY_V44_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
required_return:
  - VERDICT
  - AUDITED HEAD
  - BLOCKERS
  - FULL REPORT
```

AUDIT ONLY. Do not modify main, production code, PRs or merge anything.
