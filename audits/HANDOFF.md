# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 24
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: MAIN_SERVICE_JOURNAL_V2_REWORK_REQUIRED
```

## CURRENT PRODUCTION TARGET

```yaml
production_mode: DIRECT_MAIN
production_branch: main
audited_main_head: 5d5506da031e933773614a11e8e5377a478870f6
cycle_base: 3fe244c01dcb84dcf5af60607ba2cce191e51a73
implementation_report: audits/implementation/MAIN_SERVICE_JOURNAL_V2_5d5506da.md
audit_task: MAIN_SERVICE_JOURNAL_V2_AUDIT_01
audit_verdict: C_REJECT_REWORK_REQUIRED
audit_report: audits/history/MAIN_SERVICE_JOURNAL_V2_5d5506da031e933773614a11e8e5377a478870f6_20260915-1908.md
browser_runtime: NOT_PERFORMED
```

## OPEN BLOCKERS

```yaml
F01:
  severity: P1
  defect: employee_FICA_7_65_percent_is_applied_to_service_call_gross_revenue
  required_direction: separate_payroll_FICA_from_business_revenue_tax_or_reserve_semantics
F02:
  severity: P1
  defect: Export_App_promises_full_app_backup_but_omits_bruno_ac_service_journal_v2
  required_direction: journal_inclusive_versioned_export_import_round_trip
```

## VERIFIED NON-BLOCKING STATE

```yaml
exact_main_head_verified: true
ci_run: 35037896673
ci_validated_commit: 426d2938031b6bb5fd933c6751f0b78b74caac99
ci_result: SUCCESS
post_ci_delta_verified: DELETE_.github/workflows/journal-v2-validation.yml_only
journal_home_navigation_static: pass
helper_negative_net_core_test: pass
pwa_cache: bruno-ac-v38
legacy_migration_static: non_destructive
```

## REQUIRED NEXT CYCLE

Implement corrections outside the audit workspace, then refresh `TASK_CURRENT.md` to a new exact production HEAD and re-audit:

- corrected service-revenue tax semantics;
- V2 Journal included in Export App / Import App;
- executable export → clear → import equivalence test;
- actual mobile browser Journal flow;
- reload persistence and legacy migration;
- range boundary edge cases;
- offline/PWA update behavior;
- financial/calculator regression gates.

## PR26 STATUS PRESERVED

PR #26 remains separate and unmerged. This direct-main Service Journal audit did not mutate or merge PR #26.

## AUDIT SAFETY

```yaml
production_code_modified: false
main_modified: false
pr_modified: false
merge_performed: false
audit_branch_writes_only: true
```
