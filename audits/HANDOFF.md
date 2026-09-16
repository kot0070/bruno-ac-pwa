# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 29
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: MAIN_PROJECT_ESTIMATOR_AUDITED_REWORK_REQUIRED
```

## CURRENT PRODUCTION TARGET

```yaml
production_mode: DIRECT_MAIN
production_branch: main
audited_head: e5da455e38f36a4226ec407894efe2c84b301eda
source_pr: 27
source_pr_final_head: aefdf975583e5f2cb17e739cf9fcc3d9334bbc66
implementation_report: audits/implementation/MAIN_PROJECT_ESTIMATOR_E5DA455E.md
audit_task: MAIN_PROJECT_ESTIMATOR_ACCEPTANCE_01
browser_runtime: NOT_PERFORMED
verdict: C_REJECT_REWORK_REQUIRED
```

## CURRENT BLOCKER

```yaml
F01:
  severity: P1
  defect: full technical calculator treats missing secondary/overflow drain run for pan-drain or overflow-drain as warning-only, allowing authoritative Apply when the selected compliance method still lacks its required measured field run
```

## VERIFIED CLOSED / PRESERVED

```yaml
prior_journal_v4_restore_identity_blocker: CLOSED
prior_commercial_to_residential_force_enable_blocker: CLOSED
staged_compact_calculator_source_architecture: VERIFIED_STATIC
residential_commercial_room_catalog_isolation: VERIFIED
minimum_calculated_final_model: VERIFIED
staged_override_to_bom_sync: VERIFIED
commercial_authoritative_apply_guard: PRESERVED
catalog_current_pricing_and_dual_price_tracks: PRESERVED
journal_payroll_calendar_backup_regressions: PRESERVED_BY_SOURCE_PLUS_CI
pwa_cache: bruno-ac-v41
feature_ci_run: 35043250401
feature_ci_validated_commit: a4204fd145853d2663ed40ef8ec42c30ddd1ac43
feature_ci_result: SUCCESS
post_ci_delta:
  - DELETE .github/workflows/pr27-blocker-fix-validation.yml
pages_run: 35043470123
pages_head: e5da455e38f36a4226ec407894efe2c84b301eda
pages_result: SUCCESS
```

## AUDIT REPORT

```text
audits/history/MAIN_PROJECT_ESTIMATOR_e5da455e38f36a4226ec407894efe2c84b301eda_20260915-2052.md
```

## NEXT ACTION

Correct the full technical overflow-method required-length gating on production code in a separate implementation cycle. For `pan-drain` and `overflow-drain`, a zero/missing measured secondary run must fail closed before Job mutation unless the operator selects another valid protection method. Add executable regressions for both cases, produce a new exact production HEAD, refresh TASK_CURRENT/implementation evidence, then run a fresh independent AUDIT ONLY.

## AUDIT SAFETY

```yaml
main_modified_by_audit: false
production_code_modified_by_audit: false
production_pr_modified_by_audit: false
merge_performed_by_audit: false
audit_writes_only_under_audits: true
```
