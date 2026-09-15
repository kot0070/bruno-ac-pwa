# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
read_order:
  - audits/WORKSPACE.md
  - audits/CONTEXT.md
  - audits/HANDOFF.md
  - audits/TASK_CURRENT.md
protocol_required: true
```

# MODE GUARD — AUDIT ONLY

```yaml
mode_guard:
  task_type: AUDIT
  implementation_mode: FORBIDDEN
  production_write_forbidden: true
  production_commit_forbidden: true
  merge_forbidden: true
  audit_exact_head_required: true
```

```yaml
task_id: PR22_FOCUSED_ACCEPTANCE_REAUDIT_118166D
mode: focused_acceptance_reaudit
repository: kot0070/bruno-ac-pwa
production_pr: 22
production_branch: feature/financial-integrity-texas-acr-docs
target_head: 118166d91df18c025956e63c17727362805e1165
baseline_audited_head: 603cbca03e292ae1d3bf424514fb60da6233bfc6
source_audit_report: audits/history/PR22_603cbca03e292ae1d3bf424514fb60da6233bfc6_20260915-1235.md
source_implementation_task: PR22_CLOSE_ACCEPTANCE_GAPS_01
status: ACTIVE
```

## OBJECTIVE

Perform a focused acceptance re-audit of the corrective implementation at the exact target HEAD. Do not reimplement or merge.

```yaml
focus:
  - verify_final_net_diff_contains_no_temporary_workflow_or_script
  - verify_executable_integration_test_runs_real_production_lifecycle_helpers
  - verify_catalog_100_70_apply_then_catalog_110_55_without_reapply_keeps_job_100_70
  - verify_margins_customer_edit_without_reapply_keeps_job_100_70
  - verify_save_reload_keeps_catalog_110_55_and_job_100_70
  - verify_explicit_reapply_updates_job_to_110_55
  - verify_calculate_preview_nonmutation
  - verify_manual_material_rows_survive_reapply
  - verify_blank_Catalog_cat_your_restores_missing_blank_and_removes_persisted_override
  - verify_blank_Margins_mrg_your_uses_same_blank_aware_path
  - verify_customer_change_after_clear_resolves_current_customer_price_fallback
  - verify_nonblank_malformed_Your_Cost_remains_INVALID_FINANCIAL
  - verify_financial_compliance_regression_gates_remain_intact
```

## REQUIRED VALIDATION

```yaml
required_tests:
  - node tests/financial-integrity.test.js
  - node tests/ac-calculator-pricing.test.js
  - node tests/pr22-lifecycle-integration.test.js
required_syntax:
  - validate_index_inline_js
required_repository_checks:
  - compare_baseline_to_target_head
  - confirm_only_allowed_final_files_changed
  - confirm_PR_open_unmerged
```

## OUTPUT / RETENTION

```yaml
report_required: true
report_location: audits/history
update_latest_pointer_if_workspace_rules_require: true
update_HANDOFF_after_audit: true
production_changes_forbidden: true
merge_forbidden: true
```
