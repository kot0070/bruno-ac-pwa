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

# MODE GUARD — IMPLEMENTATION ONLY

```yaml
mode_guard:
  task_type: IMPLEMENTATION
  audit_mode: FORBIDDEN
  verdict_output: FORBIDDEN
  report_generation: FORBIDDEN
  production_write_required: true
  production_commit_required: true
  production_push_required: true
  merge_forbidden: true
  success_requires_new_production_head: true
  if_no_code_change_made: task_status_BLOCKED_not_DONE
```

DO NOT perform another acceptance audit.
DO NOT return A/B/C verdict.
DO NOT write an audit report.
DO NOT stop after analysis.

This task is successful only if the required corrective implementation is made on the production branch, tests pass, a new commit is pushed, and a NEW production HEAD is returned.

```yaml
task_id: PR22_CLOSE_ACCEPTANCE_GAPS_01
mode: corrective_implementation
repository: kot0070/bruno-ac-pwa
production_pr: 22
production_branch: feature/financial-integrity-texas-acr-docs
starting_head: 603cbca03e292ae1d3bf424514fb60da6233bfc6
source_audit_report: audits/history/PR22_603cbca03e292ae1d3bf424514fb60da6233bfc6_20260915-1235.md
source_verdict: B_ACCEPT_AFTER_MINOR_FIXES
status: ACTIVE
```

## OBJECTIVE

```yaml
primary_goal: close_remaining_acceptance_gap_without_regressing_production_financial_lifecycle
required_outcome:
  - add_genuine_executable_integration_coverage_for_catalog_and_margins_lifecycle
  - cover_persist_reload_and_explicit_reapply
  - fix_blank_your_cost_clear_to_restore_fallback_semantics
  - preserve_all_existing_financial_and_compliance_invariants
  - keep_PR_open_unmerged
```

## SCOPE

```yaml
allowed_changes:
  production:
    - index.html
  tests:
    - tests/ac-calculator-pricing.test.js
    - tests/financial-integrity.test.js
    - new_minimal_integration_test_file_if_strictly_needed
  tooling:
    - temporary_local_or_ci_test_harness_if_removed_from_final_net_diff
forbidden:
  - unrelated_refactor
  - HVAC_scope_logic_changes
  - method_A_formula_changes
  - financial_precedence_changes
  - quote_pricing_model_changes
  - ACR_compliance_relaxation
  - merge_PR
```

## REQUIRED IMPLEMENTATION

```yaml
integration_test:
  classification_target: EXECUTABLE_INTEGRATION
  must_execute_real_production_paths: true
  must_not_be_only_source_assertions: true
  minimum_fixture:
    initial:
      catalog_customer: 100
      catalog_your: 70
      calculator_apply: true
      expected_job_unitCost: 100
      expected_job_snapshot: 70
    mutate_catalog_without_reapply:
      catalog_customer: 110
      catalog_your: 55
      expected_job_unitCost: 100
      expected_job_snapshot: 70
    margins_customer_edit_without_reapply:
      expected_job_unitCost: 100
      expected_job_snapshot: 70
    save_reload:
      expected_catalog_customer: 110
      expected_catalog_your: 55
      expected_job_unitCost: 100
      expected_job_snapshot: 70
    explicit_reapply:
      expected_job_unitCost: 110
      expected_job_snapshot: 55
  required_assertions:
    - no_implicit_catalog_to_job_unitCost_write
    - no_implicit_margins_to_job_unitCost_write
    - historical_snapshot_unchanged_until_explicit_action
    - explicit_reapply_updates_both_tracks
    - calculate_preview_does_not_mutate_persisted_job
    - manual_material_rows_survive_reapply
```

```yaml
blank_your_cost_clear_semantics:
  target_controls:
    - Catalog_cat-your
    - Margins_mrg-your
  required_behavior:
    blank_input:
      semantic: restore_missing_blank
      remove_explicit_your_cost_override: true
      remove_persisted_cost_map_entry: true
      must_not_write: INVALID_FINANCIAL
    malformed_nonblank_input:
      semantic: INVALID_FINANCIAL
    calculator_after_clear:
      yourCostSource: customer-price-fallback
      yourUnitCost: current_customer_price
  dynamic_fixture:
    explicit_your: 70
    clear_to_blank: true
    customer_after_clear: 60
    expected_your: 60
    expected_source: customer-price-fallback
```

## REGRESSION GATES

```yaml
must_remain_true:
  - Catalog_edit_does_not_mutate_existing_Job_before_explicit_reapply
  - Margins_edit_does_not_mutate_existing_Job_before_explicit_reapply
  - Customer_track_to_Quote_only
  - YourCost_track_to_snapshot_PnL_only
  - Actual_overrides_snapshot_only_in_PnL
  - Calculator_never_creates_actualCost
  - invalid_financial_never_silently_becomes_zero
  - legitimate_zero_remains_valid
  - explicit_invalid_higher_priority_cost_does_not_fall_through
  - reconciliation_fixture_used_380_estimate_450_variance_minus70
  - method_A_existing_tests_pass
  - ACR_TECL_separation_preserved
  - service_worker_consistency_preserved_if_assets_change
```

## VALIDATION

```yaml
required_tests:
  - node tests/financial-integrity.test.js
  - node tests/ac-calculator-pricing.test.js
  - new_integration_test_command_if_added
required_syntax:
  - node_check_modified_js
  - validate_index_inline_js_if_index_changed
final_tree:
  - no_temporary_scripts
  - no_temporary_workflows
  - no_unrelated_files
```

## DELIVERY

```yaml
implementation_target: production_branch
commit_required: true
push_required: true
merge_forbidden: true
post_implementation:
  - update audits/HANDOFF.md on audit_branch with new production_HEAD and task result
  - set next audit task in audits/TASK_CURRENT.md for focused acceptance re-audit
chat_response_schema:
  - "STATUS: <DONE|BLOCKED>"
  - "NEW HEAD: <full_sha>"
  - "TESTS: <short_status>"
  - "FILES: <short_changed_files>"
  - "NEXT: <focused_reaudit_ready|blocker>"
```
