# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 23
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: MAIN_SERVICE_JOURNAL_V2_AUDIT_PENDING
```

## CURRENT PRODUCTION TARGET

```yaml
production_mode: DIRECT_MAIN
production_branch: main
main_head: 5d5506da031e933773614a11e8e5377a478870f6
cycle_base: 3fe244c01dcb84dcf5af60607ba2cce191e51a73
implementation_report: audits/implementation/MAIN_SERVICE_JOURNAL_V2_5d5506da.md
current_audit_task: MAIN_SERVICE_JOURNAL_V2_AUDIT_01
```

## SERVICE JOURNAL V2 SCOPE

```yaml
primary_changes:
  - Journal_is_home_workspace
  - compact_calendar_first_layout
  - day_week_month_quarter_archive
  - modal_add_edit_service_call
  - compact_saved_call_rows
  - range_income_totals
  - hourly_or_fixed_day_helpers
  - helper_payroll_can_drive_negative_daily_net
  - helper_take_home_tax_estimate
  - one_time_tax_settings
  - TX_Dripping_Springs_default_7_65_FICA_estimate
  - floating_Aa_restored
  - PWA_cache_v38
storage_key: bruno-ac-service-journal-v2
browser_runtime: NOT_PERFORMED
```

## VALIDATION

```yaml
ci_run: 35037896673
validated_commit: 426d2938031b6bb5fd933c6751f0b78b74caac99
result: SUCCESS
validated_steps:
  - service_journal_tests
  - financial_integrity_tests
  - calculator_review_tests
  - syntax_checks
final_target_head: 5d5506da031e933773614a11e8e5377a478870f6
expected_post_ci_delta: DELETE_.github/workflows/journal-v2-validation.yml_only
```

## IMPORTANT AUDIT FOCUS

```yaml
must_check:
  - actual_mobile_browser_behavior
  - aggregate_totals_update_after_saved_call_changes
  - helper_negative_net_semantics
  - date_archive_boundaries
  - reload_persistence
  - legacy_migration_non_destructive
  - Aa_visibility
  - navigation_home_behavior
  - tax_claim_scope_and_primary_sources
  - Export_App_omits_V2_journal_key
known_limit_requiring_independent_severity_decision:
  - current_full_app_backup_does_not_include_bruno_ac_service_journal_v2
```

## TAX SEMANTIC BOUNDARY

```yaml
default_location: Dripping Springs, TX
default_estimate_pct: 7.65
basis: employee_FICA_6.2_social_security_plus_1.45_medicare
not_claimed:
  - complete_personal_tax_liability
  - federal_income_tax_withholding
  - employer_payroll_tax_burden
user_can_override_or_disable: true
```

## PR26 STATUS PRESERVED

PR #26 remains separate and unmerged. Its prior re-audit state is not authority for this direct-main Service Journal audit. Do not merge or mutate PR #26 during the current task.

## HANDOFF RULES

```yaml
rules:
  - read_WORKSPACE_PROTOCOL_CONTEXT_HANDOFF_ROADMAP_TASK_and_implementation_report_before_audit
  - audit_exact_main_head_5d5506da031e933773614a11e8e5377a478870f6
  - production_main_is_read_only_during_audit
  - no_PR_mutation_or_merge
  - browser_runtime_must_not_be_claimed_without_execution
  - write_full_report_and_update_LATEST_AUDIT_and_HANDOFF_on_audit_completion
```
