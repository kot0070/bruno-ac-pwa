# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 25
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: MAIN_NAV_JOURNAL_V3_AUDIT_READY
```

## CURRENT PRODUCTION TARGET

```yaml
production_mode: DIRECT_MAIN
production_branch: main
base_rejected_head: 5d5506da031e933773614a11e8e5377a478870f6
target_head: 84b0da0de9029fb5f6182580dcd6b8185fda9fae
implementation_report: audits/implementation/MAIN_NAV_JOURNAL_V3_84b0da0d.md
audit_task: MAIN_NAV_JOURNAL_V3_REAUDIT_02
browser_runtime_by_implementer: NOT_PERFORMED
```

## PREVIOUS AUDIT

```yaml
verdict: C_REJECT_REWORK_REQUIRED
report: audits/history/MAIN_SERVICE_JOURNAL_V2_5d5506da031e933773614a11e8e5377a478870f6_20260915-1908.md
blockers:
  - F01_employee_FICA_incorrectly_applied_to_service_call_revenue
  - F02_full_app_backup_omits_service_journal_store
```

## IMPLEMENTED CLOSURES

```yaml
F01:
  service_revenue_FICA_removed: true
  owner_reserve_separate_default_off: true
  employee_FICA_affects_take_home: true
  employer_FICA_TWC_FUTA_add_to_employer_crew_cost: true
F02:
  versioned_full_backup_bridge: true
  capture_scope: all_bruno_ac_prefixed_localStorage_keys
  includes_service_journal: true
  import_validation: true
  executable_round_trip_test: true
```

## ADDITIONAL PRODUCT CHANGES

```yaml
primary_mobile_order:
  - Journal
  - Calculator
  - Job
  - Catalog
  - More
more_navigation: hierarchical_drawer
job_customer_documents:
  - Proposal
  - Invoice
project_classes:
  residential: existing_calculator_behavior
  commercial: fail_closed_planning_context_no_residential_BOM_apply
journal_rows: compact_v3
pwa_cache: bruno-ac-v39
```

## CI

```yaml
run: 35040092200
validated_commit: 5ea77335613929d19f84dad41afe1dd8dbb93bc6
result: SUCCESS
final_head: 84b0da0de9029fb5f6182580dcd6b8185fda9fae
post_ci_delta: DELETE_.github/workflows/main-nav-journal-v3-validation.yml_only
```

## IMPORTANT BOUNDARIES

- Commercial mode is not a complete commercial rules engine. It must remain visibly fail-closed against applying residential-derived compliance/BOM output.
- Payroll values are estimating aids; TWC assigned employer rates and employee federal withholding can differ.
- PR #26 remains separate, draft/rejected/unmerged; this direct-main cycle does not accept or merge it.
- Independent audit should use browser runtime if available; implementation agent did not perform browser execution.

## NEXT ACTION

Execute `audits/TASK_CURRENT.md` as AUDIT ONLY against exact main HEAD `84b0da0de9029fb5f6182580dcd6b8185fda9fae`.
