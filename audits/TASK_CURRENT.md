# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
implementation_report: audits/implementation/PR23_AC_CALCULATOR_UX_2a6a7463.md
read_order:
  - audits/WORKSPACE.md
  - audits/CONTEXT.md
  - audits/HANDOFF.md
  - audits/implementation/PR23_AC_CALCULATOR_UX_2a6a7463.md
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
  active_PR_mutation_forbidden: true
  merge_forbidden: true
  audit_exact_head_required: true
```

```yaml
task_id: PR23_AC_CALCULATOR_UX_ACCEPTANCE_01
mode: independent_ux_acceptance_audit
repository: kot0070/bruno-ac-pwa
production_pr: 23
production_branch: feature/ac-calculator-ux-clarity
base_branch: main
base_sha: e54d642171ed0b342aba0fe2230f3fdeaa82ad06
target_head: 2a6a74637a1aecc1b82144508c9733c9b0d4abfa
accepted_financial_baseline_head: 118166d91df18c025956e63c17727362805e1165
status: ACTIVE
```

## OBJECTIVE

Independently determine whether PR #23 fixes the AC Calculator usability failure shown by the user without regressing the already accepted financial/BOM lifecycle.

The implementation report is context only. Production code and observable behavior are authority.

## USER FAILURE TO REPRODUCE

```yaml
observed_before_PR23:
  calculation_banner: "Calculation is current"
  selected: 3
  catalog_resolved: 2_of_3
  pricing_totals: em_dash
  gate: "1 selected item(s) are unresolved or have invalid financial data — correct before Apply"
  user_result: unable_to_understand_whether_calculator_works_or_what_to_fix
```

A green/current state while Apply/pricing is blocked is not acceptable.

## REQUIRED UX INVARIANTS

```yaml
states:
  ready:
    requires: no_selected_hard_blockers_and_no_selected_zero_review
    banner_must_not_claim_only_staleness/currentness
    expected_meaning: selected_BOM_ready_to_apply
  action_required:
    trigger:
      - selected_unresolved
      - selected_invalid_financial
    visible_apply: disabled
    must_surface:
      - blocker_count
      - blocker_row_label
      - blocker_type
      - corrective_action
  review_required:
    trigger: selected_valid_zero_price
    semantics: valid_not_invalid
    visible_apply: allowed_subject_to_existing_confirmation
    must_not_be_classified_as_hard_blocker: true
  dirty_or_stale:
    trigger: inputs_changed_after_explicit_calculation
    must_not_be_reclassified_ready_by_review_layer: true
```

## REQUIRED BEHAVIOR CHECKS

```yaml
checks:
  - id: contradictory_green_state_removed
    fixture: selected_3_with_1_unresolved
    expected:
      banner: action_required
      visible_apply_disabled: true
      attention_count: 1
      pricing_reason_visible: true

  - id: selected_only_semantics
    fixture: unresolved_or_invalid_row_is_deselected
    expected: deselected_row_does_not_block

  - id: attention_panel
    expected:
      - lists_only_selected_attention_rows
      - exact_row_label_visible
      - issue_type_visible
      - help_text_visible
      - jump_to_row_action_works_if_browser_available
      - deselect_action_updates_state

  - id: review_counts
    expected_fields:
      - generated
      - selected
      - ready
      - needs_attention
    expected_counts_must_follow_checkbox_selection: true

  - id: preview_only_semantics
    required_copy_meaning: Calculate_does_not_write_Job_Materials_until_Apply

  - id: zero_price_review
    fixture: one_selected_valid_zero_plus_ready_rows
    expected:
      mode: review_required
      visible_apply_enabled_if_underlying_apply_available: true
      existing_zero_confirmation_preserved: true

  - id: invalid_financial
    fixture: selected_invalid_financial
    expected:
      mode: action_required
      visible_apply_disabled: true
      invalid_must_not_be_presented_as_zero: true

  - id: stale_state
    fixture: calculate_then_change_input
    expected:
      stale_or_dirty_message: true
      visible_apply_disabled: true
      old_attention_state_must_not_override_stale_semantics: true

  - id: reference_information_hierarchy
    expected:
      why_references_collapsed_by_default: true
      reference_content_not_removed: true
      BOM_actionable_review_before_long_reference_wall: true

  - id: mobile_row_clarity
    expected:
      - row_state_plain_language_visible
      - unresolved_help_visible
      - invalid_help_visible
      - zero_review_help_visible
      - no_horizontal_table_required_for_basic_diagnosis

  - id: service_worker_delivery
    expected:
      cache_name: bruno-ac-v33
      cached_asset: ac-calculator-review-ux.js

  - id: production_scope
    expected_changed_files_exactly:
      - ac-calculator-review-ux.js
      - ac-calculator.html
      - sw.js
      - tests/ac-calculator-review-ux.test.js
```

## REGRESSION GATES — MUST REMAIN TRUE

```yaml
financial_and_lifecycle:
  - ac-calculator-engine.js_unchanged_from_main
  - ac-calculator.js_unchanged_from_main
  - financial-integrity-core.js_unchanged_from_main
  - Customer_Price_to_Job_unitCost_to_Quote
  - Your_Cost_to_procurementCostSnapshot_to_PnL
  - actualCost_overrides_snapshot_in_PnL_only
  - Calculator_never_creates_actualCost
  - invalid_financial_never_silently_becomes_zero
  - legitimate_zero_remains_valid
  - Catalog_or_Margins_edit_does_not_mutate_historical_Job_without_explicit_reapply
  - Calculate_preview_does_not_mutate_Job_Materials
  - manual_material_rows_survive_reapply
```

## TEST QUALITY

```yaml
required_static_or_runtime_checks:
  - inspect_tests/ac-calculator-review-ux.test.js
  - verify_deriveReviewState_is_pure_and_tested
  - verify_ready_fixture
  - verify_unresolved_fixture
  - verify_invalid_fixture
  - verify_zero_fixture
  - verify_mixed_fixture
  - verify_deselected_invalid_does_not_block

browser_runtime:
  preferred: true
  if_available:
    - reproduce_mobile_width_flow
    - exercise_Calculate
    - exercise_unresolved_selected
    - exercise_Deselect
    - exercise_stale_after_input_change
    - exercise_zero_review_if_fixture_can_be_constructed_safely
  if_unavailable:
    report_exactly: NOT_PERFORMED
    do_not_invent_browser_results: true
```

## SEVERITY

```yaml
P0:
  - financial_engine_regression
  - Apply_allowed_despite_selected_unresolved_or_invalid_financial
  - invalid_to_zero_regression
  - Calculate_or_review_layer_mutates_Job_without_explicit_Apply
P1:
  - contradictory_ready_green_state_still_present_when_blocked
  - blocker_not_identifiable_without_hunting
  - stale_result_can_be_applied_or_presented_ready
  - zero_review_misclassified_as_invalid
  - selected_only_semantics_wrong
P2:
  - minor_copy_or_layout_issue_without_actionability_or_financial_risk
```

## REQUIRED REPORT

```yaml
report_path_template: audits/history/PR23_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
minimum_sections:
  - Executive_Verdict
  - Repository_State
  - Exact_Audited_SHA
  - Final_Diff
  - User_Failure_Reproduction
  - Ready_Action_Review_State_Matrix
  - Attention_Panel
  - Selected_Only_Semantics
  - Stale_Dirty_State
  - Zero_Price_Review
  - Mobile_Usability
  - Reference_Collapse
  - Service_Worker
  - Test_Quality
  - Financial_Regression_Gates
  - Browser_Runtime_Result
  - Findings
  - Merge_Blockers
  - Final_Verdict
```

After successful report write, update `audits/LATEST_AUDIT.md` with the same complete report, update `audits/HANDOFF.md`, and keep only the 3 newest files in `audits/history/`.

Do not modify PR #23 or production code. Do not merge.
