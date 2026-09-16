# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 30
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: MAIN_SECONDARY_DRAIN_REAUDIT_READY
```

## CURRENT PRODUCTION TARGET

```yaml
production_mode: DIRECT_MAIN
production_branch: main
base_rejected_head: e5da455e38f36a4226ec407894efe2c84b301eda
target_head: 5c7884b32f9e48adb0d3c81f9b8c70fb18f921db
implementation_report: audits/implementation/MAIN_SECONDARY_DRAIN_FAIL_CLOSED_5c7884b3.md
audit_task: MAIN_SECONDARY_DRAIN_FAIL_CLOSED_REAUDIT_01
previous_verdict: C_REJECT_REWORK_REQUIRED
previous_report: audits/history/MAIN_PROJECT_ESTIMATOR_e5da455e38f36a4226ec407894efe2c84b301eda_20260915-2052.md
browser_runtime_by_implementation: NOT_PERFORMED
```

## BLOCKER CORRECTION

Previous P1:

```text
pan-drain / overflow-drain could use secondaryDrainFt = 0/blank and remain warning-only through Apply.
```

Correction on main:
- new `secondary-drain-guard.js` owns this specific fail-closed condition;
- Apply disabled for active install scope + overflow damage risk + pan-drain/overflow-drain + missing measured run;
- capture-phase Apply interception prevents Job mutation;
- field is marked invalid and Apply gate shows required input;
- clearing this blocker never force-enables Apply; other project/BOM/financial/Commercial gates remain authoritative;
- `pan-switch`/`switch-only` do not require this run through this guard;
- repair without install-material scope does not create the blocker.

## VALIDATION

```yaml
ci_run: 35046565626
ci_validated_commit: f53c01a947b278eefa2a3e8b16ed1f55eba131fe
ci_result: SUCCESS
final_head: 5c7884b32f9e48adb0d3c81f9b8c70fb18f921db
post_ci_delta:
  - DELETE .github/workflows/main-secondary-drain-validation.yml
pwa_cache: bruno-ac-v42
pages_run: 35046601027
```

## RE-AUDIT FOCUS

Audit exact final main HEAD and prove the previous P1 is closed without introducing Apply-state ownership regressions. Re-check staged estimator, Commercial guard, dual-pricing/financial lifecycle, Journal/backup and PWA shell around the change.

## AUDIT SAFETY

```yaml
audit_only: true
main_write_forbidden: true
production_code_write_forbidden: true
pr_mutation_forbidden: true
merge_forbidden: true
```
