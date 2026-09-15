# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 17
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: PR26_ROOM_ESTIMATOR_AUDIT_PENDING
```

## LAST ACCEPTED / MERGED PRODUCTION BASELINE

```yaml
merged_pr: 25
accepted_feature_head: 90ebe4d2408a7b0af7e6e7671540f632585a8804
acceptance_verdict: A_ACCEPT
acceptance_report: audits/history/PR25_90ebe4d2408a7b0af7e6e7671540f632585a8804_20260915-1635.md
main_merge_commit: e84c9e9b6c53693d087db46156975ffec93d238a
```

PR25 prior non-blocking finding `IRC-M1401.3-EQUIPMENT-SIZING` source URL is corrected inside PR26.

## CURRENT IMPLEMENTATION

```yaml
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
base_sha: e84c9e9b6c53693d087db46156975ffec93d238a
production_head: a04915f472679866ff941d0fb7b4b8752519becb
implementation_report: audits/implementation/PR26_ROOM_BASED_ESTIMATOR_a04915f4.md
merged: false
draft: true
changed_files_exactly:
  - ac-calculator.html
  - code-library/texas-hvac-2026.json
  - code-rule-registry.js
  - room-estimator-engine.js
  - room-estimator-persistence.js
  - room-estimator-preload.js
  - room-estimator-ux.js
  - sw.js
  - tests/code-rule-registry.test.js
  - tests/room-estimator-engine.test.js
```

## IMPLEMENTATION PURPOSE

```yaml
phase: room_based_code_driven_estimator_large_block
flow:
  - building_profile
  - room_schedule
  - design_and_code_traceability
  - calculated_planning_or_takeoff_baseline
  - contractor_or_customer_override
  - override_reason
  - final_quantity
  - existing_AC_Calculator_BOM
  - existing_Catalog_Customer_Price_and_Your_Cost
  - existing_margin_and_Apply_lifecycle
```

## CRITICAL SAFETY BOUNDARIES

```yaml
no_sqft_to_tonnage_inference: true
no_claim_of_performing_Manual_J_S_or_D: true
planning_supply_defaults_are_code_minimums: false
unknown_code_minimum_is_fabricated: false
new_or_replacement_duct_missing_takeoff_blocks: true
new_or_replacement_return_missing_design_input_blocks: true
existing_duct_return_not_invented: true
override_reason_supported: true
future_hard_minimum_below_override_can_block: true
financial_math_reimplemented_by_room_estimator: false
```

## QUANTITY PROVENANCE MODEL

```yaml
fields:
  - codeMinimum
  - hardMinimum
  - calculatedBaseline
  - baselineType
  - ruleIds
  - override.value
  - override.reason
  - override.note
  - finalQuantity
  - finalSource
current_metrics:
  - supplyRegisters
  - ductFt
  - returnGrilles
```

## FINANCIAL / BOM INTEGRATION

```yaml
final_room_quantities_feed_existing_calculator: true
existing_catalog_matching_remains_authoritative: true
customer_track: Catalog.unitCost -> Calculator.customerUnitPrice -> Job.unitCost -> Quote
internal_track: Catalog.yourCost -> Calculator.yourUnitCost -> Job.procurementCostSnapshot -> PnL
actual_track: Job.actualCost -> PnL_override_only
```

## PERSISTENCE

```yaml
path: state.acCalculator.roomEstimator
additive: true
success_gate: existing_AC_Calculator_generatedAt_changes_after_successful_Apply
blocked_or_cancelled_apply_should_not_persist_room_snapshot: true
preload_restores:
  - sqft
  - ductScope
```

## CODE / DESIGN TRACEABILITY

```yaml
new_reference:
  id: ACCA-MANUAL-D-2016
  role: design_reference_not_numeric_code_minimum
  source: https://www.acca.org/standards/technical-manuals/manual-d
new_mappings:
  - equipment-sizing
  - duct-design
  - duct
  - supply-registers
  - return-grilles
local_AHJ_remains_explicit: true
full_copyrighted_manual_stored: false
```

## VALIDATION

```yaml
ci_run: 35028250513
validated_commit: b7c32f36aba4de652f5046f9986c294513424020
ci_result: SUCCESS
successful_steps:
  - room-estimator
  - code-rule-registry
  - financial-integrity
  - calculator-pricing
  - pr22-lifecycle-integration
  - calculator-review-ux
  - service-journal-ux
  - JS_syntax_checks
post_ci_change: remove_temporary_workflow_only
final_head: a04915f472679866ff941d0fb7b4b8752519becb
temporary_workflow_in_final_diff: false
browser_runtime: NOT_PERFORMED
```

## NEXT STATE

```yaml
next_task_id: PR26_ROOM_BASED_ESTIMATOR_ACCEPTANCE_01
next_task_mode: independent_large_block_acceptance_audit
expected_next_state: PR26_acceptance_or_focused_followup_fixes
merge_before_acceptance: forbidden
```

## HANDOFF RULES

```yaml
rules:
  - read_WORKSPACE_PROTOCOL_CONTEXT_HANDOFF_ROADMAP_IMPLEMENTATION_REPORT_TASK_before_action
  - task_file_defines_active_PR_branch_SHA
  - audit_exact_head_a04915f472679866ff941d0fb7b4b8752519becb
  - production_PR_and_code_read_only_during_audit
  - auditor_does_not_merge
  - reports_and_workspace_writes_only_on_audit_branch_under_audits
  - implementation_report_is_context_not_authority
  - browser_runtime_must_not_be_claimed_without_execution
  - if_findings_exist_fix_same_PR_then_reaudit_new_exact_HEAD
```
