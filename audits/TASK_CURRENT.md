# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
roadmap: audits/ROADMAP_NEXT.md
implementation_report: audits/implementation/MAIN_PROJECT_HISTORY_V45_IMPORT_FIX_9E05636F.md
previous_report: audits/history/MAIN_PROJECT_HISTORY_V44_19846aa72a0370fbb5cd164a37d8abe9c41a750a_20260915-2233.md
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
task_id: MAIN_PROJECT_HISTORY_V45_IMPORT_REAUDIT_01
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
production_branch: main
base_audited_head: 19846aa72a0370fbb5cd164a37d8abe9c41a750a
target_head: 9e05636fb3bbc26c0b60ef4624753539e728bd87
status: ACTIVE
```

## OBJECTIVE

Independently re-audit exact `main` HEAD `9e05636fb3bbc26c0b60ef4624753539e728bd87` after closing all findings from the V44 Project History audit.

Do not limit review to the three prior findings; re-check valid import/export/history behavior and relevant calculator/financial/PWA regressions.

## PRIOR FINDINGS — MUST CLOSE

### F01 P1 — atomic full-history import

Mixed valid + malformed full-history payload must be rejected as a whole.

Required:

- every incoming snapshot validates before any new store is committed;
- invalid member => `ok:false`, `added:0`;
- returned/committed store must remain equal to the pre-import normalized target store;
- no valid subset may leak into history.

### F02 P1 — strict totals validation

Every snapshot must contain all four totals fields:

```yaml
customerMaterials
YourCost_alias_not_allowed: false
yourCost
marginDollar
marginPct
```

Actual required values are exactly the four canonical keys above except the explanatory alias line; auditor must verify the implementation requires:

```text
customerMaterials
yourCost
marginDollar
marginPct
```

Each value must be a finite JavaScript `number` or `null` only.

Reject:

- missing field;
- numeric string;
- boolean;
- NaN / Infinity where representable in runtime construction.

Do not accept coercion via `Number(...)`.

### F03 P2 — collision-safe import IDs

Imported snapshots must receive new IDs that are explicitly unique against:

- existing local history IDs;
- IDs generated earlier in the same import batch.

`importedFromId` must preserve source provenance without becoming the local primary ID.

## VALID IMPORT REGRESSION

Re-check:

- valid single snapshot import succeeds;
- valid full-history import succeeds atomically;
- imported snapshots preserve frozen snapshot content except local import metadata/new ID;
- Activate remains history-selection-only;
- Duplicate still removes historical Catalog prices and returns to CURRENT Catalog pricing;
- source frozen snapshots remain immutable.

## EXISTING V44 / V43 REGRESSIONS

Re-check:

- Confirm & Save remains fail-closed;
- Commercial confirmation/Apply remains fail-closed;
- missing required line-set/condensate inputs remain blocking;
- secondary-drain pan-drain/overflow-drain missing run remains blocking;
- unresolved BOM and INVALID_FINANCIAL remain blocking;
- Customer Price / Your Cost tracks remain separated;
- blank Your Cost fallback, explicit zero and Actual Cost precedence remain unchanged;
- explicit Apply/Re-Apply snapshot lifecycle remains intact;
- Step 4 price preview remains based on existing full calculator outputs;
- 2,000 -> 20,000 ft² estimating responsiveness remains visibly present and still labeled non-code/non-Manual-J/D;
- full App backup includes `bruno-ac-project-history-v1` through the existing `bruno-ac-*` policy.

## PWA V45

Expected cache:

```text
bruno-ac-v45
```

Verify:

- `project-history-core.js` remains in SHELL;
- network-first JS/CSS/JSON behavior is unchanged;
- no stale v44 expectation remains in the integration test;
- offline runtime must be reported `NOT_PERFORMED` if not actually exercised.

## VALIDATION EVIDENCE TO VERIFY

```yaml
validated_run: 35052657047
validated_commit: e30016c81ecf8a96d5ad8ad8c3c8bb798372c1ff
expected_ci_result: SUCCESS
final_target: 9e05636fb3bbc26c0b60ef4624753539e728bd87
expected_post_ci_delta:
  - DELETE .github/workflows/main-v45-history-import-validation.yml
pages_run: 35052702946
pages_result: SUCCESS
expected_cache: bruno-ac-v45
```

Exact compare from prior audited V44 HEAD to target should contain only:

- `project-history-core.js`
- `sw.js`
- `tests/project-estimator-integration.test.js`
- `tests/project-history-core.test.js`

## BROWSER / RUNTIME

Strongly preferred, but source+Node execution is acceptable for the pure history core.

Minimum executable checks:

1. mixed full-history batch: one valid + one malformed => no partial import;
2. missing total => reject;
3. numeric-string total => reject;
4. boolean total => reject;
5. all-null totals => valid;
6. valid single import => new ID;
7. valid multi-import => all local IDs unique;
8. history/duplicate/export flow still works.

If browser/offline runtime is unavailable, report exactly `NOT_PERFORMED` for those runtime-only checks.

## REQUIRED REPORT

```yaml
report_path_template: audits/history/MAIN_PROJECT_HISTORY_V45_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
required_return:
  - VERDICT
  - AUDITED HEAD
  - BLOCKERS
  - FULL REPORT
```

AUDIT ONLY. Do not modify main, production code, PRs or merge anything.
