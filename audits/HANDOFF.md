# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 31
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: MAIN_SECONDARY_DRAIN_REAUDIT_ACCEPTED
```

## CURRENT PRODUCTION TARGET

```yaml
production_mode: DIRECT_MAIN
production_branch: main
audited_head: 5c7884b32f9e48adb0d3c81f9b8c70fb18f921db
base_rejected_head: e5da455e38f36a4226ec407894efe2c84b301eda
audit_task: MAIN_SECONDARY_DRAIN_FAIL_CLOSED_REAUDIT_01
verdict: A_ACCEPT
blockers: none
findings:
  P0: 0
  P1: 0
  P2: 1
prior_P1: CLOSED
browser_runtime: NOT_PERFORMED
full_report: audits/history/MAIN_SECONDARY_DRAIN_5c7884b32f9e48adb0d3c81f9b8c70fb18f921db_20260915-2113.md
```

## ACCEPTANCE RESULT

The prior P1 is closed. Exact `main` HEAD fail-closes `pan-drain` / `overflow-drain` when `secondaryDrainFt` is missing while overflow-risk installation scope is active. The field is marked invalid, Apply is disabled, and a capture-phase click guard prevents the existing Apply handler from reaching Job mutation.

Clearing the drain requirement removes only the guard's own marker/title and never force-enables Apply. Existing Commercial, project-plan, unresolved BOM and invalid-financial gates remain authoritative.

The dedicated unit test is narrower than the implementation: it verifies the predicate states but not DOM render/capture/nonmutation interaction. This is recorded as P2 test-depth debt, not a production blocker.

## VALIDATION

```yaml
ci_run: 35046565626
ci_validated_commit: f53c01a947b278eefa2a3e8b16ed1f55eba131fe
ci_result: SUCCESS
final_head: 5c7884b32f9e48adb0d3c81f9b8c70fb18f921db
post_ci_delta:
  - DELETE .github/workflows/main-secondary-drain-validation.yml
pages_run: 35046601027
pages_result: SUCCESS
pwa_cache: bruno-ac-v42
```

## AUDIT SAFETY

```yaml
audit_only: true
main_write_performed: false
production_code_write_performed: false
pr_mutation_performed: false
merge_performed: false
```
