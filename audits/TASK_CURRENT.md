# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
implementation_report: audits/implementation/PR23_F01_OBSERVER_FIX_8c70dddc.md
source_audit_report: audits/history/PR23_2a6a74637a1aecc1b82144508c9733c9b0d4abfa_20260915-1554.md
read_order:
  - audits/WORKSPACE.md
  - audits/CONTEXT.md
  - audits/HANDOFF.md
  - audits/history/PR23_2a6a74637a1aecc1b82144508c9733c9b0d4abfa_20260915-1554.md
  - audits/implementation/PR23_F01_OBSERVER_FIX_8c70dddc.md
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
task_id: PR23_F01_FOCUSED_REAUDIT_8C70DDDC
mode: focused_acceptance_reaudit
repository: kot0070/bruno-ac-pwa
production_pr: 23
production_branch: feature/ac-calculator-ux-clarity
base_branch: main
base_sha: e54d642171ed0b342aba0fe2230f3fdeaa82ad06
previous_rejected_head: 2a6a74637a1aecc1b82144508c9733c9b0d4abfa
target_head: 8c70dddc4d3879dd9a4f8fd58d74049ac1ab1eb1
status: ACTIVE
```

## OBJECTIVE

Independently verify that PR23 audit finding `F01_self_triggering_review_sync_loop` is eliminated at the exact target HEAD, while preserving the previously accepted UX-state semantics and financial/lifecycle boundaries.

Implementation report is context only. Production source/behavior and executable evidence are authority.

## PRIMARY F01 CHECK

```yaml
must_verify:
  - review_observers_are_disconnected_before_sync_owned_DOM_writes
  - observers_are_restored_in_finally_even_if_sync_returns_or_throws
  - sync_owned_status_writes_cannot_requeue_status_observer
  - sync_owned_BOM_decorations_cannot_requeue_BOM_observer
  - authoritative_external_status/BOM/mainApply_changes_still_trigger_sync
  - no_continuous_zero_delay_queueSync_cycle_after_ready_action_required_or_review_required
  - repeated_sync_on_unchanged_state_is_idempotent
```

If browser/runtime instrumentation is available, explicitly verify observer callbacks settle after a calculated state. If not available, report `BROWSER_RUNTIME: NOT_PERFORMED` and evaluate source + executable tests without inventing runtime evidence.

## REQUIRED UX REGRESSION CHECKS

```yaml
states:
  ready:
    banner: selected_BOM_ready_to_apply
    visible_apply: follows_underlying_apply
  action_required:
    trigger: selected_unresolved_or_invalid
    visible_apply: disabled
    attention_panel: visible
  review_required:
    trigger: selected_valid_zero_no_hard_blocker
    visible_apply: allowed_subject_to_existing_zero_confirmation
  dirty_or_stale:
    must_remain_owned_by_existing_ux_layer: true
    review_layer_must_not_force_ready: true
selected_only:
  deselected_attention_row_does_not_block: true
```

## DELIVERY / CACHE

```yaml
service_worker:
  expected_cache: bruno-ac-v34
  expected_asset: ./ac-calculator-review-ux.js
final_diff_exactly:
  - ac-calculator-review-ux.js
  - ac-calculator.html
  - sw.js
  - tests/ac-calculator-review-ux.test.js
forbidden_final_artifacts:
  - .github/workflows/pr23-ux-validation.yml
  - temporary_scripts
```

## EXECUTABLE EVIDENCE

Implementation report references temporary CI run `35016786924` at commit `a94532fb76b7846336a978ae645f7349d3e34ae0`.

Independently inspect run/job evidence. Expected successful steps:

```yaml
- financial-integrity
- ac-calculator-pricing
- pr22-lifecycle-integration
- ac-calculator-review-ux
- JS_syntax_checks
```

Also inspect final target HEAD to ensure removal of temporary workflow did not alter production files after the validated code.

## FINANCIAL REGRESSION GATES

```yaml
must_remain_unchanged_from_main:
  - ac-calculator-engine.js
  - ac-calculator.js
  - financial-integrity-core.js
must_remain_true:
  - Customer_Price_to_Job_unitCost_to_Quote
  - Your_Cost_to_procurementCostSnapshot_to_PnL
  - actualCost_overrides_snapshot_in_PnL_only
  - Calculator_never_creates_actualCost
  - invalid_financial_never_silently_becomes_zero
  - legitimate_zero_remains_valid
  - Calculate_preview_does_not_mutate_Job_Materials
  - historical_Job_not_mutated_by_Catalog_or_Margins_without_explicit_reapply
```

## SEVERITY

```yaml
P0:
  - financial_or_lifecycle_regression
  - Apply_allowed_despite_selected_unresolved_or_invalid
P1:
  - F01_still_reproducible_or_source_design_still_self_triggering
  - corrected_observer_design_drops_real_upstream_updates
  - stale_state_can_be_presented_ready
P2:
  - minor_nonblocking_copy_or_layout_issue
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
  - F01_Observer_Lifecycle
  - Idempotent_Rendering
  - Runtime_Or_Static_Settling_Evidence
  - UX_State_Regression_Matrix
  - Service_Worker
  - Test_CI_Evidence
  - Financial_Regression_Gates
  - Browser_Runtime_Result
  - Findings
  - Merge_Blockers
  - Final_Verdict
```

After successful report write: update `audits/LATEST_AUDIT.md`, update `audits/HANDOFF.md`, enforce history retention, and return only VERDICT / AUDITED HEAD / BLOCKERS / FULL REPORT.

Do not modify PR #23 or production code. Do not merge.
