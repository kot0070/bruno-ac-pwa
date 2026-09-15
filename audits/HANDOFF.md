# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 18
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: PR26_LIVE_ESTIMATOR_AUDIT_PENDING
```

## LAST ACCEPTED / MERGED PRODUCTION BASELINE

```yaml
merged_pr: 25
accepted_feature_head: 90ebe4d2408a7b0af7e6e7671540f632585a8804
acceptance_verdict: A_ACCEPT
acceptance_report: audits/history/PR25_90ebe4d2408a7b0af7e6e7671540f632585a8804_20260915-1635.md
main_merge_commit: e84c9e9b6c53693d087db46156975ffec93d238a
```

## CURRENT IMPLEMENTATION

```yaml
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
base_sha: e84c9e9b6c53693d087db46156975ffec93d238a
production_head: 5b069931eaf98311f31d344c1acd6cc8e5553ade
obsolete_previous_audit_target: a04915f472679866ff941d0fb7b4b8752519becb
implementation_reports:
  - audits/implementation/PR26_ROOM_BASED_ESTIMATOR_a04915f4.md
  - audits/implementation/PR26_LIVE_CODE_ESTIMATOR_5b069931.md
merged: false
draft: true
```

## USER TARGET FLOW

```text
Building/system inputs
-> square footage + room schedule
-> code/design traceability
-> code minimum where defensible
-> calculated/design baseline
-> contractor/customer override + reason
-> live compliance state
-> final quantity
-> live components/material BOM
-> existing Catalog Customer Price / Your Cost
-> live margin preview
-> explicit Apply to Job only
```

## LIVE ESTIMATOR EXTENSION

```yaml
new_file: room-estimator-live.js
behavior:
  - debounced_room_input_reactivity
  - rebuild_room_engine_result
  - sync_valid_final_quantities_to_existing_calculator_preview
  - trigger_existing_calculate_path_not_parallel_pricing
  - mirror_existing_Customer_Your_Margin_outputs
  - red_fail_state_for_known_hard_minimum_or_explicit_blocker
  - warning_state_for_unresolved_design_input
  - source_links_resolved_from_local_Code_Library_ruleIds
  - no_automatic_Apply
  - no_live_localStorage_write
```

## SAFETY / TRUTHFULNESS BOUNDARIES

```yaml
no_sqft_to_tonnage_inference: true
no_claim_of_performing_Manual_J_S_or_D: true
planning_defaults_are_code_minimums: false
unknown_numeric_minimum_fabricated: false
known_hard_minimum_below_override_should_block_and_render_red: true
unresolved_design_input_should_not_render_compliant: true
live_preview_writes_job: false
explicit_Apply_required_for_job_mutation: true
```

## FINANCIAL / BOM INTEGRATION

```yaml
room_final_quantity_to_existing_AC_Calculator: true
existing_catalog_matching_authoritative: true
customer_track: Catalog.unitCost -> Calculator.customerUnitPrice -> Job.unitCost -> Quote
internal_track: Catalog.yourCost -> Calculator.yourUnitCost -> Job.procurementCostSnapshot -> PnL
actual_track: Job.actualCost -> PnL_override_only
parallel_room_pricing_formula: false
```

## CODE / SOURCE TRACEABILITY

```yaml
registry: code-library/texas-hvac-2026.json
room_live_source_links_use_ruleIds: true
noopener_required: true
local_AHJ_explicit: true
Manual_D_role: design_reference_not_numeric_code_minimum
PR25_M1401_3_source_issue_fixed_in_PR26: true
```

## PWA

```yaml
cache: bruno-ac-v38
live_asset_cached: ./room-estimator-live.js
```

## VALIDATION

```yaml
original_room_block_ci:
  run: 35028250513
  validated_commit: b7c32f36aba4de652f5046f9986c294513424020
  result: SUCCESS
live_extension_ci:
  run: 35029436317
  validated_commit: cb8a14f043bc8cc6bb609beb4408dd46df39e602
  result: SUCCESS
  successful_steps:
    - room-estimator
    - code-rule-registry
    - financial-integrity
    - calculator-pricing
    - lifecycle-integration
    - calculator-review-ux
    - service-journal-ux
    - syntax-checks-including-live-layer
post_live_ci_change: remove_temporary_workflow_only
final_head: 5b069931eaf98311f31d344c1acd6cc8e5553ade
temporary_workflow_in_final_diff: false
browser_runtime: NOT_PERFORMED
```

## NEXT STATE

```yaml
next_task_id: PR26_LIVE_CODE_ESTIMATOR_ACCEPTANCE_02
next_task_mode: independent_large_block_acceptance_audit
merge_before_acceptance: forbidden
```

## HANDOFF RULES

```yaml
rules:
  - read_WORKSPACE_PROTOCOL_CONTEXT_HANDOFF_ROADMAP_both_implementation_reports_TASK_before_action
  - task_file_defines_active_PR_branch_SHA
  - audit_exact_head_5b069931eaf98311f31d344c1acd6cc8e5553ade
  - obsolete_head_a04915f472679866ff941d0fb7b4b8752519becb_must_not_be_used_for_acceptance
  - production_PR_and_code_read_only_during_audit
  - auditor_does_not_merge
  - reports_and_workspace_writes_only_on_audit_branch_under_audits
  - implementation_report_is_context_not_authority
  - browser_runtime_must_not_be_claimed_without_execution
  - if_findings_exist_fix_same_PR_then_reaudit_new_exact_HEAD
```
