# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
roadmap: audits/ROADMAP_NEXT.md
implementation_report: audits/implementation/MAIN_PROJECT_ESTIMATOR_E5DA455E.md
previous_report: audits/history/PR27_cf856a30b2f9cdcb9d61373d3472fef31b9e7343_20260915-2005.md
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
task_id: MAIN_PROJECT_ESTIMATOR_ACCEPTANCE_01
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
production_branch: main
target_head: e5da455e38f36a4226ec407894efe2c84b301eda
status: ACTIVE
```

## OBJECTIVE

Perform an independent adversarial end-to-end audit of exact `main` HEAD `e5da455e38f36a4226ec407894efe2c84b301eda`.

Do not limit review to the two previous PR27 blockers. Verify the production calculator/operator flow as a whole.

## REQUIRED FLOW

```text
Compact Project Setup
-> Residential / Commercial
-> total building area
-> Rooms / Zones (+ quantity, optional area where needed)
-> Code / Design baseline
-> Minimum / Calculated / Final
-> Catalog additions / repricing
-> Full technical live calculator
-> explicit Apply to Job
```

The first operator view must be the compact staged estimator, not the legacy full technical form. The full form is a second-stage detail/live-calculation view after initial baseline creation.

## PRIOR BLOCKERS — MUST CLOSE

### Journal v4 restore
- validate workers[] object shape;
- stable non-empty unique worker IDs;
- crew.workerId required and resolves to an existing worker;
- malformed/dangling worker fixtures fail before any storage write.

### Commercial -> Residential Apply
- bridge must never force-enable Apply;
- returning to Residential restores eligibility only through authoritative calculator/project gating;
- unresolved project/BOM/financial blockers must remain disabled.

## PROJECT ESTIMATOR

Verify:
- Residential and Commercial room/zone catalogs are distinct;
- square footage does not fabricate Manual J/S/D or tonnage;
- code minimum is shown only where an actual represented minimum exists;
- design recommendations are not mislabeled as code minimums;
- field-required lengths/values remain required rather than inferred;
- below represented minimum is visibly noncompliant/fail-closed;
- Final quantity/override updates downstream BOM;
- Catalog additions flow into the BOM with current Catalog pricing;
- Customer Price / Your Cost remain separate;
- explicit Apply/Re-Apply snapshot semantics remain authoritative.

## REGRESSION

Re-check Journal, payroll, calendar Day/Week/Month/Quarter, app backup/restore, navigation, PWA/offline, Code Library/Rule Registry, Method A, financial integrity, calculator pricing/review/lifecycle and customer/procurement price separation.

## VALIDATION EVIDENCE TO VERIFY

```yaml
feature_validation_run: 35043250401
feature_validated_commit: a4204fd145853d2663ed40ef8ec42c30ddd1ac43
feature_ci_result: SUCCESS
post_validation_feature_delta:
  - DELETE .github/workflows/pr27-blocker-fix-validation.yml
main_merge_head: e5da455e38f36a4226ec407894efe2c84b301eda
pages_run: 35043470123
pages_result: SUCCESS
expected_cache: bruno-ac-v41
```

Independently verify that merged main contains the intended final production content and excludes temporary workflow files.

## BROWSER RUNTIME

Mobile/browser runtime is strongly preferred, especially to prove the staged calculator is the first visible calculator UI and the full technical form is second-stage. If unavailable, report exactly `NOT_PERFORMED` and do not infer runtime success from CI/static source.

## REQUIRED REPORT

```yaml
report_path_template: audits/history/MAIN_PROJECT_ESTIMATOR_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
required_return:
  - VERDICT
  - AUDITED HEAD
  - BLOCKERS
  - FULL REPORT
```

AUDIT ONLY. Do not modify main, production code, PRs or merge anything.
